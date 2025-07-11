/** @jest-environment node */
import { GET, POST } from '../user-vendors/route'

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
    from: jest.fn(() => {
      const order = jest.fn().mockResolvedValue({ data: [], error: null })
      const eq = jest.fn().mockReturnValue({ order })
      return {
        select: jest.fn().mockReturnValue({ eq, order }),
        insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: '1' }, error: null }) }) })
      }
    })
  }))
}))

describe('user-vendors API', () => {
  it('gets vendors', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
  })

  it('creates vendor', async () => {
    const req = new Request('http://localhost/api/user-vendors', { method: 'POST', body: JSON.stringify({ name: 'A' }) })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
  })
})
