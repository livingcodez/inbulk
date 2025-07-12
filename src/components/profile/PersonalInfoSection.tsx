'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Pencil, Users, Zap, User } from 'lucide-react'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { Button } from '@/components/ui/Button'
import { PersonalInfoModal } from './PersonalInfoModal'
import { PersonalInfoViewModal } from './PersonalInfoViewModal'
import { VendorManagerModal } from './VendorManagerModal'

export function PersonalInfoSection() {
  const { profile, session } = useSupabase()
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [vendorOpen, setVendorOpen] = useState(false)

  const openEditModal = () => setEditOpen(true)
  const closeEditModal = () => setEditOpen(false)
  const openViewModal = () => setViewOpen(true)
  const closeViewModal = () => setViewOpen(false)
  const openVendorModal = () => setVendorOpen(true)
  const closeVendorModal = () => setVendorOpen(false)

  let timeString = ''
  try {
    timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    timeString = ''
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-neutral-900 text-white">
      <div className="p-4 space-y-4">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            Personal Info
          </span>
          <span>{timeString}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-full">
            <Image
              src={profile?.avatar_url || '/avatars/default.jpg'}
              alt={profile?.full_name || 'Profile'}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{profile?.full_name || 'Not Available'}</h3>
            <p className="text-sm text-green-400">{session?.user.email || ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={openEditModal}
            aria-label="Edit Personal Information"
            className="flex-1 flex items-center justify-center"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={openVendorModal}
            className="flex-1 flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            Vendors
          </Button>
        </div>
      </div>
      <button
        onClick={openViewModal}
        className="flex w-full items-center justify-center gap-1 bg-green-500 py-2 text-sm font-medium text-black"
      >
        <Zap className="h-4 w-4" />
        See More
      </button>
      <PersonalInfoModal isOpen={editOpen} onClose={closeEditModal} />
      <PersonalInfoViewModal isOpen={viewOpen} onClose={closeViewModal} />
      <VendorManagerModal isOpen={vendorOpen} onClose={closeVendorModal} />
    </div>
  )
}
