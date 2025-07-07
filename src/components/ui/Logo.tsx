'use client'

import Link from 'next/link'
import { useSupabase } from '@/contexts/SupabaseProvider'

export function Logo() {
  const { session } = useSupabase()

  const content = (
    <>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M27 7H5C4.44772 7 4 7.44772 4 8V24C4 24.5523 4.44772 25 5 25H27C27.5523 25 28 24.5523 28 24V8C28 7.44772 27.5523 7 27 7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 12C21 14.2091 19.2091 16 17 16C14.7909 16 13 14.2091 13 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xl font-semibold text-primary quicksand">
        CrowdCart
      </span>
    </>
  )

  return session ? (
    <Link
      href="/dashboard?mode=buyer&tab=explore"
      className="flex items-center gap-2"
    >
      {content}
    </Link>
  ) : (
    <div className="flex items-center gap-2">{content}</div>
  )
}
