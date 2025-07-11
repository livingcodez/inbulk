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
        avatar_url: '/test.jpg',
        phone_number: '123',
        shipping_address: '123 Street'
      },
      session: { user: { email: 'test@example.com' } },
      updateProfile: mockUpdateProfile
    })
  })

  it('hides phone and address by default', () => {
    render(<PersonalInfoSection />)
    expect(screen.queryByTestId('phone')).toBeNull()
    expect(screen.queryByTestId('address')).toBeNull()
  })

  it('shows phone and address when See More clicked', () => {
    render(<PersonalInfoSection />)
    fireEvent.click(screen.getByText('See More'))
    expect(screen.getByTestId('phone')).toBeInTheDocument()
    expect(screen.getByTestId('address')).toBeInTheDocument()
    expect(screen.getByText('Hide')).toBeInTheDocument()
  })

  it('handles missing details gracefully', () => {
    mockUseSupabase.mockReturnValue({
      profile: { full_name: 'Test User', avatar_url: '/test.jpg' },
      session: { user: { email: 'test@example.com' } },
      updateProfile: mockUpdateProfile
    })
    render(<PersonalInfoSection />)
    fireEvent.click(screen.getByText('See More'))
    expect(screen.queryByTestId('phone')).toBeNull()
    expect(screen.queryByTestId('address')).toBeNull()
  })

  it('edit button contains only an icon and is vertically centered', () => {
    render(<PersonalInfoSection />)
    const btn = screen.getByLabelText('Edit Personal Information')
    expect(btn).not.toHaveTextContent(/edit/i)
    expect(btn.className).toMatch(/top-1\/2/)
    expect(btn.className).toMatch(/-translate-y-1\/2/)
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
