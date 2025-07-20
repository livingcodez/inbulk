import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AvatarEditModal } from '../AvatarEditModal'

const mockUpdateProfile = jest.fn()

jest.mock('@/contexts/SupabaseProvider', () => ({
  useSupabase: () => ({
    profile: { avatar_url: '/old.jpg', avatar_original_url: '/old.jpg' },
    updateProfile: mockUpdateProfile
  })
}))

describe('AvatarEditModal', () => {
  beforeEach(() => {
    mockUpdateProfile.mockReset()
    global.fetch = jest.fn()
  })
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
    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        avatar_url: '/api/thumbnail?imageUrl=http%3A%2F%2Fimg.com%2Fpic.png',
        avatar_original_url: 'http://img.com/pic.png'
      })
    )
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
  })

  it('resolves indirect url before saving', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ image: 'http://img.com/photo.jpg' })
    })
    const handleClose = jest.fn()
    render(<AvatarEditModal isOpen={true} onClose={handleClose} />)
    fireEvent.change(screen.getByPlaceholderText('Image URL'), {
      target: { value: 'https://ibb.co/abc' }
    })
    fireEvent.click(screen.getByText('Save'))
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/resolve-image?url=https%3A%2F%2Fibb.co%2Fabc'
      )
    )
    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        avatar_url: '/api/thumbnail?imageUrl=http%3A%2F%2Fimg.com%2Fphoto.jpg',
        avatar_original_url: 'https://ibb.co/abc'
      })
    )
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
  })

  it('shows error on invalid url', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false })
    render(<AvatarEditModal isOpen={true} onClose={jest.fn()} />)
    const input = screen.getByPlaceholderText('Image URL')
    fireEvent.change(input, { target: { value: 'http://example.com' } })
    fireEvent.click(screen.getByText('Save'))
    expect(await screen.findByText('Invalid or unreachable image')).toBeInTheDocument()
    expect(mockUpdateProfile).not.toHaveBeenCalled()
  })

  it('calls onClose when cancel clicked', () => {
    const handleClose = jest.fn()
    render(<AvatarEditModal isOpen={true} onClose={handleClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(handleClose).toHaveBeenCalled()
  })
})
