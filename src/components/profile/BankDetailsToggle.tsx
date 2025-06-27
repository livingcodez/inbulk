'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { VendorBankForm } from './VendorBankForm'

interface BankDetailsToggleProps {
  initialAccountNumber?: string
  initialBankCode?: string
  initialCurrency?: string
}

export function BankDetailsToggle({
  initialAccountNumber = '',
  initialBankCode = '',
  initialCurrency = 'NGN',
}: BankDetailsToggleProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-4">
      {showForm ? (
        <VendorBankForm
          initialAccountNumber={initialAccountNumber}
          initialBankCode={initialBankCode}
          initialCurrency={initialCurrency}
        />
      ) : (
        <Button type="button" onClick={() => setShowForm(true)}>
          Update Bank Details
        </Button>
      )}
    </div>
  )
}
