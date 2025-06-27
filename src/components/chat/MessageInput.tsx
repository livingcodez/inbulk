import { Send, Smile, Paperclip } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface Props {
  onSend: (text: string) => void
}

export function MessageInput({ onSend }: Props) {
  const [text, setText] = useState('')

  const handleSend = () => {
    const value = text.trim()
    if (!value) return
    onSend(value)
    setText('')
  }

  return (
    <div className="flex items-center gap-2 border-t bg-gray-50 p-3">
      <button disabled className="text-gray-500">
        <Smile size={20} />
      </button>
      <button disabled className="text-gray-500">
        <Paperclip size={20} />
      </button>
      <input
        className="flex-1 rounded-full border px-3 py-2 text-sm"
        placeholder="Type a message..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSend()
          }
        }}
      />
      <Button size="sm" onClick={handleSend} className="rounded-full px-2">
        <Send size={18} />
      </Button>
    </div>
  )
}
