'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  UserCircle,
  ChevronRight,
  Mail, // Added for Inbox
  Settings, // Added for Settings
} from 'lucide-react'
import { useState, useRef, useCallback, useEffect } from 'react' // Ensure useEffect, useState are imported
import { useSupabase } from '@/contexts/SupabaseProvider'
import { Tooltip } from '@/components/ui/tooltip'
import { getUnreadNotificationCount } from '@/lib/supabase/notifications'; // NEW IMPORT

const mainNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: Mail }, // Added Inbox item
]

const bottomNavItems = [
  { name: 'Profile', href: '/profile', icon: UserCircle },
]

const SWIPE_THRESHOLD = 50 // minimum distance for swipe
const SWIPE_TIMEOUT = 300 // maximum time for swipe

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useSupabase()
  const [isExpanded, setIsExpanded] = useState(false)
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })

  const [unreadCount, setUnreadCount] = useState(0); // NEW STATE

  // useEffect to fetch unread count
  useEffect(() => {
    if (profile?.id) {
      const fetchCount = async () => {
        try {
          // console.log(`Sidebar: Fetching count for user ${profile.id}`); // Debug log
          const count = await getUnreadNotificationCount(profile.id);
          // console.log(`Sidebar: Fetched count: ${count}`); // Debug log
          setUnreadCount(count);
        } catch (error) {
          console.error("Sidebar: Error calling getUnreadNotificationCount", error);
          setUnreadCount(0); // Fallback on error
        }
      };
      fetchCount();
    } else {
      // console.log("Sidebar: No profile.id, setting unreadCount to 0"); // Debug log
      setUnreadCount(0); // Reset if profile or profile.id is not available
    }
  }, [profile]); // Re-fetch if profile changes

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    }

    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = Math.abs(touchEnd.y - touchStartRef.current.y)
    const deltaTime = touchEnd.time - touchStartRef.current.time

    // Only consider horizontal swipes with minimal vertical movement
    if (
      Math.abs(deltaX) > SWIPE_THRESHOLD &&
      deltaY < SWIPE_THRESHOLD &&
      deltaTime < SWIPE_TIMEOUT
    ) {
      setIsExpanded(deltaX > 0) // swipe right expands, left collapses
    }
  }, [])

  const renderNavItem = useCallback(
    // ({ name, href, icon: Icon }: typeof mainNavItems[0]) => { // Original typing
    // Using a more generic type for item to satisfy both main and bottom nav items if their types differ slightly
    // For now, assuming they share: name: string, href: string, icon: React.ElementType
    ({ name, href, icon: Icon }: { name: string; href: string; icon: React.ElementType }) => {
      const isActive = pathname.startsWith(href);

      // Dynamic condition for showing the notification badge
      const showNotificationBadge = name === 'Inbox' && unreadCount > 0;

      const linkContent = (
        <Link
          href={href}
          className={cn(
            'group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            isActive
              ? 'bg-gray-100 text-primary dark:bg-gray-800 dark:text-primary-light'
              : 'text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light'
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          <div className="relative flex-shrink-0"> {/* Wrapper for icon and potential badge on icon */}
            <Icon
              className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors duration-150', // Removed mr-3 from here
                isActive
                  ? 'text-primary dark:text-primary-light'
                  : 'text-gray-400 group-hover:text-primary dark:text-gray-400 dark:group-hover:text-primary-light'
              )}
              aria-hidden="true"
            />
            {/* Badge on icon (for collapsed state, more subtle) */}
            {showNotificationBadge && !isExpanded && ( // Use showNotificationBadge
              <span className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white dark:ring-gray-900" />
            )}
          </div>

          {/* Text and expanded badge part - only render if sidebar is expanded */}
          {isExpanded && (
            <>
              <span
                className={cn(
                  'truncate transition-opacity duration-200 ease-in-out ml-3', // Simpler class, rely on parent flex for layout
                  // Opacity and width are handled by isExpanded condition now for rendering
                )}
              >
                {name}
              </span>
              {showNotificationBadge && ( // No need for && isExpanded here as this whole block is under isExpanded
                <span className="ml-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500" />
              )}
            </>
          )}
        </Link>
      );

      return (
        <div key={name} className="relative">
          {!isExpanded ? (
            <Tooltip content={name} side="right">
              {linkContent}
            </Tooltip>
          ) : (
            linkContent
          )}
        </div>
      )
    },
    [pathname, isExpanded, unreadCount] // ADD unreadCount to dependency array
  )

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 transition-all duration-300 ease-in-out',
        'h-[calc(100vh-4rem)]',
        'bg-white border-r border-t dark:bg-gray-900',
        'dark:border-r-gray-800 dark:border-t-neutral-700',
        'transform will-change-transform',
        isExpanded ? 'w-64' : 'w-16',
        !isExpanded && '-translate-x-0'
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Main navigation"
    >
      <div className="flex h-full flex-col py-8">
        {/* Toggle button for mobile */}
        <button
          className="md:hidden absolute -right-3 top-6 bg-white border rounded-full p-1 shadow-sm"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={isExpanded}
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 text-neutral-500 transition-transform duration-300',
              isExpanded ? 'rotate-180' : ''
            )}
            aria-hidden="true"
          />
        </button>

        {/* Main navigation */}
        <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation links">
          {mainNavItems.map(renderNavItem)}
        </nav>

        {/* Bottom navigation */}
        <nav className="px-3 mt-auto space-y-1" aria-label="User navigation links">
          {bottomNavItems.map(renderNavItem)}
        </nav>
      </div>
    </aside>
  )
}
