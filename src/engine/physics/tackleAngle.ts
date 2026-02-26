const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function resolveAngleBand(angleDeg: number): "HEAD_ON" | "INSIDE" | "GLANCING" {
  const angle = clamp(Math.abs(angleDeg), 0, 90);
  if (angle <= 20) return "HEAD_ON";
  if (angle <= 55) return "INSIDE";
  return "GLANCING";
}

export function anglePenaltyFromRush(angleDeg: number, bendZ: number): number {
  const angle = clamp(Math.abs(angleDeg), 5, 85);
  const widePenalty = ((angle - 22) / 63) * 0.52;
  return clamp(widePenalty - bendZ * 0.18, -0.12, 0.48);
}
