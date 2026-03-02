import type { TradeProposal, TradeResponse } from "@/types/trades";
import { calculateTradeValue } from "@/systems/tradeValuation";

/**
 * Trade engine audit summary:
 * - Player value uses `playerTradeValue`: base `overall * 10` with an age multiplier (younger boosts, older discounts);
 *   this does not currently model contract dollars or explicit positional scarcity directly.
 * - Draft pick value is represented by `isPick` assets and valued via their `overall` field fallback (`300` default),
 *   so pick round/year offset handling is expected upstream when constructing pick assets.
 * - Existing AI willingness path is `decideTrade`, which computes package delta + context modifiers (team needs,
 *   redundancy, cap stress, rebuild/contend window, relationship/prestige) and returns accept probability + accepted bool.
 *   It does not natively produce explicit counter-offers.
 * - Existing primary signatures: `playerTradeValue`, `packageValue`, `deriveTeamContext`, and `decideTrade`.
 */
export type TradePlayer = {
  playerId: string;
  name: string;
  teamId: string;
  pos?: string;
  age?: number;
  overall?: number;
  isPick?: boolean;
};

export type TradePackage = {
  outgoing: TradePlayer[];
  incoming: TradePlayer[];
};

export type TeamContext = {
  needScoreByPos: Record<string, number>;
  capStress: number;
  windowScore: number;
  redundancyFlags: Record<string, boolean>;
  futurePickWeight: number;
  gmMode: "REBUILD" | "RELOAD" | "CONTEND";
};

/** Minimum starter counts by position used for need-score and redundancy calculations */
const MIN_STARTERS: Record<string, number> = {
  QB: 1, RB: 2, WR: 3, TE: 1, OL: 5, DL: 4, EDGE: 2, LB: 3, CB: 3, S: 2,
};

