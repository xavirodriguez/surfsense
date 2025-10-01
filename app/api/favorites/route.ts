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
      .from("favorites")
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
    console.error("[v0] Error fetching favorites:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch favorites" },
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

    const { spot_id } = await request.json()

    if (!spot_id) {
      return NextResponse.json({ success: false, error: "spot_id is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        spot_id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error adding favorite:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to add favorite" },
      { status: 500 },
    )
  }
}
