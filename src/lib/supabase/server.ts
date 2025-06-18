import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { Database } from '@/types/database.types'

// Create a cached version of the Supabase client to prevent multiple instances
export const createServerSupabaseClient = cache(async () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
})

// Get authenticated user data
export async function getAuthUser() {
  const supabase = await createServerSupabaseClient()
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

// Get user profile with authenticated user data
export async function getUserProfile() {
  const user = await getAuthUser()
  if (!user) return null

  const supabase = await createServerSupabaseClient()
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    // Create profile if it doesn't exist
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata.full_name,
          avatar_url: user.user_metadata.avatar_url,
          role: 'buyer',
          wallet_balance: 0,
          holds: 0,
        })
        .select()
        .single()

      if (createError) throw createError
      return newProfile
    }

    return profile
  } catch (error) {
    console.error('Profile error:', error)
    return null
  }
}
