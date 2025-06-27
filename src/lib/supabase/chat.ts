import supabaseClient from './supabaseClient'

export type Conversation = {
  id: string
  name: string
  avatar_url: string | null
  type: 'personal' | 'business' | 'group'
  last_message: string | null
  last_message_at: string | null
  unread_count: number
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

export async function getConversations(userId: string) {
  const { data, error } = await supabaseClient
    .from('user_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })

  if (error) throw error
  return data as Conversation[]
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabaseClient
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Message[]
}

export async function sendMessage(params: {
  conversation_id: string
  sender_id: string
  content: string
}) {
  const { data, error } = await supabaseClient
    .from('messages')
    .insert(params)
    .select()
    .single()

  if (error) throw error
  return data as Message
}

export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
) {
  return supabaseClient
    .channel('messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      payload => callback(payload.new as Message)
    )
    .subscribe()
}
