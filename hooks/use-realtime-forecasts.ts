"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Forecast } from "@/lib/types"

export function useRealtimeForecasts(spotId: string, initialForecasts: Forecast[]) {
  const [forecasts, setForecasts] = useState<Forecast[]>(initialForecasts)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to forecast changes for this spot
    const channel = supabase
      .channel(`forecasts:${spotId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forecasts",
          filter: `spot_id=eq.${spotId}`,
        },
        (payload) => {
          console.log("[v0] New forecast received:", payload)
          setForecasts((current) => {
            const newForecast = payload.new as Forecast
            // Add new forecast and sort by timestamp
            return [...current, newForecast].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
            )
          })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "forecasts",
          filter: `spot_id=eq.${spotId}`,
        },
        (payload) => {
          console.log("[v0] Forecast updated:", payload)
          setForecasts((current) => current.map((f) => (f.id === payload.new.id ? (payload.new as Forecast) : f)))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [spotId, supabase])

  return forecasts
}
