import { Avatar } from '@/components/ui/Avatar'
import type { Message } from '@/lib/supabase/chat'
import { cn } from '@/lib/utils'

interface Props {
  message: Message
  isOwn: boolean
  showSender?: boolean
  senderName?: string
  senderAvatar?: string | null
}

export function ChatBubble({ message, isOwn, showSender, senderName, senderAvatar }: Props) {
  return (
    <div className={cn('flex max-w-[80%] items-end gap-2', isOwn ? 'ml-auto flex-row-reverse' : '')}>
      {!isOwn && (
        <Avatar src={senderAvatar ?? undefined} alt={senderName ?? ''} size={32} />
      )}
      <div className={cn('rounded-xl px-3 py-2 text-sm', isOwn ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm')}>
        {showSender && !isOwn && senderName && (
          <div className="mb-1 text-xs font-medium text-gray-500">{senderName}</div>
        )}
        <div>{message.content}</div>
      </div>
    </div>
  )
}
