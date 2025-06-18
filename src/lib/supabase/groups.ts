import supabaseClient from './supabaseClient'

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

  if (updateError) throw updateError

  return data
}

export async function leaveGroup(groupId: string, userId: string) {
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
  return data
}
