'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit3, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button'; // Assuming you have a Button component
import { type UserManagedVendor } from '@/lib/supabase/userVendors'; // Import the type
import AddEditVendorModal from '@/components/profile/vendors/AddEditVendorModal';


export default function ManagedVendorsPage() {
  const [vendors, setVendors] = useState<UserManagedVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<UserManagedVendor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<UserManagedVendor | null>(null);

  const fetchVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user-vendors');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to fetch vendors: ${response.statusText}`);
      }
      const data = await response.json();
      setVendors(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAddVendor = () => {
    setSelectedVendor(null);
    setIsModalOpen(true);
  };

  const handleEditVendor = (vendor: UserManagedVendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!showDeleteConfirm || showDeleteConfirm.id !== vendorId) return;

    try {
      const response = await fetch(`/api/user-vendors/${vendorId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to delete vendor: ${response.statusText}`);
      }
      // Refresh list after delete
      fetchVendors();
      setShowDeleteConfirm(null);
    } catch (err: any) {
      setError(`Failed to delete vendor: ${err.message}`);
      // Keep the confirmation dialog open to show the error or close it
      // For now, just log and it will close implicitly if error is displayed elsewhere
      console.error("Delete error:", err);
    }
  };

  const handleSaveVendor = () => {
    // This will be called by the modal on successful save
    setIsModalOpen(false);
    setSelectedVendor(null);
    fetchVendors(); // Refresh the list
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading your vendors...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">My Managed Vendors</h1>
        <Button onClick={handleAddVendor} variant="default" size="sm">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Vendor
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-3" />
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {vendors.length === 0 && !isLoading && !error && (
        <div className="text-center py-10 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v2M6 5V3m12 2V3" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">No vendors added yet</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Get started by adding your first source vendor.</p>
          <div className="mt-6">
            <Button onClick={handleAddVendor} variant="default">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Vendor
            </Button>
          </div>
        </div>
      )}

      {vendors.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-neutral-800 shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Website</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Categories</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">{vendor.vendor_name}</div>
                    {vendor.contact_person && <div className="text-xs text-neutral-500 dark:text-neutral-400">{vendor.contact_person}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {vendor.email && <div>{vendor.email}</div>}
                    {vendor.phone_number && <div>{vendor.phone_number}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {vendor.website_url ? (
                      <a href={vendor.website_url.startsWith('http') ? vendor.website_url : `http://${vendor.website_url}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline dark:text-primary-dark">
                        Visit Website
                      </a>
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-500">-</span>
                    )}
                  </td>
                   <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    {vendor.product_categories_supplied && vendor.product_categories_supplied.length > 0
                      ? vendor.product_categories_supplied.join(', ')
                      : <span className="text-xs italic">Not specified</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditVendor(vendor)} title="Edit Vendor">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructiveOutline" size="icon" onClick={() => setShowDeleteConfirm(vendor)} title="Delete Vendor">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding/editing a vendor */}
      <AddEditVendorModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedVendor(null); }}
        vendor={selectedVendor}
        onSave={handleSaveVendor}
      />

      {/* Delete Confirmation Dialog (simple alert-like for now) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Confirm Deletion</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
              Are you sure you want to delete the vendor &quot;{showDeleteConfirm.vendor_name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteVendor(showDeleteConfirm.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ensure this file is created in the correct path: src/app/profile/vendors/page.tsx
// Next steps:
// 1. Create the actual AddEditVendorModal component.
// 2. Style components as needed, potentially using shadcn/ui if that's the project standard.
// 3. Refine error handling and loading states.
// 4. Test thoroughly.
