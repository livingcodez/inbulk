import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../Sidebar';

// Mock next/navigation to provide a path for usePathname
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

jest.mock('@/contexts/SupabaseProvider', () => ({
  useSupabase: () => ({ profile: { id: '1' } })
}));

jest.mock('@/lib/supabase/notifications', () => ({
  getUnreadNotificationCount: jest.fn().mockResolvedValue(0)
}));

// Mock next/link to simply render anchors during test
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

describe('Sidebar component', () => {
  it('applies top border classes', () => {
    render(<Sidebar />);
    const aside = screen.getByLabelText('Main navigation');
    expect(aside.className).toContain('border-t');
    expect(aside.className).toContain('dark:border-t-neutral-700');
  });

  it('shows description text when expanded', async () => {
    render(<Sidebar />);
    const aside = screen.getByLabelText('Main navigation');
    fireEvent.mouseEnter(aside);
    expect(await screen.findByText('View dashboard')).toBeInTheDocument();
  });
});
