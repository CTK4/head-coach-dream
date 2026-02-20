import leagueDbJson from "@/data/leagueDB.json";
import draftClassJson from "@/data/draftClass.json";
import { getGmTraits, type GmScoutTraits } from "@/engine/gmScouting";
import { hashSeed, mulberry32 } from "@/engine/rng";

export type DraftClassRow = {
  "Player ID": number;
  Rank: number;
  Name: string;
  POS: string;
  College?: string;
  DraftTier?: string;
  Age?: number;
  "40"?: number;
};

export type Prospect = {
  prospectId: string;
  rank: number;
  name: string;
  pos: string;
  college: string;
  tier: string;
  age: number;
  forty: number | null;
};

export type DraftPickSlot = {
  overall: number;
  round: number;
  pickInRound: number;
  teamId: string;
  originalTeamId: string;
};

export type DraftSelection = {
  overall: number;
  round: number;
  pickInRound: number;
  teamId: string;
  prospectId: string;
  name: string;
  pos: string;
  rank: number;
};

export type DraftTradeOffer = {
  offerId: string;
  source: "INCOMING" | "OUTGOING";
  direction: "DOWN" | "UP";
  fromTeamId: string;
  toTeamId: string;
  give: DraftPickSlot[];
  receive: DraftPickSlot[];
  valueGive: number;
  valueReceive: number;
  note: string;
};

export type TradeUpOutcome =
  | { status: "ACCEPTED"; message: string; appliedSim: DraftSimState }
  | { status: "COUNTERED"; message: string; counter: DraftTradeOffer }
  | { status: "DECLINED"; message: string };

export type DraftSimState = {
  season: number;
  userTeamId: string;
  slots: DraftPickSlot[];
  cursor: number;
  selections: DraftSelection[];
  takenProspectIds: Record<string, true>;
  tradeOffers: DraftTradeOffer[];
  complete: boolean;
  cpuCpuTradeCapsByRound: Record<number, number>;
  cpuCpuTradesByRound: Record<number, number>;
  cpuCpuTradesTotal: number;
};

type DraftOrderRow = { season: number; round: number; pick: number; teamId: string };
type DraftPicksRow = { season: number; round: number; originalTeamId: string; currentTeamId: string; isUsed: boolean };
type PersonnelRow = { personId: string; teamId?: string; role?: string };

