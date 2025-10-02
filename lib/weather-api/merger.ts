// lib/weather-api/merger.ts
import type { NormalizedForecast } from './types';

export function mergeForecasts(
  results: Array<{ provider: string; forecast: any }>
): NormalizedForecast[] {
  const mergedForecastsMap = new Map<string, Partial<NormalizedForecast>>();
  console.log('[Merger] - Iniciando mergeForecasts. Resultados de proveedores:', results.length);

  const weights: Record<string, number> = {
    stormglass: 1.2,
    weatherapi: 1.0,
    openmeteo: 0.8
  };

  results.forEach(providerResult => {
    const providerName = providerResult.provider;
    const providerWeight = weights[providerName] ?? 1;
    const rawForecastData = providerResult.forecast;

    console.log(`[Merger] - Procesando proveedor: ${providerName}`);
    console.log(`[Merger] - Datos crudos del proveedor (${providerName}):`, JSON.stringify(rawForecastData, null, 2)); // ¡MUY IMPORTANTE!

    if (Array.isArray(rawForecastData)) {
      console.log(`[Merger] - ${providerName} devolvió un array con ${rawForecastData.length} elementos.`);
      rawForecastData.forEach((hourlyData: any, index: number) => {
        // console.log(`[Merger] - ${providerName} - Procesando elemento horario ${index}:`, JSON.stringify(hourlyData, null, 2)); // Descomentar si necesitas más detalle

        const timeValue = hourlyData.time; // Stormglass usa 'time'
        if (!timeValue) {
          console.warn(`[Merger] - ${providerName} - Elemento horario ${index} no tiene campo 'time'. Saltando.`);
          return; // Saltar este elemento si no tiene tiempo
        }

        let timestampKey: string;
        try {
          timestampKey = new Date(timeValue).toISOString();
        } catch (e) {
          console.error(`[Merger] - ${providerName} - Error al parsear 'time' (${timeValue}):`, e);
          return; // Saltar si el tiempo es inválido
        }

        if (!mergedForecastsMap.has(timestampKey)) {
          mergedForecastsMap.set(timestampKey, { timestamp: new Date(timestampKey) });
        }

        const currentMerged = mergedForecastsMap.get(timestampKey)!;

        const getStormglassValue = (metric: any[] | undefined) => {
          if (metric && Array.isArray(metric) && metric.length > 0) {
            // Puedes añadir lógica para elegir la mejor fuente si hay varias
            return metric[0].value;
          }
          return null;
        };

        // Wave Height
        const waveHeight = getStormglassValue(hourlyData.waveHeight);
        if (waveHeight !== null) {
          currentMerged.waveHeightMin = currentMerged.waveHeightMin !== undefined
            ? (currentMerged.waveHeightMin * (providerWeight - 1) + waveHeight * providerWeight) / providerWeight
            : waveHeight;
          currentMerged.waveHeightMax = currentMerged.waveHeightMax !== undefined
            ? (currentMerged.waveHeightMax * (providerWeight - 1) + waveHeight * providerWeight) / providerWeight
            : waveHeight * 1.2; // Asumiendo un 20% más para el máximo si solo hay uno
        }

        // Helper para actualizar campos numéricos con promedio ponderado
        const updateNumericField = (field: keyof NormalizedForecast, sgMetric: any[] | undefined) => {
          const value = getStormglassValue(sgMetric);
          if (value !== null && typeof value === 'number') {
            if (currentMerged[field] === undefined) {
              (currentMerged as any)[field] = value;
            } else if (typeof (currentMerged as any)[field] === 'number') {
              (currentMerged as any)[field] = ((currentMerged as any)[field] * (providerWeight - 1) + value * providerWeight) / providerWeight;
            }
          }
        };

        // Helper para actualizar campos no numéricos (ej. tideType)
        const updateNonNumericField = (field: keyof NormalizedForecast, sgMetric: any[] | undefined) => {
          const value = getStormglassValue(sgMetric);
          if (value !== null) {
            if (currentMerged[field] === undefined) {
              (currentMerged as any)[field] = value;
            }
          }
        };


        updateNumericField('wavePeriod', hourlyData.wavePeriod);
        updateNumericField('waveDirection', hourlyData.waveDirection);
        updateNumericField('windSpeed', hourlyData.windSpeed);
        updateNumericField('windDirection', hourlyData.windDirection);
        updateNumericField('windGust', hourlyData.windGust);
        updateNumericField('waterTemperature', hourlyData.waterTemperature);

        // Para la marea, Stormglass tiene un objeto 'swellDirection' o 'tide'
        // Si Stormglass devuelve 'tide' con 'height' y 'type'
        // Esto es una suposición, revisa la estructura real de la respuesta de Stormglass para 'tide'
        if (hourlyData.tide && Array.isArray(hourlyData.tide) && hourlyData.tide.length > 0) {
          const tideData = hourlyData.tide[0];
          if (tideData.value !== null && typeof tideData.value === 'number') {
            updateNumericField('tideHeight', [{ value: tideData.value }]); // Envuelve en array para usar getStormglassValue
          }
          if (tideData.type !== null) {
            updateNonNumericField('tideType', [{ value: tideData.type }]);
          }
        }
      });
    } else {
      console.warn(`[Merger] - El proveedor ${providerName} no devolvió un array de pronósticos horarios. Datos:`, rawForecastData);
    }
  });

  const finalForecasts = Array.from(mergedForecastsMap.values())
    .filter((f): f is NormalizedForecast => f.timestamp instanceof Date)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  console.log(`[Merger] - mergeForecasts completado. Total de pronósticos fusionados: ${finalForecasts.length}`);
  // console.log(`[Merger] - Primer pronóstico final:`, finalForecasts[0]); // Descomentar para ver el resultado final

  return finalForecasts;
}