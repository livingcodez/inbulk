'use client'

import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'; // Import toast
import { Button } from '@/components/ui/Button'
import { type Product } from '@/types/database.types';

// Define the category structure
interface CategoryOption {
  name: string;
  subcategories: string[];
}

const PRODUCT_CATEGORIES: CategoryOption[] = [
  { name: "Electronics", subcategories: ["Computers", "Smartphones", "Audio", "Cameras", "Accessories"] },
  { name: "Apparel", subcategories: ["Men's", "Women's", "Children's", "Shoes", "Accessories"] },
  { name: "Services & Subscriptions", subcategories: ["Streaming Services", "Software Subscriptions", "Cloud Storage", "Gaming Subscriptions"] },
  { name: "Home & Garden", subcategories: ["Furniture", "Decor", "Appliances", "Gardening", "Tools"] },
  { name: "Collectibles & Art", subcategories: ["Antiques", "Art Prints", "Figurines", "Trading Cards"] },
  { name: "Other", subcategories: [] }
];

// Define the specific data structure the form collects and onSubmit expects
export interface ProductFormData {
  // Basic Product Information
  name: string; // Renamed from 'title'
  description: string | null;

  // Categorization
  category: string;
  subcategory: string | null;

  // Conditional Subscription Details
  subscriptionUsername: string | null;
  subscriptionPassword: string | null;
  subscription2FAKey: string | null;

  // Pricing & Cost
  actualCost: number | null; // New field: Actual Cost of Product/Service ($)

  // Product Visuals
  image_url: string | null;

  // Delivery Information
  deliveryTime: string | null; // New field: Delivery Time (e.g., "Instant", "1-3 Business Days")
  customDeliveryTimeDescription: string | null; // New field: Custom Delivery Time Description

  // Product & Group Type
  isFungible: boolean; // Renamed from is_fungible
  createTimedGroup: boolean; // Changed from autoGroup: If true, an initial timed group is created. Otherwise, an untimed group.

  // Initial Group Settings
  groupSize: number | null; // Target Group Size for the initial automatically created group (timed or untimed)
  countdownSecs: number | null; // Timed Group Countdown (seconds) - only if createTimedGroup is true

  // Selected supplier from user-managed list
  selectedVendorId: string;

  // Fields to be deprecated or re-evaluated from old interface:
  // price: number; // This will be calculated: actualCost / groupSize
  // min_participants: number | null; // Replaced by groupSize for autoGroup, or manual group settings elsewhere
  // max_participants: number | null; // Replaced by groupSize for autoGroup
  // end_date: string | null; // This might be covered by countdownSecs for timed groups, or a separate field for non-auto groups
}

interface ProductListingFormProps {
  onSubmit: (formData: ProductFormData) => Promise<void>;
  onClose?: () => void; // For closing the modal
  // initialData could be mapped from Product to ProductFormData if needed for an edit form
  initialData?: Partial<ProductFormData>; // Use ProductFormData for consistency if editing
}

