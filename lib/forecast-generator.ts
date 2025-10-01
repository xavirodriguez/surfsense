/**
 * Simulates realistic surf forecast data
 * In production, this would fetch from real APIs like Surfline, Stormglass, etc.
 */

interface ForecastData {
  timestamp: Date
  wave_height_min: number
  wave_height_max: number
  wave_period: number
  wave_direction: number
  wind_speed: number
  wind_direction: number
  wind_gust: number
  tide_height: number
  tide_type: "high" | "low" | "rising" | "falling"
  water_temperature: number
}

// Helper to generate realistic wave data based on time of day and randomness
function generateWaveData(baseDate: Date, hourOffset: number): ForecastData {
  const timestamp = new Date(baseDate)
  timestamp.setHours(timestamp.getHours() + hourOffset)

  // Simulate tidal patterns (roughly 12-hour cycles)
  const tidePhase = (hourOffset % 12) / 12
  const tideHeight = Math.sin(tidePhase * Math.PI * 2) * 1.5 + 1.5 // 0 to 3 meters

  // Determine tide type based on phase
  let tide_type: "high" | "low" | "rising" | "falling"
  if (tidePhase < 0.25) {
    tide_type = "rising"
  } else if (tidePhase < 0.5) {
    tide_type = "high"
  } else if (tidePhase < 0.75) {
    tide_type = "falling"
  } else {
    tide_type = "low"
  }

  // Add some randomness to wave heights (0.5 to 4 meters)
  const baseWaveHeight = 1.5 + Math.random() * 2 + Math.sin((hourOffset / 24) * Math.PI) * 0.5
  const wave_height_min = Math.max(0.5, baseWaveHeight - 0.3)
  const wave_height_max = baseWaveHeight + 0.5

  // Wave period typically 8-16 seconds
  const wave_period = 10 + Math.random() * 6

  // Wave direction (0-360 degrees)
  const wave_direction = Math.floor(Math.random() * 360)

  // Wind speed (0-25 knots)
  const wind_speed = Math.random() * 25
  const wind_gust = wind_speed + Math.random() * 5

  // Wind direction
  const wind_direction = Math.floor(Math.random() * 360)

  // Water temperature (varies by location, 15-25°C)
  const water_temperature = 18 + Math.random() * 7

  return {
    timestamp,
    wave_height_min: Math.round(wave_height_min * 10) / 10,
    wave_height_max: Math.round(wave_height_max * 10) / 10,
    wave_period: Math.round(wave_period * 10) / 10,
    wave_direction,
    wind_speed: Math.round(wind_speed * 10) / 10,
    wind_direction,
    wind_gust: Math.round(wind_gust * 10) / 10,
    tide_height: Math.round(tideHeight * 100) / 100,
    tide_type,
    water_temperature: Math.round(water_temperature * 10) / 10,
  }
}

/**
 * Calculate surfability score (0-10) based on conditions
 */
export function calculateSurfabilityScore(forecast: ForecastData): number {
  let score = 5 // Start at middle

  // Wave height scoring (ideal 1-2.5m)
  const avgWaveHeight = (forecast.wave_height_min + forecast.wave_height_max) / 2
  if (avgWaveHeight >= 1 && avgWaveHeight <= 2.5) {
    score += 2
  } else if (avgWaveHeight < 0.5 || avgWaveHeight > 4) {
    score -= 2
  }

  // Wave period scoring (longer is better, 12+ is ideal)
  if (forecast.wave_period >= 12) {
    score += 2
  } else if (forecast.wave_period < 8) {
    score -= 1
  }

  // Wind speed scoring (light wind is better)
  if (forecast.wind_speed < 5) {
    score += 1
  } else if (forecast.wind_speed > 15) {
    score -= 2
  }

  // Tide scoring (mid tide is often best)
  if (forecast.tide_height >= 1 && forecast.tide_height <= 2) {
    score += 1
  }

  // Clamp between 0 and 10
  return Math.max(0, Math.min(10, Math.round(score * 10) / 10))
}

/**
 * Generate AI recommendation based on conditions
 */
export function generateAIRecommendation(forecast: ForecastData, score: number): string {
  const avgWaveHeight = (forecast.wave_height_min + forecast.wave_height_max) / 2

  if (score >= 8) {
    return `Excellent conditions! ${avgWaveHeight.toFixed(1)}m waves with ${forecast.wave_period.toFixed(1)}s period. Light winds make this a perfect session.`
  } else if (score >= 6) {
    return `Good surfing conditions. ${avgWaveHeight.toFixed(1)}m waves, though wind at ${forecast.wind_speed.toFixed(1)} knots may affect quality.`
  } else if (score >= 4) {
    return `Moderate conditions. Waves are ${avgWaveHeight.toFixed(1)}m but conditions could be better. Consider waiting for improved forecast.`
  } else {
    return `Poor conditions. ${avgWaveHeight < 0.5 ? "Waves too small" : "Conditions too rough"}. Check back later for better surf.`
  }
}

/**
 * Generate forecast data for the next 5 days (3-hour intervals)
 */
export function generateForecastData(startDate: Date = new Date()): ForecastData[] {
  const forecasts: ForecastData[] = []
  const hoursToGenerate = 5 * 24 // 5 days
  const interval = 3 // 3-hour intervals

  for (let hour = 0; hour < hoursToGenerate; hour += interval) {
    forecasts.push(generateWaveData(startDate, hour))
  }

  return forecasts
}
