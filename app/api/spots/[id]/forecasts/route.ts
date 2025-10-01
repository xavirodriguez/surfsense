import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const hours = Number.parseInt(searchParams.get("hours") || "72") // Default 3 days
    const now = new Date()
    const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from("forecasts")
      .select("*")
      .eq("spot_id", id)
      .gte("timestamp", now.toISOString())
      .lte("timestamp", futureDate.toISOString())
      .order("timestamp")

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error fetching forecasts:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch forecasts" },
      { status: 500 },
    )
  }
}
