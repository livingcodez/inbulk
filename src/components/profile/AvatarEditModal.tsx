'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { X } from 'lucide-react'

interface AvatarEditModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AvatarEditModal({ isOpen, onClose }: AvatarEditModalProps) {
  const { profile, updateProfile } = useSupabase()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDirectImage = (value: string) => /\.(png|jpe?g|gif|webp)$/i.test(value.split('?')[0])

  useEffect(() => {
    if (isOpen) {
      setUrl(profile?.avatar_original_url || profile?.avatar_url || '')
      setError(null)
    }
  }, [isOpen, profile?.avatar_url, profile?.avatar_original_url])

  const resolveImage = async (link: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/resolve-image?url=${encodeURIComponent(link)}`)
      if (res.ok) {
        const data = await res.json()
        return data.image as string
      }
    } catch (err) {
      console.error('resolve-image error', err)
    }
    return null
  }

  const handleSave = async () => {
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Image URL required')
      return
    }
    let finalImage = trimmed
    if (!isDirectImage(trimmed)) {
      setLoading(true)
      const resolved = await resolveImage(trimmed)
      if (!resolved || !isDirectImage(resolved)) {
        setLoading(false)
        setError('Invalid or unreachable image')
        return
      }
      finalImage = resolved
    }
    const avatarPath = `/api/thumbnail?imageUrl=${encodeURIComponent(finalImage)}`
    setLoading(true)
    try {
      await updateProfile({
        avatar_url: avatarPath,
        avatar_original_url: trimmed,
      })
      onClose()
    } catch (err) {
      console.error('Failed to update avatar', err)
      setError('Failed to update avatar')
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
          <h2 className="text-lg font-semibold">Edit Avatar</h2>
          <button onClick={onClose} aria-label="Close" className="text-neutral-500 hover:text-neutral-700">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-2">
          <input
            placeholder="Image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border rounded px-2 py-1 text-neutral-900 dark:text-white"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={loading}>Save</Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </button>
  )
}
