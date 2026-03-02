import { normalizePos } from "@/engine/rosterOverlay";

export function projectedMarketApy(posRaw: string, ovr: number, age: number) {
  const pos = normalizePos(posRaw);
  const base = 900_000;

  const posMult: Record<string, number> = {
    QB: 1.75,
    WR: 1.25,
    EDGE: 1.28,
    CB: 1.22,
    DL: 1.08,
    LB: 0.92,
    S: 0.90,
    TE: 0.90,
    RB: 0.80,
    OL: 1.15,
  };

  const peak = pos === "QB" ? 30 : 28;
  const ageAdj = 1 - Math.max(0, age - peak) * 0.03;
  const ovrAdj = Math.max(0.1, Math.min(1.35, (ovr - 55) / 40));
  const raw = base + 18_000_000 * ovrAdj * (posMult[pos] ?? 1) * ageAdj;
  return Math.round(raw / 50_000) * 50_000;
}

export function extensionBand(apy: number) {
  const lo = Math.round((apy * 0.92) / 50_000) * 50_000;
  const hi = Math.round((apy * 1.10) / 50_000) * 50_000;
  return { lo, mid: apy, hi };
}

export function tradeReturnEv(posRaw: string, ovr: number, age: number, capHit: number) {
  const pos = normalizePos(posRaw);
  const premiumPos = new Set(["QB", "EDGE", "WR", "CB"]);
  const ageScore = Math.max(0, Math.min(1, (30 - age) / 8));
  const ovrScore = Math.max(0, Math.min(1, (ovr - 65) / 25));
  const capPenalty = Math.max(0, Math.min(1, capHit / 25_000_000));
  const posBoost = premiumPos.has(pos) ? 0.15 : 0;

  const score = Math.max(0, Math.min(1, 0.15 + ovrScore * 0.55 + ageScore * 0.25 + posBoost - capPenalty * 0.25));

  if (score >= 0.92) return "1st–2nd";
  if (score >= 0.80) return "2nd–3rd";
  if (score >= 0.62) return "3rd–4th";
  if (score >= 0.45) return "4th–5th";
  if (score >= 0.28) return "6th–7th";
  return "No value";
}
