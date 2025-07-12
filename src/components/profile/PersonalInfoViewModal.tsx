'use client'
import { X } from 'lucide-react'
import { useSupabase } from '@/contexts/SupabaseProvider'

interface PersonalInfoViewModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PersonalInfoViewModal({ isOpen, onClose }: PersonalInfoViewModalProps) {
  const { profile } = useSupabase()

  if (!isOpen) return null

  const hasDetails = profile?.phone_number || profile?.shipping_address

  return (
    <button
      type="button"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
      onKeyDown={(e) => (e.key === 'Escape' ? onClose() : null)}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="bg-white dark:bg-neutral-850 p-6 rounded-lg shadow-xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Contact Details</h2>
          <button onClick={onClose} aria-label="Close" className="text-neutral-500 hover:text-neutral-700">
            <X size={20} />
          </button>
        </div>
        {hasDetails ? (
          <div className="space-y-2">
            {profile?.phone_number && (
              <p data-testid="modal-phone" className="text-sm text-center">{profile.phone_number}</p>
            )}
            {profile?.shipping_address && (
              <p data-testid="modal-address" className="text-sm text-center">{profile.shipping_address}</p>
            )}
          </div>
        ) : (
          <p data-testid="no-details" className="text-sm text-muted-foreground text-center">No additional details</p>
        )}
      </div>
    </button>
  )
}