const CPU_CPU_TRADE_DIST: Record<number, { avg: number; min: number; max: number }> = {
  1: { avg: 6, min: 4, max: 10 },
  2: { avg: 9, min: 7, max: 12 },
  3: { avg: 8, min: 6, max: 11 },
  4: { avg: 7, min: 5, max: 9 },
  5: { avg: 6, min: 4, max: 8 },
  6: { avg: 4, min: 2, max: 6 },
  7: { avg: 3, min: 1, max: 5 },
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function s(v: unknown) {
  return String(v ?? "");
}
function num(v: unknown, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function getDraftClass(): Prospect[] {
  const rows = draftClassJson as DraftClassRow[];
  return rows
    .map((r) => ({
      prospectId: String(r["Player ID"]),
      rank: num(r.Rank, 999),
      name: s(r.Name),
      pos: s(r.POS).toUpperCase(),
      college: s(r.College ?? "Unknown"),
      tier: s(r.DraftTier ?? ""),
      age: num(r.Age, 22),
      forty: Number.isFinite(Number(r["40"])) ? Number(r["40"]) : null,
    }))
    .sort((a, b) => a.rank - b.rank);
}

function initCpuCpuTradeCaps(saveSeed: number, season: number) {
  const caps: Record<number, number> = {};
  for (const r of Object.keys(CPU_CPU_TRADE_DIST).map(Number)) {
    const d = CPU_CPU_TRADE_DIST[r];
    const rng = mulberry32(hashSeed(saveSeed, "CPU_CPU_TRADE_CAP", season, r));
    const jitter = Math.round((rng() - 0.5) * 4);
    caps[r] = clamp(d.avg + jitter, d.min, d.max);
  }
  return caps;
}

export function initDraftSim(args: { saveSeed: number; season: number; userTeamId: string }): DraftSimState {
  const slots = buildSlotsForSeason(args.season);
  return {
    season: args.season,
    userTeamId: args.userTeamId,
    slots,
    cursor: 0,
    selections: [],
    takenProspectIds: {},
    tradeOffers: [],
    complete: slots.length === 0,
    cpuCpuTradeCapsByRound: initCpuCpuTradeCaps(args.saveSeed, args.season),
    cpuCpuTradesByRound: {},
    cpuCpuTradesTotal: 0,
  };
}

function buildSlotsForSeason(season: number): DraftPickSlot[] {
  const order = (leagueDbJson as any).DraftOrder as DraftOrderRow[];
  const picks = (leagueDbJson as any).DraftPicks as DraftPicksRow[];

  const ord = order.filter((r) => Number(r.season) === season).sort((a, b) => a.round - b.round || a.pick - b.pick);

  const currentByOriginal: Record<string, string> = {};
  for (const p of picks) {
    if (Number(p.season) !== season || p.isUsed) continue;
    currentByOriginal[`${p.round}|${p.originalTeamId}`] = String(p.currentTeamId);
  }

  const out: DraftPickSlot[] = [];
  let overall = 1;
  for (const r of ord) {
    const originalTeamId = String(r.teamId);
    const cur = currentByOriginal[`${r.round}|${originalTeamId}`] ?? originalTeamId;
    out.push({ overall, round: Number(r.round), pickInRound: Number(r.pick), teamId: cur, originalTeamId });
    overall += 1;
  }
  return out;
}

function getTeamGmPersonId(teamId: string): string | undefined {
  const ppl = (leagueDbJson as any).Personnel as PersonnelRow[];
  const gm = ppl.find((p) => String(p.role) === "GENERAL_MANAGER" && String(p.teamId) === String(teamId));
  return gm?.personId ? String(gm.personId) : undefined;
}
function getGmTraitsByTeam(teamId: string): GmScoutTraits {
  return getGmTraits(getTeamGmPersonId(teamId));
}
function posBucket(pos: string) {
  const p = pos.toUpperCase();
  if (["OT", "OG", "C"].includes(p)) return "OL";
  if (["DT", "NT"].includes(p)) return "DL";
  if (["DE"].includes(p)) return "EDGE";
  if (["MLB", "ILB", "OLB"].includes(p)) return "LB";
  if (["FS", "SS"].includes(p)) return "S";
  return p;
}
function trueValueFromRank(rank: number) {
  return clamp(96 - (rank - 1) * 0.12, 66, 96);
}
function sigmaFromGm(gm: GmScoutTraits) {
  let sigmaBase = 6.5;
  sigmaBase -= gm.analytics_orientation * 0.03;
  sigmaBase -= gm.film_process * 0.02;
  sigmaBase -= gm.intel_network * 0.01;
  sigmaBase += gm.urgency_bias * 0.015;
  return clamp(sigmaBase, 2.5, 9.0);
}
function prospectSignals(p: Prospect) {
  const pos = p.pos.toUpperCase();
  const isDefense = ["CB", "S", "LB", "EDGE", "DL"].includes(pos);
  const isTrenches = ["OL", "DL", "EDGE"].includes(pos);
  const eliteTraitSignal = p.rank <= 10 ? 1 : 0;
  const ceilingSignal = p.rank <= 25 ? 1 : 0;
  const rasSignal = p.forty ? clamp((5.05 - p.forty) / 0.8, 0, 1) : 0.5;
  return { pos, isDefense, isTrenches, eliteTraitSignal, ceilingSignal, rasSignal, riskSignal: 0 };
}
function biasForProspect(gm: GmScoutTraits, sig: ReturnType<typeof prospectSignals>, teamNeedAtPos: number) {
  let b = 0;
  b += (gm.bias_star - 50) * sig.eliteTraitSignal * 0.06;
  b += (gm.bias_athleticism - 50) * sig.rasSignal * 0.05;
  b += (gm.bias_trenches - 50) * (sig.isTrenches ? 1 : 0) * 0.05;
  b += (gm.bias_defense - 50) * (sig.isDefense ? 1 : 0) * 0.04;
  b -= (gm.discipline - 50) * sig.riskSignal * 0.05;
  b += (gm.aggression - 50) * sig.ceilingSignal * 0.04;
  b += (gm.urgency_bias - 50) * teamNeedAtPos * 0.03;
  return clamp(b, -6, 6);
}

export function computeNeedsIndex(args: {
  rosterCountsByBucket: Record<string, number>;
  draftedCountsByBucket: Record<string, number>;
}) {
  const baseMin: Record<string, number> = { QB: 2, RB: 3, WR: 5, TE: 3, OL: 8, DL: 4, EDGE: 3, LB: 5, CB: 5, S: 4, K: 1, P: 1 };
  const out: Record<string, number> = {};
  for (const k of Object.keys(baseMin)) {
    const have = (args.rosterCountsByBucket[k] ?? 0) + (args.draftedCountsByBucket[k] ?? 0);
    out[k] = clamp((baseMin[k] - have) / Math.max(1, baseMin[k]), 0, 1);
  }
  return out;
}

export function pickCpuProspect(args: {
  saveSeed: number;
  season: number;
  teamId: string;
  prospects: Prospect[];
  takenProspectIds: Record<string, true>;
  rosterCountsByBucket: Record<string, number>;
  draftedCountsByBucket: Record<string, number>;
}) {
  const gm = getGmTraitsByTeam(args.teamId);
  const needs = computeNeedsIndex({ rosterCountsByBucket: args.rosterCountsByBucket, draftedCountsByBucket: args.draftedCountsByBucket });
  const sigma = sigmaFromGm(gm);
  let best: { p: Prospect; score: number; tie: number } | null = null;

  for (const p of args.prospects) {
    if (args.takenProspectIds[p.prospectId]) continue;
    const sig = prospectSignals(p);
    const bucket = posBucket(sig.pos);
    const needAtPos = needs[bucket] ?? 0;
    const vScouted =
      trueValueFromRank(p.rank) +
      biasForProspect(gm, sig, needAtPos) +
      (mulberry32(hashSeed(args.saveSeed, "DRAFT_GM_NOISE", args.season, args.teamId, p.prospectId))() - 0.5) * 2 * sigma;
    const score = vScouted + needAtPos * 3.5 + (gm.bias_value - 50) * 0.01;
    const tie = mulberry32(hashSeed(args.saveSeed, "DRAFT_TB", args.season, args.teamId, p.prospectId))();
    if (!best || score > best.score || (score === best.score && tie > best.tie)) best = { p, score, tie };
  }

  return best?.p ?? null;
}

export function applySelection(state: DraftSimState, slot: DraftPickSlot, prospect: Prospect): DraftSimState {
  const sel: DraftSelection = {
    overall: slot.overall,
    round: slot.round,
    pickInRound: slot.pickInRound,
    teamId: slot.teamId,
    prospectId: prospect.prospectId,
    name: prospect.name,
    pos: prospect.pos,
    rank: prospect.rank,
  };
  const cursor = state.cursor + 1;
  return {
    ...state,
    selections: [...state.selections, sel],
    takenProspectIds: { ...state.takenProspectIds, [prospect.prospectId]: true },
    cursor,
    complete: cursor >= state.slots.length,
    tradeOffers: [],
  };
}

function pickValue(overall: number) {
  return Math.round(3000 * Math.exp(-0.015 * (overall - 1)));
}
function listFuturePicksForTeam(sim: DraftSimState, teamId: string) {
  return sim.slots.slice(sim.cursor).filter((s0) => s0.teamId === teamId);
}
function listFuturePicksByTeam(sim: DraftSimState) {
  const byTeam: Record<string, DraftPickSlot[]> = {};
  for (const s0 of sim.slots.slice(sim.cursor)) (byTeam[s0.teamId] ??= []).push(s0);
  return byTeam;
}
function canCpuCpuTrade(sim: DraftSimState, round: number) {
  return (sim.cpuCpuTradesByRound[round] ?? 0) < (sim.cpuCpuTradeCapsByRound[round] ?? 0);
}
function markCpuCpuTrade(sim: DraftSimState, round: number): DraftSimState {
  return {
    ...sim,
    cpuCpuTradesTotal: sim.cpuCpuTradesTotal + 1,
    cpuCpuTradesByRound: { ...sim.cpuCpuTradesByRound, [round]: (sim.cpuCpuTradesByRound[round] ?? 0) + 1 },
  };
}

function buildTradeDownOffers(args: { saveSeed: number; sim: DraftSimState; count: number }) {
  const slot = args.sim.slots[args.sim.cursor];
  if (!slot || slot.teamId !== args.sim.userTeamId) return [];

  const byTeam = listFuturePicksByTeam(args.sim);
  const teams = Object.keys(byTeam)
    .filter((t) => t !== args.sim.userTeamId)
    .filter((t) => (byTeam[t]?.[0]?.overall ?? 0) > slot.overall)
    .sort((a, b) => byTeam[a][0].overall - byTeam[b][0].overall);

  const rng = mulberry32(hashSeed(args.saveSeed, "DRAFT_TRADE_DOWN_OFFERS", args.sim.season, slot.overall));
  const offers: DraftTradeOffer[] = [];
  const valueGive = pickValue(slot.overall);

  for (let i = 0; i < teams.length && offers.length < args.count; i += 1) {
    const fromTeamId = teams[i];
    const theirFirst = byTeam[fromTeamId][0];
    if (!theirFirst) continue;

    const candidates = byTeam[fromTeamId].slice(1, 7);
    let receive: DraftPickSlot[] = [theirFirst];
    if (candidates.length) {
      const add = candidates.reduce((best, c) => {
        const bDelta = Math.abs(valueGive - (pickValue(theirFirst.overall) + pickValue(best.overall)));
        const cDelta = Math.abs(valueGive - (pickValue(theirFirst.overall) + pickValue(c.overall)));
        return cDelta < bDelta ? c : best;
      }, candidates[0]);
      receive = [theirFirst, add];
    }
    const valueReceive = receive.reduce((acc, p) => acc + pickValue(p.overall), 0);
    if (valueReceive < valueGive * 0.88 || valueReceive > valueGive * 1.2) continue;

    offers.push({
      offerId: `DTO_DN_${slot.overall}_${fromTeamId}_${Math.floor(rng() * 1e9)}`,
      source: "INCOMING",
      direction: "DOWN",
      fromTeamId,
      toTeamId: args.sim.userTeamId,
      give: [slot],
      receive,
      valueGive,
      valueReceive,
      note: receive.length === 2 ? `Trade down to Overall ${theirFirst.overall} + extra pick` : `Trade down to Overall ${theirFirst.overall}`,
    });
  }

  offers.sort((a, b) => b.valueReceive - a.valueReceive);
  return offers;
}

function maybeIncomingTradeUpOffers(args: { saveSeed: number; sim: DraftSimState; count: number }) {
  const slot = args.sim.slots[args.sim.cursor];
  if (!slot || slot.teamId === args.sim.userTeamId) return [];
  if (mulberry32(hashSeed(args.saveSeed, "DRAFT_TRADE_UP_INCOMING_GATE", args.sim.season, slot.overall))() > 0.28) return [];

  const userPicks = listFuturePicksForTeam(args.sim, args.sim.userTeamId);
  const nextUser = userPicks[0];
  if (!nextUser || nextUser.overall - slot.overall > 14) return [];

  const candidatesToAdd = userPicks.filter((p) => p.overall > nextUser.overall).slice(0, 7);
  const rng = mulberry32(hashSeed(args.saveSeed, "DRAFT_TRADE_UP_INCOMING", args.sim.season, slot.overall, nextUser.overall));
  const valueNeed = pickValue(slot.overall);
  const offers: DraftTradeOffer[] = [];

  for (const add of candidatesToAdd) {
    if (offers.length >= args.count) break;
    const give = [nextUser, add];
    const valueGive = give.reduce((acc, p) => acc + pickValue(p.overall), 0);
    const theirFuture = listFuturePicksForTeam(args.sim, slot.teamId).filter((p) => p.overall > slot.overall).slice(0, 4);
    const back = rng() < 0.55 && theirFuture.length ? theirFuture[Math.floor(rng() * theirFuture.length)] : null;
    const receive = back ? [slot, back] : [slot];
    const valueReceive = receive.reduce((acc, p) => acc + pickValue(p.overall), 0);
    if (valueGive < valueNeed * 0.94 || valueGive > valueNeed * 1.35) continue;

    offers.push({
      offerId: `DTO_UP_IN_${slot.overall}_${args.sim.userTeamId}_${Math.floor(rng() * 1e9)}`,
      source: "INCOMING",
      direction: "UP",
      fromTeamId: slot.teamId,
      toTeamId: args.sim.userTeamId,
      give,
      receive,
      valueGive,
      valueReceive,
      note: back ? `Trade up to Overall ${slot.overall} (get back O${back.overall})` : `Trade up to Overall ${slot.overall}`,
    });
  }

  offers.sort((a, b) => a.valueGive - b.valueGive);
  return offers.slice(0, args.count);
}

export function generateTradeOffers(args: { saveSeed: number; sim: DraftSimState; count?: number }) {
  const slot = args.sim.slots[args.sim.cursor];
  if (!slot) return [];
  const n = args.count ?? 3;
  return slot.teamId === args.sim.userTeamId
    ? buildTradeDownOffers({ saveSeed: args.saveSeed, sim: args.sim, count: n })
    : maybeIncomingTradeUpOffers({ saveSeed: args.saveSeed, sim: args.sim, count: n });
}

export function applyTrade(sim: DraftSimState, offer: DraftTradeOffer): DraftSimState {
  const slot = sim.slots[sim.cursor];
  if (!slot) return sim;

  const map = new Map(sim.slots.map((s0) => [s0.overall, { ...s0 }]));

  if (offer.direction === "DOWN") {
    if (slot.teamId !== sim.userTeamId || !offer.give.some((p) => p.overall === slot.overall)) return sim;
    const cur = map.get(slot.overall);
    if (!cur) return sim;
    cur.teamId = offer.fromTeamId;
    for (const r of offer.receive) {
      const s0 = map.get(r.overall);
      if (s0) s0.teamId = sim.userTeamId;
    }
  }

  if (offer.direction === "UP") {
    if (slot.teamId === sim.userTeamId || !offer.receive.some((p) => p.overall === slot.overall)) return sim;
    const cur = map.get(slot.overall);
    if (!cur) return sim;
    cur.teamId = sim.userTeamId;
    for (const g of offer.give) {
      const s0 = map.get(g.overall);
      if (s0) s0.teamId = offer.fromTeamId;
    }
    for (const r of offer.receive) {
      if (r.overall === slot.overall) continue;
      const s0 = map.get(r.overall);
      if (s0) s0.teamId = sim.userTeamId;
    }
  }

  return { ...sim, slots: Array.from(map.values()).sort((a, b) => a.overall - b.overall), tradeOffers: [] };
}

function computeAcceptThreshold(gm: GmScoutTraits) {
  return 1.06 + (gm.bias_value - 50) * 0.002 - (gm.aggression - 50) * 0.0015 - (gm.urgency_bias - 50) * 0.001 + (gm.discipline - 50) * 0.001;
}

function evaluateUserOfferCore(args: { saveSeed: number; sim: DraftSimState; offer: DraftTradeOffer }) {
  const slot = args.sim.slots[args.sim.cursor];
  if (!slot || slot.teamId !== args.offer.fromTeamId) return { status: "DECLINED" as const, threshold: 0 };
  const rng = mulberry32(hashSeed(args.saveSeed, "CPU_EVAL_USER_OFFER", args.sim.season, slot.overall, args.offer.offerId));
  const ratio = args.offer.valueGive / Math.max(1, pickValue(slot.overall));
  const threshold = computeAcceptThreshold(getGmTraitsByTeam(slot.teamId)) + (rng() - 0.5) * 0.04;
  if (ratio >= threshold) return { status: "ACCEPTED" as const, threshold };
  if (ratio >= threshold * 0.8) return { status: "COUNTER" as const, threshold };
  return { status: "DECLINED" as const, threshold };
}

function buildCounterOffer(args: { saveSeed: number; sim: DraftSimState; offer: DraftTradeOffer; threshold: number }) {
  const slot = args.sim.slots[args.sim.cursor];
  if (!slot) return null;
  const rng = mulberry32(hashSeed(args.saveSeed, "CPU_COUNTER_USER_OFFER", args.sim.season, slot.overall, args.offer.offerId));
  const targetValue = pickValue(slot.overall) * (args.threshold + 0.02 + (rng() - 0.5) * 0.02);

  const userFuture = listFuturePicksForTeam(args.sim, args.sim.userTeamId).slice(0, 12);
  const offered = new Set(args.offer.give.map((p) => p.overall));
  const addPool = userFuture.filter((p) => !offered.has(p.overall));

  const give = [...args.offer.give];
  const receive = [slot];
  let valueGive = give.reduce((a, p) => a + pickValue(p.overall), 0);

  if (args.offer.receive.length <= 1) {
    for (const p of addPool) {
      if (give.length >= 5 || valueGive >= targetValue) break;
      give.push(p);
      valueGive += pickValue(p.overall);
    }
  }

  return {
    offerId: `DTO_UP_COUNTER_${slot.overall}_${args.sim.userTeamId}_${Math.floor(rng() * 1e9)}`,
    source: "INCOMING" as const,
    direction: "UP" as const,
    fromTeamId: slot.teamId,
    toTeamId: args.sim.userTeamId,
    give,
    receive,
    valueGive,
    valueReceive: pickValue(slot.overall),
    note: args.offer.receive.length <= 1 ? "Counter: add value to move up" : "Counter: no pick coming back",
  };
}

export function buildUserTradeUpOffer(args: {
  saveSeed: number;
  sim: DraftSimState;
  giveOveralls: number[];
  askBackOverall?: number | null;
}) {
  const slot = args.sim.slots[args.sim.cursor];
  if (!slot || slot.teamId === args.sim.userTeamId) return null;

  const userFuture = listFuturePicksForTeam(args.sim, args.sim.userTeamId);
  const cpuFuture = listFuturePicksForTeam(args.sim, slot.teamId);

  const give = args.giveOveralls
    .map((o) => userFuture.find((p) => p.overall === o))
    .filter(Boolean) as DraftPickSlot[];
  if (!give.length) return null;

  const receive: DraftPickSlot[] = [slot];
  if (args.askBackOverall) {
    const back = cpuFuture.find((p) => p.overall === args.askBackOverall);
    if (back && back.overall > slot.overall) receive.push(back);
  }

  const rng = mulberry32(hashSeed(args.saveSeed, "DRAFT_USER_TRADE_UP_OFFER", args.sim.season, slot.overall, give[0].overall));
  return {
    offerId: `DTO_UP_OUT_${slot.overall}_${args.sim.userTeamId}_${Math.floor(rng() * 1e9)}`,
    source: "OUTGOING" as const,
    direction: "UP" as const,
    fromTeamId: slot.teamId,
    toTeamId: args.sim.userTeamId,
    give,
    receive,
    valueGive: give.reduce((a, p) => a + pickValue(p.overall), 0),
    valueReceive: receive.reduce((a, p) => a + pickValue(p.overall), 0),
    note: receive.length > 1 ? `Offer: move to O${slot.overall} (ask back O${receive[1].overall})` : `Offer: move to O${slot.overall}`,
  };
}

export function submitUserTradeUpOffer(args: { saveSeed: number; sim: DraftSimState; offer: DraftTradeOffer }): TradeUpOutcome {
  const evalRes = evaluateUserOfferCore(args);
  if (evalRes.status === "ACCEPTED") {
    return { status: "ACCEPTED", message: "Trade accepted.", appliedSim: applyTrade(args.sim, args.offer) };
  }
  if (evalRes.status === "COUNTER") {
    const counter = buildCounterOffer({ saveSeed: args.saveSeed, sim: args.sim, offer: args.offer, threshold: evalRes.threshold });
    if (counter) return { status: "COUNTERED", message: "They want more to move down.", counter };
  }
  return { status: "DECLINED", message: "They aren't looking for that package." };
}

function tryCpuCpuTrade(args: {
  saveSeed: number;
  sim: DraftSimState;
  prospects: Prospect[];
  rosterCountsByTeamBucket: Record<string, Record<string, number>>;
  draftedCountsByTeamBucket: Record<string, Record<string, number>>;
}) {
  const slot = args.sim.slots[args.sim.cursor];
  if (!slot || slot.teamId === args.sim.userTeamId || !canCpuCpuTrade(args.sim, slot.round)) return args.sim;

  const rng = mulberry32(hashSeed(args.saveSeed, "CPU_CPU_TRADE_GATE", args.sim.season, slot.overall));
  if (rng() > 0.03) return args.sim;

  const gm = getGmTraitsByTeam(slot.teamId);
  const appetite = (gm.aggression + gm.urgency_bias - gm.discipline) / 200;
  if (rng() > clamp(appetite, 0.05, 0.65)) return args.sim;

  const candidates = args.sim.slots.slice(args.sim.cursor + 1, Math.min(args.sim.cursor + 11, args.sim.slots.length)).filter((s0) => s0.teamId !== args.sim.userTeamId);
  if (!candidates.length) return args.sim;
  const buyerSlot = candidates[Math.floor(rng() * candidates.length)];
  if (buyerSlot.teamId === slot.teamId) return args.sim;

  const pickForBuyer = pickCpuProspect({
    saveSeed: args.saveSeed,
    season: args.sim.season,
    teamId: buyerSlot.teamId,
    prospects: args.prospects,
    takenProspectIds: args.sim.takenProspectIds,
    rosterCountsByBucket: args.rosterCountsByTeamBucket[buyerSlot.teamId] ?? {},
    draftedCountsByBucket: args.draftedCountsByTeamBucket[buyerSlot.teamId] ?? {},
  });
  if (!pickForBuyer || pickForBuyer.rank > 18 || buyerSlot.overall - slot.overall > 8) return args.sim;

  const needExtra = pickValue(slot.overall) - pickValue(buyerSlot.overall);
  const buyerFuture = listFuturePicksForTeam(args.sim, buyerSlot.teamId).filter((p) => p.overall > buyerSlot.overall).slice(0, 6);
  const extra = buyerFuture.find((p) => pickValue(p.overall) >= needExtra * 0.45) ?? buyerFuture[0];
  if (!extra) return args.sim;

  const map = new Map(args.sim.slots.map((s0) => [s0.overall, { ...s0 }]));
  const a = map.get(slot.overall);
  const b = map.get(buyerSlot.overall);
  const e = map.get(extra.overall);
  if (!a || !b || !e) return args.sim;

  a.teamId = buyerSlot.teamId;
  b.teamId = slot.teamId;
  e.teamId = slot.teamId;

  return markCpuCpuTrade({ ...args.sim, slots: Array.from(map.values()).sort((x, y) => x.overall - y.overall) }, slot.round);
}

export function cpuAdvanceUntilUser(args: {
  saveSeed: number;
  state: DraftSimState;
  prospects: Prospect[];
  rosterCountsByTeamBucket: Record<string, Record<string, number>>;
  draftedCountsByTeamBucket: Record<string, Record<string, number>>;
}) {
  let sim = args.state;
  const drafted = { ...args.draftedCountsByTeamBucket };

  while (!sim.complete) {
    const slot = sim.slots[sim.cursor];
    if (!slot) return { sim: { ...sim, complete: true }, draftedCountsByTeamBucket: drafted };
    if (slot.teamId === sim.userTeamId) break;

    sim = tryCpuCpuTrade({ saveSeed: args.saveSeed, sim, prospects: args.prospects, rosterCountsByTeamBucket: args.rosterCountsByTeamBucket, draftedCountsByTeamBucket: drafted });

    const slot2 = sim.slots[sim.cursor];
    if (!slot2 || slot2.teamId === sim.userTeamId) break;

    const teamId = slot2.teamId;
    const draftedCounts = drafted[teamId] ?? {};
    const pick = pickCpuProspect({
      saveSeed: args.saveSeed,
      season: sim.season,
      teamId,
      prospects: args.prospects,
      takenProspectIds: sim.takenProspectIds,
      rosterCountsByBucket: args.rosterCountsByTeamBucket[teamId] ?? {},
      draftedCountsByBucket: draftedCounts,
    });
    if (!pick) return { sim: { ...sim, complete: true }, draftedCountsByTeamBucket: drafted };

    sim = applySelection(sim, slot2, pick);
    const b = posBucket(pick.pos);
    drafted[teamId] = { ...draftedCounts, [b]: (draftedCounts[b] ?? 0) + 1 };
  }

  return { sim, draftedCountsByTeamBucket: drafted };
}

export function upcomingUserPickSlots(sim: DraftSimState, max = 8) {
  const out: DraftPickSlot[] = [];
  for (let i = sim.cursor; i < sim.slots.length; i += 1) {
    const s0 = sim.slots[i];
    if (s0.teamId !== sim.userTeamId) continue;
    out.push(s0);
    if (out.length >= max) break;
  }
  return out;
}
