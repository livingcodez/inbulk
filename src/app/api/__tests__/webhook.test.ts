/** @jest-environment node */
import { POST } from '../webhook/route'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null }),
    insert: jest.fn().mockResolvedValue({}),
    rpc: jest.fn().mockResolvedValue({}),
  }))
}))

describe('webhook API', () => {
  const secret = 'secret'
  it('ignores invalid signature', async () => {
    const body = JSON.stringify({})
    const req = new Request('http://localhost/api/webhook', { method: 'POST', body })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
  })

  it('processes charge.success', async () => {
    const event = {
      event: 'charge.success',
      data: { customer: { email: 'a@test.com' }, amount: 10000, reference: 'ref' },
    }
    const body = JSON.stringify(event)
    const sig = crypto.createHmac('sha512', secret).update(body).digest('hex')
    const req = new Request('http://localhost/api/webhook', {
      method: 'POST',
      body,
      headers: { 'x-paystack-signature': sig },
    })
    process.env.PAYSTACK_WEBHOOK_SECRET = secret
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'key'
    const res = await POST(req as any)
    expect(res.status).toBe(200)
  })
})
