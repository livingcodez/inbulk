'use client'
import { useState } from 'react'

export default function DepositForm() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = Number(amount)
    if (isNaN(value) || value < 100) {
      alert('Minimum amount is ₦100')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', amount: value }),
      })
      const data = await res.json()
      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        alert(data.error || 'Payment failed')
      }
    } catch (err) {
      console.error(err)
      alert('Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="w-full border rounded px-2 py-1"
      />
      <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2 rounded">
        {loading ? 'Processing...' : 'Proceed to Paystack'}
      </button>
    </form>
  )
}
