// __tests__/merger.test.ts
import { mergeForecasts } from '@/lib/weather-api/merger';

// 📦 Pega aquí la respuesta REAL de Stormglass (estructura completa)
const mockStormglassResponse = [
  {
    provider: 'stormglass',
    forecast: [
      {
        time: '2025-10-04T12:00:00Z',
        waveHeight: [{ value: 1.5, source: 'sg' }],
        wavePeriod: [{ value: 10.2, source: 'sg' }],
        waveDirection: [{ value: 180, source: 'sg' }],
        waterTemperature: [{ value: 18.5, source: 'sg' }]
      },
      {
        time: '2025-10-04T15:00:00Z',
        waveHeight: [{ value: 1.8, source: 'sg' }],
        wavePeriod: [{ value: 11.0, source: 'sg' }]
      }
    ]
  }
];

describe('mergeForecasts', () => {
  it('convierte correctamente respuesta Stormglass', () => {
    const result = mergeForecasts(mockStormglassResponse);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      timestamp: expect.any(Date),
      waveHeightMin: expect.any(Number),
      waveHeightMax: expect.any(Number)
    });
  });

  it('maneja array vacío sin crash', () => {
    expect(mergeForecasts([{ provider: 'test', forecast: [] }])).toEqual([]);
  });

  it('ignora proveedores con forecast null', () => {
    const invalid = [
      { provider: 'fail', forecast: null },
      ...mockStormglassResponse
    ];
    
    const result = mergeForecasts(invalid as any);
    expect(result.length).toBeGreaterThan(0);
  });

  it('ordena por timestamp ascendente', () => {
    const result = mergeForecasts(mockStormglassResponse);
    
    for (let i = 1; i < result.length; i++) {
      expect(result[i].timestamp.getTime())
        .toBeGreaterThanOrEqual(result[i-1].timestamp.getTime());
    }
  });
});