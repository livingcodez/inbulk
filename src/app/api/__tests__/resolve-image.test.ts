/** @jest-environment node */
import { GET } from '../resolve-image/route'

describe('resolve-image API', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<meta property="og:image" content="http://img.jpg"/>')
    })
  })

  it('returns image url', async () => {
    const req = new Request('http://localhost/api/resolve-image?url=http://x.com')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.image).toBe('http://img.jpg')
  })

  it('returns 404 when missing', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('<html></html>') })
    const req = new Request('http://localhost/api/resolve-image?url=http://x.com')
    const res = await GET(req)
    expect(res.status).toBe(404)
  })
})
