import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: Request) {
  const { email, amount } = await req.json()
  if (!email || !amount || amount < 100) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }
  const key = process.env.PAYSTACK_SECRET_KEY
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/callback`
  if (!key || !callbackUrl) {
    return NextResponse.json({ error: 'Payment unavailable' }, { status: 500 })
  }
  try {
    const res = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100,
        callback_url: callbackUrl,
      },
      { headers: { Authorization: `Bearer ${key}` } }
    )
    const { authorization_url } = res.data.data
    return NextResponse.json({ authorization_url })
  } catch (err) {
    console.error('Paystack init error', err)
    return NextResponse.json({ error: 'Failed to initiate transaction' }, { status: 500 })
  }
}
