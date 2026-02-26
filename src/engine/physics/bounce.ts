export type BounceSurface = "DRY" | "WET" | "SNOW";

export function resolveBounce(
  input: { baseRecoveryBias01: number; surface: BounceSurface; windTier?: "LOW" | "MED" | "HIGH" },
  rng: () => number,
): { rollYds: number; direction: -1 | 1; recoveryBias01: number; weird: boolean } {
  const surfaceFactor = input.surface === "WET" ? 1.15 : input.surface === "SNOW" ? 1.3 : 1;
  const windFactor = input.windTier === "HIGH" ? 1.25 : input.windTier === "MED" ? 1.1 : 1;
  const magnitude = Math.round((1 + rng() * 8) * surfaceFactor * windFactor);
  const direction = rng() < 0.5 ? -1 : 1;
  const weird = rng() < (input.surface === "SNOW" ? 0.23 : input.surface === "WET" ? 0.14 : 0.08);
  const recoveryBias01 = Math.min(0.95, Math.max(0.05, input.baseRecoveryBias01 + (weird ? 0.09 : 0) - (direction === -1 ? 0.04 : 0.02)));
  return { rollYds: Math.min(14, magnitude + (weird ? 2 : 0)), direction, recoveryBias01, weird };
}
