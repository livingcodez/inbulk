import { useState } from 'react'

export default function DepositPage() {
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const [reference, setReference] = useState('')

  async function handlePay() {
    setLoading(true)
    const res = await fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount: Number(amount) * 100 })
    })
    const data = await res.json()
    if (data.authorization_url) {
      setReference(data.reference)
      window.location.href = data.authorization_url
    } else {
      alert(data.error || 'Error')
    }
    setLoading(false)
  }

  return (
    <div className="p-4 space-y-4">
      {pending ? (
        <p>Pending confirmation...</p>
      ) : (
        <>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border p-2" />
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="border p-2" />
          <button onClick={handlePay} disabled={loading}>Pay</button>
        </>
      )}
    </div>
  )
}
