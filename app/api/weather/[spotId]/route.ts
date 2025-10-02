// app/api/weather/[spotId]/route.ts
import { NextResponse } from 'next/server';
import { WeatherAggregator } from '@/lib/weather-api/aggregator';
import { StormglassProvider } from '@/lib/weather-api/providers/stormglass';
import { mergeForecasts } from '@/lib/weather-api/merger';
import { createClient } from '@/lib/supabase/server';
import type { Forecast } from '@/lib/types'; // Asegúrate de importar tu tipo Forecast

const aggregator = new WeatherAggregator([
  new StormglassProvider(process.env.STORMGLASS_KEY!),
  //new OpenMeteoProvider(),
  // Añade más providers aquí
]);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ spotId: string }> }
) {
  const { spotId } = await params;
  const supabase = await createClient();

  console.log(`[${spotId}] - Solicitud recibida para el spot.`);

  // 1. Verificar caché (< 30min)
  // Aquí, la lógica de caché podría ser más compleja si quieres cachear un array completo.
  // Por ahora, para depurar, podemos omitir la caché o buscar el pronóstico más reciente.
  // Para simplificar, vamos a forzar la obtención de nuevos datos para ver la inserción.
  // const { data: cached } = await supabase
  //   .from('forecasts')
  //   .select('*')
  //   .eq('spot_id', spotId)
  //   .gte('created_at', new Date(Date.now() - 30 * 60000).toISOString())
  //   .order('created_at', { ascending: false })
  //   .limit(1)
  //   .single();

  // if (cached) return NextResponse.json({ data: cached, cached: true });
  console.log(`[${spotId}] - Saltando caché para depuración.`);


  // 2. Obtener coordenadas del spot
  const { data: spot, error: spotError } = await supabase
    .from('surf_spots')
    .select('latitude, longitude')
    .eq('id', spotId)
    .single();

  if (spotError) {
    console.error(`[${spotId}] - Error al obtener el spot de la DB:`, spotError);
    return NextResponse.json({ error: 'Error de base de datos al obtener el spot' }, { status: 500 });
  }

  if (!spot) {
    console.log(`[${spotId}] - Spot no encontrado.`);
    return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
  }
  console.log(`[${spotId}] - Spot encontrado:`, spot);

  // 3. Fetch paralelo de todos los providers
  const results: Array<{ provider: string; forecast: any }> = [];

  try {
    await new Promise<void>((resolve, reject) => {
      const subscription = aggregator.fetchAll$(spot.latitude, spot.longitude).subscribe({
        next: (result) => {
          console.log(`[${spotId}] - Resultado del proveedor ${result.provider}:`, result.forecast ? `Datos recibidos (${Array.isArray(result.forecast) ? result.forecast.length + ' items' : '1 item'})` : 'Sin datos');
          results.push(result);
        },
        error: (err) => {
          console.error(`[${spotId}] - Error durante la obtención de datos del proveedor:`, err);
          reject(err);
        },
        complete: () => {
          console.log(`[${spotId}] - Todos los proveedores completados. Total de resultados: ${results.length}`);
          resolve();
        }
      });
    });
  } catch (fetchError) {
    console.error(`[${spotId}] - Fallo al obtener datos de los proveedores del clima:`, fetchError);
    return NextResponse.json({ error: 'Fallo al obtener datos del clima' }, { status: 500 });
  }

  if (results.length === 0) {
    console.warn(`[${spotId}] - No se recibieron datos de ningún proveedor del clima.`);
    return NextResponse.json({ error: 'No hay datos del clima disponibles de los proveedores' }, { status: 500 });
  }

  // 4. Fusionar datos
  let mergedForecasts: Forecast[]; // <-- Ahora esperamos un array
  try {
    mergedForecasts = mergeForecasts(results); // <-- mergeForecasts debe devolver un array
    console.log(`[${spotId}] - Datos de pronóstico fusionados. Total: ${mergedForecasts.length}`);
    if (mergedForecasts.length === 0) {
        console.error(`[${spotId}] - Los datos fusionados están vacíos.`);
        return NextResponse.json({ error: 'Datos de pronóstico fusionados vacíos' }, { status: 500 });
    }
    // console.log(`[${spotId}] - Primer pronóstico fusionado:`, mergedForecasts[0]); // Descomenta para ver la estructura
  } catch (mergeError) {
    console.error(`[${spotId}] - Error al fusionar pronósticos:`, mergeError);
    return NextResponse.json({ error: 'Fallo al fusionar los datos del pronóstico' }, { status: 500 });
  }

  // 5. Preparar para guardar en DB (inserción masiva)
  const forecastsToInsert = mergedForecasts.map(f => ({
    spot_id: spotId,
    timestamp: f.timestamp.toISOString(), // Asegúrate de que f.timestamp es un Date o string ISO
    wave_height_min: f.wave_height_min,
    wave_height_max: f.wave_height_max,
    wave_period: f.wave_period,
    wave_direction: f.wave_direction,
    wind_speed: f.wind_speed,
    wind_direction: f.wind_direction,
    wind_gust: f.wind_gust,
    tide_height: f.tide_height,
    tide_type: f.tide_type,
    water_temperature: f.water_temperature,
    // Añade aquí cualquier otro campo que tu tipo Forecast tenga y quieras guardar
    // Asegúrate de que los nombres de las propiedades coincidan con las columnas de tu DB
  }));

  let savedData;
  try {
    const { data, error: insertError } = await supabase
      .from('forecasts')
      .insert(forecastsToInsert) // <-- ¡Aquí la clave! Insertamos un array
      .select(); // No uses .single() aquí, ya que esperas múltiples resultados

    if (insertError) {
      console.error(`[${spotId}] - Error de inserción múltiple en Supabase:`, insertError);
      return NextResponse.json({ error: 'Fallo al guardar los pronósticos en la base de datos', details: insertError.message }, { status: 500 });
    }
    savedData = data;
    console.log(`[${spotId}] - Se guardaron ${savedData?.length || 0} pronósticos exitosamente.`);

  } catch (dbError) {
    console.error(`[${spotId}] - Error inesperado durante la inserción en la base de datos:`, dbError);
    return NextResponse.json({ error: 'Ocurrió un error inesperado en la base de datos' }, { status: 500 });
  }

  // Devolvemos los datos guardados (que ahora serán un array)
  return NextResponse.json({ data: savedData, cached: false });
}