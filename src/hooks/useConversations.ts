import { useEffect, useState } from 'react'
import * as chatApi from '@/lib/supabase/chat'

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<chatApi.Conversation[]>([])
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

export function useMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<chatApi.Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!conversationId) return
    const id = conversationId

    let subscription: any

    async function load() {
      try {
        const data = await chatApi.getMessages(id)
        setMessages(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load messages'))
      } finally {
        setLoading(false)
      }
    }

    load()

    subscription = chatApi.subscribeToMessages(id, message => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [conversationId])

  const sendMessage = async (senderId: string, content: string) => {
    if (!conversationId) return
    await chatApi.sendMessage({ conversation_id: conversationId, sender_id: senderId, content })
  }

  return { messages, loading, error, sendMessage }
}
