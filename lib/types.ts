export interface SurfSpot {
  id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  country: string
  region: string | null
  difficulty: "beginner" | "intermediate" | "advanced" | "expert" | null
  break_type: "beach" | "reef" | "point" | "river" | null
  ideal_swell_direction: string | null
  ideal_wind_direction: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Forecast {
  id: string
  spot_id: string
  timestamp: string
  wave_height_min: number | null
  wave_height_max: number | null
  wave_period: number | null
  wave_direction: number | null
  wind_speed: number | null
  wind_direction: number | null
  wind_gust: number | null
  tide_height: number | null
  tide_type: "high" | "low" | "rising" | "falling" | null
  water_temperature: number | null
  surfability_score: number | null
  ai_recommendation: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  skill_level: "beginner" | "intermediate" | "advanced" | "expert" | null
  preferred_wave_height_min: number | null
  preferred_wave_height_max: number | null
  created_at: string
  updated_at: string
}

export interface Favorite {
  id: string
  user_id: string
  spot_id: string
  created_at: string
}

export interface Alert {
  id: string
  user_id: string
  spot_id: string
  min_wave_height: number | null
  max_wave_height: number | null
  min_surfability_score: number | null
  enabled: boolean
  created_at: string
  updated_at: string
}
