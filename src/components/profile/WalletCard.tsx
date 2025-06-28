'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { FundWalletModal } from './FundWalletModal'
import { PayoutModal } from './PayoutModal'

interface WalletCardProps {
  balance: number
  holds: number
  account_name?: string | null
  account_number?: string | null
  bank_name?: string | null
  currency?: string | null
}

export function WalletCard({ balance, holds, account_name, account_number, bank_name, currency }: WalletCardProps) {
  const [showFundModal, setShowFundModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const openFundModal = () => setShowFundModal(true)
  const closeFundModal = () => setShowFundModal(false)
  const openPayoutModal = () => setShowPayoutModal(true)
  const closePayoutModal = () => setShowPayoutModal(false)

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
      <div className="flex gap-2 pt-2 flex-wrap">
        <Button onClick={openFundModal}>Fund</Button>
        <Button variant="secondary" disabled>Withdraw</Button>
        <Button variant="secondary" onClick={openPayoutModal}>Modify Payout</Button>
      </div>
      <FundWalletModal isOpen={showFundModal} onClose={closeFundModal} />
      <PayoutModal
        isOpen={showPayoutModal}
        onClose={closePayoutModal}
        account_name={account_name}
        account_number={account_number}
        bank_name={bank_name}
        currency={currency}
      />
    </div>
  )
}
