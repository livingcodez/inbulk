import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  const { amount } = await request.json()
  const value = Number(amount)
  if (isNaN(value) || value < 100) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('wallet_balance')
    .eq('id', user.id)
    .single()
  if (error || !profile) {
    return NextResponse.json({ error: 'Failed to load wallet' }, { status: 500 })
  }
  if (profile.wallet_balance >= value) {
    await supabase
      .from('user_profiles')
      .update({ wallet_balance: profile.wallet_balance - value })
      .eq('id', user.id)
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: value,
      type: 'escrow',
      status: 'completed',
      description: 'Group buy payment',
    })
    return NextResponse.json({ paidWithWallet: true })
  }
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) return NextResponse.json({ error: 'Payment unavailable' }, { status: 500 })
  const reference = `GP_${Date.now()}_${user.id}`
  try {
    const res = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: user.email,
      amount: value * 100,
      reference,
    }, {
      headers: { Authorization: `Bearer ${key}` }
    })
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: value,
      type: 'escrow',
      status: 'pending',
      reference_id: reference,
    })
    return NextResponse.json({ paymentUrl: res.data.data.authorization_url })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
}
