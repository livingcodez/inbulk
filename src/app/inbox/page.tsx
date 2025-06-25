'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { useConversations } from '@/hooks/useConversations'
import { ConversationPreview } from '@/components/chat/ConversationPreview'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function InboxPage() {
  const { session } = useSupabase()
  const userId = session?.user.id
  const { conversations, loading } = useConversations(userId)

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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h1 className="flex items-center gap-2 text-3xl font-bold text-primary mb-4">Chats</h1>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="w-full border rounded-md px-3 py-2 pl-8"
              />
            </div>
            <div className="flex gap-2">
              {([
                ['all', 'All'],
                ['unread', 'Unread'],
                ['personal', 'Personal'],
                ['business', 'Business'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as any)}
                  className={`px-3 py-1 rounded-md border text-sm ${filter === value ? 'bg-primary text-white border-primary' : 'bg-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-20">No chats found.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map(convo => (
                <ConversationPreview key={convo.id} conversation={convo} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
