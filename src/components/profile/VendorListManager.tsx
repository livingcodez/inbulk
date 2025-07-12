'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface Vendor {
  id: string
  name: string
}

export function VendorListManager() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [name, setName] = useState('')

  const load = async () => {
    const res = await fetch('/api/user-vendors')
    if (res.ok) {
      setVendors(await res.json())
    }
  }

  useEffect(() => { load() }, [])

  const addVendor = async () => {
    if (!name.trim()) return
    const res = await fetch('/api/user-vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    if (res.ok) {
      setName('')
      await load()
    }
  }

  const removeVendor = async (id: string) => {
    const res = await fetch('/api/user-vendors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (res.ok) {
      await load()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Vendor name" className="border p-2 rounded w-full" />
        <Button onClick={addVendor}>Add</Button>
      </div>
      <ul className="space-y-2">
        {vendors.map(v => (
          <li key={v.id} className="flex justify-between border p-2 rounded">
            <span>{v.name}</span>
            <Button variant="destructive" size="sm" onClick={() => removeVendor(v.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
