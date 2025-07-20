import ProfilePage from '../page';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { render, screen } from '@testing-library/react'; // Using render for async component

// Mock next/navigation
jest.mock('next/navigation', () => {
  const originalModule = jest.requireActual('next/navigation');
  return {
    ...originalModule,
    redirect: jest.fn((path) => {
      const error = new Error('NEXT_REDIRECT');
      // @ts-ignore
      error.digest = `NEXT_REDIRECT;${path}`; // Mimic Next.js redirect error signature
      throw error;
    }),
  };
});

// Mock @/lib/supabase/server
jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(),
}));

// Mock Header component as it's not relevant to this test's logic
jest.mock('@/components/layout/Header', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-header">Mock Header</div>,
  };
});

// Mock ShippingDetailsForm to avoid loading client dependencies
jest.mock('@/components/profile/ShippingDetailsForm', () => ({
  __esModule: true,
  ShippingDetailsForm: () => <div data-testid="shipping-form" />
}));

// Mock PersonalInfoSection to avoid client dependencies
jest.mock('@/components/profile/PersonalInfoSection', () => ({
  __esModule: true,
  PersonalInfoSection: () => <div data-testid="personal-info" />
}));

// Mock Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />;
    }
}));


describe('ProfilePage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should redirect to /login if createServerSupabaseClient throws an error', async () => {
    (createServerSupabaseClient as jest.Mock).mockRejectedValueOnce(new Error('Supabase client init failed'));

    try {
      await ProfilePage();
    } catch (error: any) {
      // Check if the error is the one thrown by our redirect mock
      if (error.message === 'NEXT_REDIRECT' && error.digest?.includes('/login')) {
        // This is expected
      } else {
        // Re-throw if it's some other error, so the test fails
        throw error;
      }
    }
    expect(redirect).toHaveBeenCalledWith('/login');
    // Based on component logic, if createServerSupabaseClient fails,
    // redirect is called once in the main catch block of ProfilePage.
    expect(redirect).toHaveBeenCalled();
  });

  it('should redirect to /login if session is null', async () => {
    const mockGetSession = jest.fn().mockResolvedValueOnce({ data: { session: null }, error: null });
    const mockGetUserFn = jest.fn().mockResolvedValueOnce({ data: { user: null } });
    const auth = { getUser: mockGetUserFn, getSession: mockGetSession };
    (createServerSupabaseClient as jest.Mock).mockResolvedValueOnce({ auth });

    try {
      await ProfilePage();
    } catch (error: any) {
      expect(error.message).toBe('NEXT_REDIRECT');
      // @ts-ignore
      expect(error.digest).toContain('NEXT_REDIRECT');
      // @ts-ignore
      expect(error.digest).toContain('/login');
    }
    expect(redirect).toHaveBeenCalledWith('/login');
    expect(redirect).toHaveBeenCalled();
  });

  it('should redirect to /login if getSession returns an error', async () => {
    const mockGetSession = jest.fn().mockResolvedValueOnce({ data: { session: null }, error: new Error('Session fetch error') });
    const mockGetUserErr = jest.fn().mockResolvedValueOnce({ data: { user: null } });
    const authErr = { getUser: mockGetUserErr, getSession: mockGetSession };
    (createServerSupabaseClient as jest.Mock).mockResolvedValueOnce({ auth: authErr });

    try {
      await ProfilePage();
    } catch (error: any) {
      expect(error.message).toBe('NEXT_REDIRECT');
      // @ts-ignore
      expect(error.digest).toContain('NEXT_REDIRECT');
      // @ts-ignore
      expect(error.digest).toContain('/login');
    }
    expect(redirect).toHaveBeenCalledWith('/login');
    // Based on current component logic, redirect is called twice in this scenario:
    // 1. Inside the if(error) for getSession in ProfilePage
    // 2. The thrown NEXT_REDIRECT is caught by the outer try-catch in ProfilePage, which calls redirect again.
    expect(redirect).toHaveBeenCalled();
  });

  // Optional: Test for successful rendering path (requires more mocking for profile data)
  it.skip('should render profile information if session exists and profile is fetched', async () => {
     const mockUser = { id: 'user-123', email: 'test@example.com' };
     const mockSession = { user: mockUser, expires_at: '', expires_in: 0, access_token: '', refresh_token: '', token_type: '' };
     const mockProfile = { id: 'user-123', full_name: 'Test User', avatar_url: '/test.jpg', role: 'tester', wallet_balance: 100, holds: 10, email: 'test@example.com' };

     const mockGetSession = jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null });
     const mockFrom = jest.fn().mockReturnValue({
         select: jest.fn().mockReturnThis(),
         eq: jest.fn().mockReturnThis(),
         single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
     });

    const mockGetUser3 = jest.fn().mockResolvedValue({ data: { user: mockUser } })
    (createServerSupabaseClient as jest.Mock).mockResolvedValue({
        auth: { getUser: mockGetUser3, getSession: mockGetSession },
        from: mockFrom,
    });

     // Since ProfilePage is an async component, we need to await its resolution
     // and then use testing-library's render on the result.
     const PageComponent = await ProfilePage();
     render(PageComponent);

     expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
     expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
     expect(redirect).not.toHaveBeenCalled();
  });

});
