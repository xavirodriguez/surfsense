import type { NormalizedForecast } from './types';

interface StormglassMetric {
  value: number;
  source: string;
}

export function mergeForecasts(
  results: Array<{ provider: string; forecast: any }>
): NormalizedForecast[] {
  const map = new Map<string, Partial<NormalizedForecast>>();

  const getValue = (metric?: StormglassMetric[]): number | null => 
    metric?.[0]?.value ?? null;

  results.forEach(({ provider, forecast }) => {
    if (!Array.isArray(forecast) || !forecast.length) {
      console.warn(`[Merger] ${provider} sin array válido`);
      return;
    }

    forecast.forEach((hour: any) => {
      if (!hour.time) return;
      
      const key = new Date(hour.time).toISOString();
      if (!map.has(key)) {
        map.set(key, { timestamp: new Date(key) });
      }

      const curr = map.get(key)!;
      const wh = getValue(hour.waveHeight);
      
      if (wh !== null) {
        curr.waveHeightMin ??= wh * 0.9;
        curr.waveHeightMax ??= wh * 1.1;
      }
      
      curr.wavePeriod ??= getValue(hour.wavePeriod);
      curr.waveDirection ??= getValue(hour.waveDirection);
      // curr.windSpeed ??= getValue(hour.windSpeed);
      // curr.windDirection ??= getValue(hour.windDirection);
      curr.waterTemperature ??= getValue(hour.waterTemperature);
      curr.windGust ??= (curr.windSpeed ?? 0) * 1.2;
      curr.tideHeight ??= null;
      curr.tideType ??= null;
    });
  });

  const final = Array.from(map.values())
    .filter((f): f is NormalizedForecast => 
      !!f.timestamp && 
      (f.waveHeightMin !== undefined || f.windSpeed !== undefined)
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  console.log(`[Merger] ${final.length} pronósticos fusionados`);
  return final;
}