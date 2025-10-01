import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")
    const country = searchParams.get("country")
    const difficulty = searchParams.get("difficulty")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let query = supabase.from("surf_spots").select("*").order("name")

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,region.ilike.%${search}%`)
    }

    if (country) {
      query = query.eq("country", country)
    }

    if (difficulty) {
      query = query.eq("difficulty", difficulty)
    }

    query = query.limit(limit)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error fetching spots:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch spots" },
      { status: 500 },
    )
  }
}
