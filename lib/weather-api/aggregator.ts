import { forkJoin, of, type Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import type { WeatherProvider } from './types';

export class WeatherAggregator {
  constructor(private providers: WeatherProvider[]) {
    if (!providers.length) throw new Error('Sin providers');
  }

  fetchAll$(lat: number, lon: number): Observable<Array<{ provider: string; forecast: any }>> {
    const obs = this.providers.map(p =>
      (p.fetchForecast(lat, lon) as Observable<any>).pipe(
        map(f => {
          console.log(`[Aggregator] ${p.name} → ${Array.isArray(f) ? f.length : 0} items`);
          return { provider: p.name, forecast: f };
        }),
        catchError(err => {
          console.error(`[Aggregator] ${p.name} falló:`, err.message);
          return of({ provider: p.name, forecast: [] }); // ✅ of() para mantener stream
        })
      )
    );

    return forkJoin(obs);
  }
}