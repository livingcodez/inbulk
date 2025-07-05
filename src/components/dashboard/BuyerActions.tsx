'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { AddProductModal } from '@/components/products/AddProductModal'

export function BuyerActions() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleProductAdded = () => {
    router.refresh()
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="fixed bottom-8 right-8 bg-primary hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary-dark/80 text-white p-4 rounded-full shadow-lg z-30 transition-transform hover:scale-105"
        aria-label="Suggest new product"
      >
        <Plus size={24} />
      </button>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onProductAdded={handleProductAdded}
      />
    </>
  )
}
