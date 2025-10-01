// lib/weather-api/providers/stormglass.ts
import type { WeatherProvider, RawWeatherData, NormalizedForecast } from '../types';

interface StormglassResponse {
  hours: Array<{
    time: string;
    waveHeight: { sg: number };
    wavePeriod: { sg: number };
    // ...
  }>;
}

export class StormglassProvider implements WeatherProvider {
  readonly name = 'stormglass';
  
  constructor(private readonly apiKey: string) {}

  async fetch(lat: number, lon: number): Promise<RawWeatherData> {
    const params = 'waveHeight,wavePeriod,waveDirection,windSpeed';
    const url = `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=${params}`;
    
    const res = await fetch(url, {
      headers: { Authorization: this.apiKey },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!res.ok) throw new Error(`Stormglass: ${res.status}`);
    
    return {
      provider: this.name,
      timestamp: new Date(),
      data: await res.json()
    };
  }

  normalize(raw: RawWeatherData): NormalizedForecast {
    const data = raw.data as StormglassResponse;
    const first = data.hours[0];
    
    return {
      timestamp: new Date(first.time),
      waveHeightMin: first.waveHeight.sg * 0.9,
      waveHeightMax: first.waveHeight.sg * 1.1,
      wavePeriod: first.wavePeriod.sg,
      // ... mapear resto
    };
  }
}