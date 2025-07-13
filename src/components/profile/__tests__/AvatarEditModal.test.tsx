import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AvatarEditModal } from '../AvatarEditModal'

const mockUpdateProfile = jest.fn()

jest.mock('@/contexts/SupabaseProvider', () => ({
  useSupabase: () => ({
    profile: { avatar_url: '/old.jpg' },
    updateProfile: mockUpdateProfile
  })
}))

describe('AvatarEditModal', () => {
  it('does not render when closed', () => {
    render(<AvatarEditModal isOpen={false} onClose={jest.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('updates avatar url and closes', async () => {
    const handleClose = jest.fn()
    render(<AvatarEditModal isOpen={true} onClose={handleClose} />)
    const input = screen.getByPlaceholderText('Image URL')
    fireEvent.change(input, { target: { value: 'http://img.com/pic.png' } })
    fireEvent.click(screen.getByText('Save'))
    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledWith({ avatar_url: 'http://img.com/pic.png' }))
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
  })

  it('calls onClose when cancel clicked', () => {
    const handleClose = jest.fn()
    render(<AvatarEditModal isOpen={true} onClose={handleClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(handleClose).toHaveBeenCalled()
  })
})
