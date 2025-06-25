'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import * as chatApi from '@/lib/supabase/chat'
import { useMessages } from '@/hooks/useMessages'
import type { Conversation } from '@/lib/supabase/chat'
import { Button } from '@/components/ui/Button'

export default function ChatPage() {
  const params = useParams<{ conversationId: string }>()
  const conversationId = params.conversationId
  const { session } = useSupabase()
  const userId = session?.user.id

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const { messages, loading, sendMessage } = useMessages(conversationId)
  const [input, setInput] = useState('')
  const [loadingConversation, setLoadingConversation] = useState(true)

  useEffect(() => {
    async function load() {
      if (!conversationId) return
      try {
        const data = await chatApi.getConversationById(conversationId)
        setConversation(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingConversation(false)
      }
    }
    load()
  }, [conversationId])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !userId) return
    await sendMessage(userId, text)
    setInput('')
    const container = document.getElementById('messages-area')
    if (container) container.scrollTop = container.scrollHeight
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-4">
        <div className="mx-auto max-w-xl border rounded-lg shadow-sm bg-white flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
          {loadingConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : conversation ? (
            <ChatHeader conversation={conversation} />
          ) : (
            <div className="p-4">Conversation not found</div>
          )}

          <div id="messages-area" className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner />
              </div>
            ) : (
              messages.map(m => (
                <ChatBubble key={m.id} message={m} currentUserId={userId!} />
              ))
            )}
          </div>

          <div className="border-t p-3 flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2"
            />
            <Button size="sm" onClick={handleSend}
              className="send-btn rounded-full">
              Send
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
