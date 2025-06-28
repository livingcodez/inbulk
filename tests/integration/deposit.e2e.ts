import { POST as deposit } from '../../src/app/api/deposit/route'
import webhook from '../../pages/api/paystack-webhook'

jest.mock('axios', () => ({
  default: {
    post: jest.fn().mockResolvedValue({ data: { data: { authorization_url: 'http://pay' } } }),
    get: jest.fn().mockResolvedValue({ data: { data: { status: 'success', customer: { email: 'a@test.com' }, amount: 100 } } })
  }
}))

describe('deposit flow', () => {
  it('runs webhook after deposit', async () => {
    await deposit(new Request('http://test', { method: 'POST', body: JSON.stringify({ email: 'a@test.com', amount: 100 }) }) as any)
    const req: any = { method: 'POST', body: { data: { reference: 'ref', customer: { email: 'a@test.com' }, amount: 100 } }, headers: { 'x-paystack-signature': 'sig' } }
    const resMock: any = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    await webhook(req, resMock)
    expect(resMock.status).toHaveBeenCalled()
  })
})
