'use client'
import { useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { Pencil } from 'lucide-react'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { Button } from '@/components/ui/Button'
import { PersonalInfoModal } from './PersonalInfoModal'

export function PersonalInfoSection() {
  const { profile, session } = useSupabase()
  const [expanded, setExpanded] = useState(false)
  const [open, setOpen] = useState(false)

  const toggle = () => setExpanded(prev => !prev)
  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <div className="relative">
      <div className="flex flex-col items-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-full">
          <Image
            src={profile?.avatar_url || '/avatars/default.jpg'}
            alt={profile?.full_name || 'Profile'}
            fill
            className="object-cover"
          />
        </div>
        <h3 className="mt-2 text-lg font-semibold text-center">
          {profile?.full_name || 'Not Available'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground text-center">
          {session?.user.email || ''}
        </p>
        <div className="relative mt-4 w-full">
          <div
            className={clsx(
              'absolute inset-x-0 bottom-0 grid gap-2 bg-background text-center transition-all duration-300',
              expanded ? 'max-h-40 translate-y-0' : 'max-h-6 translate-y-[95%]'
            )}
            aria-hidden={!expanded}
          >
            {expanded && profile?.phone_number && (
              <p data-testid="phone" className="text-sm">
                {profile.phone_number}
              </p>
            )}
            {expanded && profile?.shipping_address && (
              <p data-testid="address" className="text-sm">
                {profile.shipping_address}
              </p>
            )}
            <button
              onClick={toggle}
              className="rounded-t-md bg-muted px-3 py-1 text-sm font-medium"
            >
              {expanded ? 'Hide' : 'See More'}
            </button>
          </div>
        </div>
      </div>
      <Button
        size="sm"
        onClick={openModal}
        aria-label="Edit Personal Information"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <PersonalInfoModal isOpen={open} onClose={closeModal} />
    </div>
  )
}
