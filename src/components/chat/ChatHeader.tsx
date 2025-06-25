'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import type { Conversation } from '@/lib/supabase/chat'
import { Button } from '@/components/ui/Button'

interface ChatHeaderProps {
  conversation: Conversation
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b p-3 flex-shrink-0">
      <Link href="/inbox">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <Avatar src={conversation.avatar_url ?? undefined} alt={conversation.name} size={40} />
      <div>
        <p className="font-medium leading-none">{conversation.name}</p>
        <p className="text-xs text-green-600">Online</p>
      </div>
    </div>
  )
}
