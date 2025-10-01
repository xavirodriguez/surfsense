"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Alert } from "@/lib/types"

interface AlertWithSpot extends Alert {
  surf_spots: {
    name: string
    region: string | null
    country: string
  }
}

export function useRealtimeAlerts(userId: string, initialAlerts: AlertWithSpot[]) {
  const [alerts, setAlerts] = useState<AlertWithSpot[]>(initialAlerts)
  const [notifications, setNotifications] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to alert changes for this user
    const channel = supabase
      .channel(`alerts:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("[v0] New alert created:", payload)
          // Fetch the full alert with spot details
          const { data } = await supabase
            .from("alerts")
            .select(
              `
            *,
            surf_spots (name, region, country)
          `,
            )
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setAlerts((current) => [data as AlertWithSpot, ...current])
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "alerts",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[v0] Alert updated:", payload)
          setAlerts((current) =>
            current.map((a) => (a.id === payload.new.id ? { ...a, ...(payload.new as Alert) } : a)),
          )
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "alerts",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[v0] Alert deleted:", payload)
          setAlerts((current) => current.filter((a) => a.id !== payload.old.id))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  // Monitor forecasts to trigger alert notifications
  useEffect(() => {
    if (alerts.length === 0) return

    const channel = supabase
      .channel("forecast_alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forecasts",
        },
        (payload) => {
          const forecast = payload.new as any

          // Check if this forecast matches any user alerts
          alerts.forEach((alert) => {
            if (!alert.enabled || alert.spot_id !== forecast.spot_id) return

            let matches = true

            if (alert.min_wave_height && forecast.wave_height_max < alert.min_wave_height) {
              matches = false
            }

            if (alert.max_wave_height && forecast.wave_height_min > alert.max_wave_height) {
              matches = false
            }

            if (alert.min_surfability_score && forecast.surfability_score < alert.min_surfability_score) {
              matches = false
            }

            if (matches) {
              const message = `Perfect conditions at ${alert.surf_spots.name}! Score: ${forecast.surfability_score}`
              console.log("[v0] Alert triggered:", message)
              setNotifications((current) => [...current, message])

              // Auto-dismiss notification after 5 seconds
              setTimeout(() => {
                setNotifications((current) => current.filter((n) => n !== message))
              }, 5000)
            }
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [alerts, supabase])

  return { alerts, notifications }
}
