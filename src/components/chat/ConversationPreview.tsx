import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import type { Conversation } from '@/lib/supabase/chat'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Props {
  conversation: Conversation
}

export function ConversationPreview({ conversation }: Props) {
  return (
    <Link
      href={`/inbox/${conversation.id}`}
      className={cn(
        'flex gap-4 rounded-md border p-3 transition-colors hover:bg-gray-50',
        !conversation.unread_count ? '' : 'bg-blue-50 border-l-4 border-blue-400'
      )}
    >
      <Avatar src={conversation.avatar_url ?? undefined} alt={conversation.name} size={48} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between items-center">
          <span className="font-medium truncate">{conversation.name}</span>
          {conversation.last_message_at && (
            <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
              {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
            </span>
          )}
        </div>
        <div className="flex justify-between mt-1 items-start">
          <span className="text-sm text-gray-600 truncate flex-1">{conversation.last_message}</span>
          {conversation.unread_count > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