export function ProductListingForm({ onSubmit, initialData, onClose }: ProductListingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [actualCostInput, setActualCostInput] = useState<string>("");
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string>("");
  const [customDeliveryTimeDesc, setCustomDeliveryTimeDesc] = useState<string>("");
  const [isFungibleValue, setIsFungibleValue] = useState<boolean>(false);
  const [createTimedGroupValue, setCreateTimedGroupValue] = useState<boolean>(false); // Default to false (untimed group)
  const [groupSizeInput, setGroupSizeInput] = useState<string>('5'); // Group size always needed
  const [countdownSecsInput, setCountdownSecsInput] = useState<string>('86400'); // For timed group
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])
  const [selectedVendor, setSelectedVendor] = useState('')
  const [imageInput, setImageInput] = useState(initialData?.image_url || '')
  const [resolvedImage, setResolvedImage] = useState<string | null>(initialData?.image_url || null)
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    fetch('/api/user-vendors')
      .then(res => (res.ok ? res.json() : []))
      .then(setVendors)
  }, [])

  useEffect(() => {
    setImageInput(initialData?.image_url || '')
    setResolvedImage(initialData?.image_url || null)
  }, [initialData?.image_url])


  const DELIVERY_TIME_OPTIONS = ["Instant", "1-3 Business Days", "3-7 Business Days", "1-2 Weeks", "Custom (Specify below)"];

  useEffect(() => {
    // Initialize all relevant states from initialData
    const cat = initialData?.category || "";
    const subCat = initialData?.subcategory || "";
    setSelectedCategory(cat);
    setSelectedSubcategory(subCat);
    setActualCostInput(initialData?.actualCost?.toString() || "");
    setIsFungibleValue(initialData?.isFungible ?? false);
    setCreateTimedGroupValue(initialData?.createTimedGroup ?? false); // Use new prop, default to false
    setGroupSizeInput(initialData?.groupSize?.toString() ?? '5');
    setCountdownSecsInput(initialData?.countdownSecs?.toString() ?? '86400');


    const isSoftwareSubInit = cat === "Services & Subscriptions" && subCat === "Software Subscriptions";
    if (isSoftwareSubInit) {
      setSelectedDeliveryTime("Instant");
      setCustomDeliveryTimeDesc("");
    } else {
      const initialDeliveryTime = initialData?.deliveryTime || "";
      setSelectedDeliveryTime(initialDeliveryTime);
      if (initialDeliveryTime === "Custom (Specify below)") {
        setCustomDeliveryTimeDesc(initialData?.customDeliveryTimeDescription || "");
      } else {
        setCustomDeliveryTimeDesc("");
      }
    }
  }, [initialData]);

  useEffect(() => {
    // Update available subcategories when category changes
    const currentCategoryData = PRODUCT_CATEGORIES.find(cat => cat.name === selectedCategory);
    if (currentCategoryData && currentCategoryData.subcategories.length > 0) {
      setAvailableSubcategories(currentCategoryData.subcategories);
    } else {
      setAvailableSubcategories([]);
    }

    // Logic for Software Subscription affecting Delivery Time
    const isSoftwareSub = selectedCategory === "Services & Subscriptions" && selectedSubcategory === "Software Subscriptions";
    if (isSoftwareSub) {
      setSelectedDeliveryTime("Instant");
      setCustomDeliveryTimeDesc("");
    } else {
      // If category/subcategory changes *away* from software subscription,
      // and delivery time was 'Instant' (possibly due to auto-set), reset it.
      // User might need to re-select. Or, we could try to restore previous state if stored.
      // For now, simple reset if it was forced to "Instant".
      if (selectedDeliveryTime === "Instant" && (initialData?.deliveryTime !== "Instant" || !initialData?.deliveryTime) ) {
         // Avoid resetting if "Instant" was the original initialData.deliveryTime
        if(!(initialData?.category === selectedCategory && initialData?.subcategory === selectedSubcategory && initialData?.deliveryTime === "Instant")){
            setSelectedDeliveryTime(""); // Reset to prompt user selection
        }
      }
    }
  }, [selectedCategory, selectedSubcategory, initialData?.deliveryTime, initialData?.category, initialData?.subcategory]);


  useEffect(() => {
    // Clear custom description if delivery time is not "Custom"
    if (selectedDeliveryTime !== "Custom (Specify below)") {
      setCustomDeliveryTimeDesc("");
    }
  }, [selectedDeliveryTime]);


  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setSelectedSubcategory(""); // Reset subcategory
  };

  const handleDeliveryTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeliveryTime = e.target.value;
    setSelectedDeliveryTime(newDeliveryTime);
  };

  const resolveImage = async (url: string) => {
    try {
      const res = await fetch(`/api/resolve-image?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const data = await res.json()
        return data.image as string
      }
    } catch (err) {
      console.error('resolve-image', err)
    }
    return url
  }

  const handleImageBlur = async () => {
    if (!imageInput) {
      setResolvedImage(null)
      return
    }
    setResolving(true)
    const resolved = await resolveImage(imageInput)
    setResolvedImage(resolved)
    setResolving(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // --- Step 1: Data Collection from Form Elements & State ---
    const formElements = e.currentTarget.elements;
    const formName = (formElements.namedItem('name') as HTMLInputElement)?.value.trim() || "";
    const formDescription = (formElements.namedItem('description') as HTMLTextAreaElement)?.value.trim() || "";
    const formImageUrl = imageInput.trim() || null;
    let finalImageUrl = formImageUrl;
    if (formImageUrl) {
      finalImageUrl = resolvedImage || await resolveImage(formImageUrl);
    }

    const parsedActualCost = parseFloat(actualCostInput); // actualCostInput is from state
    const finalActualCost = isNaN(parsedActualCost) || parsedActualCost <=0 ? null : parsedActualCost; // Ensure positive

    let formSubUsername = null;
    let formSubPassword = null;
    let formSub2FAKey = null;
    const currentIsSoftwareSubscription = selectedCategory === "Services & Subscriptions" && selectedSubcategory === "Software Subscriptions";

    if (currentIsSoftwareSubscription) {
      formSubUsername = (formElements.namedItem('subscriptionUsername') as HTMLInputElement)?.value.trim() || null;
      formSubPassword = (formElements.namedItem('subscriptionPassword') as HTMLInputElement)?.value || null;
      formSub2FAKey = (formElements.namedItem('subscription2FAKey') as HTMLInputElement)?.value.trim() || null;
    }

    let finalGroupSize: number | null = null;
    let finalCountdownSecs: number | null = null;

    // Group size is always needed for the initial group
    const parsedGroupSize = parseInt(groupSizeInput, 10);
    if (!isNaN(parsedGroupSize) && parsedGroupSize >= 1) {
      finalGroupSize = parsedGroupSize;
    }

    if (createTimedGroupValue) { // createTimedGroupValue is from state
      if (countdownSecsInput.trim() === "") { // countdownSecsInput is from state
        finalCountdownSecs = 86400; // Default if blank for timed group
      } else {
        const parsedCountdownSecs = parseInt(countdownSecsInput, 10);
        if (!isNaN(parsedCountdownSecs) && parsedCountdownSecs >= 1) {
          finalCountdownSecs = parsedCountdownSecs;
        }
        // If invalid and not blank, finalCountdownSecs remains null for validation later (for timed group)
      }
    }

    // --- Step 2: Validation ---
    if (formName.length < 3) {
      setError("Product Name must be at least 3 characters long.");
      setLoading(false);
      return;
    }
    if (formDescription.length < 10) {
      setError("Description must be at least 10 characters long.");
      setLoading(false);
      return;
    }
    if (!selectedCategory) {
      setError("Please select a Category.");
      setLoading(false);
      return;
    }
    if (!selectedVendor) {
      setError('Please select a vendor.');
      setLoading(false);
      return;
    }
    if (finalActualCost === null || finalActualCost <= 0) {
      setError("Actual Cost must be a positive number.");
      setLoading(false);
      return;
    }
    if (!selectedDeliveryTime) {
      setError("Please select a Delivery Time.");
      setLoading(false);
      return;
    }
    if (selectedDeliveryTime === "Custom (Specify below)" && (!customDeliveryTimeDesc || customDeliveryTimeDesc.trim() === "")) {
      setError("Please provide a Custom Delivery Time Description when 'Custom' is selected.");
      setLoading(false);
      return;
    }
    if (currentIsSoftwareSubscription) {
      if (!formSubUsername) {
        setError("Subscription Username is required for Software Subscriptions.");
        setLoading(false);
        return;
      }
      if (!formSubPassword) {
        setError("Subscription Password is required for Software Subscriptions.");
        setLoading(false);
        return;
      }
    }
    // Validation for initial group settings
    if (finalGroupSize === null) {
      setError("Target Group Size must be a valid number (at least 1) for the initial group.");
      setLoading(false);
      return;
    }
    if (createTimedGroupValue) { // Only validate countdown if it's a timed group
      if (countdownSecsInput.trim() !== "" && finalCountdownSecs === null) {
        setError("Timed Group Countdown must be a valid positive number if provided, or left blank for default (when creating a timed group).");
        setLoading(false);
        return;
      }
    }

    // --- Construct final data object ---
    const data: ProductFormData = {
      name: formName,
      description: formDescription,
      category: selectedCategory,
      subcategory: selectedSubcategory || null,
      subscriptionUsername: currentIsSoftwareSubscription ? formSubUsername : null,
      subscriptionPassword: currentIsSoftwareSubscription ? formSubPassword : null,
      subscription2FAKey: currentIsSoftwareSubscription ? formSub2FAKey : null,
      actualCost: finalActualCost,
      image_url: finalImageUrl,
      deliveryTime: selectedDeliveryTime,
      customDeliveryTimeDescription: (selectedDeliveryTime === "Custom (Specify below)" && !isSoftwareSubscription) ? (customDeliveryTimeDesc.trim() || null) : null,
      isFungible: isFungibleValue,
      createTimedGroup: createTimedGroupValue,
      groupSize: finalGroupSize, // Always pass groupSize
      countdownSecs: createTimedGroupValue ? finalCountdownSecs : null, // Pass countdownSecs only if timed group
      selectedVendorId: selectedVendor,
    };

    try {
      await onSubmit(data);
      toast.success(initialData ? "Listing updated successfully!" : "Listing created successfully!");
      if (onClose) onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(initialData ? `Error updating listing: ${errorMessage}` : `Error creating listing: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  const isSoftwareSubscription = selectedCategory === "Services & Subscriptions" && selectedSubcategory === "Software Subscriptions";
  const showCustomDeliveryInput = selectedDeliveryTime === "Custom (Specify below)" && !isSoftwareSubscription;
  // const showAutoGroupSettings = autoGroupValue; // Replaced by individual conditions

  const calculatedPriceData = useMemo(() => {
    const cost = parseFloat(actualCostInput);
    const size = parseInt(groupSizeInput, 10);
    // Price calculation is always relevant if cost and size are valid, as a group is always made.
    if (cost > 0 && size > 0) {
      return {
        price: (cost / size).toFixed(2),
        cost: cost.toFixed(2),
        size: size.toString(),
      };
    }
    return null;
  }, [actualCostInput, groupSizeInput]);

  return (
    <div className="relative p-4 sm:p-6"> {/* Added padding, relative positioning for close button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="mb-6 text-center"> {/* Centered header text, added margin-bottom */}
        {/* Assuming Quicksand font would be configured in tailwind.config.js as font-quicksand */}
        {/* Using font-semibold for heading as 'Regular 400' might be too light for a large heading */}
        <h2 className="text-4xl lg:text-5xl font-semibold font-sans text-primary dark:text-primary-dark">
          Create New Product Listing
        </h2>
        <p className="mt-2 text-sm sm:text-base font-sans text-gray-600 dark:text-neutral-400">
          Fill in the details for your new product. Auto-group settings will help buyers join groups easily.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Product Name</label>
          <input type="text" name="name" id="name" required placeholder="e.g., Premium Laptop Stand" defaultValue={initialData?.name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Description</label>
          <textarea name="description" id="description" rows={3} required placeholder="Detailed description of your product..." defaultValue={initialData?.description || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50" />
        </div>

        {/* Category and Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Category</label>
            <select
              id="category"
              name="category"
              required
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50"
            >
              <option value="" disabled>Select a category</option>
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Subcategory</label>
            <select
              id="subcategory"
              name="subcategory"
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              disabled={!selectedCategory || availableSubcategories.length === 0}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-neutral-800 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50"
            >
              {!selectedCategory ? (
                <option value="" disabled>Select category first</option>
              ) : availableSubcategories.length === 0 ? (
                <option value="" disabled>No subcategories available</option>
              ) : (
                <>
                  <option value="">Select a subcategory (optional)</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </>
              )}
            </select>
        </div>
      </div>

        {/* Vendor Selection */}
        <div>
          <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Supplier</label>
          <select
            id="vendor"
            name="vendor"
            required
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50"
          >
            <option value="" disabled>Select a vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* Conditional Subscription Details Section */}
        {isSoftwareSubscription && (
          <div className="my-6 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-md border border-dashed border-gray-300 dark:border-neutral-700 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-3">
              Subscription Details
            </h3>
            {/* Subscription Username */}
            <div>
              <label htmlFor="subscriptionUsername" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Subscription Username</label>
              <input
                type="text"
                name="subscriptionUsername"
                id="subscriptionUsername"
                required={isSoftwareSubscription}
                defaultValue={initialData?.subscriptionUsername || ''}
                placeholder="Enter username for the subscription"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50"
              />
            </div>
            {/* Subscription Password */}
            <div>
              <label htmlFor="subscriptionPassword" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Subscription Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="subscriptionPassword"
                  id="subscriptionPassword"
                  required={isSoftwareSubscription}
                  defaultValue={initialData?.subscriptionPassword || ''}
                  placeholder="Enter password for the subscription"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark rounded-md"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" /></svg>
                  )}
                </button>
              </div>
            </div>
            {/* Subscription 2FA Key */}
            <div>
              <label htmlFor="subscription2FAKey" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Subscription 2FA Key (Optional)</label>
              <input
                type="text"
                name="subscription2FAKey"
                id="subscription2FAKey"
                defaultValue={initialData?.subscription2FAKey || ''}
                placeholder="Enter 2FA backup key if applicable"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                If the subscription uses Two-Factor Authentication, provide a backup/recovery key.
              </p>
            </div>
          </div>
        )}

        {/* Actual Cost */}
        <div>
          <label htmlFor="actualCost" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Actual Cost of Product/Service ($)</label>
          <input
            type="number"
            name="actualCost"
            id="actualCost"
            required
            value={actualCostInput}
            onChange={(e) => setActualCostInput(e.target.value)}
            min="0.01"
            step="0.01"
            placeholder="e.g., 200.00"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
            The total cost for you to acquire/fulfill this product/service for a group.
          </p>
        </div>

         <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Image URL (Optional)</label>
          <input
            type="url"
            name="image_url"
            id="image_url"
            placeholder="https://placehold.co/600x400.png"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onBlur={handleImageBlur}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50"
          />
          {resolvedImage && (
            <img src={resolvedImage} alt="Preview" className="mt-2 h-24 object-contain" />
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
            Provide a URL for the product image. If blank, a placeholder will be used.
          </p>
        </div>

        {/* Delivery Information Section */}
        <div className="space-y-2">
          <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Delivery Time</label>
          <select
            id="deliveryTime"
            name="deliveryTime"
            required
            value={selectedDeliveryTime}
            onChange={handleDeliveryTimeChange}
            disabled={isSoftwareSubscription}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50 disabled:bg-gray-100 dark:disabled:bg-neutral-800"
          >
            <option value="" disabled>Select delivery timeframe</option>
            {DELIVERY_TIME_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {isSoftwareSubscription && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              Instant delivery automatically selected for software subscriptions.
            </p>
          )}
        </div>

        {showCustomDeliveryInput && !isSoftwareSubscription && (
          <div>
            <label htmlFor="customDeliveryTimeDescription" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Custom Delivery Time Description</label>
            <input
              type="text"
              name="customDeliveryTimeDescription"
              id="customDeliveryTimeDescription"
              value={customDeliveryTimeDesc}
              onChange={(e) => setCustomDeliveryTimeDesc(e.target.value)}
              required={showCustomDeliveryInput} // Technically, it's required if showCustomDeliveryInput is true
              placeholder="e.g., Approx. 3 weeks, specific date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50"
            />
          </div>
        )}

        {/* Product & Group Type Section */}
        <div className="space-y-4 pt-2">
          {/* Unique Item/Service Instance (isFungible) */}
          <div className="flex items-center justify-between">
            <label htmlFor="isFungible" className="flex-grow cursor-pointer">
              <span className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Unique Item/Service Instance</span>
              <p className="text-xs text-gray-500 dark:text-neutral-400">Is this a specific, unique instance (e.g., specific account, single art piece)?</p>
            </label>
            <label className="relative inline-flex items-center cursor-pointer" aria-label="Toggle Unique Item/Service Instance">
              <input
                type="checkbox"
                id="isFungible"
                name="isFungible"
                className="sr-only peer"
                checked={isFungibleValue}
                onChange={(e) => setIsFungibleValue(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary dark:peer-focus:ring-primary-dark rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary peer-checked:hover:bg-primary-dark"></div>
            </label>
          </div>

          {/* Create Timed Group (createTimedGroup) */}
          <div className="flex items-center justify-between">
            <label htmlFor="createTimedGroup" className="flex-grow cursor-pointer">
              <span className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Create Initial Timed Group</span>
              <p className="text-xs text-gray-500 dark:text-neutral-400">If enabled, the initial group will be timed. Otherwise, it will be untimed. Group Size is always required below.</p>
            </label>
            <label className="relative inline-flex items-center cursor-pointer" aria-label="Toggle Initial Timed Group">
              <input
                type="checkbox"
                id="createTimedGroup"
                name="createTimedGroup"
                className="sr-only peer"
                checked={createTimedGroupValue}
                onChange={(e) => setCreateTimedGroupValue(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary dark:peer-focus:ring-primary-dark rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary peer-checked:hover:bg-primary-dark"></div>
            </label>
          </div>
        </div>

        {/* Initial Group Settings Section */}
        {/* This section is always shown because a group is always created */}
        <div className="my-4 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-md border border-dashed border-gray-300 dark:border-neutral-700 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-3">
              Initial Group Settings
            </h3>
            {/* Target Group Size */}
            <div>
              <label htmlFor="groupSize" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Target Group Size</label>
              <input
                type="number"
                name="groupSize"
                id="groupSize"
                value={groupSizeInput}
                onChange={(e) => setGroupSizeInput(e.target.value)}
                required // Always required as a group is always created
                min="1"
                placeholder="e.g., 5 (min. 1)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                Number of members for the initial group (e.g., 2-20).
              </p>
            </div>
            {/* Timed Group Countdown - only shown if createTimedGroupValue is true */}
            {createTimedGroupValue && (
              <div>
                <label htmlFor="countdownSecs" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">Timed Group Countdown (seconds)</label>
                <input
                  type="number"
                  name="countdownSecs"
                  id="countdownSecs"
                  value={countdownSecsInput}
                  onChange={(e) => setCountdownSecsInput(e.target.value)}
                  min="1"
                  placeholder="e.g., 86400 (for 24 hours)"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                  Duration for the initial timed group. Defaults to 24 hours if left blank.
                </p>
              </div>
            )}
        </div>

        {/* Calculated Price Per Buyer Display */}
        {calculatedPriceData && (
          <div className="mt-6 mb-2 p-4 border border-dashed border-blue-500 dark:border-blue-400 rounded-md bg-blue-50 dark:bg-blue-900/20 text-center space-y-1">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              CALCULATED PRICE PER BUYER
            </p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              ${calculatedPriceData.price}
            </p>
            <p className="text-xs text-gray-600 dark:text-neutral-400">
              Based on Actual Cost of ${calculatedPriceData.cost} and Group Size of {calculatedPriceData.size}.
            </p>
          </div>
        )}
      </div>
       <div className="flex justify-end pt-6">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto dark:bg-primary-dark dark:hover:bg-primary-dark/90">
          {loading ? 'Saving...' : (initialData ? 'Update Listing' : 'Add Listing')}
        </Button>
      </div>
    </form>
  </div>
  );
}
