'use client'

import { useState, useEffect } from 'react';
import { ProductListingForm, type ProductFormData } from './ProductListingForm';
import { createProduct, type CreateProductInput } from '@/lib/supabase/products'; // Import Supabase function and type
import { useSupabase } from '@/contexts/SupabaseProvider'; // To get profile for vendor_id
import { X } from 'lucide-react';
// Button import might not be needed here if ProductListingForm handles its own submit button.

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
      setIsSubmitting(false); // Ensure loading state is reset
      return;
    }
    setIsSubmitting(true);
    setSubmissionError(null);

    // ProductFormData now includes selected_user_managed_vendor_id
    // Map ProductFormData to CreateProductInput structure
    const productDataForApi: CreateProductInput = {
      title: formData.name,
      description: formData.description,
      price: (formData.actualCost && formData.groupSize && formData.groupSize > 0)
             ? parseFloat((formData.actualCost / formData.groupSize).toFixed(2))
             : 0, // Ensure price is a number
      image_url: formData.image_url,
      vendor_id: profile.id, // This is the platform user acting as vendor
      selected_user_managed_vendor_id: formData.selected_user_managed_vendor_id, // The chosen source vendor
      category: formData.category,
      subcategory: formData.subcategory,
      max_participants: formData.groupSize,
      actual_cost: formData.actualCost,
      delivery_time: formData.deliveryTime === "Custom (Specify below)"
                     ? formData.customDeliveryTimeDescription
                     : formData.deliveryTime,
      createTimedGroup: formData.createTimedGroup,
      // groupSize is already part of max_participants for product,
      // but createProduct also uses it for initial group. Ensure consistency.
      groupSize: formData.groupSize as number, // Assert as number, should be validated in form
      countdownSecs: formData.createTimedGroup ? formData.countdownSecs : null,
    };

    if (!productDataForApi.selected_user_managed_vendor_id) {
        setSubmissionError("Source Vendor ID is missing. Please select a source vendor in the form.");
        setIsSubmitting(false);
        return;
    }


    try {
      // createProduct now expects CreateProductInput
      await createProduct(productDataForApi);
      // Using toast for feedback, consistent with ProductListingForm's internal potential use
      // but this modal is the one initiating the API call.
      alert('Product added successfully!'); // Or use toast.success if available globally
      onProductAdded();
      onClose();
    } catch (error: any) {
      console.error("Failed to create product:", error);
      const message = error.message || "Failed to add product. Please try again.";
      setSubmissionError(message);
      // toast.error(message); // Optionally use toast here too
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
            userId={profile?.id || ''} // Pass userId to ProductListingForm
            onClose={onClose} // Pass onClose so ProductListingForm can also close modal if needed
            // initialData can be an empty object or mapped if we were editing
        />
      </div>
    </div>
  );
}
