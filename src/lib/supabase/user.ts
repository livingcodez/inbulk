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
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  role?: UserRole
  account_name?: string | null
  account_number?: string | null
  bank_name?: string | null
  currency?: string | null
  shipping_address?: string | null
  phone_number?: string | null
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
  first_name?: string | null
  last_name?: string | null
  avatar_url: string | null
  role: UserRole
  account_name?: string | null
  account_number?: string | null
  bank_name?: string | null
  currency?: string | null
  shipping_address?: string | null
  phone_number?: string | null
}) {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .insert({
      ...profile,
      wallet_balance: 0,
      holds: 0,
      account_name: profile.account_name ?? null,
      account_number: profile.account_number ?? null,
      bank_name: profile.bank_name ?? null,
      currency: profile.currency ?? null,
      first_name: profile.first_name ?? null,
      last_name: profile.last_name ?? null,
      shipping_address: profile.shipping_address ?? null,
      phone_number: profile.phone_number ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
