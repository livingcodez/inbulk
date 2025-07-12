'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

interface PayoutModalProps {
  isOpen: boolean
  onClose: () => void
  account_name?: string | null
  account_number?: string | null
  bank_name?: string | null
  currency?: string | null
}

export function PayoutModal({ isOpen, onClose, account_name, account_number, bank_name, currency }: PayoutModalProps) {
  const [form, setForm] = useState({
    account_name: account_name || '',
    account_number: account_number || '',
    bank_name: bank_name || '',
    currency: currency || 'NGN'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm({
        account_name: account_name || '',
        account_number: account_number || '',
        bank_name: bank_name || '',
        currency: currency || 'NGN'
      })
    }
  }, [isOpen, account_name, account_number, bank_name, currency])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await fetch('/api/update-payout-info', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <button
      type="button"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
      onKeyDown={(e) => (e.key === 'Escape' ? onClose() : null)}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="bg-white dark:bg-neutral-850 p-6 rounded-lg shadow-xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Modify Payout</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-2">
          <input name="account_name" value={form.account_name} onChange={handleChange} placeholder="Name" className="w-full border rounded px-2 py-1" />
          <input name="account_number" value={form.account_number} onChange={handleChange} placeholder="Account Number" className="w-full border rounded px-2 py-1" />
          <input name="bank_name" value={form.bank_name} onChange={handleChange} placeholder="Bank Name" className="w-full border rounded px-2 py-1" />
          <select name="currency" value={form.currency} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="NGN">NGN</option>
            <option value="USD" disabled>USD</option>
          </select>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSubmit} disabled={loading}>Save</Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </button>
  )
}
