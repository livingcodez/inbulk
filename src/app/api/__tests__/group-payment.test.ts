/** @jest-environment node */
import { POST } from '../group-payment/route'

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({})),
}))

jest.mock('axios')

describe('group-payment API', () => {
  it('rejects invalid amount', async () => {
    const req = new Request('http://localhost/api/group-payment', {
      method: 'POST',
      body: JSON.stringify({ amount: 20 }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })
})
