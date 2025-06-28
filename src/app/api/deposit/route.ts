import axios from 'axios'

export async function POST(request: Request) {
  const { email, amount } = await request.json()
  if (!email || !amount) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 })
  }
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) {
    return new Response(JSON.stringify({ error: 'Payment unavailable' }), { status: 500 })
  }
  try {
    const reference = `DEP_${Date.now()}`
    const res = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount,
      reference
    }, { headers: { Authorization: `Bearer ${key}` } })
    return new Response(JSON.stringify({ authorization_url: res.data.data.authorization_url, reference }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Failed to initiate payment' }), { status: 500 })
  }
}
