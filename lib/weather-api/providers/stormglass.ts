import type { NormalizedForecast, RawWeatherData, WeatherProvider } from '../types';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

interface StormglassHour {
  time: string;
  waveHeight?: Array<{ value: number; source: string }>;
  wavePeriod?: Array<{ value: number; source: string }>;
  waveDirection?: Array<{ value: number; source: string }>;
  windSpeed?: Array<{ value: number; source: string }>;
  windDirection?: Array<{ value: number; source: string }>;
  waterTemperature?: Array<{ value: number; source: string }>;
}

export class StormglassProvider implements WeatherProvider {
  readonly name = 'stormglass'; // ✅ DEBE ser readonly
  private apiKey: string;
  private cachedForecast$: Observable<StormglassHour[]> | null = null;
  private currentLat: number | null = null;
  private currentLon: number | null = null;
  constructor(apiKey: string) {
    if (!apiKey) throw new Error('STORMGLASS_KEY requerida');
    this.apiKey = apiKey;
  }
    fetch(lat: number, lon: number): Promise<RawWeatherData> {
        throw new Error('Method not implemented.');
    }
    normalize(raw: RawWeatherData): NormalizedForecast {
        throw new Error('Method not implemented.');
    }
    private fetchForecastInternal(latitude: number, longitude: number): Observable<StormglassHour[]> {
        const params = 'waveHeight,wavePeriod,waveDirection,windSpeed,waveDirection,waterTemperature';
        // Mantenemos la lógica de 72 horas para pronóstico
        const start = Math.floor(Date.now() / 1000);
        const end = start + 72 * 3600; 
        const url = `https://api.stormglass.io/v2/weather/point?lat=${latitude}&lng=${longitude}&params=${params}&start=${start}&end=${end}`;
    
        return from(
          fetch(url, { headers: { 'Authorization': this.apiKey }})
            .then(async res => {
                if (!res.ok) {
                  const body = await res.json().catch(() => ({ message: res.statusText }));
                  throw new Error(`Stormglass ${res.status}: ${body.errors?.params?.[0] || body.message || 'Unknown'}`);
                }
                return res.json();
            })
        ).pipe(
          map((data: { hours: StormglassHour[] }) => {
            if (!data?.hours?.length) throw new Error('Sin datos de hours');
            console.log(`[Stormglass] ${data.hours.length} horas OK`);
            return data.hours;
          }),
          catchError(err => {
            console.error('[Stormglass] Error:', err.message);
            // IMPORTANTE: Limpiar el caché en caso de error para que reintente en la próxima llamada
            this.cachedForecast$ = null; 
            return throwError(() => err);
          })
        );
      }

  fetchForecast(latitude: number, longitude: number): Observable<StormglassHour[]> {
    if (this.cachedForecast$ === null || this.currentLat !== latitude || this.currentLon !== longitude) {
        console.log(`[Stormglass] Forzando nuevo fetch y re-cacheo.`);
        this.currentLat = latitude;
        this.currentLon = longitude;
        
        // Llamamos al fetch original y aplicamos shareReplay
        this.cachedForecast$ = this.fetchForecastInternal(latitude, longitude).pipe(
            shareReplay({ 
                bufferSize: 1, 
                windowTime: 2 * 3600 * 1000, // 2 horas
                refCount: true              // OBLIGATORIO en la sintaxis de objeto
            })
        );
      } else {
        console.log(`[Stormglass] Usando valor cacheado.`);
      }
  
      return this.cachedForecast$;
  }
}