/**
 * Data ingestion utilities for fetching and processing surf data
 * In production, this would integrate with real APIs
 */

import { createClient } from "@/lib/supabase/server"
import { generateForecastData, calculateSurfabilityScore, generateAIRecommendation } from "./forecast-generator"

export async function ingestForecastsForSpot(spotId: string): Promise<number> {
  const supabase = await createClient()

  // Generate forecast data
  const forecastData = generateForecastData()

  let insertedCount = 0

  for (const data of forecastData) {
    const score = calculateSurfabilityScore(data)
    const recommendation = generateAIRecommendation(data, score)

    const { error } = await supabase.from("forecasts").insert({
      spot_id: spotId,
      timestamp: data.timestamp.toISOString(),
      wave_height_min: data.wave_height_min,
      wave_height_max: data.wave_height_max,
      wave_period: data.wave_period,
      wave_direction: data.wave_direction,
      wind_speed: data.wind_speed,
      wind_direction: data.wind_direction,
      wind_gust: data.wind_gust,
      tide_height: data.tide_height,
      tide_type: data.tide_type,
      water_temperature: data.water_temperature,
      surfability_score: score,
      ai_recommendation: recommendation,
    })

    if (!error) {
      insertedCount++
    }
  }

  return insertedCount
}

export async function ingestForecastsForAllSpots(): Promise<{ spotsProcessed: number; forecastsCreated: number }> {
  const supabase = await createClient()

  // Get all spots
  const { data: spots, error } = await supabase.from("surf_spots").select("id, name")

  if (error || !spots) {
    throw new Error("Failed to fetch surf spots")
  }

  let totalForecasts = 0

  for (const spot of spots) {
    const count = await ingestForecastsForSpot(spot.id)
    totalForecasts += count
  }

  return {
    spotsProcessed: spots.length,
    forecastsCreated: totalForecasts,
  }
}
