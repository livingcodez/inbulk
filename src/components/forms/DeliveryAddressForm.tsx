'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button'; // Assuming Button component
import { Loader2 } from 'lucide-react';
import { type ParticipantDeliveryAddressInput } from '@/lib/supabase/addresses'; // For the address structure
// Assuming UserProfileAddress might be useful if pre-filling from profile
import { type UserProfileAddress } from '@/lib/supabase/addresses';

export interface DeliveryAddressFormData extends ParticipantDeliveryAddressInput {
  // No extra fields needed beyond what ParticipantDeliveryAddressInput defines for submission
  // full_name, address_line_1, city, state_province_region, postal_code, country are key
}

interface DeliveryAddressFormProps {
  // Initial data could be a UserProfileAddress if pre-filling from user's saved addresses,
  // or a ParticipantDeliveryAddress if editing an already submitted address for a group.
  initialData?: Partial<DeliveryAddressFormData> | Partial<UserProfileAddress> | null;
  onSubmit: (formData: DeliveryAddressFormData, saveToProfile: boolean, makeDefault: boolean) => Promise<void>;
  isLoading?: boolean; // To be controlled by parent if submission happens outside
  submitButtonText?: string;
  enableSaveToProfileOption?: boolean; // Show "Save to profile" checkbox
}

const initialFormState: DeliveryAddressFormData = {
  full_name: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state_province_region: '',
  postal_code: '',
  country: '',
  phone_number: '',
  // address_label is part of UserProfileAddressInput, not directly ParticipantDeliveryAddressInput
  // but can be collected if saveToProfile is true.
  address_label: '', // Add for consistency if saving to profile
};

export default function DeliveryAddressForm({
  initialData,
  onSubmit,
  isLoading: parentIsLoading = false,
  submitButtonText = 'Submit Address',
  enableSaveToProfileOption = true,
}: DeliveryAddressFormProps) {
  const [formData, setFormData] = useState<DeliveryAddressFormData>(initialFormState);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [makeDefault, setMakeDefault] = useState(false); // Only relevant if saveToProfile is true
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        address_line_1: initialData.address_line_1 || '',
        address_line_2: initialData.address_line_2 || '',
        city: initialData.city || '',
        state_province_region: initialData.state_province_region || '',
        postal_code: initialData.postal_code || '',
        country: initialData.country || '',
        phone_number: initialData.phone_number || '',
        address_label: (initialData as UserProfileAddress).address_label || '', // Handle potential label from profile
      });
      // If pre-filling from a default profile address, perhaps check the saveToProfile and makeDefault boxes
      if ((initialData as UserProfileAddress).is_default && enableSaveToProfileOption) {
          setSaveToProfile(true);
          setMakeDefault(true);
      } else {
          setSaveToProfile(false);
          setMakeDefault(false);
      }

    } else {
      setFormData(initialFormState);
      setSaveToProfile(false);
      setMakeDefault(false);
    }
    setError(null);
  }, [initialData, enableSaveToProfileOption]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const internalHandleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim() || !formData.address_line_1.trim() || !formData.city.trim() || !formData.state_province_region.trim() || !formData.postal_code.trim() || !formData.country.trim()) {
      setError("Please fill in all required address fields (Full Name, Address Line 1, City, State, Postal Code, Country).");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData, saveToProfile && enableSaveToProfileOption, makeDefault && saveToProfile && enableSaveToProfileOption);
      // Success is handled by the parent component (e.g., closing modal, showing toast)
    } catch (err: any) {
      setError(err.message || "Failed to submit address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentIsLoading = parentIsLoading || isSubmitting;

  // Basic styling for inputs, adapt to your project's UI components
  const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const labelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300";
  const checkboxLabelClass = "ml-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer";
  const checkboxClass = "h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary dark:border-neutral-600 dark:focus:ring-primary-dark dark:checked:bg-primary-dark";


  return (
    <form onSubmit={internalHandleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className={labelClass}>Full Name <span className="text-red-500">*</span></label>
        <input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleChange} className={inputClass} required autoComplete="name" />
      </div>

      <div>
        <label htmlFor="address_line_1" className={labelClass}>Address Line 1 <span className="text-red-500">*</span></label>
        <input type="text" name="address_line_1" id="address_line_1" value={formData.address_line_1} onChange={handleChange} className={inputClass} required autoComplete="address-line1" />
      </div>

      <div>
        <label htmlFor="address_line_2" className={labelClass}>Address Line 2 (Optional)</label>
        <input type="text" name="address_line_2" id="address_line_2" value={formData.address_line_2 || ''} onChange={handleChange} className={inputClass} autoComplete="address-line2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className={labelClass}>City <span className="text-red-500">*</span></label>
          <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className={inputClass} required autoComplete="address-level2" />
        </div>
        <div>
          <label htmlFor="state_province_region" className={labelClass}>State / Province / Region <span className="text-red-500">*</span></label>
          <input type="text" name="state_province_region" id="state_province_region" value={formData.state_province_region} onChange={handleChange} className={inputClass} required autoComplete="address-level1" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="postal_code" className={labelClass}>Postal Code <span className="text-red-500">*</span></label>
          <input type="text" name="postal_code" id="postal_code" value={formData.postal_code} onChange={handleChange} className={inputClass} required autoComplete="postal-code" />
        </div>
        <div>
          <label htmlFor="country" className={labelClass}>Country <span className="text-red-500">*</span></label>
          <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} className={inputClass} required autoComplete="country-name" />
        </div>
      </div>

      <div>
        <label htmlFor="phone_number" className={labelClass}>Phone Number (Optional, for delivery)</label>
        <input type="tel" name="phone_number" id="phone_number" value={formData.phone_number || ''} onChange={handleChange} className={inputClass} autoComplete="tel" />
      </div>

      {enableSaveToProfileOption && (
        <div className="space-y-2 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="saveToProfile"
              id="saveToProfile"
              checked={saveToProfile}
              onChange={(e) => {
                setSaveToProfile(e.target.checked);
                if (!e.target.checked) setMakeDefault(false); // Uncheck makeDefault if saveToProfile is unchecked
              }}
              className={checkboxClass}
            />
            <label htmlFor="saveToProfile" className={checkboxLabelClass}>
              Save this address to my profile
            </label>
          </div>

          {saveToProfile && (
            <>
            <div className="pl-6"> {/* Indent make default and label options */}
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="makeDefault"
                  id="makeDefault"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                  className={checkboxClass}
                  disabled={!saveToProfile}
                />
                <label htmlFor="makeDefault" className={checkboxLabelClass}>
                  Make this my default delivery address
                </label>
              </div>
              <div className="mt-2">
                 <label htmlFor="address_label" className={`${labelClass} text-xs`}>Address Label (Optional, e.g., Home, Work)</label>
                 <input
                    type="text"
                    name="address_label"
                    id="address_label"
                    value={formData.address_label || ''}
                    onChange={handleChange}
                    className={`${inputClass} text-sm`}
                    placeholder="e.g., My Home"
                    disabled={!saveToProfile}
                />
              </div>
            </div>
            </>
          )}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="default" disabled={currentIsLoading}>
          {currentIsLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
}
