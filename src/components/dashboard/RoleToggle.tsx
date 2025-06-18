'use client'

import { useSupabase } from '@/contexts/SupabaseProvider'
import { cn } from '@/lib/utils'

export function RoleToggle() {
  const { profile, updateProfile } = useSupabase()

  const handleRoleChange = async (role: 'buyer' | 'vendor') => {
    if (!profile) return
    await updateProfile({ role })
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleRoleChange('buyer')}
        className={cn(
          'px-4 py-2 rounded border font-medium transition-colors',
          profile?.role === 'buyer'
            ? 'bg-primary text-white border-primary'
            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
        )}
      >
        Buyer
      </button>
      <button
        onClick={() => handleRoleChange('vendor')}
        className={cn(
          'px-4 py-2 rounded border font-medium transition-colors',
          profile?.role === 'vendor'
            ? 'bg-primary text-white border-primary'
            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
        )}
      >
        Vendor
      </button>
    </div>
  )
}
