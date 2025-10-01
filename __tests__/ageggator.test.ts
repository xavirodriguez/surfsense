// __tests__/aggregator.test.ts
import { WeatherAggregator } from "@/lib/weather-api/aggregator";

const mockProvider = {
  name: "mock",
  fetch: async () => ({ provider: "mock", timestamp: new Date(), data: {} }),
  normalize: () => ({ timestamp: new Date(), waveHeightMin: 1.5 /* ... */ }),
};

test("agrega múltiples providers", (done) => {
  const agg = new WeatherAggregator([mockProvider]);
  const results: unknown[] = [];

  agg.fetchAll$(0, 0).subscribe({
    next: (r) => results.push(r),
    complete: () => {
      expect(results).toHaveLength(1);
      done();
    },
  });
});
