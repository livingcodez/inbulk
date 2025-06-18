'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: ReactNode
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    { href: '/shop', label: 'Shop', icon: '🛍️' },
    { href: '/groups', label: 'Groups', icon: '👥' },
    { href: '/wallet', label: 'Wallet', icon: '💳' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <main className="flex-1 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-bottom-bar">
        <div className="flex items-center justify-around h-16 px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-16 text-sm transition-colors',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-neutral-400 hover:text-neutral-700'
              )}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
