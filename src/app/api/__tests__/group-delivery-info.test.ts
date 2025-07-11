/** @jest-environment node */
import { GET } from '../group-delivery-info/[id]/route'

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
    from: jest.fn(() => {
      const eq = jest.fn().mockResolvedValue({ data: [], error: null })
      return { select: jest.fn().mockReturnValue({ eq }) }
    })
  }))
}))

describe('group delivery info API', () => {
  it('returns data', async () => {
    const req = new Request('http://localhost')
    const res = await GET(req as any, { params: Promise.resolve({ id: 'g1' }) } as any)
    expect(res.status).toBe(200)
  })
})
