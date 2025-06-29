import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DepositForm from '../DepositForm'

describe('DepositForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ authorization_url: 'http://pay' }) }) as any
  })

  it('submits valid amount', async () => {
    render(<DepositForm email="test@example.com" />)
    fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '200' } })
    fireEvent.click(screen.getByRole('button', { name: /proceed to paystack/i }))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    const args = (global.fetch as jest.Mock).mock.calls[0]
    expect(args[0]).toBe('/api/deposit')
    const body = JSON.parse(args[1].body)
    expect(body).toEqual({ email: 'test@example.com', amount: 200 })
  })

  it('rejects invalid amount', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    render(<DepositForm email="test@example.com" />)
    fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '50' } })
    fireEvent.click(screen.getByRole('button', { name: /proceed to paystack/i }))
    expect(alertSpy).toHaveBeenCalledWith('Minimum amount is ₦100')
    expect(global.fetch).not.toHaveBeenCalled()
    alertSpy.mockRestore()
  })
})
