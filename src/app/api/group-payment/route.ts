import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import axios from 'axios'
import type { Database } from '@/types/database.types'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId, amount } = await req.json()
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('wallet_balance')
    .eq('id', session.user.id)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 })
  }

  if (profile.wallet_balance >= amount) {
    const newBalance = profile.wallet_balance - amount
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', session.user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to debit wallet' }, { status: 500 })
    }

    await supabase.from('transactions').insert({
      user_id: session.user.id,
      amount,
      type: 'escrow',
      status: 'completed',
      reference_id: groupId,
      description: 'Group payment from wallet',
    })

    return NextResponse.json({ status: 'paid_from_wallet' })
  }

  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
  }

  try {
    const { data: paystackRes } = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: session.user.email,
        amount: amount * 100,
        metadata: { groupId },
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' } }
    )

    const { authorization_url, reference } = paystackRes.data
    await supabase.from('transactions').insert({
      user_id: session.user.id,
      amount,
      type: 'escrow',
      status: 'pending',
      reference_id: reference,
      description: 'Group payment via paystack',
    })

    return NextResponse.json({ paymentUrl: authorization_url })
  } catch (err: any) {
    console.error('Paystack error', err.response?.data || err.message)
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}
