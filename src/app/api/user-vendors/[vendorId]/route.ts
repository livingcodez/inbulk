import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  getUserVendorById,
  updateUserVendor,
  deleteUserVendor,
  // deleteUserVendorWithReferenceCheck, // If we decide to use this more robust delete
  type UserManagedVendor
} from '@/lib/supabase/userVendors';

interface RouteParams {
  params: {
    vendorId: string;
  };
}

// GET: Retrieve a specific vendor by ID for the authenticated user
export async function GET(request: Request, { params }: RouteParams) {
  const { vendorId } = params;
  if (!vendorId) {
    return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // RLS in getUserVendorById ensures user can only access their own vendor.
    // The userId parameter in getUserVendorById is mainly for consistency or if direct checks were needed.
    const { data: vendor, error } = await getUserVendorById(user.id, vendorId);

    if (error) {
      console.error(`GET /api/user-vendors/${vendorId}: Supabase error getting vendor`, error);
      // Check if the error is because the vendor was not found for this user (due to RLS)
      // or if it simply doesn't exist. Supabase might return a generic error or an empty data array.
      // A 404 is appropriate if the resource is not found or not accessible.
      return NextResponse.json({ error: error.message || 'Vendor not found or access denied' }, { status: 404 });
    }
    if (!vendor) { // Explicitly check if vendor is null/undefined even if no error
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    return NextResponse.json(vendor, { status: 200 });
  } catch (e: any) {
    console.error(`GET /api/user-vendors/${vendorId}: Exception getting vendor`, e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

// PUT: Update a specific vendor by ID for the authenticated user
export async function PUT(request: Request, { params }: RouteParams) {
  const { vendorId } = params;
  if (!vendorId) {
    return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let updates: Partial<Omit<UserManagedVendor, 'id' | 'user_id' | 'created_at'>>;
  try {
    updates = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Ensure vendor_name is not being set to empty if provided
  if (updates.vendor_name === '' || updates.vendor_name === null) {
    return NextResponse.json({ error: 'Vendor name cannot be empty' }, { status: 400 });
  }


  try {
    // RLS in updateUserVendor ensures user can only update their own vendor.
    const { data: updatedVendor, error } = await updateUserVendor(vendorId, updates, user.id);
    if (error) {
      console.error(`PUT /api/user-vendors/${vendorId}: Supabase error updating vendor`, error);
       // A 404 is appropriate if the resource to update is not found or not accessible.
      return NextResponse.json({ error: error.message || 'Vendor not found or update failed' }, { status: 404 });
    }
     if (!updatedVendor) { // Explicitly check if updatedVendor is null/undefined
        return NextResponse.json({ error: 'Vendor not found or update failed' }, { status: 404 });
    }
    return NextResponse.json(updatedVendor, { status: 200 });
  } catch (e: any) {
    console.error(`PUT /api/user-vendors/${vendorId}: Exception updating vendor`, e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

// DELETE: Delete a specific vendor by ID for the authenticated user
export async function DELETE(request: Request, { params }: RouteParams) {
  const { vendorId } = params;
  if (!vendorId) {
    return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Consider using deleteUserVendorWithReferenceCheck for safety if implemented and desired.
    // For now, using the simpler deleteUserVendor.
    // RLS in deleteUserVendor ensures user can only delete their own vendor.
    const { error } = await deleteUserVendor(vendorId, user.id);
    if (error) {
      // This could be because the vendor doesn't exist, or a DB constraint failed (e.g., FK if not handled)
      // Or if using deleteUserVendorWithReferenceCheck, it could be because it's in use.
      console.error(`DELETE /api/user-vendors/${vendorId}: Supabase error deleting vendor`, error);
      const errorMessage = error.code === 'PGRST200' ? 'Cannot delete vendor. It is referenced by one or more products.' : (error.message || 'Vendor not found or deletion failed');
      const status = error.code === 'PGRST200' ? 409 : 404; // 409 Conflict if referenced
      return NextResponse.json({ error: errorMessage }, { status });
    }
    return NextResponse.json({ message: 'Vendor deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (e: any) {
    console.error(`DELETE /api/user-vendors/${vendorId}: Exception deleting vendor`, e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