export type TradeDecision = {
  outgoingValue: number;
  incomingValue: number;
  delta: number;
  acceptProb: number;
  accepted: boolean;
  reason: string;
  reasons: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hash32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rand01(key: string): number {
  const h = hash32(key);
  return (h & 0xffffff) / 0x1000000;
}

export function playerTradeValue(p: TradePlayer): number {
  return calculateTradeValue({
    overall: Number(p.overall ?? 60),
    age: Number(p.age ?? 26),
    isPick: Boolean(p.isPick),
  }, { teamStage: "competitive", positionalNeed: 0.5 });
}

export function packageValue(players: TradePlayer[]): number {
  return players.reduce((s, p) => s + playerTradeValue(p), 0);
}

export function draftPickTradeValue(round: number, year: number, currentSeason: number): number {
  const roundBase: Record<number, number> = { 1: 900, 2: 650, 3: 450, 4: 300, 5: 220, 6: 160, 7: 120 };
  const base = roundBase[Math.max(1, Math.min(7, Number(round) || 7))] ?? 120;
  const yearOffset = Math.max(0, Number(year) - Number(currentSeason));
  const discount = Math.pow(0.88, yearOffset);
  return Math.round(base * discount);
}

export function deriveTeamContext(opts: {
  rosterByPos?: Record<string, number>;
  capTotal?: number;
  capUsed?: number;
  winPct?: number;
  gmMode?: "REBUILD" | "RELOAD" | "CONTEND";
  gmRelationship?: number;
  leaguePrestige?: number;
}): TeamContext {
  const capTotal = opts.capTotal ?? 200_000_000;
  const capUsed = opts.capUsed ?? 150_000_000;
  const capStress = clamp(capUsed / capTotal, 0, 1);

  const rosterByPos = opts.rosterByPos ?? {};
  const needScoreByPos: Record<string, number> = {};
  for (const [pos, minCount] of Object.entries(MIN_STARTERS)) {
    const have = rosterByPos[pos] ?? 0;
    needScoreByPos[pos] = clamp(1 - have / minCount, 0, 1);
  }

  const redundancyFlags: Record<string, boolean> = {};
  for (const [pos, have] of Object.entries(rosterByPos)) {
    const min = MIN_STARTERS[pos] ?? 1;
    redundancyFlags[pos] = have >= min * 2;
  }

  const gmMode = opts.gmMode ?? "CONTEND";
  const winPct = opts.winPct ?? 0.5;
  const windowScore = gmMode === "REBUILD" ? 0.2 : gmMode === "CONTEND" ? clamp(winPct + 0.2, 0, 1) : 0.5;
  const futurePickWeight = gmMode === "REBUILD" ? 1.4 : gmMode === "CONTEND" ? 0.7 : 1.0;

  return { needScoreByPos, capStress, windowScore, redundancyFlags, futurePickWeight, gmMode };
}

export function decideTrade(opts: {
  season: number;
  userTeamId: string;
  partnerTeamId: string;
  pkg: TradePackage;
  teamContext?: Partial<TeamContext> & { gmRelationship?: number; leaguePrestige?: number };
  hardRejectDeficitPct?: number;
  autoAcceptSurplusPct?: number;
}): TradeDecision {
  const outgoingValue = packageValue(opts.pkg.outgoing);
  const incomingValue = packageValue(opts.pkg.incoming);
  const ctx = opts.teamContext;
  const gmMode = ctx?.gmMode ?? "CONTEND";

  const reasons: string[] = [];
  const incomingQBs = opts.pkg.incoming.filter((p) => p.pos === "QB" && Number(p.overall ?? 0) >= 80);
  const qbRedundant = incomingQBs.length > 0 && (ctx?.redundancyFlags?.["QB"] ?? false);
  if (qbRedundant) reasons.push("Already have an elite QB on the roster.");

  const capStress = ctx?.capStress ?? 0;
  const incomingVetCap = opts.pkg.incoming
    .filter((p) => !p.isPick && Number(p.age ?? 0) >= 30)
    .reduce((s, p) => s + playerTradeValue(p), 0);
  const capPenalty = incomingVetCap * capStress * 0.15;
  if (capPenalty > 50 && capStress > 0.85) reasons.push("Cap stress makes absorbing this contract risky.");

  let needMultiplier = 1.0;
  for (const p of opts.pkg.incoming) {
    const pos = String(p.pos ?? "").toUpperCase();
    const need = ctx?.needScoreByPos?.[pos] ?? 0.5;
    needMultiplier = Math.max(needMultiplier, 1 + need * 0.3);
  }

  let lossMultiplier = 1.0;
  for (const p of opts.pkg.outgoing) {
    if (p.isPick) continue;
    const pos = String(p.pos ?? "").toUpperCase();
    const need = ctx?.needScoreByPos?.[pos] ?? 0.5;
    lossMultiplier = Math.max(lossMultiplier, 1 + need * 0.2);
  }

  let redundancyPenalty = 0;
  for (const p of opts.pkg.incoming) {
    if (p.isPick) continue;
    const pos = String(p.pos ?? "").toUpperCase();
    if (ctx?.redundancyFlags?.[pos]) {
      redundancyPenalty += playerTradeValue(p) * 0.1;
      if (!reasons.includes("Acquiring redundant depth.")) reasons.push("Acquiring redundant depth.");
    }
  }

  const windowScore = ctx?.windowScore ?? 0.5;
  const incomingImpact = opts.pkg.incoming.filter((p) => !p.isPick && Number(p.overall ?? 0) >= 75);
  const windowBonus = incomingImpact.length > 0 ? windowScore * 30 : 0;

  let pickBonus = 0;
  if (gmMode === "REBUILD") {
    const incomingPicks = opts.pkg.incoming.filter((p) => p.isPick);
    const futurePickWeight = ctx?.futurePickWeight ?? 1.4;
    pickBonus = incomingPicks.reduce((s, p) => s + playerTradeValue(p), 0) * (futurePickWeight - 1);
    const outgoingVetValue = opts.pkg.outgoing
      .filter((p) => !p.isPick && Number(p.age ?? 0) >= 28)
      .reduce((s, p) => s + playerTradeValue(p), 0);
    if (outgoingVetValue > 400) reasons.push("Rebuild mode: prioritizing future picks over veterans.");
  }

  const repRelationship = clamp(Number((ctx as any)?.gmRelationship ?? 50), 0, 100);
  const repPrestige = clamp(Number((ctx as any)?.leaguePrestige ?? 50), 0, 100);
  const repModifier = ((repRelationship - 50) * 0.012 + (repPrestige - 50) * 0.008) * Math.max(outgoingValue, incomingValue, 100);

  const tradeScore =
    incomingValue * needMultiplier
    - outgoingValue * lossMultiplier
    - redundancyPenalty
    - capPenalty
    + windowBonus
    + pickBonus
    + repModifier;

  const hardReject = opts.hardRejectDeficitPct ?? 0.18;
  const autoAccept = opts.autoAcceptSurplusPct ?? 0.12;
  const partnerGives = incomingValue;
  const partnerReceives = outgoingValue;

  if (partnerReceives > 0 && partnerGives < partnerReceives * (1 - hardReject)) {
    reasons.unshift("Offer is too light. Add value to get a deal done.");
    return { outgoingValue, incomingValue, delta: incomingValue - outgoingValue, acceptProb: 0, accepted: false, reason: reasons[0], reasons: reasons.slice(0, 2) };
  }

  if (qbRedundant) {
    return { outgoingValue, incomingValue, delta: incomingValue - outgoingValue, acceptProb: 0, accepted: false, reason: reasons[0], reasons: reasons.slice(0, 2) };
  }

  if (partnerReceives > 0 && partnerGives > partnerReceives * (1 + autoAccept) && tradeScore > 0) {
    return { outgoingValue, incomingValue, delta: incomingValue - outgoingValue, acceptProb: 1, accepted: true, reason: "Deal accepted. Value was clearly favorable.", reasons: [] };
  }

  const normalized = clamp(tradeScore / Math.max(outgoingValue, 100), -1, 1);
  const acceptProb = clamp(0.5 + normalized * 0.35, 0.1, 0.9);
  const key = `T|${opts.season}|${opts.userTeamId}|${opts.partnerTeamId}|out=${outgoingValue}|in=${incomingValue}`;
  const roll = rand01(key);
  const accepted = roll < acceptProb;

  if (!accepted && reasons.length === 0) reasons.push("Deal rejected. Adjust the package and try again.");

  return {
    outgoingValue,
    incomingValue,
    delta: incomingValue - outgoingValue,
    acceptProb,
    accepted,
    reason: accepted ? "Deal accepted." : reasons[0] ?? "Deal rejected.",
    reasons: accepted ? [] : reasons.slice(0, 2),
  };
}

function detectPrimaryNeed(aiTeam: any): string {
  const byPos: Record<string, number> = (aiTeam as any)?.rosterByPos ?? {};
  let bestPos = "WR";
  let bestNeed = -1;
  for (const [pos, min] of Object.entries(MIN_STARTERS)) {
    const have = Number(byPos[pos] ?? 0);
    const need = Math.max(0, Number(min) - have);
    if (need > bestNeed) {
      bestNeed = need;
      bestPos = pos;
    }
  }
  return bestPos;
}

function makeCounterProposal(proposal: TradeProposal, neededPos: string): TradeProposal {
  const counter: TradeProposal = {
    ...proposal,
    id: `${proposal.id}_CTR`,
    status: "COUNTERED",
    initiatorSide: {
      ...proposal.initiatorSide,
      players: [...proposal.initiatorSide.players],
      draftPicks: [...proposal.initiatorSide.draftPicks],
    },
    receiverSide: {
      ...proposal.receiverSide,
      players: [...proposal.receiverSide.players],
      draftPicks: [...proposal.receiverSide.draftPicks],
    },
  };

  const nextNeeded = (proposal as any).initiatorPlayerPool?.find((p: any) => !counter.initiatorSide.players.includes(String(p.playerId)) && String(p.pos ?? "").toUpperCase() === neededPos);
  if (nextNeeded) {
    counter.initiatorSide.players.push(String(nextNeeded.playerId));
  } else if (counter.initiatorSide.draftPicks.length > 0) {
    counter.initiatorSide.draftPicks = counter.initiatorSide.draftPicks.map((p, idx) => (idx === 0 ? { ...p, round: Math.max(1, Number(p.round) - 1) } : p));
  }

  return counter;
}

export function evaluateTradeProposal(proposal: TradeProposal, aiTeam: any, coach: { gmRelationship?: number }): TradeResponse {
  const needPos = detectPrimaryNeed(aiTeam);
  const offersNeed = Boolean((proposal as any).offeredPositions?.includes?.(needPos));
  let fairUpper = 8;
  let fairLower = -5;
  if (offersNeed) {
    fairUpper += 5;
    fairLower -= 5;
  }

  const gmRel = Number((coach as any)?.gmRelationship ?? 50);
  if (gmRel >= 70) {
    fairUpper += 3;
    fairLower -= 3;
  } else if (gmRel < 40) {
    fairUpper -= 5;
    fairLower += 5;
  }

  const d = Number(proposal.valueDelta ?? 0);
  if (d <= fairLower) {
    return { decision: "ACCEPT", message: "We like this value on our side. Let's finalize it." };
  }

  if (d > fairUpper) {
    const counter = makeCounterProposal(proposal, needPos);
    const hardReject = d > fairUpper + 8;
    if (hardReject) {
      return { decision: "REJECT", message: "That's too light for us. Add serious value and come back." };
    }
    return { decision: "COUNTER", counterProposal: counter, message: `We're interested, but we need more at ${needPos}.` };
  }

  const roll = rand01(`${proposal.id}|${d}|${needPos}|${gmRel}`);
  if (roll <= 0.6) return { decision: "ACCEPT", message: "Fair value. Deal accepted." };
  return { decision: "COUNTER", counterProposal: makeCounterProposal(proposal, needPos), message: "Close, but we'd like a small adjustment." };
}
