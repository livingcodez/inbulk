'use client'

import { useSupabase } from '@/contexts/SupabaseProvider'
import { useConversations } from '@/hooks/useConversations'
import { ConversationPreview } from '@/components/chat/ConversationPreview'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Header } from '@/components/layout/Header'

export default function InboxPage() {
  const { profile } = useSupabase()
  const { conversations, loading } = useConversations(profile?.id)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'personal' | 'business'>('all')

  const filtered = conversations.filter(c => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && c.unread_count > 0) ||
      (filter === 'personal' && (c.type === 'personal' || c.type === 'group')) ||
      (filter === 'business' && c.type === 'business')
    const term = search.toLowerCase()
    const matchesSearch =
      c.name.toLowerCase().includes(term) ||
      (c.last_message ?? '').toLowerCase().includes(term)
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Chats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 pl-8 text-sm"
                />
                <span className="absolute left-2 top-2.5 text-gray-400">🔍</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'unread', 'personal', 'business'] as const).map(f => (
                  <Button
                    key={f}
                    size="sm"
                    variant={filter === f ? 'default' : 'outline'}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">No chats found.</p>
                ) : (
                  filtered.map(c => (
                    <ConversationPreview key={c.id} conversation={c} />
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </main>
      <footer className="mt-auto border-t bg-white py-6 text-center dark:bg-neutral-800 dark:border-neutral-700">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">&copy; 2025 CrowdCart Lite. All rights reserved.</p>
      </footer>
    </div>
  )
}
