import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PayoutModal } from '../PayoutModal'

describe('PayoutModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when closed', () => {
    render(<PayoutModal isOpen={false} onClose={jest.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('submits payout details and closes', async () => {
    const handleClose = jest.fn()
    global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve({ success: true }) }) as any

    render(
      <PayoutModal
        isOpen={true}
        onClose={handleClose}
        account_name="John"
        account_number="123"
        bank_name="ABC"
        currency="NGN"
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Jane' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/update-payout-info', expect.objectContaining({ method: 'POST' }))
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
  })

  it('calls onClose when cancel clicked', () => {
    const handleClose = jest.fn()
    render(<PayoutModal isOpen={true} onClose={handleClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(handleClose).toHaveBeenCalled()
  })
})
