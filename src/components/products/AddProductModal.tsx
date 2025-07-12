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

    // Map ProductFormData to the structure expected by createProduct
    const productDataForApi = {
      title: formData.name, // Changed from name to title, mapped from formData.name
      description: formData.description,
      // Calculate price if actualCost and groupSize are available, otherwise default or handle as per createProduct's needs
      price: (formData.actualCost && formData.groupSize && formData.groupSize > 0) ? formData.actualCost / formData.groupSize : 0,
      image_url: formData.image_url,
      vendor_id: profile.id,
      category: formData.category,
      subcategory: formData.subcategory, // Mapped from form
      // min_buyers is removed
      max_participants: formData.groupSize, // This might be redundant if createProduct handles group creation's target_count separately
      actual_cost: formData.actualCost,  // Mapped from form
      is_fungible: formData.isFungible,  // Mapped from isFungible
      delivery_time: formData.deliveryTime === "Custom (Specify below)"
                     ? formData.customDeliveryTimeDescription
                     : formData.deliveryTime, // Mapped from form with custom logic
      // end_date is not in ProductFormData, so removed.
      // status is set to 'draft' by createProduct itself.

      selected_user_vendor_id: formData.selectedVendorId,

      // New fields for group creation logic within createProduct
      createTimedGroup: formData.createTimedGroup,
      groupSize: formData.groupSize, // Pass groupSize again for clarity in createProduct's group creation step
      countdownSecs: formData.createTimedGroup ? formData.countdownSecs : null,
    };

    try {
      // console.log("Submitting to createProduct:", productDataForApi);
      // Type assertion to any for now, will be fixed when createProduct signature is updated
      await createProduct(productDataForApi as any);
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

  const handleBackdropKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
      onKeyDown={handleBackdropKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Close modal" // Added aria-label for clarity
    >
      {/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        className="bg-white dark:bg-neutral-850 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
      {/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
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
