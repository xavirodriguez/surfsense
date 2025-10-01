import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { SurfSpot } from "@/lib/types"

interface SpotCardProps {
  spot: SurfSpot
  currentScore?: number
}

export function SpotCard({ spot, currentScore }: SpotCardProps) {
  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-blue-100 text-blue-800"
      case "advanced":
        return "bg-orange-100 text-orange-800"
      case "expert":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-blue-600"
    if (score >= 4) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{spot.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {spot.region ? `${spot.region}, ` : ""}
              {spot.country}
            </CardDescription>
          </div>
          {currentScore !== undefined && (
            <div className="flex flex-col items-end">
              <div className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>{currentScore.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {spot.difficulty && (
              <Badge variant="secondary" className={getDifficultyColor(spot.difficulty)}>
                {spot.difficulty}
              </Badge>
            )}
            {spot.break_type && (
              <Badge variant="outline" className="capitalize">
                {spot.break_type}
              </Badge>
            )}
          </div>
          <Button asChild size="sm">
            <Link href={`/spots/${spot.id}`}>
              <TrendingUp className="h-4 w-4 mr-2" />
              View Forecast
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
