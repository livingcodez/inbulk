import { type ProductStatus } from '@/types/database.types' // Assuming this is used or useful
import supabaseClient from './supabaseClient'
import { createGroup } from './groups' // Import createGroup

export async function getLiveProducts(params?: { // Use an object for params for better extensibility
  searchQuery?: string;
  category?: string;
  // Potentially other filters like price range, etc. in the future
}) {
  let query = supabaseClient
    .from('products')
    .select('*, user_profiles(full_name)') // Select product fields and vendor's full name
    .eq('status', 'live'); // Always filter by live status

  if (params?.searchQuery && params.searchQuery.trim() !== '') {
    const searchTerm = `%${params.searchQuery.trim()}%`;
    // Search in product title and description.
    // Using .or() to match if either field contains the search term.
    query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }

  if (params?.category && params.category.trim() !== '') {
    query = query.eq('category', params.category.trim());
  }

  // Always order by creation date, newest first
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching live products:', error); // Log the error
    throw error; // Re-throw to be handled by the caller
  }
  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*, user_profiles(full_name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getVendorProducts(vendorId: string) {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createProduct(product: {
  title: string // Changed from name
  description: string | null
  price: number
  image_url: string | null
  vendor_id: string
  category: string
  subcategory: string | null
  // min_buyers removed
  max_participants: number | null // Changed from max_buyers
  actual_cost: number | null
  is_fungible: boolean
  delivery_time: string | null;

  // Parameters for automatic group creation
  createTimedGroup: boolean;
  groupSize: number;
  countdownSecs: number | null;
  selected_user_vendor_id: string;
}) {
  // Destructure to separate product fields from group creation params
  const {
    createTimedGroup: shouldCreateTimedGroup,
    groupSize: initialGroupSize,
    countdownSecs: initialCountdownSecs,
    price: productPrice, // Use for escrow_amount
    vendor_id,
    selected_user_vendor_id,
    ...productCoreData
  } = product;

  const { data: newProduct, error: productError } = await supabaseClient
    .from('products')
    .insert({
      ...productCoreData, // Insert core product data
      vendor_id: vendor_id, // Ensure vendor_id is part of the insert payload
      selected_user_vendor_id,
      price: productPrice, // Ensure price is part of the insert payload
      status: 'draft' as ProductStatus,
    })
    .select()
    .single();

  if (productError) {
    console.error('Error creating product:', productError);
    throw productError;
  }

  if (!newProduct) {
    // This case should ideally not happen if productError is not thrown and insert is successful
    throw new Error('Product creation did not return data.');
  }

  // Now, create the initial group
  try {
    let expires_at: string | null = null;
    if (shouldCreateTimedGroup && initialCountdownSecs && initialCountdownSecs > 0) {
      expires_at = new Date(Date.now() + initialCountdownSecs * 1000).toISOString();
    }

    if (typeof productPrice !== 'number' || productPrice <= 0) {
      console.warn(`Invalid product price (${productPrice}) for escrow_amount. Group creation might use a default or fail.`);
      // Potentially use newProduct.actual_cost / initialGroupSize if available and makes sense
      // For now, proceeding with potentially invalid price, createGroup might handle it or error out.
    }

    await createGroup({
      product_id: newProduct.id,
      escrow_amount: productPrice,
      target_count: initialGroupSize,
      vendor_id: newProduct.vendor_id, // or vendor_id from input if preferred, newProduct.vendor_id should be reliable
      expires_at: expires_at,
      // vote_deadline and unanimous_required can be omitted for default behavior from createGroup
    });
    // console.log('Initial group created successfully for product:', newProduct.id);
  } catch (groupError) {
    console.error(`Error creating initial group for product ${newProduct.id}:`, groupError);
    // Do not re-throw, allowing product creation to be reported as successful.
    // Logged the error. Consider more robust error handling/notification for production.
  }

  return newProduct;
}

export async function updateProduct(id: string, updates: {
  title?: string // Changed from name
  description?: string | null
  price?: number
  image_url?: string | null
  category?: string
  subcategory?: string | null
  // min_buyers removed
  max_participants?: number | null // Changed from max_buyers
  actual_cost?: number | null
  is_fungible?: boolean
  delivery_time?: string | null
  status?: ProductStatus
}) {
  const { data, error } = await supabaseClient
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string) {
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
