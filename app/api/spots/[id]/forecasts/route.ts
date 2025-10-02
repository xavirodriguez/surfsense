// app/api/weather/[spotId]/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: spotId } = await params // Renombrado a spotId para mayor claridad
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const hours = Number.parseInt(searchParams.get("hours") || "72") // Default 3 days
    const now = new Date()
    const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000)

    console.log(`[GET /api/weather/${spotId}] - Solicitud recibida.`)
    console.log(`[GET /api/weather/${spotId}] - Parámetros de consulta:`)
    console.log(`  - spot_id: ${spotId}`)
    console.log(`  - hours: ${hours}`)
    console.log(`  - now (ISO): ${now.toISOString()}`)
    console.log(`  - futureDate (ISO): ${futureDate.toISOString()}`)

    const { data, error } = await supabase
      .from("forecasts")
      .select("*")
      .eq("spot_id", spotId)
      .gte("timestamp", now.toISOString())
      .lte("timestamp", futureDate.toISOString())
      .order("timestamp")

    if (error) {
      console.error(`[GET /api/weather/${spotId}] - Error al consultar Supabase:`, error)
      // Si el error es de RLS, lo verás aquí.
      // Por ejemplo: error.message.includes('row-level security')
      if (error.message.includes('row-level security')) {
        return NextResponse.json(
          { success: false, error: "Row-level security policy denied access for SELECT operation." },
          { status: 403 }, // Forbidden
        )
      }
      throw error // Relanza el error para que el catch lo maneje
    }

    if (!data || data.length === 0) {
      console.log(`[GET /api/weather/${spotId}] - No se encontraron pronósticos para los criterios dados.`)
      return NextResponse.json({ success: true, data: [] }) // Devolver un array vacío si no hay datos
    }

    console.log(`[GET /api/weather/${spotId}] - Pronósticos encontrados:`, data.length)
    // console.log(`[GET /api/weather/${spotId}] - Primer pronóstico:`, data[0]) // Opcional: para ver la estructura

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[GET /api/weather/] Error fetching forecasts:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch forecasts" },
      { status: 500 },
    )
  }
}