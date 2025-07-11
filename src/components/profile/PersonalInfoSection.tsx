'use client'
import { useState } from 'react'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { Button } from '@/components/ui/Button'
import { PersonalInfoModal } from './PersonalInfoModal'

export function PersonalInfoSection() {
  const { profile, session } = useSupabase()
  const [showMore, setShowMore] = useState(false)
  const [open, setOpen] = useState(false)

  const toggleMore = () => setShowMore(prev => !prev)
  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="pi_fullname" className="text-sm font-medium">Full Name</label>
          <input
            id="pi_fullname"
            value={profile?.full_name || ''}
            readOnly
            className="w-full rounded-lg border bg-background px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="pi_email" className="text-sm font-medium">Email</label>
          <input
            id="pi_email"
            value={session?.user.email || ''}
            readOnly
            className="w-full rounded-lg border bg-background px-3 py-2"
          />
        </div>
        {showMore && (
          <>
            <div className="space-y-2">
              <label htmlFor="pi_phone" className="text-sm font-medium">Phone Number</label>
              <input
                id="pi_phone"
                value={profile?.phone_number || ''}
                readOnly
                className="w-full rounded-lg border bg-background px-3 py-2"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="pi_address" className="text-sm font-medium">Shipping Address</label>
              <textarea
                id="pi_address"
                value={profile?.shipping_address || ''}
                readOnly
                className="w-full rounded-lg border bg-background px-3 py-2"
              />
            </div>
          </>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={toggleMore}>
          {showMore ? 'Hide' : 'See More'}
        </Button>
        <Button onClick={openModal}>Edit Personal Information</Button>
      </div>
      <PersonalInfoModal isOpen={open} onClose={closeModal} />
    </div>
  )
}
