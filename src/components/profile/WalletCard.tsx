'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { FundWalletModal } from './FundWalletModal'

interface WalletCardProps {
  balance: number
  holds: number
}

export function WalletCard({ balance, holds }: WalletCardProps) {
  const [showModal, setShowModal] = useState(false)
  const openModal = () => setShowModal(true)
  const closeModal = () => setShowModal(false)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Available Balance</p>
        <p className="text-3xl font-bold">{balance ?? '0.00'}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Holds</p>
        <p className="text-xl font-semibold">{holds ?? '0.00'}</p>
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={openModal}>Fund</Button>
        <Button variant="secondary" disabled>Withdraw</Button>
      </div>
      <FundWalletModal isOpen={showModal} onClose={closeModal} />
    </div>
  )
}
