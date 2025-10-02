// lib/weather-api/aggregator.ts
import { from, merge,forkJoin, type Observable } from 'rxjs';
import { map, catchError, timeout, retry } from 'rxjs/operators';
import type { WeatherProvider, NormalizedForecast } from './types';

export class WeatherAggregator {
  private providers: WeatherProvider[];

  constructor(providers: WeatherProvider[]) {
    this.providers = providers;
  }

  fetchAll$(latitude: number, longitude: number): Observable<{ provider: string; forecast: any }> {
    const observables = this.providers.map((provider: WeatherProvider) =>
      provider.fetchForecast(latitude, longitude).pipe(
        map(forecastData => ({ provider: provider.name, forecast: forecastData }))
      )
    );

    // forkJoin espera a que todos los observables se completen y emite un array de sus últimos valores.
    // Si solo tienes un proveedor, esto emitirá un array con un solo elemento.
    // El 'map' posterior es para transformar el array de resultados en un Observable que emite cada resultado individualmente.
    // Esto es si quieres que el subscribe en route.ts reciba un resultado a la vez.
    // Si quieres que reciba todos los resultados de una vez, puedes quitar el flatMap.
    return forkJoin(observables).pipe(
      // Si quieres que el 'next' de tu subscribe en route.ts reciba cada resultado individualmente:
      // flatMap(results => from(results))
      // Si quieres que el 'next' de tu subscribe reciba el array completo de resultados:
      map(results => results) // Esto es lo que tu subscribe en route.ts espera ahora
    );
  }
/*
  fetchAll$(lat: number, lon: number): Observable<{
    provider: string;
    forecast: NormalizedForecast | null;
    error?: string;
  }> {
    const streams = this.providers.map(p =>
      from(p.fetch(lat, lon)).pipe(
        timeout(15000),
        retry({ count: 2, delay: 1000 }),
        map(raw => ({
          provider: p.name,
          forecast: p.normalize(raw),
          error: undefined
        })),
        catchError(err => [{
          provider: p.name,
          forecast: null,
          error: err.message
        }])
      )
    );

    return merge(...streams);
  }
  */
}