'use client'

import { useParams } from 'next/navigation'
import { useSupabase } from '@/contexts/SupabaseProvider'
import { useMessages } from '@/hooks/useConversations'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { MessageInput } from '@/components/chat/MessageInput'
import { useEffect, useRef, useState } from 'react'
import * as chatApi from '@/lib/supabase/chat'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ChatDetailPage() {
  const params = useParams<{ id: string }>()
  const conversationId = params.id
  const { profile } = useSupabase()
  const { messages, loading, sendMessage } = useMessages(conversationId)
  const [conversation, setConversation] = useState<chatApi.Conversation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function load() {
      if (profile?.id && conversationId) {
        try {
          const convs = await chatApi.getConversations(profile.id)
          const conv = convs.find(c => c.id === conversationId) || null
          setConversation(conv)
        } catch (e) {
          console.error(e)
        }
      }
    }
    load()
  }, [profile?.id, conversationId])

  const handleSend = (text: string) => {
    if (!profile) return
    sendMessage(profile.id, text)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading && !conversation) {
    return <div className="flex justify-center p-10"><LoadingSpinner /></div>
  }

  if (!conversation) return null

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-2xl flex-col rounded-md border shadow-sm">
      <ChatHeader name={conversation.name} avatarUrl={conversation.avatar_url} />
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3" id="messages">
        {messages.map(m => (
          <ChatBubble
            key={m.id}
            message={m}
            isOwn={m.sender_id === profile?.id}
            showSender={conversation.type === 'group'}
            senderName={m.sender_id === profile?.id ? 'You' : ''}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  )
}
