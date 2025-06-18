'use client'

import { useSupabase } from '@/contexts/SupabaseProvider'
import { Avatar } from '@/components/ui/Avatar'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

export function Header() {
  const { profile } = useSupabase()

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Header Actions */}
          <div className="flex items-center gap-6">
            {/* Wallet */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">Balance</span>
              <span className="font-medium text-primary">
                ${profile?.wallet_balance?.toFixed(2) ?? '0.00'}
              </span>
            </div>

            {/* User Profile */}
            <Avatar
              src={profile?.avatar_url}
              alt={profile?.full_name ?? 'User'}
              size={32}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
