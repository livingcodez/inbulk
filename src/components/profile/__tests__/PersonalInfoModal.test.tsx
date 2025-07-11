import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PersonalInfoSection } from '../PersonalInfoSection'

const mockUpdateProfile = jest.fn()
const mockUseSupabase = jest.fn()

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
        phone_number: '123',
        shipping_address: '123 Street'
      },
      session: { user: { email: 'test@example.com' } },
      updateProfile: mockUpdateProfile
    })
  })

  it('hides phone and address by default', () => {
    render(<PersonalInfoSection />)
    expect(screen.queryByDisplayValue('123')).toBeNull()
    expect(screen.queryByDisplayValue('123 Street')).toBeNull()
  })

  it('shows phone and address when See More clicked', () => {
    render(<PersonalInfoSection />)
    fireEvent.click(screen.getByText('See More'))
    expect(screen.getByDisplayValue('123')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123 Street')).toBeInTheDocument()
  })

  it('saves updates and closes modal', async () => {
    render(<PersonalInfoSection />)
    fireEvent.click(screen.getByText('Edit Personal Information'))
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
