'use client'

import { useRouter } from 'next/navigation' // For redirect
import { useSupabase } from '@/contexts/SupabaseProvider'
import { Avatar } from '@/components/ui/Avatar'
import { Logo } from '@/components/ui/Logo'
import { UserDropdownMenu, type DropdownMenuItem } from '@/components/ui/UserDropdownMenu' // Import new components
import { LogOut, UserCircle } from 'lucide-react'; // Example icons
// import { cn } from '@/lib/utils'; // cn is not used in the final proposed code, can be removed if UserDropdownMenu handles all its internal cn uses.

export function Header() {
  const { supabase, profile } = useSupabase(); // supabase client for auth
  const router = useRouter();

  const handleSignOut = async () => {
    if (!supabase) {
      console.error('Supabase client not available for sign out.');
      // Fallback redirect even if supabase client is missing for some reason
      router.push('/login');
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    } finally {
      // Redirect to login page regardless of signOut success to ensure a clean state
      // Supabase client listeners should handle clearing local session data.
      router.push('/login');
      router.refresh(); // To ensure layout re-evaluates auth state
    }
  };

  const menuItems: DropdownMenuItem[] = [
    // {
    //   label: 'Profile',
    //   onClick: () => router.push('/profile')
    //   // icon: <UserCircle size={16} className="mr-2" /> // If dropdown supported icons
    // },
    // { type: 'divider' }, // If dropdown supported dividers
    {
      label: 'Sign out',
      onClick: handleSignOut,
      isDanger: true,
      // icon: <LogOut size={16} className="mr-2" /> // If dropdown supported icons
    },
  ];

  const userTrigger = (
    <div className="flex items-center gap-2 cursor-pointer p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors">
      <Avatar
        src={profile?.avatar_url}
        alt={profile?.full_name ?? 'User'}
        size={32} // existing size
      />
      {profile?.full_name && (
         <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 hidden md:inline">
            {profile.full_name.split(' ')[0]} {/* Display only first name */}
         </span>
      )}
       {/* Chevron down icon could be nice here if not part of Avatar itself */}
    </div>
  );

  return (
    <header className="bg-white border-b shadow-sm dark:bg-neutral-850 dark:border-neutral-700 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Header Actions */}
          <div className="flex items-center gap-4 sm:gap-6"> {/* Adjusted gap for responsiveness */}
            {/* Wallet */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Balance:</span>
              <span className="font-medium text-primary dark:text-primary-dark">
                ${profile?.wallet_balance?.toFixed(2) ?? '0.00'}
              </span>
            </div>

            {/* User Profile Dropdown */}
            {profile ? ( // Only show dropdown if profile is loaded (user is logged in)
              <UserDropdownMenu trigger={userTrigger} items={menuItems} menuWidthClass="w-56" />
            ) : (
              // Optional: Placeholder or login button if profile is null and page is public
              // For a dashboard header, profile should ideally always exist.
              // If not, SupabaseProvider or page logic should redirect to login.
              <div className="h-8 w-24 bg-neutral-200 rounded animate-pulse"></div> // Simple pulse placeholder
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
