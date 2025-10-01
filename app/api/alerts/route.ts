import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("alerts")
      .select(
        `
        *,
        surf_spots (*)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error fetching alerts:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch alerts" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { spot_id, min_wave_height, max_wave_height, min_surfability_score } = body

    if (!spot_id) {
      return NextResponse.json({ success: false, error: "spot_id is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("alerts")
      .insert({
        user_id: user.id,
        spot_id,
        min_wave_height: min_wave_height || null,
        max_wave_height: max_wave_height || null,
        min_surfability_score: min_surfability_score || null,
        enabled: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error creating alert:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create alert" },
      { status: 500 },
    )
  }
}
