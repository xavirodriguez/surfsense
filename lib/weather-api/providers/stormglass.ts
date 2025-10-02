// @/lib/weather-api/providers/stormglass.ts
import type { WeatherProvider, RawWeatherData, NormalizedForecast } from '../types';

import { Observable, from, throwError } from 'rxjs'; // Importa throwError
import { map, catchError } from 'rxjs/operators'; // Importa catchError

export class StormglassProvider implements WeatherProvider {
  public name = 'stormglass';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!this.apiKey) {
      console.error('StormglassProvider: STORMGLASS_KEY no está definida.');
      // Podrías lanzar un error aquí o manejarlo de otra manera
    }
  }
    fetch(lat: number, lon: number): Promise<RawWeatherData> {
        throw new Error('Method not implemented.');
    }
    normalize(raw: RawWeatherData): NormalizedForecast {
        throw new Error('Method not implemented.');
    }

  fetchForecast(latitude: number, longitude: number): Observable<any> {
    // Asegúrate de que estos parámetros son correctos y válidos para tu plan de Stormglass
    const params = 'waveHeight,wavePeriod,waveDirection,windSpeed,windDirection,waterTemperature,tide';
    const start = Math.floor(Date.now() / 1000); // Desde ahora
    const end = start + 72 * 3600; // Hasta 72 horas en el futuro

    const url = `https://api.stormglass.io/v2/weather/point?lat=${latitude}&lng=${longitude}&params=${params}&start=${start}&end=${end}`;

    console.log(`[StormglassProvider] - Solicitando a Stormglass URL: ${url}`);
    console.log(`[StormglassProvider] - Usando API Key (primeros 5 chars): ${this.apiKey ? this.apiKey.substring(0, 5) + '...' : 'N/A'}`);


    return from(
      fetch(url, {
        headers: {
          'Authorization': this.apiKey
        }
      }).then(async res => { // Usa async para poder await res.json() en caso de error
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({ message: res.statusText })); // Intenta leer el cuerpo del error
          console.error(`[StormglassProvider] - Error de respuesta de la API Stormglass (Status: ${res.status}, Body: ${JSON.stringify(errorBody)})`);
          throw new Error(`Stormglass API error: ${res.statusText} - ${errorBody.message || 'Unknown error'}`);
        }
        return res.json();
      })
    ).pipe(
      map(data => {
        if (data && Array.isArray(data.hours)) {
          console.log(`[StormglassProvider] - Datos de Stormglass recibidos. Total de horas: ${data.hours.length}`);
          // console.log(`[StormglassProvider] - Primer objeto de hora:`, JSON.stringify(data.hours[0], null, 2)); // Descomentar para ver el detalle
          return data.hours;
        } else {
          console.error('StormglassProvider: La respuesta no contiene un array "hours" válido.', data);
          return [];
        }
      }),
      catchError(err => {
        console.error(`[StormglassProvider] - Error en el pipe de RxJS:`, err);
        return throwError(() => new Error(`StormglassProvider: Fallo en la obtención de datos - ${err.message}`));
      })
    );
  }
}