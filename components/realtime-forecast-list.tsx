"use client"

import { ForecastCard } from "@/components/forecast-card"
import { ForecastChart } from "@/components/forecast-chart"
import { useRealtimeForecasts } from "@/hooks/use-realtime-forecasts"
import type { Forecast } from "@/lib/types"

interface RealtimeForecastListProps {
  spotId: string
  initialForecasts: Forecast[]
}

export function RealtimeForecastList({ spotId, initialForecasts }: RealtimeForecastListProps) {
  const forecasts = useRealtimeForecasts(spotId, initialForecasts)

  if (forecasts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No forecast data available yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <ForecastChart forecasts={forecasts} />
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-cyan-900">Detailed Forecast</h2>
        <p className="text-cyan-700">3-hour intervals for the next 72 hours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forecasts.map((forecast) => (
          <ForecastCard key={forecast.id} forecast={forecast} />
        ))}
      </div>
    </>
  )
}
