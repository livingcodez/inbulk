import supabaseClient from './supabaseClient';
import { createNotification } from './notifications';
import { isProductPhysical } from './products'; // Import the new function
import { type Tables } from '@/types/database.types';

// Define a type for the group member, which will be returned by joinGroup
export type GroupMemberWithProductPhysicality = Tables<'group_members'> & {
  requires_address_collection: boolean;
  product_id: string; // Add product_id for convenience
};


async function sendSoftwareSubscriptionCredentials(groupId: string) {
  const { data: group, error } = await supabaseClient
    .from('groups')
    .select(`
      id,
      product_id,
      products (
        id,
        title,
        category,
        subcategory,
        subscription_username,
        subscription_password,
        subscription_2fa_key,
        vendor_id,
        user_profiles(full_name)
      )
    `)
    .eq('id', groupId)
    .single()

  if (error || !group || !(group as any).products) return

  const product: any = (group as any).products

  if (
    product.category !== 'Services & Subscriptions' ||
    product.subcategory !== 'Software Subscriptions'
  ) {
    return
  }

  const { data: members, error: memError } = await supabaseClient
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)

  if (memError || !members) return

  let message = `Username: ${product.subscription_username}\nPassword: ${product.subscription_password}`
  if (product.subscription_2fa_key) {
    message += `\n2FA: ${product.subscription_2fa_key}`
  }
  const vendorName = product.user_profiles?.full_name || 'Vendor'

  await Promise.all(
    members.map((m: any) =>
      createNotification({
        user_id: m.user_id,
        title: `Access credentials for ${product.title}`,
        message: `From ${vendorName}:\n${message}`,
        type: 'info',
        link: `/products/${product.id}?group_id=${groupId}`,
      })
    )
  )
}

// Interface for group data, might need expansion
export interface GroupData {
  id: string;
  name: string | null;
  product_id: string;
  status: string; // e.g., 'open', 'waiting_votes', 'closed', 'completed'
  group_type: 'timed' | 'untimed' | null; // Assuming this field exists
  member_count: number;
  target_count: number; // Corresponds to product's max_buyers or a group-specific target
  waitlist_count?: number; // If tracked directly on group
  waitlist_max_capacity?: number; // If applicable
  created_at: string;
  expires_at: string | null; // For timed groups, when the offer itself expires
  vote_deadline: string | null; // For groups in voting, when the short voting window ends
  // For voting UI
  group_members?: Array<{ user_id: string; vote_status: string | null }>; // To check if current user is member & their vote
  products?: { title: string, price: number, max_participants: number | null }; // Renamed name to title, max_buyers to max_participants
  unanimous_approval_required?: boolean; // Or some other way to determine approval rules
  // Add any other fields that would be useful for the GroupCard
}

