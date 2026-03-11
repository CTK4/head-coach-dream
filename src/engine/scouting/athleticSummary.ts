type AthleticTier = "ELITE" | "GOOD" | "AVG" | "POOR";

type AthleticSummaryInput = {
  forty?: number | null;
  vert?: number | null;
  shuttle?: number | null;
  threeCone?: number | null;
  bench?: number | null;
};

export type AthleticSummary = {
  speed: AthleticTier;
  explosiveness: AthleticTier;
  agility: AthleticTier;
  power: AthleticTier;
  overallLabel: "EXPLOSIVE" | "FLUID" | "POWER" | "BALANCED" | "LIMITED";
};

function asNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function speedTier(forty: number | null): AthleticTier {
  if (forty == null) return "AVG";
  if (forty <= 4.4) return "ELITE";
  if (forty <= 4.58) return "GOOD";
  if (forty <= 4.78) return "AVG";
  return "POOR";
}

function explosivenessTier(vert: number | null): AthleticTier {
  if (vert == null) return "AVG";
  if (vert >= 38) return "ELITE";
  if (vert >= 34) return "GOOD";
  if (vert >= 30) return "AVG";
  return "POOR";
}

function agilityTier(shuttle: number | null, threeCone: number | null): AthleticTier {
  const hasShuttle = shuttle != null;
  const hasThreeCone = threeCone != null;
  if (!hasShuttle && !hasThreeCone) return "AVG";

  const shuttleScore =
    shuttle == null
      ? 2
      : shuttle <= 4.05
        ? 3
        : shuttle <= 4.25
          ? 2
          : shuttle <= 4.5
            ? 1
            : 0;
  const coneScore =
    threeCone == null
      ? 2
      : threeCone <= 6.85
        ? 3
        : threeCone <= 7.1
          ? 2
          : threeCone <= 7.35
            ? 1
            : 0;

  const avgScore = (shuttleScore + coneScore) / 2;
  if (avgScore >= 2.5) return "ELITE";
  if (avgScore >= 1.75) return "GOOD";
  if (avgScore >= 1.0) return "AVG";
  return "POOR";
}

function powerTier(bench: number | null): AthleticTier {
  if (bench == null) return "AVG";
  if (bench >= 30) return "ELITE";
  if (bench >= 23) return "GOOD";
  if (bench >= 16) return "AVG";
  return "POOR";
}

const TIER_POINTS: Record<AthleticTier, number> = {
  ELITE: 3,
  GOOD: 2,
  AVG: 1,
  POOR: 0,
};

export function getAthleticSummary(input: AthleticSummaryInput): AthleticSummary {
  const speed = speedTier(asNumber(input.forty));
  const explosiveness = explosivenessTier(asNumber(input.vert));
  const agility = agilityTier(asNumber(input.shuttle), asNumber(input.threeCone));
  const power = powerTier(asNumber(input.bench));

  const points = {
    speed: TIER_POINTS[speed],
    explosiveness: TIER_POINTS[explosiveness],
    agility: TIER_POINTS[agility],
    power: TIER_POINTS[power],
  };

  const total = points.speed + points.explosiveness + points.agility + points.power;
  const top = Object.entries(points).sort((a, b) => b[1] - a[1]);

  let overallLabel: AthleticSummary["overallLabel"] = "BALANCED";
  if (total <= 3) overallLabel = "LIMITED";
  else if (points.explosiveness >= 2 && points.speed >= 2) overallLabel = "EXPLOSIVE";
  else if (points.agility >= 2 && points.speed >= 2) overallLabel = "FLUID";
  else if (points.power >= 2 && points.explosiveness >= 2) overallLabel = "POWER";
  else if (top[0]?.[1] === 0) overallLabel = "LIMITED";

  return { speed, explosiveness, agility, power, overallLabel };
}
