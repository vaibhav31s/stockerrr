import { Suspense } from 'react'
import { DashboardClient } from './dashboard-client'
import { Card, CardContent } from '@/components/ui/card'

function DashboardLoading() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClient />
    </Suspense>
  )
}
