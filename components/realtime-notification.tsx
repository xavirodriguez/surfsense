"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell } from "lucide-react"

interface RealtimeNotificationProps {
  notifications: string[]
}

export function RealtimeNotification({ notifications }: RealtimeNotificationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (notifications.length > 0) {
      setVisible(true)
    }
  }, [notifications])

  if (!visible || notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md space-y-2">
      {notifications.map((notification, index) => (
        <Alert key={index} className="bg-cyan-50 border-cyan-200 shadow-lg">
          <Bell className="h-4 w-4 text-cyan-600" />
          <AlertDescription className="text-cyan-900">{notification}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
