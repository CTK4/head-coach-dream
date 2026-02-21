/**
 * Stub calculators for the Player Development screen.
 * These will be refined once snap-based growth simulation is wired in.
 */

/** Returns a dev-arrow character based on age curve and potential gap. */
export function computeDevArrow(player: {
  age?: unknown;
  overall?: unknown;
  potential?: unknown;
  dev?: unknown;
}): "↑" | "→" | "↓" {
  const age = Number(player.age ?? 0);
  const ovr = Number(player.overall ?? 0);
  const p = player as Record<string, unknown>;
  const rawPotential = p.potential ?? p.dev;
  const potential = Number(rawPotential ?? 0);
  const gap = potential > 0 ? potential - ovr : 0;

  if (age >= 33) return "↓";
  if (age >= 30 && ovr >= 85) return "↓";
  if (age <= 24 && (gap >= 5 || potential === 0)) return "↑";
  if (age <= 26 && gap >= 8) return "↑";
  return "→";
}

/** Returns a regression risk level based on age. */
export function computeDevRisk(player: { age?: unknown }): "LOW" | "MED" | "HIGH" {
  const age = Number(player.age ?? 0);
  if (age >= 34) return "HIGH";
  if (age >= 30) return "MED";
  return "LOW";
}
