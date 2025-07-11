import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server'; // For route handlers
import { createProduct, type CreateProductInput } from '@/lib/supabase/products';
import { listUserVendors } from '@/lib/supabase/userVendors'; // To validate vendor ownership

export async function POST(request: Request) {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('POST /api/products: Auth error', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let productData: CreateProductInput;
  try {
    productData = await request.json();
  } catch (e) {
    console.error('POST /api/products: Invalid JSON body', e);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // --- Validation ---
  // Basic validation for required fields (more can be added)
  if (!productData.title || !productData.price || !productData.category || !productData.selected_user_managed_vendor_id || !productData.groupSize) {
    return NextResponse.json({ error: 'Missing required product fields: title, price, category, selected_user_managed_vendor_id, groupSize are required.' }, { status: 400 });
  }

  // Ensure the vendor_id in productData matches the authenticated user
  // This means the user is listing the product under their own vendor profile (as a platform user)
  if (productData.vendor_id !== user.id) {
      return NextResponse.json({ error: 'Product vendor_id must match authenticated user ID.' }, { status: 403 });
  }

  // Validate that the selected_user_managed_vendor_id belongs to the authenticated user
  try {
    const { data: userVendors, error: vendorListError } = await listUserVendors(user.id);
    if (vendorListError) {
      console.error('POST /api/products: Error fetching user vendors for validation', vendorListError);
      return NextResponse.json({ error: 'Could not validate source vendor ownership.' }, { status: 500 });
    }
    const isValidVendor = userVendors?.some(v => v.id === productData.selected_user_managed_vendor_id);
    if (!isValidVendor) {
      return NextResponse.json({ error: 'Invalid selected_user_managed_vendor_id. Vendor does not belong to the user or does not exist.' }, { status: 400 });
    }
  } catch (validationError) {
    console.error('POST /api/products: Exception during source vendor validation', validationError);
    return NextResponse.json({ error: 'Error validating source vendor.' }, { status: 500 });
  }


  try {
    // The createProduct function in products.ts now expects CreateProductInput type
    const newProduct = await createProduct(productData);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/products: Error creating product', error);
    // Check for specific Supabase errors if needed, or provide a generic message
    const errorMessage = error.message || 'Failed to create product.';
    const errorStatus = typeof error.status === 'number' ? error.status : 500; // Use error status if available
    return NextResponse.json({ error: errorMessage, details: error.details || null }, { status: errorStatus });
  }
}

// Placeholder for GET request to list products if needed in the future
// For example, to get products with certain filters, pagination, etc.
// export async function GET(request: Request) {
//   // ... logic to fetch products ...
//   // const products = await getLiveProducts({ /* params from request.url */ });
//   // return NextResponse.json(products);
// }
