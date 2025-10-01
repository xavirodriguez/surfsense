import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const now = new Date()

    // Get the closest forecast to current time
    const { data, error } = await supabase
      .from("forecasts")
      .select("*")
      .eq("spot_id", id)
      .gte("timestamp", now.toISOString())
      .order("timestamp")
      .limit(1)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error fetching current conditions:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch current conditions" },
      { status: 500 },
    )
  }
}
