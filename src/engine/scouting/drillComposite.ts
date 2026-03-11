export type DrillInput = {
  forty?: number | null;
  vert?: number | null;
  shuttle?: number | null;
  bench?: number | null;
};

function finite(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function hasEnoughDrillDataForPercentile(input: DrillInput): boolean {
  return finite(input.forty) != null && finite(input.vert) != null && finite(input.shuttle) != null && finite(input.bench) != null;
}

export function getDrillCompositeScore(input: DrillInput): number | null {
  const forty = finite(input.forty);
  const vert = finite(input.vert);
  const shuttle = finite(input.shuttle);
  const bench = finite(input.bench);
  if (forty == null || vert == null || shuttle == null || bench == null) return null;
  return (5.3 - forty) * 36 + vert * 0.9 + (5.2 - shuttle) * 24 + bench * 0.45;
}


const FULL_WEIGHT = 36 + 0.9 + 24 + 0.45;

export type PartialDrillCompositeSignal = {
  score: number;
  coverage: number;
  drillCount: number;
};

export function getPartialDrillCompositeSignal(input: DrillInput): PartialDrillCompositeSignal | null {
  const parts: Array<{ value: number; weight: number; transform: (v: number) => number }> = [];
  const forty = finite(input.forty);
  const vert = finite(input.vert);
  const shuttle = finite(input.shuttle);
  const bench = finite(input.bench);
  if (forty != null) parts.push({ value: forty, weight: 36, transform: (v) => 5.3 - v });
  if (vert != null) parts.push({ value: vert, weight: 0.9, transform: (v) => v });
  if (shuttle != null) parts.push({ value: shuttle, weight: 24, transform: (v) => 5.2 - v });
  if (bench != null) parts.push({ value: bench, weight: 0.45, transform: (v) => v });
  if (!parts.length) return null;

  const coveredWeight = parts.reduce((sum, p) => sum + p.weight, 0);
  const weightedScore = parts.reduce((sum, p) => sum + p.transform(p.value) * p.weight, 0);
  const normalizedScore = weightedScore * (FULL_WEIGHT / coveredWeight);

  return {
    score: normalizedScore,
    coverage: coveredWeight / FULL_WEIGHT,
    drillCount: parts.length,
  };
}
