'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit3, Trash2, Star, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type UserProfileAddress } from '@/lib/supabase/addresses';
// We'll need a modal for adding/editing profile addresses.
// For now, using DeliveryAddressForm as a placeholder if its props are compatible,
// or we'll need a dedicated AddEditProfileAddressModal.
// Let's assume DeliveryAddressForm can be adapted or a new specific modal will be made.
import DeliveryAddressForm, { type DeliveryAddressFormData } from '@/components/forms/DeliveryAddressForm';
import toast from 'react-hot-toast';

// This page will use DeliveryAddressForm for adding/editing.
// The onSubmit for DeliveryAddressForm in this context will call profile address APIs.

export default function ProfileAddressesPage() {
  const [addresses, setAddresses] = useState<UserProfileAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserProfileAddress | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<UserProfileAddress | null>(null);

  const fetchProfileAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/profile/addresses');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to fetch profile addresses: ${response.statusText}`);
      }
      const data: UserProfileAddress[] = await response.json();
      setAddresses(data.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0) || new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ));
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAddresses();
  }, []);

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setIsModalOpen(true);
  };

  const handleEditAddress = (address: UserProfileAddress) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const handleModalSave = async (formData: DeliveryAddressFormData, saveToProfileIgnored: boolean, makeDefault: boolean) => {
    // `saveToProfileIgnored` is not relevant here as we are already in "profile addresses" context.
    // `makeDefault` is relevant.

    // Construct payload for UserProfileAddressInput
    const payload: Partial<UserProfileAddress> = { // Use UserProfileAddress to include is_default and label
        full_name: formData.full_name,
        address_line_1: formData.address_line_1,
        address_line_2: formData.address_line_2 || null,
        city: formData.city,
        state_province_region: formData.state_province_region,
        postal_code: formData.postal_code,
        country: formData.country,
        phone_number: formData.phone_number || null,
        address_label: formData.address_label || null, // from DeliveryAddressForm's state
        is_default: makeDefault,
    };

    let response;
    try {
        if (selectedAddress && selectedAddress.id) {
        // Editing
        response = await fetch(`/api/profile/addresses/${selectedAddress.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        } else {
        // Adding
        response = await fetch('/api/profile/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        }

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to save address.');
        }
        toast.success(`Address ${selectedAddress ? 'updated' : 'added'} successfully!`);
        setIsModalOpen(false);
        setSelectedAddress(null);
        fetchProfileAddresses(); // Refresh list
    } catch (err: any) {
        toast.error(`Error saving address: ${err.message}`);
        // Keep modal open for user to see error or correct, error will be shown in modal if propogated
        // For now, DeliveryAddressForm has its own error display.
        throw err; // Re-throw so DeliveryAddressForm can catch it and set its local error
    }
  };


  const handleDeleteAddress = async (addressId: string) => {
    if (!showDeleteConfirm || showDeleteConfirm.id !== addressId) return;
    setError(null);
    try {
      const response = await fetch(`/api/profile/addresses/${addressId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete address.');
      }
      toast.success('Address deleted successfully!');
      fetchProfileAddresses(); // Refresh list
      setShowDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message); // Show error on page level
      toast.error(`Error deleting address: ${err.message}`);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/profile/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ set_as_default: true }), // Special flag for PUT endpoint
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to set default address.');
      }
      toast.success('Default address updated!');
      fetchProfileAddresses(); // Refresh list to show new default
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error setting default: ${err.message}`);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading your addresses...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">My Saved Addresses</h1>
        <Button onClick={handleAddAddress} variant="default" size="sm">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Address
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-3" />
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {addresses.length === 0 && !isLoading && !error && (
        <div className="text-center py-10 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
           <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">No saved addresses</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Add addresses to make checkout faster for physical goods.</p>
          <div className="mt-6">
            <Button onClick={handleAddAddress} variant="default">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Address
            </Button>
          </div>
        </div>
      )}

      {addresses.length > 0 && (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex-grow mb-3 sm:mb-0">
                <div className="flex items-center mb-1">
                  {address.address_label && <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mr-2">{address.address_label}</h3>}
                  {address.is_default && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100">
                      <Star className="h-3 w-3 mr-1" /> Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{address.full_name}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{address.address_line_1}</p>
                {address.address_line_2 && <p className="text-sm text-neutral-600 dark:text-neutral-300">{address.address_line_2}</p>}
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {address.city}, {address.state_province_region} {address.postal_code}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{address.country}</p>
                {address.phone_number && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Phone: {address.phone_number}</p>}
              </div>
              <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                {!address.is_default && (
                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(address.id)} className="w-full sm:w-auto">
                    <Star className="mr-1 h-4 w-4" /> Set as Default
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleEditAddress(address)} className="w-full sm:w-auto">
                  <Edit3 className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructiveOutline" size="sm" onClick={() => setShowDeleteConfirm(address)} className="w-full sm:w-auto">
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeliveryAddressForm
        isOpen={isModalOpen} // This prop doesn't exist on DeliveryAddressForm
                            // The modal needs to be conditionally rendered here.
        initialData={selectedAddress}
        onSubmit={handleModalSave}
        enableSaveToProfileOption={false} // Not needed when managing profile addresses directly
        submitButtonText={selectedAddress ? "Save Changes" : "Add Address"}
      />
      {/* This modal needs to be conditionally rendered based on isModalOpen */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4 transition-opacity duration-300 ease-in-out"> {/* Lower z-index than delete confirm */}
            <div className="bg-white dark:bg-neutral-800 p-1 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                 {/* Close button for the modal itself */}
                <div className="flex justify-end p-2">
                    <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                        <X size={20} />
                    </button>
                </div>
                <DeliveryAddressForm
                    initialData={selectedAddress}
                    onSubmit={handleModalSave}
                    enableSaveToProfileOption={false}
                    submitButtonText={selectedAddress ? "Save Changes" : "Add Address"}
                />
            </div>
        </div>
      )}


      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Confirm Deletion</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
              Are you sure you want to delete the address for &quot;{showDeleteConfirm.full_name}&quot; ({showDeleteConfirm.address_line_1})? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteAddress(showDeleteConfirm.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
