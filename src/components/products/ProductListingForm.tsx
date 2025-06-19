'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { type Product } from '@/types/database.types'; // Ensure Product type is available

// Define the specific data structure the form collects and onSubmit expects
export interface ProductFormData {
  name: string; // Product title
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  is_fungible: boolean;
  min_participants: number | null;
  max_participants: number | null;
  end_date: string | null;
}

interface ProductListingFormProps {
  onSubmit: (formData: ProductFormData) => Promise<void>;
  // initialData could be mapped from Product to ProductFormData if needed for an edit form
  initialData?: Partial<ProductFormData>; // Use ProductFormData for consistency if editing
}

export function ProductListingForm({ onSubmit, initialData }: ProductListingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: ProductFormData = {
      name: formData.get('title') as string, // Map 'title' from form to 'name'
      description: formData.get('description') as string || null,
      price: parseFloat(formData.get('price') as string),
      image_url: formData.get('image_url') as string || null,
      category: formData.get('category') as string, // New field
      is_fungible: (formData.get('is_fungible') === 'on' || formData.get('is_fungible') === 'true'), // New field
      min_participants: parseInt(formData.get('min_participants') as string) || null, // Ensure null if empty
      max_participants: parseInt(formData.get('max_participants') as string) || null, // Ensure null if empty
      end_date: formData.get('end_date') as string || null,
    };

    // Basic validation example (can be expanded)
    if (!data.name || !data.category || isNaN(data.price) || data.price <= 0) {
        setError("Please fill in all required fields: Title, Category, and a valid Price.");
        setLoading(false);
        return;
    }
    if (data.min_participants && data.min_participants < 1) {
        setError("Minimum participants must be at least 1.");
        setLoading(false);
        return;
    }
    if (data.max_participants && data.min_participants && data.max_participants < data.min_participants) {
        setError("Maximum participants cannot be less than minimum participants.");
        setLoading(false);
        return;
    }


    try {
      await onSubmit(data);
      // If onSubmit resolves, it's successful. The modal will handle closing.
      // If editing, form could be reset here: e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Product Title</label>
          <input type="text" name="title" id="title" required defaultValue={initialData?.name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50" />
        </div>
        {/* Add Category input */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Category</label>
          <input type="text" name="category" id="category" required defaultValue={initialData?.category} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50" />
        </div>
        {/* ... (description, price, end_date, min_participants, max_participants, image_url inputs - add dark mode classes) ... */}
        {/* Example for description with dark mode */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Description</label>
          <textarea name="description" id="description" rows={3} defaultValue={initialData?.description || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50" />
        </div>
        {/* Add other inputs similarly, ensuring dark mode classes for inputs: dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50 */}

        {/* Example for price input with dark mode */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Price ($)</label>
                <input type="number" name="price" id="price" required min="0.01" step="0.01" defaultValue={initialData?.price} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50" />
            </div>
            {/* ... end_date ... */}
             <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Group End Date (Optional)</label>
                <input type="datetime-local" name="end_date" id="end_date" defaultValue={initialData?.end_date || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="min_participants" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Min. Participants (Optional)</label>
                <input type="number" name="min_participants" id="min_participants" min="1" defaultValue={initialData?.min_participants ?? 1} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50" />
            </div>
            <div>
                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Max. Participants (Optional)</label>
                <input type="number" name="max_participants" id="max_participants" min="1" defaultValue={initialData?.max_participants || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50" />
            </div>
        </div>
         <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Image URL (Optional)</label>
          <input type="url" name="image_url" id="image_url" defaultValue={initialData?.image_url || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50" />
        </div>

        {/* Add Is Fungible checkbox */}
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input id="is_fungible" name="is_fungible" type="checkbox" defaultChecked={initialData?.is_fungible ?? false} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-neutral-700 dark:border-neutral-600 dark:checked:bg-primary" />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="is_fungible" className="font-medium text-gray-700 dark:text-neutral-300">Unique/Non-Fungible Item</label>
            <p className="text-gray-500 dark:text-neutral-400 text-xs">Check if this item is unique (e.g., a specific art print, collectible).</p>
          </div>
        </div>
      </div>
      {/* ... (submit button) ... */}
       <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="dark:bg-primary-dark dark:hover:bg-primary-dark/90">
          {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
}
