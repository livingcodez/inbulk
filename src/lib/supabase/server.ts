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

    // Handle errors from the initial fetch
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching existing profile. Full error object:', JSON.stringify(error, null, 2));
      if (typeof error === 'object' && error !== null) {
        console.error('Error fetching existing profile code:', (error as any).code);
        console.error('Error fetching existing profile details:', (error as any).details);
        console.error('Error fetching existing profile hint:', (error as any).hint);
      }
      throw error; // Re-throw unexpected errors
    }

    // If profile was found, return it
    if (profile) {
      return profile;
    }

    // If no profile was found (error.code was 'PGRST116' or error was null but profile was also null), create one.
    // console.log(`No profile found for user ${user.id}, attempting to create one.`); // Optional: for debugging
    try {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name ?? null, // Safe access
          avatar_url: user.user_metadata?.avatar_url ?? null, // Safe access
          role: 'buyer', // Default role
          wallet_balance: 0,
          holds: 0,
        })
          .select()
          .single();

        if (createError) {
          console.error('Error creating new profile. Full error object:', JSON.stringify(createError, null, 2));
          if (typeof createError === 'object' && createError !== null) {
            console.error('Error creating new profile code:', (createError as any).code);
            console.error('Error creating new profile details:', (createError as any).details);
            console.error('Error creating new profile hint:', (createError as any).hint);
          }
          throw createError; // Re-throw to be caught by the outer catch
        }
        // console.log(`New profile created for user ${user.id}:`, newProfile); // Optional: for debugging
        return newProfile;
    } catch (creationPhaseError: any) {
      console.error('Exception during profile creation phase. Full error:', JSON.stringify(creationPhaseError, null, 2));
      if (typeof creationPhaseError === 'object' && creationPhaseError !== null) {
        console.error('Exception during profile creation phase code:', creationPhaseError.code);
        console.error('Exception during profile creation phase message:', creationPhaseError.message);
      }
      throw creationPhaseError; // Re-throw to be caught by the outer catch
    }

  } catch (error: any) {
    console.error('Outer catch - Profile error caught. Full error object:', JSON.stringify(error, null, 2));
    if (error && typeof error === 'object') {
      console.error('Outer catch - Profile error code:', error.code);
      console.error('Outer catch - Profile error details:', error.details);
      console.error('Outer catch - Profile error hint:', error.hint);
      console.error('Outer catch - Profile error message:', error.message);
    }
    return null
  }
}
