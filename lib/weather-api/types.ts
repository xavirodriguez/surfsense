// lib/weather-api/types.ts
export interface WeatherProvider {
    fetchForecast(latitude: number, longitude: number): unknown;
    readonly name: string;
    fetch(lat: number, lon: number): Promise<RawWeatherData>;
    normalize(raw: RawWeatherData): NormalizedForecast;
  }
  
  export interface RawWeatherData {
    provider: string;
    timestamp: Date;
    data: unknown;
  }
  
export interface NormalizedForecast {
  timestamp: Date;
  waveHeightMin: number | null;
  waveHeightMax: number | null;
  wavePeriod: number | null;
  waveDirection: number | null;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  tideHeight: number | null;
  tideType: 'high' | 'low' | 'rising' | 'falling' | null;
  waterTemperature: number | null;
}