import { PostgrestError } from '@supabase/supabase-js';
import supabaseClient from './supabaseClient';

// Define the structure of a UserManagedVendor based on the planned DB schema
// This should align with the columns in the `user_managed_vendors` table
export interface UserManagedVendor {
  id: string; // uuid
  user_id: string; // uuid, FK to auth.users.id
  vendor_name: string;
  contact_person?: string | null;
  email?: string | null;
  phone_number?: string | null;
  website_url?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state_province_region?: string | null;
  postal_code?: string | null;
  country?: string | null;
  notes?: string | null;
  product_categories_supplied?: string[] | null; // Array of strings
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

// Define a generic DBResult type for consistency
interface DBResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

/**
 * Creates a new vendor entry for the specified user.
 * @param userId The ID of the user creating the vendor.
 * @param vendorDetails The details of the vendor to create.
 * @returns The created vendor data or an error.
 */
export async function createUserVendor(
  userId: string,
  vendorDetails: Omit<UserManagedVendor, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<DBResult<UserManagedVendor>> {
  if (!userId) {
    return { data: null, error: { message: 'User ID is required.', details: '', hint: '', code: '400' } as PostgrestError };
  }
  if (!vendorDetails || !vendorDetails.vendor_name) {
    return { data: null, error: { message: 'Vendor name is required.', details: '', hint: '', code: '400' } as PostgrestError };
  }

  const { data, error } = await supabaseClient
    .from('user_managed_vendors')
    .insert({ ...vendorDetails, user_id: userId })
    .select()
    .single();

  return { data, error };
}

/**
 * Retrieves a specific vendor by its ID, ensuring it belongs to the specified user.
 * @param userId The ID of the user requesting the vendor.
 *   (Note: RLS policy primarily enforces this, but good to have user_id in query for clarity/potential direct checks)
 * @param vendorId The ID of the vendor to retrieve.
 * @returns The vendor data or an error.
 */
export async function getUserVendorById(
  userId: string, // Though RLS is the enforcer, userId is kept for potential direct checks if needed
  vendorId: string
): Promise<DBResult<UserManagedVendor>> {
  if (!vendorId) {
    return { data: null, error: { message: 'Vendor ID is required.', details: '', hint: '', code: '400' } as PostgrestError };
  }
   if (!userId) { // Added this check for completeness, though RLS is primary
    return { data: null, error: { message: 'User ID is required to fetch vendor.', details: '', hint: '', code: '400' } as PostgrestError };
  }

  const { data, error } = await supabaseClient
    .from('user_managed_vendors')
    .select('*')
    .eq('id', vendorId)
    // .eq('user_id', userId) // RLS handles this, but can be explicit if desired for non-RLS environments or specific checks
    .single();

  return { data, error };
}

/**
 * Lists all vendors managed by the specified user.
 * @param userId The ID of the user whose vendors are to be listed.
 *   (Note: RLS policy primarily enforces this)
 * @returns A list of vendors or an error.
 */
export async function listUserVendors(
  userId: string // RLS is the enforcer for user_id matching
): Promise<DBResult<UserManagedVendor[]>> {
   if (!userId) { // Added this check
    return { data: null, error: { message: 'User ID is required to list vendors.', details: '', hint: '', code: '400' } as PostgrestError };
  }
  const { data, error } = await supabaseClient
    .from('user_managed_vendors')
    .select('*')
    // .eq('user_id', userId) // RLS handles this
    .order('vendor_name', { ascending: true });

  return { data, error };
}

/**
 * Updates an existing vendor's details.
 * RLS policy ensures the user can only update their own vendors.
 * @param vendorId The ID of the vendor to update.
 * @param updates Partial details to update the vendor with.
 * @param userId The ID of the user performing the update (for logging or if RLS wasn't primary).
 * @returns The updated vendor data or an error.
 */
export async function updateUserVendor(
  vendorId: string,
  updates: Partial<Omit<UserManagedVendor, 'id' | 'user_id' | 'created_at'>>,
  userId: string // userId passed for potential logging or if RLS weren't the sole guard. RLS will enforce ownership.
): Promise<DBResult<UserManagedVendor>> {
  if (!vendorId) {
    return { data: null, error: { message: 'Vendor ID is required for update.', details: '', hint: '', code: '400' } as PostgrestError };
  }
   if (!userId) {
    return { data: null, error: { message: 'User ID is required for update operation.', details: '', hint: '', code: '400' } as PostgrestError };
  }

  const { data, error } = await supabaseClient
    .from('user_managed_vendors')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', vendorId)
    // .eq('user_id', userId) // RLS handles this
    .select()
    .single();

  return { data, error };
}

/**
 * Deletes a vendor by its ID.
 * RLS policy ensures the user can only delete their own vendors.
 * @param vendorId The ID of the vendor to delete.
 * @param userId The ID of the user performing the deletion (for logging or if RLS wasn't primary).
 * @returns Null if successful, or an error.
 */
export async function deleteUserVendor(
  vendorId: string,
  userId: string // userId passed for potential logging or if RLS weren't the sole guard. RLS will enforce ownership.
): Promise<DBResult<null>> {
  if (!vendorId) {
    return { data: null, error: { message: 'Vendor ID is required for deletion.', details: '', hint: '', code: '400' } as PostgrestError };
  }
  if (!userId) {
    return { data: null, error: { message: 'User ID is required for delete operation.', details: '', hint: '', code: '400' } as PostgrestError };
  }

  // Before deleting, consider implications if the vendor is linked to products.
  // The Task Details mentioned: "Preventing deletion if referenced is safest for data integrity initially."
  // This check should ideally be done here or via a database trigger/constraint if possible.
  // For now, this function will proceed with deletion. A more robust implementation
  // would query the 'products' table for `selected_user_managed_vendor_id: vendorId`.

  const { error } = await supabaseClient
    .from('user_managed_vendors')
    .delete()
    .eq('id', vendorId);
    // .eq('user_id', userId); // RLS handles this

  if (error) {
    return { data: null, error };
  }
  return { data: null, error: null };
}

// Example of a more robust delete function that checks for references:
/*
export async function deleteUserVendorWithReferenceCheck(
  vendorId: string,
  userId: string
): Promise<DBResult<null>> {
  if (!vendorId || !userId) {
    return { data: null, error: { message: 'Vendor ID and User ID are required.', details: '', hint: '', code: '400' } as PostgrestError };
  }

  // Check if any product references this vendor
  const { data: products, error: productCheckError } = await supabaseClient
    .from('products')
    .select('id')
    .eq('selected_user_managed_vendor_id', vendorId)
    .limit(1);

  if (productCheckError) {
    console.error('Error checking product references:', productCheckError);
    return { data: null, error: productCheckError };
  }

  if (products && products.length > 0) {
    return {
      data: null,
      error: {
        message: 'Cannot delete vendor. It is referenced by one or more products.',
        details: `Vendor ID ${vendorId} is in use.`,
        hint: 'Remove vendor from all product listings before deleting.',
        code: 'PGRST200' // Or a custom error code
      } as PostgrestError
    };
  }

  // Proceed with deletion if no references found
  const { error: deleteError } = await supabaseClient
    .from('user_managed_vendors')
    .delete()
    .eq('id', vendorId); // RLS ensures user_id match

  if (deleteError) {
    return { data: null, error: deleteError };
  }
  return { data: null, error: null };
}
*/
