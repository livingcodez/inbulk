import { render, screen } from '@testing-library/react'
import { Logo } from '../Logo'

const mockUseSupabase = jest.fn()

jest.mock('@/contexts/SupabaseProvider', () => ({
  useSupabase: () => mockUseSupabase(),
}))

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

describe('Logo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders link when session exists', () => {
    mockUseSupabase.mockReturnValue({ session: {}, profile: null })
    render(<Logo />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/dashboard?mode=buyer&tab=explore')
  })

  it('renders without link when session is null', () => {
    mockUseSupabase.mockReturnValue({ session: null, profile: null })
    render(<Logo />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
