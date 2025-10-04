// lib/weather-api/types.ts
import type { Observable } from 'rxjs';

export interface WeatherProvider {
  readonly name: string;
  fetchForecast(latitude: number, longitude: number): Observable<any>;
}

export interface NormalizedForecast {
  timestamp: Date;
  waveHeightMin: number | null;
  waveHeightMax: number | null;
  wavePeriod: number | null;
  waveDirection: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  windGust: number | null;
  tideHeight: number | null;
  tideType: 'high' | 'low' | 'rising' | 'falling' | null;
  waterTemperature: number | null;
}


  
  export interface RawWeatherData {
    provider: string;
    timestamp: Date;
    data: unknown;
  }
  
