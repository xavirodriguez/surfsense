import { createClient } from "@/lib/supabase/server"
// import { streamText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { messages } = await request.json()

    // Get user profile for context
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Get recent forecasts for context
    const now = new Date().toISOString()
    const { data: spots } = await supabase.from("surf_spots").select("id, name, country, region, difficulty").limit(20)

    const { data: forecasts } = await supabase
      .from("forecasts")
      .select("spot_id, wave_height_min, wave_height_max, wind_speed, surfability_score, ai_recommendation")
      .gte("timestamp", now)
      .order("timestamp")
      .limit(50)

    // Build context for AI
    const contextMessage = `You are SurfSense AI, an expert surf forecasting assistant. 

User Profile:
- Skill Level: ${profile?.skill_level || "intermediate"}
- Preferred Wave Height: ${profile?.preferred_wave_height_min || "any"} - ${profile?.preferred_wave_height_max || "any"}m

Available Surf Spots (sample):
${spots?.map((s: any) => `- ${s.name} (${s.country}): ${s.difficulty || "unknown"} difficulty`).join("\n")}

Recent Forecast Data:
${forecasts
  ?.slice(0, 10)
  .map(
    (f: any) =>
      `- Spot: ${spots?.find((s: any) => s.id === f.spot_id)?.name || "Unknown"}, Waves: ${f.wave_height_min}-${f.wave_height_max}m, Wind: ${f.wind_speed}kts, Score: ${f.surfability_score}/10`,
  )
  .join("\n")}

Help the user find the best surf conditions, answer questions about spots, and provide personalized recommendations based on their skill level and preferences. Be concise, friendly, and surf-focused.`

    const result = streamText({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: contextMessage,
        },
        ...messages,
      ],
      temperature: 0.7,
      maxTokens: 500,
    })
return "";
    // return result.toDataStreamResponse()
  } catch (error) {
    console.error("[v0] Chat error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 },
    )
  }
}
