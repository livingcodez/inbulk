import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { formatDistanceToNow } from 'date-fns'
import type { ConversationPreview as Conversation } from '@/lib/supabase/conversations'
import { cn } from '@/lib/utils'

interface Props {
  conversation: Conversation
}

export function ConversationPreview({ conversation }: Props) {
  return (
    <Link
      href={`/inbox/${conversation.id}`}
      className={cn(
        'flex items-center gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors',
        conversation.unread_count > 0 && 'bg-blue-50 border-l-4 border-primary'
      )}
    >
      <Avatar
        src={conversation.avatar_url ?? undefined}
        alt={conversation.name}
        size={48}
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-medium truncate">{conversation.name}</p>
          {conversation.last_message_at && (
            <time className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
            </time>
          )}
        </div>
        <div className="flex justify-between items-start mt-1">
          <p className="text-sm text-muted-foreground truncate">
            {conversation.last_message}
          </p>
          {conversation.unread_count > 0 && (
            <span className="ml-2 flex items-center justify-center h-5 w-5 rounded-full bg-orange-500 text-white text-xs">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
