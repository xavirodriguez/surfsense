// app/api/weather/[spotId]/route.ts
import { NextResponse } from 'next/server';
import { WeatherAggregator } from '@/lib/weather-api/aggregator';
import { StormglassProvider } from '@/lib/weather-api/providers/stormglass';
import { mergeForecasts } from '@/lib/weather-api/merger';
import { createClient } from '@/lib/supabase/server';

const aggregator = new WeatherAggregator([
  new StormglassProvider(process.env.STORMGLASS_KEY!),
  // Añade más providers aquí
]);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ spotId: string }> }
) {
  const { spotId } = await params;
  const supabase = await createClient();

  // 1. Verificar caché (< 30min)
  const { data: cached } = await supabase
    .from('forecasts')
    .select('*')
    .eq('spot_id', spotId)
    .gte('created_at', new Date(Date.now() - 30 * 60000).toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (cached) return NextResponse.json({ data: cached, cached: true });

  // 2. Obtener coordenadas del spot
  const { data: spot } = await supabase
    .from('surf_spots')
    .select('latitude, longitude')
    .eq('id', spotId)
    .single();

  if (!spot) return NextResponse.json({ error: 'Spot not found' }, { status: 404 });

  // 3. Fetch paralelo de todos los providers
  const results: Array<{ provider: string; forecast: any }> = [];
  
  await new Promise<void>((resolve) => {
    aggregator.fetchAll$(spot.latitude, spot.longitude).subscribe({
      next: (result) => results.push(result),
      complete: () => resolve()
    });
  });

  // 4. Fusionar datos
  const merged = mergeForecasts(results);

  // 5. Guardar en DB
  const { data: saved } = await supabase
    .from('forecasts')
    .insert({
      spot_id: spotId,
      timestamp: merged.timestamp.toISOString(),
      wave_height_min: merged.waveHeightMin,
      wave_height_max: merged.waveHeightMax,
      // ... resto
    })
    .select()
    .single();

  return NextResponse.json({ data: saved, cached: false });
}