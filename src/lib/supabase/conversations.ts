import supabaseClient from './supabaseClient'

export interface ConversationPreview {
  id: string
  name: string
  type: 'personal' | 'business' | 'group'
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  avatar_url: string | null
}

export async function getConversations(userId: string) {
  const { data, error } = await supabaseClient
    .from('conversations')
    .select(
      'id, name, type, last_message, last_message_at, unread_count, avatar_url'
    )
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })

  if (error) throw error
  return data as ConversationPreview[]
}
