'use client'
import { useEffect, useState } from 'react'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { Button } from '@/components/ui/Button'

export function ShippingDetailsForm() {
  const { profile, updateProfile } = useSupabase()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    shipping_address: '',
    phone_number: ''
  })

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        shipping_address: profile.shipping_address || '',
        phone_number: profile.phone_number || ''
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="first_name" className="text-sm font-medium">First Name</label>
          <input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} className="w-full rounded-lg border bg-background px-3 py-2" />
        </div>
        <div className="space-y-2">
          <label htmlFor="last_name" className="text-sm font-medium">Last Name</label>
          <input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} className="w-full rounded-lg border bg-background px-3 py-2" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="shipping_address" className="text-sm font-medium">Shipping Address</label>
          <textarea id="shipping_address" name="shipping_address" value={form.shipping_address} onChange={handleChange} className="w-full rounded-lg border bg-background px-3 py-2" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="phone_number" className="text-sm font-medium">Phone Number</label>
          <input id="phone_number" name="phone_number" value={form.phone_number} onChange={handleChange} className="w-full rounded-lg border bg-background px-3 py-2" />
        </div>
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}
