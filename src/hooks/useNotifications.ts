import { useEffect, useState } from 'react'
import * as notificationApi from '@/lib/supabase/notifications'
import type { Notification } from '@/lib/supabase/notifications'

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadNotifications() {
      if (!userId) return
      
      try {
        const data = await notificationApi.getNotifications(userId)
        setNotifications(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load notifications'))
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()

    // Subscribe to real-time notifications
    if (userId) {
      const subscription = notificationApi.subscribeToNotifications(userId, (notification) => {
        setNotifications(prev => [notification, ...prev])
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark notification as read'))
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return

    try {
      await notificationApi.markAllNotificationsAsRead(userId)
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark all notifications as read'))
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationApi.deleteNotification(notificationId)
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      )
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete notification'))
    }
  }

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
