'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button'; // Assuming Button component
import { type UserManagedVendor } from '@/lib/supabase/userVendors';

interface AddEditVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor?: UserManagedVendor | null; // Existing vendor data for editing, null/undefined for adding
  onSave: (savedVendor: UserManagedVendor) => void; // Callback after successful save
}

// Simplified form data state
type VendorFormData = Omit<UserManagedVendor, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

const initialFormData: VendorFormData = {
  vendor_name: '',
  contact_person: '',
  email: '',
  phone_number: '',
  website_url: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state_province_region: '',
  postal_code: '',
  country: '',
  notes: '',
  product_categories_supplied: []
};

export default function AddEditVendorModal({ isOpen, onClose, vendor, onSave }: AddEditVendorModalProps) {
  const [formData, setFormData] = useState<VendorFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState('');


  useEffect(() => {
    if (vendor) {
      // If editing, populate form with vendor data
      setFormData({
        vendor_name: vendor.vendor_name || '',
        contact_person: vendor.contact_person || '',
        email: vendor.email || '',
        phone_number: vendor.phone_number || '',
        website_url: vendor.website_url || '',
        address_line_1: vendor.address_line_1 || '',
        address_line_2: vendor.address_line_2 || '',
        city: vendor.city || '',
        state_province_region: vendor.state_province_region || '',
        postal_code: vendor.postal_code || '',
        country: vendor.country || '',
        notes: vendor.notes || '',
        product_categories_supplied: vendor.product_categories_supplied || []
      });
    } else {
      // If adding, reset to initial (or ensure it's clean)
      setFormData(initialFormData);
    }
    // Reset error when modal opens or vendor changes
    setError(null);
  }, [isOpen, vendor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryInput(e.target.value);
  };

  const handleAddCategory = () => {
    if (categoryInput.trim() && !formData.product_categories_supplied?.includes(categoryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        product_categories_supplied: [...(prev.product_categories_supplied || []), categoryInput.trim()]
      }));
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      product_categories_supplied: prev.product_categories_supplied?.filter(cat => cat !== categoryToRemove)
    }));
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.vendor_name.trim()) {
      setError("Vendor name is required.");
      setIsLoading(false);
      return;
    }

    // Prepare data, ensuring empty strings are null where appropriate for DB
    const payload = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        typeof value === 'string' && value.trim() === '' ? null : value,
      ])
    ) as VendorFormData;


    try {
      let response;
      let savedVendor: UserManagedVendor;

      if (vendor && vendor.id) {
        // Editing existing vendor
        response = await fetch(`/api/user-vendors/${vendor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Adding new vendor
        response = await fetch('/api/user-vendors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to save vendor: ${response.statusText}`);
      }

      savedVendor = await response.json();
      onSave(savedVendor); // Call the onSave callback from parent
      onClose(); // Close modal on success

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Basic styling for inputs, adapt to your project's UI components (e.g., shadcn/ui Input)
  const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const labelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {vendor ? 'Edit' : 'Add New'} Vendor
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendor Name (Required) */}
          <div>
            <label htmlFor="vendor_name" className={labelClass}>Vendor Name <span className="text-red-500">*</span></label>
            <input type="text" name="vendor_name" id="vendor_name" value={formData.vendor_name} onChange={handleChange} className={inputClass} required />
          </div>

          {/* Contact Person */}
          <div>
            <label htmlFor="contact_person" className={labelClass}>Contact Person</label>
            <input type="text" name="contact_person" id="contact_person" value={formData.contact_person || ''} onChange={handleChange} className={inputClass} />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className={inputClass} />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone_number" className={labelClass}>Phone Number</label>
            <input type="tel" name="phone_number" id="phone_number" value={formData.phone_number || ''} onChange={handleChange} className={inputClass} />
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="website_url" className={labelClass}>Website URL</label>
            <input type="url" name="website_url" id="website_url" value={formData.website_url || ''} onChange={handleChange} className={inputClass} placeholder="https://example.com" />
          </div>

          {/* Address Fields */}
          <h3 className="text-md font-semibold pt-2 text-neutral-800 dark:text-neutral-200">Address (Optional)</h3>
          <div>
            <label htmlFor="address_line_1" className={labelClass}>Address Line 1</label>
            <input type="text" name="address_line_1" id="address_line_1" value={formData.address_line_1 || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="address_line_2" className={labelClass}>Address Line 2</label>
            <input type="text" name="address_line_2" id="address_line_2" value={formData.address_line_2 || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className={labelClass}>City</label>
              <input type="text" name="city" id="city" value={formData.city || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="state_province_region" className={labelClass}>State/Province/Region</label>
              <input type="text" name="state_province_region" id="state_province_region" value={formData.state_province_region || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postal_code" className={labelClass}>Postal Code</label>
              <input type="text" name="postal_code" id="postal_code" value={formData.postal_code || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="country" className={labelClass}>Country</label>
              <input type="text" name="country" id="country" value={formData.country || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Product Categories Supplied */}
          <div>
            <label htmlFor="product_categories_supplied" className={labelClass}>Product Categories Supplied (comma-separated or add one by one)</label>
            <div className="flex items-center mt-1">
              <input
                type="text"
                id="category_input"
                value={categoryInput}
                onChange={handleCategoryInputChange}
                className={`${inputClass} flex-grow`}
                placeholder="e.g., Electronics"
              />
              <Button type="button" onClick={handleAddCategory} variant="outline" size="sm" className="ml-2">Add</Button>
            </div>
            <div className="mt-2 space-x-2 space-y-2">
              {formData.product_categories_supplied?.map(cat => (
                <span key={cat} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark">
                  {cat}
                  <button type="button" onClick={() => handleRemoveCategory(cat)} className="ml-1.5 text-primary hover:text-primary/70 dark:text-primary-dark dark:hover:text-primary-dark/70">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className={labelClass}>Notes</label>
            <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className={inputClass}></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (vendor ? 'Save Changes' : 'Add Vendor')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
