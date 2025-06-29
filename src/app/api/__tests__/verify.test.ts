/** @jest-environment node */
import { GET } from '../verify/route'
import axios from 'axios'

jest.mock('axios')

describe('verify API', () => {
  it('success case', async () => {
    ;(axios.get as jest.Mock).mockResolvedValue({ data: { data: { status: 'success' } } })
    const req = new Request('http://localhost/api/verify?reference=ref')
    const res = await GET(req as any)
    expect(res.status).toBe(200)
  })

  it('failure case', async () => {
    ;(axios.get as jest.Mock).mockResolvedValue({ data: { data: { status: 'failed' } } })
    const req = new Request('http://localhost/api/verify?reference=ref')
    const res = await GET(req as any)
    expect(res.status).toBe(400)
  })
})
