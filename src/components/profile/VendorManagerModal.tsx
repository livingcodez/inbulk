'use client'
import { X } from 'lucide-react'
import { VendorListManager } from './VendorListManager'

interface VendorManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VendorManagerModal({ isOpen, onClose }: VendorManagerModalProps) {
  if (!isOpen) return null
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
          <h2 className="text-lg font-semibold">Vendors</h2>
          <button onClick={onClose} aria-label="Close" className="text-neutral-500 hover:text-neutral-700">
            <X size={20} />
          </button>
        </div>
        <VendorListManager />
      </div>
    </button>
  )
}
