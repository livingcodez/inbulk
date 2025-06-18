import { type UserRole } from '@/types/database.types'
import supabaseClient from './supabaseClient'

export async function getUserProfile(userId: string) {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: {
  full_name?: string | null
  avatar_url?: string | null
  role?: UserRole
}) {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createUserProfile(profile: {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
}) {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .insert({
      ...profile,
      wallet_balance: 0,
      holds: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
