const DRILL_WEIGHTS = {
  R40: 0.35,
  RVert: 0.15,
  RBroad: 0.15,
  RCone: 0.2,
  RBench: 0.15,
} as const;

type DrillKey = keyof typeof DRILL_WEIGHTS;

const DRILL_ALIASES: Record<DrillKey, string[]> = {
  R40: ["R40", "r40", "rForty", "R_Forty"],
  RVert: ["RVert", "rVert", "vertRating", "rVertical"],
  RBroad: ["RBroad", "rBroad", "broadRating"],
  RCone: ["RCone", "rCone", "coneRating", "threeConeRating"],
  RBench: ["RBench", "rBench", "benchRating"],
};

export type CombineScoreResult = {
  combineScore100: number | null;
  combineScore10: number | null;
};

function toFiniteNumber(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function readDrill(source: Record<string, unknown>, key: DrillKey): number | null {
  for (const alias of DRILL_ALIASES[key]) {
    const candidate = toFiniteNumber(source[alias]);
    if (candidate == null) continue;
    return candidate;
  }
  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function computeCombineScore(source: Record<string, unknown> | null | undefined): CombineScoreResult {
  if (!source) return { combineScore100: null, combineScore10: null };

  let weightedTotal = 0;
  let weightUsed = 0;

  (Object.keys(DRILL_WEIGHTS) as DrillKey[]).forEach((key) => {
    const drillValue = readDrill(source, key);
    if (drillValue == null) return;

    const weight = DRILL_WEIGHTS[key];
    weightedTotal += clamp(drillValue, 0, 100) * weight;
    weightUsed += weight;
  });

  if (weightUsed <= 0) return { combineScore100: null, combineScore10: null };

  const combineScore100 = weightedTotal / weightUsed;
  const scaled = 10 * Math.pow(combineScore100 / 100, 0.85);
  const combineScore10 = Math.round(scaled * 100) / 100;

  if (!Number.isFinite(combineScore100) || !Number.isFinite(combineScore10)) {
    return { combineScore100: null, combineScore10: null };
  }

  return {
    combineScore100: Math.round(combineScore100 * 100) / 100,
    combineScore10,
  };
}

export function formatCombineScore10(value: number | null | undefined): string {
  if (!Number.isFinite(value)) return "—";
  return Number(value).toFixed(2);
}
