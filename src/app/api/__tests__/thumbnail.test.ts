/** @jest-environment node */
import { GET } from '../thumbnail/route'
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => ({ auth: { getUser: () => Promise.resolve({ data: { user: null } }) }, from: () => ({ update: () => ({ eq: () => ({}) }) }) })
}))
jest.mock('next/headers', () => ({ cookies: jest.fn() }))

describe('thumbnail API', () => {
  beforeEach(() => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6mA3EAAAAASUVORK5CYII=',
      'base64'
    )
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(png)
    })
  })

  it('returns thumbnail png', async () => {
    const req = new Request('http://localhost/api/thumbnail?imageUrl=http://x.com')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/png')
  })

  it('rejects missing url', async () => {
    const req = new Request('http://localhost/api/thumbnail')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('handles fetch failure', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('fail'))
    const req = new Request('http://localhost/api/thumbnail?imageUrl=http://x.com')
    const res = await GET(req)
    expect(res.status).toBe(500)
  })
})
