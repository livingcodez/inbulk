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
        'flex gap-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-sm transition-shadow hover:shadow-md',
        conversation.unread_count > 0 && 'bg-blue-50 border-l-4 border-blue-400 dark:bg-neutral-800'
      )}
    >
      <Avatar src={conversation.avatar_url ?? undefined} alt={conversation.name} size={48} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between">
          <span className="truncate font-medium">{conversation.name}</span>
          {conversation.last_message_at && (
            <span className="ml-2 whitespace-nowrap text-xs text-gray-500">
              {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-start justify-between">
          <span className="flex-1 truncate text-sm text-gray-600">{conversation.last_message}</span>
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
