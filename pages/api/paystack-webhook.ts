import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const signature = req.headers['x-paystack-signature'] as string | undefined
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!signature || !key) return res.status(400).json({ error: 'Invalid signature' })

  const hash = crypto.createHmac('sha512', key).update(JSON.stringify(req.body)).digest('hex')
  if (hash !== signature) return res.status(400).json({ error: 'Invalid signature' })

  const reference = req.body.data?.reference
  try {
    const verify = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${key}` }
    })
    const data = verify.data.data
    if (data.status !== 'success') return res.status(200).json({})
    const email = data.customer.email
    const amount = data.amount

    await supabase.rpc('wallet_deposit', { email, amount })
    return res.status(200).json({})
  } catch (e) {
    return res.status(500).json({ error: 'Webhook failed' })
  }
}
