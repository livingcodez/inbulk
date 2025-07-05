/** @jest-environment node */
import { POST } from '../fund-wallet/route'

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({})),
}))

jest.mock('axios')

describe('fund-wallet API', () => {
  it('rejects invalid amount', async () => {
    const req = new Request('http://localhost/api/fund-wallet', {
      method: 'POST',
      body: JSON.stringify({ amount: 50 }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })
})
