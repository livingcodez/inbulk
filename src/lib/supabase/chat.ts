import supabaseClient from './supabaseClient'

export interface Conversation {
  id: string
  name: string
  type: 'personal' | 'business' | 'group'
  avatar_url: string | null
  last_message: string | null
  updated_at: string
  unread_count: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_avatar_url: string | null
  content: string
  created_at: string
  read: boolean
}

export async function getConversations(userId: string) {
  const { data, error } = await supabaseClient
    .from('conversations')
    .select(`id, name, type, avatar_url, last_message, updated_at, unread_count`)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data as any) as Conversation[]
}

export async function getConversationById(id: string) {
  const { data, error } = await supabaseClient
    .from('conversations')
    .select(`id, name, type, avatar_url, last_message, updated_at, unread_count`)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Conversation
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabaseClient
    .from('messages')
    .select(
      `id, conversation_id, sender_id, sender_name, sender_avatar_url, content, created_at, read`
    )
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as any) as Message[]
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const { data, error } = await supabaseClient
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select(
      `id, conversation_id, sender_id, sender_name, sender_avatar_url, content, created_at, read`
    )
    .single()

  if (error) throw error
  return data as Message
}
