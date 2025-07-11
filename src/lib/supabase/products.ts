import { type ProductStatus, type Tables } from '@/types/database.types' // Assuming this is used or useful
import supabaseClient from './supabaseClient'
import { createGroup } from './groups' // Import createGroup
import { type UserManagedVendor } from './userVendors' // Import UserManagedVendor type

// Define a type for Product joined with user_profiles (platform vendor)
// and user_managed_vendors (source vendor)
export type ProductWithPlatformVendor = Tables<'products'> & {
  user_profiles: { full_name: string } | null;
};

export type ProductWithSourceVendor = ProductWithPlatformVendor & {
  // selected_user_managed_vendor_id is already in Tables<'products'>
  // We want to include the joined data from user_managed_vendors table
  source_vendor: Pick<UserManagedVendor, 'id' | 'vendor_name' | 'website_url' | 'contact_person' | 'email' | 'phone_number'> | null;
};


export async function getLiveProducts(params?: {
  searchQuery?: string;
  category?: string;
}): Promise<ProductWithPlatformVendor[]> { // Return type updated
  let query = supabaseClient
    .from('products')
    // Select product fields, platform vendor's full name
    // and selected fields from the source vendor
    .select('*, user_profiles(full_name)')
    .eq('status', 'live');

  if (params?.searchQuery && params.searchQuery.trim() !== '') {
    const searchTerm = `%${params.searchQuery.trim()}%`;
    query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }

  if (params?.category && params.category.trim() !== '') {
    query = query.eq('category', params.category.trim());
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching live products:', error);
    throw error;
  }
  // Casting to ProductWithPlatformVendor[] as source_vendor might not be directly fetched here
  // unless explicitly joined. For getLiveProducts, we might not need full source_vendor details.
  return data as ProductWithPlatformVendor[];
}

