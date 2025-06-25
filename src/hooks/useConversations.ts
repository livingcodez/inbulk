import { useEffect, useState } from 'react'
import * as chatApi from '@/lib/supabase/chat'
import type { Conversation } from '@/lib/supabase/chat'

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function load() {
      if (!userId) return

      try {
        const data = await chatApi.getConversations(userId)
        setConversations(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load conversations'))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  return { conversations, loading, error }
}
