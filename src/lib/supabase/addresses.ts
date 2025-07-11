import { PostgrestError } from '@supabase/supabase-js';
import supabaseClient from './supabaseClient';
import { type Tables } from '@/types/database.types'; // Assuming your generated types

// Types based on DB schema for addresses
export type UserProfileAddress = Tables<'user_profile_addresses'>;
export type ParticipantDeliveryAddress = Tables<'participant_delivery_addresses'>;

// Input type for creating/updating profile addresses (omitting generated fields)
export type UserProfileAddressInput = Omit<UserProfileAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
// Input type for creating/updating participant delivery addresses
export type ParticipantDeliveryAddressInput = Omit<ParticipantDeliveryAddress, 'id' | 'user_id' | 'group_member_id' | 'created_at' | 'updated_at'>;


interface DBResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

// --- User Profile Address Functions ---

/**
 * Adds a new address to the user's profile.
 * If is_default is true, ensures other addresses for the user are not default.
 */
export async function addUserProfileAddress(
  userId: string,
  addressDetails: UserProfileAddressInput
): Promise<DBResult<UserProfileAddress>> {
  if (!userId) return { data: null, error: { message: 'User ID required', code: '400' } as PostgrestError };
  if (!addressDetails.full_name || !addressDetails.address_line_1 || !addressDetails.city || !addressDetails.state_province_region || !addressDetails.postal_code || !addressDetails.country) {
    return { data: null, error: { message: 'Missing required address fields for profile address.', code: '400' } as PostgrestError };
  }

  // Handle is_default logic: if true, set other addresses for this user to false.
  if (addressDetails.is_default) {
    const { error: updateError } = await supabaseClient
      .from('user_profile_addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);
    if (updateError) {
      console.error("Error unsetting other default addresses:", updateError);
      return { data: null, error: updateError };
    }
  }

  const { data, error } = await supabaseClient
    .from('user_profile_addresses')
    .insert({ ...addressDetails, user_id: userId })
    .select()
    .single();
  return { data, error };
}

/**
 * Lists all saved addresses for a user's profile.
 */
export async function listUserProfileAddresses(userId: string): Promise<DBResult<UserProfileAddress[]>> {
  if (!userId) return { data: null, error: { message: 'User ID required', code: '400' } as PostgrestError };
  const { data, error } = await supabaseClient
    .from('user_profile_addresses')
    .select('*')
    .eq('user_id', userId) // RLS also enforces this
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });
  return { data: data || [], error };
}

/**
 * Updates an existing user profile address.
 * Handles is_default logic similarly to addUserProfileAddress.
 */
