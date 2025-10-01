"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SurfSpot } from "@/lib/types"

export function useRealtimeSpots(initialSpots: SurfSpot[]) {
  const [spots, setSpots] = useState<SurfSpot[]>(initialSpots)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to surf spot changes
    const channel = supabase
      .channel("surf_spots")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "surf_spots",
        },
        (payload) => {
          console.log("[v0] New spot added:", payload)
          setSpots((current) => [...current, payload.new as SurfSpot].sort((a, b) => a.name.localeCompare(b.name)))
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "surf_spots",
        },
        (payload) => {
          console.log("[v0] Spot updated:", payload)
          setSpots((current) => current.map((s) => (s.id === payload.new.id ? (payload.new as SurfSpot) : s)))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return spots
}
