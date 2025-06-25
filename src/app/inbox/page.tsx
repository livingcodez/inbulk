export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import InboxContent from '@/components/inbox/InboxContent'

export default async function InboxPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <InboxContent userId={session.user.id} />
      </main>
    </div>
  )
}
