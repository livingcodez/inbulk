'use client'

import { useState, useMemo } from 'react'
import { useConversations } from '@/hooks/useConversations'
import { ConversationPreview } from './ConversationPreview'

interface Props {
  userId: string
}

export default function InboxContent({ userId }: Props) {
  const { conversations, loading } = useConversations(userId)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'personal' | 'business'>('all')

  const filtered = useMemo(() => {
    return conversations.filter(c => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'unread' && c.unread_count > 0) ||
        (filter === 'personal' && (c.type === 'personal' || c.type === 'group')) ||
        (filter === 'business' && c.type === 'business')

      const searchTerm = search.toLowerCase()
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm) ||
        (c.last_message ?? '').toLowerCase().includes(searchTerm)

      return matchesFilter && matchesSearch
    })
  }, [conversations, filter, search])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2 mb-4">Chats</h1>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border rounded-md px-3 py-2 pl-9 focus:outline-none"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <div className="flex gap-2">
          {(['all', 'unread', 'personal', 'business'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md border text-sm ${
                filter === f ? 'bg-primary text-white border-primary' : 'bg-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No chats found.</div>
        ) : (
          filtered.map(convo => (
            <ConversationPreview key={convo.id} conversation={convo} />
          ))
        )}
      </div>
    </div>
  )
}