export async function getProductById(id: string): Promise<ProductWithSourceVendor | null> {
  const { data, error } = await supabaseClient
    .from('products')
    .select(`
      *,
      user_profiles (full_name),
      source_vendor:user_managed_vendors (
        id,
        vendor_name,
        website_url,
        contact_person,
        email,
        phone_number
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // PostgREST error code for "Not a single row" (can be 0 rows)
      return null;
    }
    console.error(`Error fetching product by ID ${id}:`, error);
    throw error;
  }
  return data as ProductWithSourceVendor;
}


export async function getVendorProducts(platformVendorId: string): Promise<ProductWithPlatformVendor[]> { // Return type updated
  const { data, error } = await supabaseClient
    .from('products')
    .select('*, user_profiles(full_name)') // Platform vendor (lister)
    .eq('vendor_id', platformVendorId) // This 'vendor_id' is the platform user acting as vendor
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ProductWithPlatformVendor[];
}

// Interface for createProduct input, now includes selected_user_managed_vendor_id
export interface CreateProductInput {
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  vendor_id: string; // Platform user ID acting as vendor/lister
  selected_user_managed_vendor_id: string; // ID of the source vendor from user_managed_vendors table
  category: string;
  subcategory: string | null;
  max_participants: number | null;
  actual_cost: number | null;
  delivery_time: string | null;
  createTimedGroup: boolean;
  groupSize: number;
  countdownSecs: number | null;
}

export async function createProduct(product: CreateProductInput): Promise<Tables<'products'>> {
  const {
    createTimedGroup: shouldCreateTimedGroup,
    groupSize: initialGroupSize,
    countdownSecs: initialCountdownSecs,
    price: productPrice,
    vendor_id, // This is the platform user who is listing the product
    selected_user_managed_vendor_id, // This is the chosen source for the product
    ...productCoreData
  } = product;

  // Validate selected_user_managed_vendor_id (basic check, deeper validation in API layer)
  if (!selected_user_managed_vendor_id) {
    throw new Error('Source vendor ID (selected_user_managed_vendor_id) is required.');
  }

  const { data: newProduct, error: productError } = await supabaseClient
    .from('products')
    .insert({
      ...productCoreData,
      vendor_id: vendor_id, // Platform user lister
      price: productPrice,
      selected_user_managed_vendor_id: selected_user_managed_vendor_id, // Store the selected source vendor
      status: 'draft' as ProductStatus,
    })
    .select()
    .single();

  if (productError) {
    console.error('Error creating product:', productError);
    throw productError;
  }

  if (!newProduct) {
    throw new Error('Product creation did not return data.');
  }

  // Automatic group creation logic (remains largely the same)
  try {
    let expires_at: string | null = null;
    if (shouldCreateTimedGroup && initialCountdownSecs && initialCountdownSecs > 0) {
      expires_at = new Date(Date.now() + initialCountdownSecs * 1000).toISOString();
    }

    if (typeof productPrice !== 'number' || productPrice <= 0) {
      console.warn(`Invalid product price (${productPrice}) for escrow_amount. Group creation might use a default or fail.`);
    }

    await createGroup({
      product_id: newProduct.id,
      escrow_amount: productPrice,
      target_count: initialGroupSize,
      vendor_id: newProduct.vendor_id, // Platform user lister
      expires_at: expires_at,
    });
  } catch (groupError) {
    console.error(`Error creating initial group for product ${newProduct.id}:`, groupError);
    // Decide on error handling: re-throw, or log and continue
  }

  return newProduct;
}

// Interface for updateProduct input, now includes selected_user_managed_vendor_id
export interface UpdateProductInput {
  title?: string;
  description?: string | null;
  price?: number;
  image_url?: string | null;
  selected_user_managed_vendor_id?: string | null; // Allow updating or clearing the source vendor
  category?: string;
  subcategory?: string | null;
  max_participants?: number | null;
  actual_cost?: number | null;
  delivery_time?: string | null;
  status?: ProductStatus;
}

export async function updateProduct(id: string, updates: UpdateProductInput): Promise<Tables<'products'>> {
  const { data, error } = await supabaseClient
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabaseClient
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// Add this new function:
export async function getDistinctCategories(): Promise<string[]> {
  // Supabase doesn't have a direct "distinct" on a specific column through PostgREST like some SQL ORMs.
  // Option 1: Fetch all categories and process them client-side (less efficient for many products).
  // Option 2: Create a Supabase Edge Function or a database VIEW/FUNCTION to get distinct categories.
  // Option 3: A trick with PostgREST - fetch a minimal set of data grouped by category.
  //           However, true distinct is best done with an RPC call if performance is key for huge datasets.

  // For simplicity and moderate datasets, fetching all categories and deduping can work,
  // but it's not ideal for performance if 'products' table is very large.
  // A more performant way for larger tables would be to create an RPC function in Supabase.
  // let { data, error } = await supabaseClient.from('products').select('category');
  // if (error) {
  //   console.error('Error fetching categories:', error);
  //   throw error;
  // }
  // const categories = data ? [...new Set(data.map(p => p.category).filter(Boolean))] : [];
  // return categories.sort();

  // Let's use an RPC function for better performance and to learn that pattern.
  // Assume an RPC function `get_distinct_categories` is created in Supabase SQL editor:
  // CREATE OR REPLACE FUNCTION get_distinct_categories()
  // RETURNS TABLE(category TEXT) AS $$
  // BEGIN
  //   RETURN QUERY SELECT DISTINCT products.category FROM products
  //                WHERE products.category IS NOT NULL AND products.category <> ''
  //                ORDER BY products.category;
  // END;
  // $$ LANGUAGE plpgsql;

  const { data, error } = await supabaseClient.rpc('get_distinct_categories');

  if (error) {
  console.error('Error fetching distinct categories via RPC:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
    fullError: error, // Log the full object to see everything
  });
  throw new Error(`Failed to fetch categories: ${error.message || JSON.stringify(error)}`);
  }

  // The data from RPC might be an array of objects like [{category: 'Electronics'}, {category: 'Books'}]
  return data ? data.map((item: { category: string }) => item.category).sort() : [];
}

/**
 * Determines if a product is physical based on its category/subcategory
 * by checking the `category_properties` table.
 * @param productId The ID of the product to check.
 * @returns True if the product is physical, false otherwise.
 * @throws Error if product not found or category_properties lookup fails.
 */
export async function isProductPhysical(productId: string): Promise<boolean> {
  if (!productId) {
    console.warn('isProductPhysical: productId is required.');
    return false; // Or throw error
  }

  // Step 1: Get the product's category and subcategory
  const { data: product, error: productError } = await supabaseClient
    .from('products')
    .select('category, subcategory, is_physical_product') // Include override flag
    .eq('id', productId)
    .single();

  if (productError) {
    console.error(`isProductPhysical: Error fetching product ${productId}`, productError);
    // Consider specific error handling, e.g., if product not found vs. other DB error
    throw new Error(`Failed to fetch product details for physicality check: ${productError.message}`);
  }
  if (!product) {
    console.warn(`isProductPhysical: Product with ID ${productId} not found.`);
    return false; // Or throw new Error(`Product not found: ${productId}`);
  }

  // Step 2: Check for manual override flag `is_physical_product` on the product itself
  // (Assuming the column 'is_physical_product' might be added to 'products' table as an optional override)
  if (typeof product.is_physical_product === 'boolean') {
    return product.is_physical_product;
  }

  // Step 3: If no override, look up in category_properties
  // Prioritize specific subcategory match, then category-only match.
  let query = supabaseClient.from('category_properties').select('is_physical');

  if (product.subcategory) {
    // Try matching category and subcategory first
    const { data: subcatData, error: subcatError } = await query
      .match({ category_name: product.category, subcategory_name: product.subcategory })
      .maybeSingle(); // Use maybeSingle as it might not exist

    if (subcatError) {
      console.error(`isProductPhysical: Error fetching category_properties for ${product.category}/${product.subcategory}`, subcatError);
      throw new Error(`Database error checking subcategory physicality: ${subcatError.message}`);
    }
    if (subcatData) {
      return subcatData.is_physical;
    }
  }

  // If no subcategory match (or no subcategory), try matching category only
  // Reset query builder for new conditions
  query = supabaseClient.from('category_properties').select('is_physical');
  const { data: catData, error: catError } = await query
    .match({ category_name: product.category })
    .is('subcategory_name', null) // Explicitly look for entries where subcategory_name is NULL
    .maybeSingle();

  if (catError) {
    console.error(`isProductPhysical: Error fetching category_properties for ${product.category}`, catError);
    throw new Error(`Database error checking category physicality: ${catError.message}`);
  }
  if (catData) {
    return catData.is_physical;
  }

  // Default: If no specific rule found in category_properties, assume not physical (or could be true, depends on desired default)
  // This default should ideally be rare if category_properties is comprehensive.
  console.warn(`isProductPhysical: No physicality rule found for product ${productId} (category: ${product.category}, subcategory: ${product.subcategory}). Defaulting to false.`);
  return false;
}
