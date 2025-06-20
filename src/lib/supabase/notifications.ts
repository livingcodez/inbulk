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

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!userId) {
    // console.warn('getUnreadNotificationCount called without userId');
    return 0;
  }

  try {
    const { count, error } = await supabaseClient
      .from('notifications')
      .select('*', { count: 'exact', head: true }) // Important: head:true makes it not return data, just count
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error fetching unread notification count:', error.message);
      // Depending on desired behavior, could throw error or return 0
      // For a badge, returning 0 on error might be preferable to breaking UI
      return 0;
    }

    return count ?? 0; // count can be null if query fails in a specific way, default to 0
  } catch (error: any) {
    console.error('Unexpected error in getUnreadNotificationCount:', error.message);
    return 0; // Fallback in case of unexpected errors
  }
}
