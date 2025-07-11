import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature')
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || ''
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  if (hash !== signature) {
    return NextResponse.json({ received: true })
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials')
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const event = JSON.parse(rawBody)
  if (event.event === 'charge.success') {
    const email = event.data?.customer?.email
    const amountKobo = event.data?.amount
    const reference = event.data?.reference
    if (email && amountKobo && reference) {
      const { data: existing } = await supabase
        .from('wallet_transactions')
        .select('reference')
        .eq('reference', reference)
        .maybeSingle()
      if (!existing) {
        await supabase.from('wallet_transactions').insert({
          reference,
          email,
          amount: amountKobo / 100,
        })
        await supabase.rpc('increment_wallet_balance', {
          p_email: email,
          p_amount: amountKobo / 100,
        })
      }
    }
  }
  return NextResponse.json({ received: true })
}
