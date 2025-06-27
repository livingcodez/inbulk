'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface Props {
  account_name?: string | null
  account_number?: string | null
  bank_code?: string | null
  currency?: string | null
}

export default function PayoutInfo({ account_name, account_number, bank_code, currency }: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ account_name: account_name || '', account_number: account_number || '', bank_code: bank_code || '', currency: currency || 'NGN' })
  const toggle = () => setEditing(v => !v)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    await fetch('/api/update-payout-info', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' }
    })
    setEditing(false)
  }

  return (
    <div className="space-y-4">
      {!editing && (
        <>
          <p className="text-sm text-muted-foreground">Account Name: {account_name || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">Account Number: {account_number || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">Bank Code: {bank_code || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">Currency: {currency || 'N/A'}</p>
          <Button onClick={toggle} className="mt-2">Update</Button>
        </>
      )}
      {editing && (
        <div className="space-y-2">
          <input name="account_name" value={form.account_name} onChange={handleChange} placeholder="Name" className="w-full border rounded px-2 py-1" />
          <input name="account_number" value={form.account_number} onChange={handleChange} placeholder="Account Number" className="w-full border rounded px-2 py-1" />
          <input name="bank_code" value={form.bank_code} onChange={handleChange} placeholder="Bank Code" className="w-full border rounded px-2 py-1" />
          <select name="currency" value={form.currency} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="NGN">NGN</option>
            <option value="USD" disabled>USD</option>
          </select>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSubmit}>Save</Button>
            <Button variant="secondary" onClick={toggle}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}
