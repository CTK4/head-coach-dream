import { projectedMarketApy } from "@/engine/marketModel";
import { normalizePos } from "@/engine/rosterOverlay";

export type OfferDecisionResult = {
  accepted: boolean;
  acceptanceScore: number;
  threshold: number;
  askAav: number;
  offerAav: number;
  aavRatio: number;
  reason: string;
  interestBefore: number;
  interestAfter: number;
  deltaInterest: number;
};

type OfferDecisionParams = {
  player: { id: string; age?: number; overall?: number; position?: string; dev?: number; traits?: string[] };
  offer: { years: number; total?: number; aav?: number; guarantees?: number };
  context: { saveSeed: number; season: number; week: number; teamId: string; phase: "RESIGN" | "FA" };
  interest: number;
  priorOfferAav?: number;
  rejectionCount?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function preferredYears(position: string, overall: number) {
  if (position === "QB") return overall >= 85 ? 4 : 3;
  if (["WR", "EDGE", "CB", "LT"].includes(position)) return 3;
  return 2;
}

function resolveAskAav(player: OfferDecisionParams["player"]) {
  const pos = normalizePos(String(player.position ?? "UNK"));
  const ovr = Number(player.overall ?? 65);
  const age = Number(player.age ?? 26);
  const baseline = projectedMarketApy(pos, ovr, age);
  if (baseline > 0) return baseline;
  const posBase: Record<string, number> = { QB: 18_000_000, EDGE: 13_000_000, WR: 12_000_000, CB: 11_000_000, LT: 12_000_000, RB: 7_000_000, TE: 8_000_000 };
  const base = posBase[pos] ?? 6_000_000;
  const ovrCurve = Math.max(0.55, 0.7 + (ovr - 70) * 0.02);
  const ageAdj = age <= 24 ? 1.06 : age >= 31 ? 0.92 : 1;
  return Math.round(base * ovrCurve * ageAdj);
}

export function evaluateContractOffer(params: OfferDecisionParams): OfferDecisionResult {
  const askAav = Math.max(500_000, Math.round(resolveAskAav(params.player)));
  const offerAav = Math.max(0, Math.round(params.offer.aav ?? (params.offer.total ?? 0) / Math.max(1, params.offer.years)));
  const aavRatio = offerAav / askAav;

  const playerPos = normalizePos(String(params.player.position ?? "UNK"));
  const preferred = preferredYears(playerPos, Number(params.player.overall ?? 65));
  const yearGap = Math.abs(Number(params.offer.years ?? preferred) - preferred);
  const yearsFit = clamp(1 - yearGap * 0.2, 0.55, 1);
  const yearPenalty = (1 - yearsFit) * 0.2;

  let score = sigmoid((aavRatio - 1) * 10) - yearPenalty;
  score += ((clamp(params.interest, 0, 100) / 100) - 0.55) * 0.18;

  const seedKey = `${params.context.saveSeed}|${params.player.id}|${params.context.teamId}|${params.context.week}|${params.offer.years}|${offerAav}|${params.context.phase}`;
  const noise = (mulberry32(hashStr(seedKey))() - 0.5) * 0.08;
  score = clamp(score + noise, 0, 1);

  const ovr = Number(params.player.overall ?? 65);
  let threshold = 0.62;
  if (ovr >= 92) threshold += 0.1;
  else if (ovr >= 86) threshold += 0.07;
  else if (ovr >= 80) threshold += 0.05;
  if (params.interest < 45) threshold += 0.05;

  if (aavRatio < 0.85) {
    const canRarelyAccept = params.interest >= 85 && yearsFit >= 0.92;
    if (!canRarelyAccept) score = Math.min(score, 0.05);
  }

  const accepted = score >= threshold;

  let deltaInterest = accepted ? 2 : -(6 + clamp((1 - aavRatio) * 20, 0, 10) + Math.min(6, Number(params.rejectionCount ?? 0) * 2));

  let recovery = 0;
  if (params.priorOfferAav && params.priorOfferAav > 0 && offerAav >= params.priorOfferAav * 1.1) {
    const improvementPct = (offerAav - params.priorOfferAav) / params.priorOfferAav;
    recovery = clamp(improvementPct * 40, 3, 10);
    if (!accepted) recovery = Math.min(recovery, Math.abs(deltaInterest) * 0.6);
  }

  const interestBefore = clamp(params.interest, 0, 100);
  const deltaApplied = deltaInterest + recovery;
  const interestAfter = clamp(interestBefore + deltaApplied, 0, 100);

  let reason = "Competitive offer";
  if (accepted && aavRatio >= 1.05 && yearsFit >= 0.92) reason = "Strong AAV + term";
  if (!accepted) {
    const yearDiff = Number(params.offer.years ?? preferred) - preferred;
    const deficits = [
      { reason: "Too low vs market", score: Math.max(0, 1 - aavRatio) * 1.2 },
      { reason: "Wants more years", score: yearDiff < 0 ? Math.abs(yearDiff) * 0.5 : 0 },
      { reason: "Prefers shorter deal", score: yearDiff > 0 ? Math.abs(yearDiff) * 0.5 : 0 },
      { reason: "Low interest in re-signing", score: params.interest < 45 ? (45 - params.interest) / 45 : 0 },
    ].sort((a, b) => b.score - a.score);
    reason = deficits[0]?.reason ?? "Too low vs market";
  }

  return {
    accepted,
    acceptanceScore: score,
    threshold,
    askAav,
    offerAav,
    aavRatio,
    reason,
    interestBefore,
    interestAfter,
    deltaInterest: interestAfter - interestBefore,
  };
}