export async function updateUserProfileAddress(
  addressId: string,
  userId: string, // For RLS check and default logic scope
  updates: Partial<UserProfileAddressInput>
): Promise<DBResult<UserProfileAddress>> {
  if (!addressId || !userId) return { data: null, error: { message: 'Address ID and User ID required', code: '400' } as PostgrestError };

  if (updates.is_default) {
    const { error: updateError } = await supabaseClient
      .from('user_profile_addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true)
      .neq('id', addressId); // Don't unset the one we are about to set
    if (updateError) {
      console.error("Error unsetting other default addresses during update:", updateError);
      return { data: null, error: updateError };
    }
  }

  const { data, error } = await supabaseClient
    .from('user_profile_addresses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .eq('user_id', userId) // RLS also enforces this
    .select()
    .single();
  return { data, error };
}

/**
 * Deletes a user profile address.
 */
export async function deleteUserProfileAddress(addressId: string, userId: string): Promise<DBResult<null>> {
  if (!addressId || !userId) return { data: null, error: { message: 'Address ID and User ID required', code: '400' } as PostgrestError };
  const { error } = await supabaseClient
    .from('user_profile_addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', userId); // RLS also enforces this
  return { data: null, error };
}

/**
 * Sets a specific profile address as the default for the user.
 */
export async function setDefaultUserProfileAddress(addressId: string, userId: string): Promise<DBResult<UserProfileAddress>> {
   if (!addressId || !userId) return { data: null, error: { message: 'Address ID and User ID required', code: '400' } as PostgrestError };
  // Transaction to ensure atomicity would be ideal here, but Supabase client doesn't directly expose transactions.
  // Handle in two steps: first unset current default, then set new default.

  const { error: unsetError } = await supabaseClient
    .from('user_profile_addresses')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true);

  if (unsetError) {
    console.error("Error unsetting current default address:", unsetError);
    return { data: null, error: unsetError };
  }

  const { data, error: setError } = await supabaseClient
    .from('user_profile_addresses')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .eq('user_id', userId) // RLS also enforces
    .select()
    .single();

  return { data, error: setError };
}


// --- Participant Delivery Address Functions (for specific group memberships) ---

/**
 * Adds or updates a delivery address for a specific group membership.
 */
export async function addOrUpdateParticipantDeliveryAddress(
  userId: string, // Participant's user ID
  groupMemberId: string,
  addressDetails: ParticipantDeliveryAddressInput
): Promise<DBResult<ParticipantDeliveryAddress>> {
  if (!userId || !groupMemberId) return { data: null, error: { message: 'User ID and Group Member ID required', code: '400' } as PostgrestError };
   if (!addressDetails.full_name || !addressDetails.address_line_1 || !addressDetails.city || !addressDetails.state_province_region || !addressDetails.postal_code || !addressDetails.country) {
    return { data: null, error: { message: 'Missing required address fields for participant delivery address.', code: '400' } as PostgrestError };
  }

  // UPSERT: if address for group_member_id exists, update it; otherwise, insert.
  // RLS policies will ensure the user can only affect their own group_member_id.
  const { data, error } = await supabaseClient
    .from('participant_delivery_addresses')
    .upsert(
      { ...addressDetails, user_id: userId, group_member_id: groupMemberId, updated_at: new Date().toISOString() },
      { onConflict: 'group_member_id' }
    )
    .select()
    .single();

  return { data, error };
}

/**
 * Retrieves the delivery address for a specific group membership.
 * Primarily used by the participant to view/edit their submitted address.
 */
export async function getParticipantDeliveryAddress(
  userId: string, // Participant's user ID
  groupMemberId: string
): Promise<DBResult<ParticipantDeliveryAddress | null>> {
  if (!userId || !groupMemberId) return { data: null, error: { message: 'User ID and Group Member ID required', code: '400' } as PostgrestError };

  const { data, error } = await supabaseClient
    .from('participant_delivery_addresses')
    .select('*')
    .eq('group_member_id', groupMemberId)
    .eq('user_id', userId) // RLS also enforces this
    .maybeSingle(); // Use maybeSingle as it might not exist yet

  return { data, error };
}

/**
 * Retrieves all delivery addresses for a specific group.
 * Intended for use by the fulfiller (product lister/vendor or fulfillment center).
 * Access control (ensuring fulfillerUserId is authorized) should be layered here
 * and/or in the API route calling this, in addition to RLS.
 */
export async function getDeliveryAddressesForGroup(
  groupId: string,
  fulfillerUserId: string // The user ID of the fulfiller attempting to access
): Promise<DBResult<ParticipantDeliveryAddress[]>> {
  if (!groupId || !fulfillerUserId) return { data: null, error: { message: 'Group ID and Fulfiller User ID required', code: '400' } as PostgrestError };

  // This function relies heavily on RLS to ensure fulfillerUserId has access.
  // The RLS policy for SELECT on participant_delivery_addresses should check:
  // 1. If fulfillerUserId is the p.vendor_id for the product in the group.
  // 2. If the group.status is appropriate (e.g., 'completed', 'paid').
  // An additional check here for product physicality might be good, or handled by API layer.
  // For now, we assume RLS is configured correctly for the SELECT operation.

  const { data, error } = await supabaseClient
    .from('participant_delivery_addresses')
    .select(`
      *,
      group_members!inner (
        group_id,
        user_profiles (id, full_name, email)
      )
    `)
    .eq('group_members.group_id', groupId);
    // The RLS policy on participant_delivery_addresses for SELECT will handle authorization
    // based on the fulfillerUserId (auth.uid()) and its relation to the group/product.

  if (error) {
    console.error(`Error fetching delivery addresses for group ${groupId}:`, error);
  }

  return { data: data || [], error };
}
