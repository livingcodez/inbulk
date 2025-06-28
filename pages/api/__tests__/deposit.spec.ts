import { POST } from "../../../src/app/api/deposit/route"
import axios from 'axios'

jest.mock('axios')

const mocked = axios as jest.Mocked<typeof axios>

describe('deposit api', () => {
  it('calls paystack initialize', async () => {
    mocked.post.mockResolvedValue({ data: { data: { authorization_url: 'http://pay' } } })
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ email: 'a@test.com', amount: 100 }) })
    await POST(req as any)
    expect(mocked.post).toHaveBeenCalled()
  })
})
