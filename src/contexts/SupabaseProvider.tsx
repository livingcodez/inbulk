'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
// Use Profile type from database types
type Profile = Database['public']['Tables']['user_profiles']['Row']

type SupabaseContext = {
  session: Session | null
  profile: Profile | null
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const Context = createContext<SupabaseContext>({
  session: null,
  profile: null,
  signOut: async () => {},
  updateProfile: async () => {},
})

export default function SupabaseProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  const supabase = createClientComponentClient<Database>()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const getProfile = async () => {
      try {
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) throw error
          if (data) setProfile(data)
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
      }
    }

    getProfile()
  }, [session, supabase])

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event: AuthChangeEvent, currentSession: Session | null) => {
      if (event === 'SIGNED_OUT') {
        // Explicitly redirect to login page on sign out
        window.location.href = '/login';
      } else if (currentSession?.user.id !== session?.user.id) {
        // Refresh the page on other auth changes to ensure proper session state
        window.location.reload();
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, [session?.user.id, supabase.auth, supabase]); // Added supabase to dependency array as it's used in the effect.

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single()

      if (error) throw error
      if (data) setProfile(data)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const value = {
    session,
    profile,
    signOut,
    updateProfile,
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
