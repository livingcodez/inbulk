import { useEffect, useState } from 'react'
import * as chatApi from '@/lib/supabase/chat'
import type { Message } from '@/lib/supabase/chat'

export function useMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function load() {
      if (!conversationId) return

      try {
        const data = await chatApi.getMessages(conversationId)
        setMessages(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load messages'))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [conversationId])

  const sendMessage = async (senderId: string, content: string) => {
    if (!conversationId) return
    const newMsg = await chatApi.sendMessage(conversationId, senderId, content)
    setMessages(prev => [...prev, newMsg])
  }

  return { messages, loading, error, sendMessage }
}
