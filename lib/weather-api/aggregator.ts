// lib/weather-api/aggregator.ts
import { from, merge, type Observable } from 'rxjs';
import { map, catchError, timeout, retry } from 'rxjs/operators';
import type { WeatherProvider, NormalizedForecast } from './types';

export class WeatherAggregator {
  constructor(private readonly providers: WeatherProvider[]) {}

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
}