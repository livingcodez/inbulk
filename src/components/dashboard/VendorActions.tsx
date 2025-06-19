'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // For router.refresh()
import { Plus } from 'lucide-react';
import { AddProductModal } from '@/components/products/AddProductModal';
import { Button } from '@/components/ui/Button'; // If FAB is a styled Button, though not used in this example

interface VendorActionsProps {
  currentUserId: string;
}

export function VendorActions({ currentUserId }: VendorActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleProductAdded = () => {
    // This function is called by AddProductModal after successful submission
    router.refresh(); // Refresh server components, re-fetching data
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-8 right-8 bg-primary hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary-dark/80 text-white p-4 rounded-full shadow-lg z-30 transition-transform hover:scale-105"
        aria-label="Add new product listing"
      >
        <Plus size={24} />
      </button>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onProductAdded={handleProductAdded}
        currentUserId={currentUserId}
      />
    </>
  );
}
