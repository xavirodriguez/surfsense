// lib/weather-api/merger.ts
export function mergeForecasts(
    results: Array<{ provider: string; forecast: NormalizedForecast | null }>
  ): NormalizedForecast {
    const valid = results
      .filter(r => r.forecast !== null)
      .map(r => r.forecast!);
  
    if (valid.length === 0) throw new Error('No valid forecasts');
  
    // Media ponderada (puedes ajustar pesos por confiabilidad del provider)
    const weights: Record<string, number> = {
      stormglass: 1.2,
      weatherapi: 1.0,
      openmeteo: 0.8
    };
  
    const totalWeight = valid.reduce((sum, _, i) => 
      sum + (weights[results[i].provider] ?? 1), 0
    );
  
    return {
      timestamp: new Date(),
      waveHeightMin: valid.reduce((sum, f, i) => 
        sum + f.waveHeightMin * (weights[results[i].provider] ?? 1), 0
      ) / totalWeight,
      waveHeightMax: valid.reduce((sum, f, i) => 
        sum + f.waveHeightMax * (weights[results[i].provider] ?? 1), 0
      ) / totalWeight,
      // ... resto campos
    };
  }