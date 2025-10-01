import type { SurfSpot, Forecast, Profile } from "./types"

/**
 * Calculate personalized recommendation score for a spot based on user preferences
 */
export function calculatePersonalizedScore(
  spot: SurfSpot,
  currentForecast: Forecast | null,
  userProfile: Profile,
): number {
  if (!currentForecast) return 0

  let score = currentForecast.surfability_score || 0

  // Adjust based on user skill level
  const skillLevelMap = {
    beginner: ["beginner"],
    intermediate: ["beginner", "intermediate"],
    advanced: ["intermediate", "advanced"],
    expert: ["intermediate", "advanced", "expert"],
  }

  const userSkill = userProfile.skill_level || "intermediate"
  const suitableForUser = spot.difficulty && skillLevelMap[userSkill]?.includes(spot.difficulty)

  if (!suitableForUser && spot.difficulty) {
    // Penalize spots that don't match skill level
    if (spot.difficulty === "expert" && userSkill !== "expert") {
      score -= 3
    } else if (spot.difficulty === "beginner" && userSkill === "expert") {
      score -= 1
    }
  }

  // Adjust based on wave height preferences
  if (userProfile.preferred_wave_height_min && userProfile.preferred_wave_height_max) {
    const avgWaveHeight = ((currentForecast.wave_height_min || 0) + (currentForecast.wave_height_max || 0)) / 2

    if (
      avgWaveHeight >= userProfile.preferred_wave_height_min &&
      avgWaveHeight <= userProfile.preferred_wave_height_max
    ) {
      score += 1.5
    } else if (
      avgWaveHeight < userProfile.preferred_wave_height_min - 0.5 ||
      avgWaveHeight > userProfile.preferred_wave_height_max + 0.5
    ) {
      score -= 1
    }
  }

  return Math.max(0, Math.min(10, score))
}

/**
 * Get top recommended spots for a user
 */
export function getTopRecommendations(
  spots: SurfSpot[],
  forecasts: Map<string, Forecast>,
  userProfile: Profile,
  limit = 5,
): Array<{ spot: SurfSpot; score: number; forecast: Forecast | null }> {
  const recommendations = spots
    .map((spot) => {
      const forecast = forecasts.get(spot.id) || null
      const score = calculatePersonalizedScore(spot, forecast, userProfile)
      return { spot, score, forecast }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return recommendations
}
