import Link from 'next/link'
import { ArrowLeft, Phone, Video } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'

interface Props {
  name: string
  avatarUrl: string | null
}

export function ChatHeader({ name, avatarUrl }: Props) {
  return (
    <div className="flex items-center gap-2 border-b p-3">
      <Link href="/inbox" className="text-gray-600 hover:text-gray-800">
        <ArrowLeft />
      </Link>
      <Avatar src={avatarUrl ?? undefined} alt={name} size={40} />
      <div className="ml-2 flex flex-col">
        <span className="font-medium">{name}</span>
        <span className="text-xs text-green-600">Online</span>
      </div>
      <div className="ml-auto flex gap-2 text-gray-500">
        <button disabled>
          <Video size={20} />
        </button>
        <button disabled>
          <Phone size={20} />
        </button>
      </div>
    </div>
  )
}
