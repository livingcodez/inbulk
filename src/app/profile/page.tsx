export const dynamic = 'force-dynamic'
import { Header } from '@/components/layout/Header'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { User, Wallet, Settings, Bell, Banknote } from 'lucide-react'
import { VendorBankForm } from '@/components/profile/VendorBankForm'
import Image from 'next/image'
import type { Session } from '@supabase/supabase-js' // Import Session type

export default async function ProfilePage() {
  let session: Session | null = null;
  let supabaseClient; // Define supabaseClient here to be accessible outside try

  try {
    supabaseClient = await createServerSupabaseClient();
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      redirect('/login');
      return; // Ensure redirect happens
    }
    session = data.session;
  } catch (error) {
    console.error('Failed to initialize Supabase client or get session:', error);
    redirect('/login');
    return; // Ensure redirect happens
  }

  if (!session || !session.user) { // Also check for session.user
    redirect('/login');
    return; // Ensure redirect happens
  }

  // Ensure supabaseClient is defined before using it here
  if (!supabaseClient) {
      // This case should ideally be caught by the try-catch or session check,
      // but as a safeguard:
      console.error('Supabase client is not initialized.');
      redirect('/login');
      return;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    // Decide how to handle profile fetch errors, e.g., show an error message or redirect
    // For now, let's redirect to a generic error page or show a message,
    // but for this task, a simple console log and allowing the page to render (possibly with missing data)
    // might be acceptable if the main issue is the build error due to session.
    // However, to be safe and prevent rendering with incomplete/error state:
    // redirect('/error-page'); // or handle more gracefully
  }

  // Remove unused import: useSupabase
  // The import `import { useSupabase } from '@/contexts/SupabaseProvider'` was present
  // but `useSupabase` was not used. This subtask will remove it.

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-8">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full">
                      <Image
                        src={profile?.avatar_url || '/avatars/default.jpg'}
                        alt={profile?.full_name || 'Profile'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-semibold">{profile?.full_name || 'Not Available'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.role || 'N/A'} Account
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                      <input
                        id="fullName"
                        type="text"
                        value={profile?.full_name || ''}
                        className="w-full rounded-lg border bg-background px-3 py-2"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <input
                        id="email"
                        type="email"
                        value={session.user.email || ''} // Use session.user.email as a fallback
                        className="w-full rounded-lg border bg-background px-3 py-2"
                        readOnly
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {profile?.role === 'vendor' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Banknote className="h-5 w-5" />
                      <span>Vendor Payout Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VendorBankForm
                      initialAccountNumber={profile.account_number || ''}
                      initialBankCode={profile.bank_code || ''}
                      initialCurrency={profile.currency || 'NGN'}
                    />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5" />
                    <span>Wallet</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-3xl font-bold">${profile?.wallet_balance || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Holds</p>
                      <p className="text-xl font-semibold">${profile?.holds || '0.00'}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white">Fund</button>
                      <button className="rounded-lg bg-muted px-3 py-2 text-sm font-medium">Withdraw</button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Account Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
                        Enable
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Manage your notification preferences
                        </p>
                      </div>
                      <button className="rounded-lg bg-muted px-4 py-2 text-sm font-medium">
                        Configure
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add activity items here */}
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
