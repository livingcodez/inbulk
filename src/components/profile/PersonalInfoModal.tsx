'use client'
import { useState, useEffect } from 'react'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

interface PersonalInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PersonalInfoModal({ isOpen, onClose }: PersonalInfoModalProps) {
  const { profile, updateProfile } = useSupabase()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    shipping_address: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        shipping_address: profile.shipping_address || ''
      })
      setError(null)
    }
  }, [isOpen, profile])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number,
        shipping_address: form.shipping_address,
        full_name: `${form.first_name} ${form.last_name}`.trim()
      })
      onClose()
    } catch (err) {
      console.error('Failed to update profile', err)
      setError('Failed to save changes')
    } finally {
      setLoading(false)
    }
  }

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
          <h2 className="text-lg font-semibold">Edit Personal Info</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-2">
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full border rounded px-2 py-1"
          />
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full border rounded px-2 py-1"
          />
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full border rounded px-2 py-1"
          />
          <textarea
            name="shipping_address"
            value={form.shipping_address}
            onChange={handleChange}
            placeholder="Shipping Address"
            className="w-full border rounded px-2 py-1"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={loading}>
              Save
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </button>
  )
}
