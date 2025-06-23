'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { cn } from '@/lib/utils'

type Role = 'buyer' | 'vendor'

export function RoleToggle() {
  const { profile, updateProfile } = useSupabase()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Local state to manage the displayed role, influenced by URL/localStorage first
  const initialRole: Role = profile?.role === 'vendor' ? 'vendor' : 'buyer'
  const [currentDisplayRole, setCurrentDisplayRole] = useState<Role>(initialRole);

  useEffect(() => {
    const modeFromUrl = searchParams.get('mode') as Role | null
    const roleFromLocalStorage = typeof window !== 'undefined' ? localStorage.getItem('dashboardRole') as Role | null : null;
    let initialRole: Role = profile?.role === 'vendor' ? 'vendor' : 'buyer';

    if (modeFromUrl && ['buyer', 'vendor'].includes(modeFromUrl)) {
      initialRole = modeFromUrl;
    } else if (roleFromLocalStorage && ['buyer', 'vendor'].includes(roleFromLocalStorage)) {
      initialRole = roleFromLocalStorage;
    }

    setCurrentDisplayRole(initialRole);

    // If the determined initial role is different from the profile, update profile
    if (profile && profile.role !== initialRole) {
      updateProfile({ role: initialRole });
    }

    // Ensure URL reflects the currentDisplayRole if it's not already set by modeFromUrl
    // or if modeFromUrl is different from initialRole (e.g. localStorage override)
    if (modeFromUrl !== initialRole) {
        router.replace(`/dashboard?mode=${initialRole}`, { scroll: false });
    }

  }, [searchParams, profile, updateProfile, router]);

  const handleRoleChange = async (newRole: Role) => {
    // Determine the target tab for the new role
    let targetTabQueryParam = '';
    if (typeof window !== 'undefined') { // Ensure localStorage is available
      if (newRole === 'buyer') {
        const buyerTab = localStorage.getItem('buyerActiveTab');
        targetTabQueryParam = (buyerTab === 'mygroups' || buyerTab === 'explore') ? buyerTab : 'explore';
      } else { // newRole === 'vendor'
        const vendorTab = localStorage.getItem('vendorActiveTab');
        targetTabQueryParam = (vendorTab === 'orders' || vendorTab === 'mylistings') ? vendorTab : 'mylistings';
      }
    } else {
      // Fallback if localStorage is somehow not available (should not happen in client component)
      targetTabQueryParam = (newRole === 'buyer') ? 'explore' : 'mylistings';
    }

    // Update profile in Supabase (if profile exists and role is different)
    if (profile && profile.role !== newRole) {
      try {
        await updateProfile({ role: newRole });
        // If successful, proceed with navigation
      } catch (error) {
        console.error("Failed to update role in profile:", error);
        // Optionally, handle UI feedback here if profile update fails
        // For now, we'll still attempt to navigate to allow UI to reflect user's intent
        // Or, one might choose to revert the optimistic UI changes if any were made
      }
    } else if (!profile) {
        // If no profile, we may need to wait. For now, this component doesn't block navigation.
        // The target page (/dashboard) should handle profile loading and redirects if necessary.
    }

    // Persist the chosen role itself to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardRole', newRole);
    }

    // Navigate to the new mode with the determined target tab
    router.push(`/dashboard?mode=${newRole}&tab=${targetTabQueryParam}`, { scroll: false });

    // The local currentDisplayRole state in RoleToggle will update via its own useEffect
    // reacting to the URL change (searchParams.get('mode')).
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleRoleChange('buyer')}
        className={cn(
          'px-4 py-2 rounded border font-medium transition-colors',
          currentDisplayRole === 'buyer'
            ? 'bg-primary text-white border-primary'
            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700'
        )}
      >
        Buyer
      </button>
      <button
        onClick={() => handleRoleChange('vendor')}
        className={cn(
          'px-4 py-2 rounded border font-medium transition-colors',
          currentDisplayRole === 'vendor'
            ? 'bg-primary text-white border-primary'
            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700'
        )}
      >
        Vendor
      </button>
    </div>
  )
}