async function getGroupsByProductAndType(productId: string, groupType?: 'timed' | 'untimed'): Promise<GroupData[]> {
  let query = supabaseClient
    .from('groups')
    .select(`
      id,
      name,
      product_id,
      status,
      group_type,
      member_count,
      target_count,
      waitlist_count,
      waitlist_max_capacity,
      created_at,
      expires_at,
      vote_deadline,
      unanimous_approval_required,
      group_members ( user_id, vote_status ),
      products ( title, price, max_participants )
    `)
    .eq('product_id', productId)
    // Only apply group_type filter if it's provided
    // Also, ensure status is typically 'open' or 'waiting_votes' for active browsing,
    // but this function is generic for now. Specific filtering can be added in calling functions or here if always needed.
    .order('created_at', { ascending: false });

  if (groupType) {
    query = query.eq('group_type', groupType);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching ${groupType || 'all'} groups for product ${productId}:`, error);
    throw error;
  }
  // Cast to GroupData[] - ensure the select matches this structure
  return (data as unknown as GroupData[]) || [];
}

export function getTimedGroupsByProduct(productId: string): Promise<GroupData[]> {
  return getGroupsByProductAndType(productId, 'timed');
}

export function getUntimedGroupsByProduct(productId: string): Promise<GroupData[]> {
  return getGroupsByProductAndType(productId, 'untimed');
}

export async function getGroupById(id: string) {
  const { data, error } = await supabaseClient
    .from('groups')
    .select(`
      *,
      products(*),
      group_members(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getGroupsAwaitingVotes(productId: string) {
  const { data, error } = await supabaseClient
    .from('groups')
    .select('id, name, vote_deadline') // Select necessary fields. 'name' might not exist, adjust if needed.
                                      // 'vote_deadline' is assumed to store the end time for voting.
    .eq('product_id', productId)
    .eq('status', 'waiting_votes')
    .order('created_at', { ascending: false }); // Or by vote_deadline

  if (error) {
    console.error('Error fetching groups awaiting votes:', error);
    throw error;
  }
  return data;
}

export async function getGroupsByUser(userId: string) {
  const { data, error } = await supabaseClient
    .from('group_members')
    .select(`
      *,
      groups(
        *,
        products(*)
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createGroup(group: {
  product_id: string
  escrow_amount: number
  target_count: number
  vendor_id: string
  vote_deadline?: string | null
  expires_at?: string | null
  unanimous_required?: boolean
}) {
  const { data, error } = await supabaseClient
    .from('groups')
    .insert({
      ...group,
      member_count: 0,
      status: 'open',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function joinGroup(groupId: string, userId: string) {
  const { data: existingMember, error: checkError } = await supabaseClient
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (checkError && checkError.code !== 'PGRST116') throw checkError
  if (existingMember) throw new Error('Already a member of this group')

  const { data, error } = await supabaseClient
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: userId,
      vote_status: 'pending',
      is_admin: false,
    })
    .select()
    .single()

  if (error) throw error

  // Update member count
  const { error: updateError } = await supabaseClient.rpc('increment_group_member_count', {
    group_id: groupId
  })

  if (updateError) throw updateError;

  // After successfully joining, check if the product is physical
  // This requires fetching the group to get the product_id
  const { data: groupData, error: groupError } = await supabaseClient
    .from('groups')
    .select('product_id')
    .eq('id', groupId)
    .single();

  if (groupError || !groupData) {
    console.error(`joinGroup: Could not fetch group ${groupId} to check product physicality.`, groupError);
    // Return the member data but log the error. Address collection might not be triggered.
    return { ...data, requires_address_collection: false, product_id: 'unknown' } as GroupMemberWithProductPhysicality;
  }

  const productId = groupData.product_id;
  let requiresAddress = false;
  try {
    requiresAddress = await isProductPhysical(productId);
  } catch (physicalityError) {
    console.error(`joinGroup: Error checking product physicality for product ${productId}:`, physicalityError);
    // Proceed but flag that address collection state is uncertain
  }

  // Create a notification if address collection is required
  if (requiresAddress) {
    try {
      await createNotification({
        user_id: userId,
        title: 'Delivery Address Required',
        message: `Please provide your delivery address for the product in group ID: ${groupId.substring(0,8)}...`, // Keep message concise
        type: 'action_required', // A new type or use 'info'
        link: `/profile/delivery-address?group_member_id=${data.id}&group_id=${groupId}&product_id=${productId}`, // Example link to where they'd provide it
      });
    } catch (notificationError) {
        console.error(`joinGroup: Failed to create address requirement notification for user ${userId}, group ${groupId}:`, notificationError);
    }
  }

  return { ...data, requires_address_collection: requiresAddress, product_id: productId } as GroupMemberWithProductPhysicality;
}

export async function leaveGroup(groupId: string, userId: string): Promise<boolean> {
  const { error } = await supabaseClient
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) throw error

  // Update member count
  const { error: updateError } = await supabaseClient.rpc('decrement_group_member_count', {
    group_id: groupId
  })

  if (updateError) throw updateError

  return true
}

export async function updateVoteStatus(groupId: string, userId: string, voteStatus: 'approved' | 'rejected') {
  const { data, error } = await supabaseClient
    .from('group_members')
    .update({ vote_status: voteStatus })
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  if (voteStatus === 'approved') {
    const { data: members, error: memError } = await supabaseClient
      .from('group_members')
      .select('vote_status')
      .eq('group_id', groupId)

    if (!memError && members && members.every(m => m.vote_status === 'approved')) {
      try {
        await sendSoftwareSubscriptionCredentials(groupId)
      } catch (e) {
        console.error('Error sending subscription credentials:', e)
      }
    }
  }
  return data
}
