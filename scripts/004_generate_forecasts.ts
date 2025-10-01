/**
 * Generate forecast data for all surf spots
 * This simulates data ingestion from external APIs
 */

import { neon } from "@neondatabase/serverless"
import { generateForecastData, calculateSurfabilityScore, generateAIRecommendation } from "../lib/forecast-generator"

const sql = neon(process.env.DATABASE_URL!)

async function generateForecasts() {
  console.log("[v0] Starting forecast generation...")

  // Get all surf spots
  const spots = await sql`SELECT id, name FROM surf_spots`
  console.log(`[v0] Found ${spots.length} surf spots`)

  let totalForecasts = 0

  for (const spot of spots) {
    console.log(`[v0] Generating forecasts for ${spot.name}...`)

    // Generate forecast data for next 5 days
    const forecastData = generateForecastData()

    // Insert forecasts into database
    for (const data of forecastData) {
      const score = calculateSurfabilityScore(data)
      const recommendation = generateAIRecommendation(data, score)

      await sql`
        INSERT INTO forecasts (
          spot_id,
          timestamp,
          wave_height_min,
          wave_height_max,
          wave_period,
          wave_direction,
          wind_speed,
          wind_direction,
          wind_gust,
          tide_height,
          tide_type,
          water_temperature,
          surfability_score,
          ai_recommendation
        ) VALUES (
          ${spot.id},
          ${data.timestamp.toISOString()},
          ${data.wave_height_min},
          ${data.wave_height_max},
          ${data.wave_period},
          ${data.wave_direction},
          ${data.wind_speed},
          ${data.wind_direction},
          ${data.wind_gust},
          ${data.tide_height},
          ${data.tide_type},
          ${data.water_temperature},
          ${score},
          ${recommendation}
        )
        ON CONFLICT DO NOTHING
      `

      totalForecasts++
    }
  }

  console.log(`[v0] Successfully generated ${totalForecasts} forecasts for ${spots.length} spots`)
  console.log("[v0] Forecast generation complete!")
}

generateForecasts().catch((error) => {
  console.error("[v0] Error generating forecasts:", error)
  process.exit(1)
})
