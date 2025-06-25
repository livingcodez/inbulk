'use client'

import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import type { Conversation } from '@/lib/supabase/chat'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface ConversationPreviewProps {
  conversation: Conversation
}

export function ConversationPreview({ conversation }: ConversationPreviewProps) {
  return (
    <Link
      href={`/inbox/${conversation.id}`}
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg border transition-colors',
        conversation.unread_count > 0
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white hover:bg-gray-50'
      )}
    >
      <Avatar src={conversation.avatar_url ?? undefined} alt={conversation.name} size={48} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium truncate">{conversation.name}</p>
          <time className="ml-2 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
          </time>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground truncate">
            {conversation.last_message || ''}
          </p>
          {conversation.unread_count > 0 && (
            <span className="ml-2 text-xs rounded-full bg-amber-500 text-white w-5 h-5 flex items-center justify-center">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
