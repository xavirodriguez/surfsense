import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wind, WavesIcon, Droplets, Thermometer } from "lucide-react"
import type { Forecast } from "@/lib/types"

interface ForecastCardProps {
  forecast: Forecast
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800 border-green-300"
    if (score >= 6) return "bg-blue-100 text-blue-800 border-blue-300"
    if (score >= 4) return "bg-orange-100 text-orange-800 border-orange-300"
    return "bg-red-100 text-red-800 border-red-300"
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground">{formatTime(forecast.timestamp)}</div>
            <div className="text-xs text-muted-foreground capitalize">{forecast.tide_type} tide</div>
          </div>
          <Badge className={getScoreColor(forecast.surfability_score || 0)}>
            Score: {forecast.surfability_score?.toFixed(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <WavesIcon className="h-4 w-4 text-cyan-600" />
            <div>
              <div className="text-xs text-muted-foreground">Wave Height</div>
              <div className="font-semibold">
                {forecast.wave_height_min?.toFixed(1)}-{forecast.wave_height_max?.toFixed(1)}m
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-xs text-muted-foreground">Wind</div>
              <div className="font-semibold">{forecast.wind_speed?.toFixed(1)} kts</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-indigo-600" />
            <div>
              <div className="text-xs text-muted-foreground">Period</div>
              <div className="font-semibold">{forecast.wave_period?.toFixed(1)}s</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-600" />
            <div>
              <div className="text-xs text-muted-foreground">Water Temp</div>
              <div className="font-semibold">{forecast.water_temperature?.toFixed(1)}°C</div>
            </div>
          </div>
        </div>

        {forecast.ai_recommendation && (
          <div className="mt-4 p-3 bg-cyan-50 rounded-lg">
            <div className="text-xs font-semibold text-cyan-900 mb-1">AI Recommendation</div>
            <div className="text-sm text-cyan-800">{forecast.ai_recommendation}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
