'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

interface FundWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FundWalletModal({ isOpen, onClose }: FundWalletModalProps) {
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) setAmount(0)
  }, [isOpen])

  const handleSubmit = async () => {
    if (amount <= 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/fund-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      const data = await res.json()
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        alert(data.error || 'Failed to initiate payment')
      }
    } catch (err) {
      alert('Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="bg-white dark:bg-neutral-850 p-6 rounded-lg shadow-xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Fund Wallet</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
            <X size={20} />
          </button>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Amount"
          className="w-full border rounded px-2 py-1 mb-4"
        />
        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Processing...' : 'Proceed to Paystack'}
        </Button>
      </div>
    </div>
  )
}
