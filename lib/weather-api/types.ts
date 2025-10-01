// lib/weather-api/types.ts
export interface WeatherProvider {
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
    waveHeightMin: number;
    waveHeightMax: number;
    wavePeriod: number;
    waveDirection: number;
    windSpeed: number;
    windDirection: number;
    // ... resto campos
  }