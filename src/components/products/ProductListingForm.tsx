'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { type Product } from '@/types/database.types'

interface ProductListingFormProps {
  onSubmit: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'status' | 'vendor_id'>) => Promise<void>
  initialData?: Partial<Product>
}

export function ProductListingForm({ onSubmit, initialData }: ProductListingFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image_url: formData.get('image_url') as string || null,
      min_participants: parseInt(formData.get('min_participants') as string) || 1,
      max_participants: parseInt(formData.get('max_participants') as string) || null,
      end_date: formData.get('end_date') as string || null
    }

    try {
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">      <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Product Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            defaultValue={initialData?.title}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            defaultValue={initialData?.description || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              id="price"
              required
              min="0"
              step="0.01"
              defaultValue={initialData?.price}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="datetime-local"
              name="end_date"
              id="end_date"
              defaultValue={initialData?.end_date || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="min_participants" className="block text-sm font-medium text-gray-700">
              Minimum Participants
            </label>
            <input
              type="number"
              name="min_participants"
              id="min_participants"
              min="1"
              defaultValue={initialData?.min_participants || 1}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">
              Maximum Participants
            </label>
            <input
              type="number"
              name="max_participants"
              id="max_participants"
              min="1"
              defaultValue={initialData?.max_participants || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
            Image URL (Optional)
          </label>
          <input
            type="url"
            name="image_url"
            id="image_url"
            defaultValue={initialData?.image_url || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
