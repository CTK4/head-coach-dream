import type { DerivedMetricFn, TeamGameAggV1 } from "@/engine/telemetry/types";

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Number((numerator / denominator).toFixed(6));
}

export const completionPct: DerivedMetricFn = (stats) => pct(stats.completions, stats.passAttempts);
export const yardsPerAtt: DerivedMetricFn = (stats) => pct(stats.passYards, stats.passAttempts);
export const intRate: DerivedMetricFn = (stats) => pct(stats.interceptions, stats.passAttempts);
export const sackRate: DerivedMetricFn = (stats) => pct(stats.sacksTaken, stats.passAttempts + stats.sacksTaken);

export const metricRegistry: Record<string, DerivedMetricFn> = {
  completionPct,
  yardsPerAtt,
  intRate,
  sackRate,
};

export function runAllDerivedMetrics(stats: TeamGameAggV1): Record<string, number> {
  return Object.fromEntries(Object.entries(metricRegistry).map(([key, fn]) => [key, fn(stats)]));
}
