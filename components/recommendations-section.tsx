"use client"

import { useEffect, useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SpotCard } from "@/components/spot-card"
import { Sparkles } from "lucide-react"
import type { SurfSpot, Forecast } from "@/lib/types"

interface Recommendation {
  spot: SurfSpot
  score: number
  forecast: Forecast | null
}

export function RecommendationsSection() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/recommendations")
        const result = await response.json()

        if (result.success) {
          setRecommendations(result.data)
        }
      } catch (error) {
        console.error("[v0] Error fetching recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-600" />
            AI Recommendations
          </CardTitle>
          <CardDescription>Loading personalized suggestions...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-cyan-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-cyan-600" />
          Recommended for You
        </h2>
        <p className="text-cyan-700">AI-powered suggestions based on your skill level and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.slice(0, 6).map((rec) => (
          <SpotCard key={rec.spot.id} spot={rec.spot} currentScore={rec.score} />
        ))}
      </div>
    </div>
  )
}
