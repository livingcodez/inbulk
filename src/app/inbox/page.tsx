'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { NotificationList } from '@/components/notifications/NotificationList'

export default function InboxPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inbox</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
