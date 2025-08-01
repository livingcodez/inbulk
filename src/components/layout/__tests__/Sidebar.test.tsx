import { render, screen, fireEvent, within } from '@testing-library/react';
import { Sidebar } from '../Sidebar';

// Mock next/navigation to provide a path for usePathname
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

const signOutMock = jest.fn();
jest.mock('@/contexts/SupabaseProvider', () => ({
  useSupabase: () => ({ profile: { id: '1' }, signOut: signOutMock })
}));

jest.mock('@/lib/supabase/notifications', () => ({
  getUnreadNotificationCount: jest.fn().mockResolvedValue(0)
}));

// Mock next/link to simply render anchors during test
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe('Sidebar component', () => {
  it('applies top border classes', () => {
    render(<Sidebar />);
    const aside = screen.getByLabelText('Main navigation');
    expect(aside.className).toContain('border-t');
    expect(aside.className).toContain('dark:border-t-neutral-700');
  });

  it('renders divider with correct classes', () => {
    render(<Sidebar />);
    const userNav = screen.getByLabelText('User navigation links');
    const divider = userNav.previousElementSibling as HTMLElement | null;
    expect(divider).not.toBeNull();
    expect(divider?.className).toContain('border-t');
    expect(divider?.className).toContain('dark:border-t-neutral-700');
  });

  it('aligns icon vertically with description', () => {
    render(<Sidebar />);
    const aside = screen.getByLabelText('Main navigation');
    const link = aside.querySelector('a[href="/dashboard"]');
    expect(link?.className).toContain('items-center');
  });

  it('renders caption and clamped description only when expanded', async () => {
    render(<Sidebar />);
    const aside = screen.getByLabelText('Main navigation');

    // collapsed state should hide caption and description
    expect(within(aside).queryByText('Dashboard')).toBeNull();

    fireEvent.mouseEnter(aside);

    const caption = await screen.findByText('Dashboard');
    expect(caption).toBeInTheDocument();
    const desc = await screen.findByText(
      "View items you want to group buy or create one if you can\u2019t find what you want"
    );
    expect(desc).toBeInTheDocument();
    expect(desc.className).toContain('line-clamp-2');

    fireEvent.mouseLeave(aside);
    expect(within(aside).queryByText('Dashboard')).toBeNull();
  });

  it('renders Logout without description and triggers signOut', async () => {
    render(<Sidebar />);
    const aside = screen.getByLabelText('Main navigation');
    fireEvent.mouseEnter(aside);

    const logout = await screen.findByText('Logout');
    expect(logout).toBeInTheDocument();
    const desc = within(logout.closest('div')!).queryByText(/Details about/);
    expect(desc).toBeNull();

    fireEvent.click(logout);
    expect(signOutMock).toHaveBeenCalled();
  });
});
