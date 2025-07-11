import supabaseClient from './supabaseClient'

export interface UserVendor {
  id: string
  owner_id: string
  name: string
  contact_info: any | null
  addresses: any | null
  created_at: string
}

export async function getUserVendors() {
  const { data, error } = await supabaseClient
    .from('user_managed_vendors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as UserVendor[]
}

export async function createUserVendor(vendor: {
  name: string
  contact_info?: any
  addresses?: any
}) {
  const { data, error } = await supabaseClient
    .from('user_managed_vendors')
    .insert(vendor)
    .select()
    .single()

  if (error) throw error
  return data as UserVendor
}

export async function updateUserVendor(id: string, updates: {
  name?: string
  contact_info?: any
  addresses?: any
}) {
  const { data, error } = await supabaseClient
    .from('user_managed_vendors')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as UserVendor
}

export async function deleteUserVendor(id: string) {
  const { error } = await supabaseClient
    .from('user_managed_vendors')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
