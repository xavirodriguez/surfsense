"use client"

import { SpotCard } from "@/components/spot-card"
import { useRealtimeSpots } from "@/hooks/use-realtime-spots"
import type { SurfSpot } from "@/lib/types"

interface RealtimeSpotListProps {
  initialSpots: SurfSpot[]
  scoreMap: Map<string, number>
}

export function RealtimeSpotList({ initialSpots, scoreMap }: RealtimeSpotListProps) {
  const spots = useRealtimeSpots(initialSpots)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {spots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} currentScore={scoreMap.get(spot.id)} />
      ))}
    </div>
  )
}
