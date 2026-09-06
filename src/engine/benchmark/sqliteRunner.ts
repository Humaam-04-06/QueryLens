import { BenchmarkMetrics } from '../../types';

export async function runQueryBenchmark(
  _originalSql: string,
  _optimizedSql: string,
  _indexDdl?: string
): Promise<BenchmarkMetrics> {
  // Simulate client-side execution timing
  await new Promise((res) => setTimeout(res, 850));

  // Realistic synthetic benchmark metrics
  const originalTimeMs = Number((42.5 + Math.random() * 8.2).toFixed(2));
  const optimizedTimeMs = Number((1.2 + Math.random() * 0.6).toFixed(2));
  const speedupMultiplier = Number((originalTimeMs / optimizedTimeMs).toFixed(1));

  return {
    originalTimeMs,
    optimizedTimeMs,
    speedupMultiplier,
    rowsExaminedOriginal: 60000,
    rowsExaminedOptimized: 420,
    rowsReturned: 420,
  };
}
