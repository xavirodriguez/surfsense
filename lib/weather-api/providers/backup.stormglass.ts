// lib/weather-api/providers/stormglass.ts
import type { WeatherProvider, RawWeatherData, NormalizedForecast } from '../types';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

interface StormglassHour {
  time: string;
  waveHeight?: { sg?: number; noaa?: number };
  wavePeriod?: { sg?: number };
  waveDirection?: { sg?: number };
  windSpeed?: { sg?: number; noaa?: number };
  windDirection?: { sg?: number };
}

interface StormglassResponse {
  hours: StormglassHour[];
  meta: {
    cost: number;
    dailyQuota: number;
    lat: number;
    lng: number;
  };
}

export class StormglassProvider implements WeatherProvider {
  readonly name = 'stormglass';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  fetchForecast(latitude: number, longitude: number): Observable<any> {
    const params = 'waveHeight,wavePeriod,waveDirection,windSpeed,windDirection,windGust,waterTemperature,tide'; // Asegúrate de pedir todas las métricas
    const end = Math.floor(Date.now() / 1000) + 72 * 3600; // 72 horas en el futuro
    const url = `https://api.stormglass.io/v2/weather/point?lat=${latitude}&lng=${longitude}&params=${params}&end=${end}`;

    return from(
      fetch(url, {
        headers: {
          'Authorization': this.apiKey
        }
      }).then(res => {
        if (!res.ok) {
          throw new Error(`Stormglass API error: ${res.statusText}`);
        }
        return res.json();
      })
    ).pipe(
      map(data => {
        // ¡ESTE ES EL PUNTO CLAVE!
        // Stormglass devuelve un objeto con una propiedad 'hours' que es un array.
        // Debemos devolver ese array directamente.
        if (data && Array.isArray(data.hours)) {
          return data.hours; // <-- Devolver el array de pronósticos horarios
        } else {
          console.error('StormglassProvider: La respuesta no contiene un array "hours" válido.', data);
          return []; // Devolver un array vacío si no hay datos válidos
        }
      })
    );
  }

  async fetch(lat: number, lon: number): Promise<RawWeatherData> {
    const params = 'waveHeight,wavePeriod,waveDirection,windSpeed,windDirection';
    const url = `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=${params}`;
    
    const res = await fetch(url, {
      headers: { Authorization: this.apiKey },
      signal: AbortSignal.timeout(10000),
      next: {
        revalidate: 86400 // Revalida cada hora (24h)
      }
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Stormglass ${res.status}: ${text}`);
    }
    
    const json: StormglassResponse = await res.json(); // CRÍTICO: parsea JSON
    console.log('Stormglass raw data:');
    console.log(json);
    return {
      provider: this.name,
      timestamp: new Date(),
      data: json
    };
  }

  normalize(raw: RawWeatherData): NormalizedForecast {
    const data = raw.data as StormglassResponse;
    
    if (!data.hours || data.hours.length === 0) {
      throw new Error('Stormglass: no hours data');
    }
    
    const first = data.hours[0];
    
    // Stormglass da múltiples fuentes (sg, noaa, etc), usa la primera disponible
    const waveHeight = first.waveHeight?.sg ?? first.waveHeight?.noaa ?? 0;
    const wavePeriod = first.wavePeriod?.sg ?? 0;
    const waveDir = first.waveDirection?.sg ?? 0;
    const windSpeed = first.windSpeed?.sg ?? first.windSpeed?.noaa ?? 0;
    const windDir = first.windDirection?.sg ?? 0;
    
    return {
      timestamp: new Date(first.time),
      waveHeightMin: Math.max(0, waveHeight * 0.9),
      waveHeightMax: waveHeight * 1.1,
      wavePeriod,
      waveDirection: waveDir,
      windSpeed,
      windDirection: windDir,
      windGust: windSpeed * 1.2, // Estima ráfaga
      tideHeight: null, // Stormglass no da tide en este endpoint
      tideType: null,
      waterTemperature: null
    };
  }
}