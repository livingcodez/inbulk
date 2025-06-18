'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Calendar as CalendarIcon } from 'lucide-react'

export default function SchedulePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Upcoming Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Calendar and scheduling features are coming soon. You'll be able to manage group buy schedules here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
