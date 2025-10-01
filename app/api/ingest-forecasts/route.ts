/**
 * API endpoint to trigger forecast ingestion
 * In production, this would be called by a cron job
 */

import { ingestForecastsForAllSpots } from "@/lib/data-ingestion"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const result = await ingestForecastsForAllSpots()

    return NextResponse.json({
      success: true,
      message: `Generated forecasts for ${result.spotsProcessed} spots`,
      data: result,
    })
  } catch (error) {
    console.error("[v0] Forecast ingestion error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to ingest forecasts",
      },
      { status: 500 },
    )
  }
}
