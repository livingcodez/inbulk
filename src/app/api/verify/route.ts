import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const reference = url.searchParams.get('reference')
  if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 })

  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) return NextResponse.json({ error: 'Verification unavailable' }, { status: 500 })
  try {
    const res = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${key}` }
    })
    if (res.data.data.status === 'success') {
      return NextResponse.json({ status: 'success' })
    }
    return NextResponse.json({ error: 'Transaction not successful' }, { status: 400 })
  } catch (err) {
    console.error('Paystack verify error', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
