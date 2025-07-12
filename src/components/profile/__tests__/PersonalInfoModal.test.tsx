import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PersonalInfoSection } from '../PersonalInfoSection'

const mockUpdateProfile = jest.fn()
const mockUseSupabase = jest.fn()
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) })) as any

jest.mock('@/contexts/SupabaseProvider', () => ({
  useSupabase: () => mockUseSupabase()
}))

describe('PersonalInfoSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSupabase.mockReturnValue({
      profile: {
        full_name: 'Test User',
        first_name: 'Test',
        last_name: 'User',
        avatar_url: '/test.jpg',
        phone_number: '123',
        shipping_address: '123 Street'
      },
      session: { user: { email: 'test@example.com' } },
      updateProfile: mockUpdateProfile
    })
  })

  it('modal closed by default', () => {
    render(<PersonalInfoSection />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('shows personal info label with icon', () => {
    render(<PersonalInfoSection />)
    expect(screen.getByText('Personal Info')).toBeInTheDocument()
  })

  it('opens modal with details when See More clicked', () => {
    render(<PersonalInfoSection />)
    fireEvent.click(screen.getByText('See More'))
    expect(screen.getByTestId('modal-phone')).toBeInTheDocument()
    expect(screen.getByTestId('modal-address')).toBeInTheDocument()
  })

  it('modal closes via X button', () => {
    render(<PersonalInfoSection />)
    fireEvent.click(screen.getByText('See More'))
    fireEvent.click(screen.getByLabelText('Close'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('handles rapid repeated clicks', () => {
    render(<PersonalInfoSection />)
    const btn = screen.getByText('See More')
    fireEvent.click(btn)
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.getAllByRole('dialog').length).toBe(1)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('handles missing details gracefully', () => {
    mockUseSupabase.mockReturnValue({
      profile: { full_name: 'Test User', avatar_url: '/test.jpg' },
      session: { user: { email: 'test@example.com' } },
      updateProfile: mockUpdateProfile
    })
    render(<PersonalInfoSection />)
    fireEvent.click(screen.getByText('See More'))
    expect(screen.getByTestId('no-details')).toBeInTheDocument()
  })

  it('edit button is icon only', () => {
    render(<PersonalInfoSection />)
    const btn = screen.getByLabelText('Edit Personal Information')
    expect(btn).not.toHaveTextContent(/edit personal info/i)
    expect(btn.querySelector('svg')).toBeInTheDocument()
  })

  it('opens vendor manager when Vendors clicked', () => {
    render(<PersonalInfoSection />)
    fireEvent.click(screen.getByText('Vendors'))
    expect(screen.getByPlaceholderText('Vendor name')).toBeInTheDocument()
  })

  it('saves updates and closes modal', async () => {
    render(<PersonalInfoSection />)
    fireEvent.click(screen.getByLabelText('Edit Personal Information'))
    const phoneInput = screen.getByPlaceholderText('Phone Number')
    fireEvent.change(phoneInput, { target: { value: '999' } })
    fireEvent.click(screen.getByText('Save'))
    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ phone_number: '999' })
      )
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})
