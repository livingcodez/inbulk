import supabaseClient from './supabaseClient'

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  link?: string
  read: boolean
  created_at: string
}

export async function getNotifications(userId: string) {
  const { data, error } = await supabaseClient
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Notification[]
}

export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabaseClient
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) throw error
  return data as Notification
}

export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabaseClient
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) throw error
  return true
}

export async function deleteNotification(notificationId: string) {
  const { error } = await supabaseClient
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) throw error
  return true
}

export function subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
  return supabaseClient
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification)
      }
    )
    .subscribe()
}
