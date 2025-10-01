"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, MapPin } from "lucide-react"
import { useRealtimeAlerts } from "@/hooks/use-realtime-alerts"
import { RealtimeNotification } from "@/components/realtime-notification"

interface AlertWithSpot {
  id: string
  user_id: string
  spot_id: string
  min_wave_height: number | null
  max_wave_height: number | null
  min_surfability_score: number | null
  enabled: boolean
  created_at: string
  updated_at: string
  surf_spots: {
    name: string
    region: string | null
    country: string
  }
}

interface RealtimeAlertListProps {
  userId: string
  initialAlerts: AlertWithSpot[]
}

export function RealtimeAlertList({ userId, initialAlerts }: RealtimeAlertListProps) {
  const { alerts, notifications } = useRealtimeAlerts(userId, initialAlerts)

  return (
    <>
      <RealtimeNotification notifications={notifications} />

      {alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{alert.surf_spots.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {alert.surf_spots.region ? `${alert.surf_spots.region}, ` : ""}
                      {alert.surf_spots.country}
                    </CardDescription>
                  </div>
                  <Badge variant={alert.enabled ? "default" : "secondary"}>{alert.enabled ? "Active" : "Paused"}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {alert.min_wave_height && (
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-cyan-600" />
                      <span>Min wave height: {alert.min_wave_height}m</span>
                    </div>
                  )}
                  {alert.max_wave_height && (
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-cyan-600" />
                      <span>Max wave height: {alert.max_wave_height}m</span>
                    </div>
                  )}
                  {alert.min_surfability_score && (
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-cyan-600" />
                      <span>Min score: {alert.min_surfability_score}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven&apos;t set up any alerts yet.</p>
          <Button>Create Alert</Button>
        </div>
      )}
    </>
  )
}
