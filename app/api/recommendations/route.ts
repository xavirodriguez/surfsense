import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getTopRecommendations } from "@/lib/ai-recommendations"
import type { SurfSpot, Forecast, Profile } from "@/lib/types"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 })
    }

    // Get all spots
    const { data: spots } = await supabase.from("surf_spots").select("*")

    if (!spots) {
      return NextResponse.json({ success: false, error: "No spots found" }, { status: 404 })
    }

    // Get current forecasts for all spots
    const now = new Date().toISOString()
    const { data: forecasts } = await supabase.from("forecasts").select("*").gte("timestamp", now).order("timestamp")

    // Create forecast map (spot_id -> latest forecast)
    const forecastMap = new Map<string, Forecast>()
    forecasts?.forEach((f: Forecast) => {
      if (!forecastMap.has(f.spot_id)) {
        forecastMap.set(f.spot_id, f)
      }
    })

    // Get personalized recommendations
    const recommendations = getTopRecommendations(spots as SurfSpot[], forecastMap, profile as Profile, 10)

    return NextResponse.json({
      success: true,
      data: recommendations,
    })
  } catch (error) {
    console.error("[v0] Error generating recommendations:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate recommendations" },
      { status: 500 },
    )
  }
}
