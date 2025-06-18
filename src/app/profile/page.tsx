'use client'

import Header from '@/components/layout/Header'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { User, Wallet, Settings, Bell } from 'lucide-react'
import Image from 'next/image'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

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
                      <h3 className="text-2xl font-semibold">{profile?.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.role} Account
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <input
                        type="text"
                        value={profile?.full_name || ''}
                        className="w-full rounded-lg border bg-background px-3 py-2"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        className="w-full rounded-lg border bg-background px-3 py-2"
                        readOnly
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

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
