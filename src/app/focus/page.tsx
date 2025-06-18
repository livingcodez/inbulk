'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function FocusPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Focus Mode</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Focus mode is coming soon. This feature will help you concentrate on specific tasks or groups.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
