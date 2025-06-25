import { useEffect, useState } from 'react'
import * as conversationApi from '@/lib/supabase/conversations'
import type { ConversationPreview } from '@/lib/supabase/conversations'

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadConversations() {
      if (!userId) return

      try {
        const data = await conversationApi.getConversations(userId)
        setConversations(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load conversations'))
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [userId])

  return { conversations, loading, error }
}
