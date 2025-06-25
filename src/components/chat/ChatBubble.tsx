'use client'

import { Avatar } from '@/components/ui/Avatar'
import type { Message } from '@/lib/supabase/chat'
import { cn } from '@/lib/utils'

interface ChatBubbleProps {
  message: Message
  currentUserId: string
}

export function ChatBubble({ message, currentUserId }: ChatBubbleProps) {
  const isSent = message.sender_id === currentUserId

  return (
    <div className={cn('flex items-end gap-2 max-w-[80%]', isSent ? 'ml-auto flex-row-reverse' : '')}>
      {!isSent && (
        <Avatar src={message.sender_avatar_url ?? undefined} alt={message.sender_name} size={32} />
      )}
      <div
        className={cn(
          'px-3 py-2 rounded-lg text-sm break-words',
          isSent ? 'bg-primary text-white' : 'bg-gray-100'
        )}
      >
        {message.content}
      </div>
    </div>
  )
}
