'use client'
import { useState } from 'react'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { Button } from '@/components/ui/Button'

interface VendorBankFormProps {
  initialAccountNumber?: string
  initialBankCode?: string
  initialCurrency?: string
}

export function VendorBankForm({
  initialAccountNumber = '',
  initialBankCode = '',
  initialCurrency = 'NGN',
}: VendorBankFormProps) {
  const { updateProfile } = useSupabase()
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber)
  const [bankCode, setBankCode] = useState(initialBankCode)
  const [currency, setCurrency] = useState(initialCurrency)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await updateProfile({ account_number: accountNumber, bank_code: bankCode, currency })
      alert('Bank details updated')
    } catch (err) {
      setError('Failed to update details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="accountNumber" className="text-sm font-medium">Account Number</label>
        <input
          id="accountNumber"
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="bankCode" className="text-sm font-medium">Bank Code</label>
        <input
          id="bankCode"
          type="text"
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="currency" className="text-sm font-medium">Currency</label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="NGN">NGN</option>
          <option value="USD" disabled>USD</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
