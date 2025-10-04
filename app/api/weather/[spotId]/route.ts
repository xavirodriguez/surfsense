import { NextResponse } from 'next/server';
import { WeatherAggregator } from '@/lib/weather-api/aggregator';
import { StormglassProvider } from '@/lib/weather-api/providers/stormglass';
import { mergeForecasts } from '@/lib/weather-api/merger';
import { createClient } from '@/lib/supabase/server';

const aggregator = new WeatherAggregator([
  new StormglassProvider(process.env.STORMGLASS_KEY!),
]);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ spotId: string }> }
) {
  const { spotId } = await params;
  const supabase = await createClient();

  console.log(`[${spotId}] Iniciando`);
  console.log('Aggregator providers:', aggregator['providers'].map(p => ({ name: p.name, type: p.constructor.name })));
  const { data: spot, error } = await supabase
    .from('surf_spots')
    .select('latitude, longitude')
    .eq('id', spotId)
    .single();

  if (error || !spot) {
    return NextResponse.json({ error: 'Spot no encontrado' }, { status: 404 });
  }

  console.log(`[${spotId}] Coords: ${spot.latitude}, ${spot.longitude}`);

  let results: Array<{ provider: string; forecast: any }>;
  try {
    results = await new Promise((resolve, reject) => {
      aggregator.fetchAll$(spot.latitude, spot.longitude).subscribe({
        next: (data) => {
          console.log(`[${spotId}] Providers completados:`, data.length);
          resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  } catch (err) {
    console.error(`[${spotId}] Fetch falló:`, err);
    return NextResponse.json({ error: 'Error al obtener clima' }, { status: 500 });
  }

  if (!results.length || results.every(r => !r.forecast?.length)) {
    return NextResponse.json({ error: 'Sin datos de proveedores' }, { status: 500 });
  }

  const merged = mergeForecasts(results);
  if (!merged.length) {
    return NextResponse.json({ error: 'Fusión vacía' }, { status: 500 });
  }

  const toInsert = merged.map(f => ({
    spot_id: spotId,
    timestamp: f.timestamp.toISOString(),
    wave_height_min: f.waveHeightMin,
    wave_height_max: f.waveHeightMax,
    wave_period: f.wavePeriod,
    wave_direction: f.waveDirection,
    wind_speed: f.windSpeed,
    wind_direction: f.windDirection,
    wind_gust: f.windGust,
    tide_height: f.tideHeight,
    tide_type: f.tideType,
    water_temperature: f.waterTemperature,
  }));

  const { data: saved, error: insertError } = await supabase
    .from('forecasts')
    .insert(toInsert)
    .select();

  if (insertError) {
    console.error(`[${spotId}] Insert error:`, insertError);
    return NextResponse.json({ error: 'Fallo al guardar', details: insertError.message }, { status: 500 });
  }

  console.log(`[${spotId}] ${saved?.length || 0} pronósticos guardados`);
  return NextResponse.json({ data: saved, cached: false });
}