'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Pencil } from 'lucide-react'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { Button } from '@/components/ui/Button'
import { PersonalInfoModal } from './PersonalInfoModal'
import { PersonalInfoViewModal } from './PersonalInfoViewModal'

export function PersonalInfoSection() {
  const { profile, session } = useSupabase()
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)

  const openEditModal = () => setEditOpen(true)
  const closeEditModal = () => setEditOpen(false)
  const openViewModal = () => setViewOpen(true)
  const closeViewModal = () => setViewOpen(false)

  return (
    <div className="relative pb-8">
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
      </div>
      <button
        onClick={openViewModal}
        className="absolute left-1/2 bottom-0 translate-y-1/2 -translate-x-1/2 rounded-t-md bg-muted px-3 py-1 text-sm font-medium"
      >
        See More
      </button>
      <Button
        size="sm"
        onClick={openEditModal}
        aria-label="Edit Personal Information"
        className="absolute right-2 top-2 p-2"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <PersonalInfoModal isOpen={editOpen} onClose={closeEditModal} />
      <PersonalInfoViewModal isOpen={viewOpen} onClose={closeViewModal} />
    </div>
  )
}
