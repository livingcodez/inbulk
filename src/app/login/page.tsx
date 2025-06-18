'use client'

import { useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database.types'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Welcome to CrowdCart Studio
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to continue to your account
          </p>
        </div>
        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{ theme: ThemeSupa }}
            theme="light"
            showLinks={true}
            providers={['google']}
            redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
          />
        </div>
      </div>
    </div>
  )
}
