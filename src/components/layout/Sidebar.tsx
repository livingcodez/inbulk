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
} from 'lucide-react'
import { useState, useRef, useCallback } from 'react'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { Tooltip } from '@/components/ui/tooltip'

const mainNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Shop', href: '/shop', icon: ShoppingBag },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
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
    ({ name, href, icon: Icon }: typeof mainNavItems[0]) => {
      const isActive = pathname.startsWith(href)

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
          role="menuitem"
        >
          <Icon
            className={cn(
              'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150',
              isActive
                ? 'text-primary dark:text-primary-light'
                : 'text-gray-400 group-hover:text-primary dark:text-gray-400 dark:group-hover:text-primary-light'
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              'truncate transition-all duration-300 ease-in-out',
              !isExpanded && 'opacity-0 md:opacity-100 w-0 md:w-auto'
            )}
          >
            {name}
          </span>
        </Link>
      )

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
    [pathname, isExpanded]
  )

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out',
        'bg-white border-r dark:bg-gray-900 dark:border-gray-800',
        'transform will-change-transform',
        isExpanded ? 'w-64' : 'w-16',
        !isExpanded && '-translate-x-0'
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="navigation"
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
        <nav className="flex-1 space-y-1 px-3" role="menu">
          {mainNavItems.map(renderNavItem)}
        </nav>

        {/* Bottom navigation */}
        <div className="px-3 mt-auto space-y-1" role="menu">
          {bottomNavItems.map(renderNavItem)}
        </div>
      </div>
    </aside>
  )
}
