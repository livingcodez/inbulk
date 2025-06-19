'use client'

import { useState, useEffect } from 'react';
import { ProductListingForm, type ProductFormData } from './ProductListingForm';
import { createProduct } from '@/lib/supabase/products'; // Import Supabase function
import { useSupabase } from '@/contexts/SupabaseProvider'; // To get profile for vendor_id
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button'; // Assuming Button is a general component

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void; // To trigger refresh
}

export function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const { profile } = useSupabase(); // Get current user's profile for vendor_id
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // To disable form submission button if needed

  useEffect(() => {
    // Reset error when modal is opened/closed
    setSubmissionError(null);
  }, [isOpen]);

  const handleFormSubmit = async (formData: ProductFormData) => {
    if (!profile?.id) {
      setSubmissionError("User not authenticated. Cannot add product.");
      return;
    }
    setIsSubmitting(true);
    setSubmissionError(null);

    const productDataForApi = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      image_url: formData.image_url,
      category: formData.category,
      is_fungible: formData.is_fungible,
      vendor_id: profile.id,
      min_buyers: formData.min_participants, // Map min_participants to min_buyers
      max_buyers: formData.max_participants, // Map max_participants to max_buyers
      end_date: formData.end_date, // Pass through end_date if collected
      // Fields not in ProductFormData but in createProduct's type, set to null or default
      subcategory: null,
      actual_cost: null, // Assuming not collected by this form
      delivery_time: null, // Assuming not collected by this form
    };

    try {
      // console.log("Submitting to createProduct:", productDataForApi);
      await createProduct(productDataForApi);
      alert('Product added successfully!'); // Simple feedback for now
      onProductAdded(); // Trigger list refresh
      onClose(); // Close modal
    } catch (error: any) {
      console.error("Failed to create product:", error);
      setSubmissionError(error.message || "Failed to add product. Please try again.");
      // The error will also be shown in ProductListingForm's internal error display if it re-throws
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-850 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Add New Product</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
            <X size={24} />
          </button>
        </div>

        {submissionError && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-sm text-red-700 dark:text-red-300">{submissionError}</p>
          </div>
        )}

        <ProductListingForm
            onSubmit={handleFormSubmit}
            // initialData can be an empty object or mapped if we were editing
        />
      </div>
    </div>
  );
}
