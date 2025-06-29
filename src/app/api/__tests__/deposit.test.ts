/** @jest-environment node */
import { POST } from '../deposit/route'
import axios from 'axios'

jest.mock('axios')

describe('deposit API', () => {
  it('returns authorization url', async () => {
    ;(axios.post as jest.Mock).mockResolvedValue({ data: { data: { authorization_url: 'http://pay' } } })
    const req = new Request('http://localhost/api/deposit', { method: 'POST', body: JSON.stringify({ email: 'a@test.com', amount: 200 }), headers: { 'Content-Type': 'application/json' } })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.authorization_url).toBe('http://pay')
  })

  it('handles failure', async () => {
    ;(axios.post as jest.Mock).mockRejectedValue(new Error('fail'))
    const req = new Request('http://localhost/api/deposit', { method: 'POST', body: JSON.stringify({ email: 'a@test.com', amount: 200 }), headers: { 'Content-Type': 'application/json' } })
    const res = await POST(req as any)
    expect(res.status).toBe(500)
  })
})
