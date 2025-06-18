'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

export function NotificationList() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications(undefined)

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  if (!notifications.length) {
    return (
      <div className="p-8 text-center">
        <Bell className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No notifications</h3>
        <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button
          onClick={() => markAllAsRead()}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Mark all as read
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 transition-colors ${
              notification.read ? 'bg-white' : 'bg-blue-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                <div className="mt-2 flex items-center gap-4">
                  <time className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </time>
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-xs text-blue-600 hover:text-blue-500"
                    >
                      View details
                    </Link>
                  )}
                </div>
              </div>
              <div className="ml-4 flex items-center gap-2">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-500"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-xs text-red-600 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
