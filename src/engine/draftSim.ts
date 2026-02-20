import leagueDbJson from "@/data/leagueDB.json";
import type { Prospect } from "@/engine/offseasonData";
import { hashSeed, mulberry32 } from "@/engine/rng";
import { getGmTraits, type GmScoutTraits } from "@/engine/gmScouting";

type DraftOrderRow = { season: number; round: number; pick: number; teamId: string };
type PersonnelRow = { personId: string; teamId?: string; role?: string };

export type DraftPickSlot = {
  overall: number;
  round: number;
  pickInRound: number;
  teamId: string;
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

export type DraftSimState = {
  season: number;
  userTeamId: string;
  slots: DraftPickSlot[];
  cursor: number;
  selections: DraftSelection[];
  takenProspectIds: Record<string, true>;
  userProspectIds: string[];
  complete: boolean;
  lastResolvedOverall?: number;
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

export function getDraftOrderSlots(season: number): DraftPickSlot[] {
  const rows = (leagueDbJson as any).DraftOrder as DraftOrderRow[];
  const forSeason = rows.filter((r) => Number(r.season) === Number(season));
  forSeason.sort((a, b) => a.round - b.round || a.pick - b.pick);

  const slots: DraftPickSlot[] = [];
  let overall = 1;
  for (const r of forSeason) {
    slots.push({
      overall,
      round: Number(r.round),
      pickInRound: Number(r.pick),
      teamId: String(r.teamId),
    });
    overall += 1;
  }
  return slots;
}

export function getTeamGmPersonId(teamId: string): string | undefined {
  const ppl = (leagueDbJson as any).Personnel as PersonnelRow[];
  const gm = ppl.find((p) => String(p.role) === "GENERAL_MANAGER" && String(p.teamId) === String(teamId));
  return gm?.personId ? String(gm.personId) : undefined;
}

export function getGmTraitsByTeam(teamId: string): GmScoutTraits {
  const pid = getTeamGmPersonId(teamId);
  return getGmTraits(pid);
}

export function initDraftSim(args: { saveSeed: number; season: number; userTeamId: string }): DraftSimState {
  const slots = getDraftOrderSlots(args.season);
  return {
    season: args.season,
    userTeamId: args.userTeamId,
    slots,
    cursor: 0,
    selections: [],
    takenProspectIds: {},
    userProspectIds: [],
    complete: slots.length === 0,
  };
}

function prospectSignals(p: Prospect) {
  const pos = s((p as any).pos ?? (p as any).POS ?? (p as any).position).toUpperCase();
  const tier = s((p as any).tier ?? (p as any).DraftTier ?? (p as any).draftTier).toLowerCase();
  const rank = num((p as any).rank ?? (p as any).Rank, 200);
  const forty = num((p as any)["40"] ?? (p as any).forty, 4.85);

  const isDefense = ["CB", "S", "LB", "EDGE", "DL"].includes(pos);
  const isTrenches = ["OL", "DL", "EDGE"].includes(pos);
  const eliteTraitSignal = rank <= 10 || tier.includes("top 5") || tier.includes("1st");
  const ceilingSignal = rank <= 25 || tier.includes("top 5") || tier.includes("1st");

  const rasSignal = (() => {
    const v = 5.05 - forty;
    return clamp(v / 0.8, 0, 1);
  })();

  return {
    pos,
    isDefense,
    isTrenches,
    eliteTraitSignal: eliteTraitSignal ? 1 : 0,
    ceilingSignal: ceilingSignal ? 1 : 0,
    rasSignal,
    riskSignal: 0,
  };
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

function posToNeedBucket(pos: string): string {
  const p = pos.toUpperCase();
  if (p === "QB") return "QB";
  if (["RB"].includes(p)) return "RB";
  if (["WR"].includes(p)) return "WR";
  if (["TE"].includes(p)) return "TE";
  if (["OL", "OT", "OG", "C"].includes(p)) return "OL";
  if (["DL", "DT", "NT"].includes(p)) return "DL";
  if (["EDGE", "DE"].includes(p)) return "EDGE";
  if (["LB", "MLB", "OLB", "ILB"].includes(p)) return "LB";
  if (["CB"].includes(p)) return "CB";
  if (["S", "FS", "SS"].includes(p)) return "S";
  if (["K"].includes(p)) return "K";
  if (["P"].includes(p)) return "P";
  return p;
}

export function computeDraftNeedsIndex(args: {
  teamId: string;
  rosterCountsByBucket: Record<string, number>;
  draftedCountsByBucket: Record<string, number>;
}) {
  const baseMin: Record<string, number> = {
    QB: 2,
    RB: 3,
    WR: 5,
    TE: 3,
    OL: 8,
    DL: 4,
    EDGE: 3,
    LB: 5,
    CB: 5,
    S: 4,
    K: 1,
    P: 1,
  };

  const out: Record<string, number> = {};
  for (const k of Object.keys(baseMin)) {
    const have = (args.rosterCountsByBucket[k] ?? 0) + (args.draftedCountsByBucket[k] ?? 0);
    const need = clamp((baseMin[k] - have) / Math.max(1, baseMin[k]), 0, 1);
    out[k] = need;
  }
  return out;
}

export function pickCpuProspect(args: {
  saveSeed: number;
  season: number;
  teamId: string;
  slot: DraftPickSlot;
  prospects: Prospect[];
  availableIds: Record<string, true>;
  rosterCountsByBucket: Record<string, number>;
  draftedCountsByBucket: Record<string, number>;
}): Prospect | null {
  const gm = getGmTraitsByTeam(args.teamId);
  const needs = computeDraftNeedsIndex({
    teamId: args.teamId,
    rosterCountsByBucket: args.rosterCountsByBucket,
    draftedCountsByBucket: args.draftedCountsByBucket,
  });

  const sigma = sigmaFromGm(gm);

  let best: { p: Prospect; score: number; tiebreak: number } | null = null;

  for (const p of args.prospects) {
    const pid = s((p as any).prospectId ?? (p as any).prospect_id ?? (p as any).id ?? (p as any)["Player ID"]);
    if (!pid || !args.availableIds[pid]) continue;

    const rank = num((p as any).rank ?? (p as any).Rank, 200);
    const vTrue = trueValueFromRank(rank);
    const sig = prospectSignals(p);
    const bucket = posToNeedBucket(sig.pos);
    const needAtPos = needs[bucket] ?? 0;

    const bias = biasForProspect(gm, sig, needAtPos);
    const r = mulberry32(hashSeed(args.saveSeed, "DRAFT_GM_NOISE", args.season, args.teamId, pid))();
    const z = (r - 0.5) * 2;
    const noise = z * sigma;

    const vScouted = vTrue + bias + noise;
    const score = vScouted + needAtPos * 3.5 + (gm.bias_value - 50) * 0.01;

    const tiebreak = mulberry32(hashSeed(args.saveSeed, "DRAFT_TB", args.season, args.teamId, pid))();

    if (!best || score > best.score || (score === best.score && tiebreak > best.tiebreak)) {
      best = { p, score, tiebreak };
    }
  }

  return best?.p ?? null;
}

export function applySelection(args: {
  state: DraftSimState;
  slot: DraftPickSlot;
  prospect: Prospect;
}): DraftSimState {
  const pid = s((args.prospect as any).prospectId ?? (args.prospect as any).prospect_id ?? (args.prospect as any).id ?? (args.prospect as any)["Player ID"]);
  const name = s((args.prospect as any).name ?? (args.prospect as any).Name);
  const pos = s((args.prospect as any).pos ?? (args.prospect as any).POS).toUpperCase();
  const rank = num((args.prospect as any).rank ?? (args.prospect as any).Rank, 200);

  const sel: DraftSelection = {
    overall: args.slot.overall,
    round: args.slot.round,
    pickInRound: args.slot.pickInRound,
    teamId: args.slot.teamId,
    prospectId: pid,
    name,
    pos,
    rank,
  };

  const taken = { ...args.state.takenProspectIds, [pid]: true };
  const selections = [...args.state.selections, sel];
  const userProspects =
    args.slot.teamId === args.state.userTeamId ? [...args.state.userProspectIds, pid] : args.state.userProspectIds;

  const nextCursor = args.state.cursor + 1;
  const complete = nextCursor >= args.state.slots.length;

  return {
    ...args.state,
    selections,
    takenProspectIds: taken,
    userProspectIds: userProspects,
    cursor: nextCursor,
    complete,
    lastResolvedOverall: args.slot.overall,
  };
}

export function cpuAdvanceUntilUser(args: {
  saveSeed: number;
  sim: DraftSimState;
  prospects: Prospect[];
  rosterCountsByTeamBucket: Record<string, Record<string, number>>;
  draftedCountsByTeamBucket: Record<string, Record<string, number>>;
}): {
  sim: DraftSimState;
  draftedCountsByTeamBucket: Record<string, Record<string, number>>;
} {
  let sim = args.sim;
  const drafted = { ...args.draftedCountsByTeamBucket };

  const availableIds: Record<string, true> = {};
  for (const p of args.prospects) {
    const pid = s((p as any).prospectId ?? (p as any).prospect_id ?? (p as any).id ?? (p as any)["Player ID"]);
    if (!pid) continue;
    if (sim.takenProspectIds[pid]) continue;
    availableIds[pid] = true;
  }

  while (!sim.complete) {
    const slot = sim.slots[sim.cursor];
    if (!slot) return { sim: { ...sim, complete: true }, draftedCountsByTeamBucket: drafted };
    if (slot.teamId === sim.userTeamId) break;

    const teamId = slot.teamId;
    const rosterCounts = args.rosterCountsByTeamBucket[teamId] ?? {};
    const draftedCounts = drafted[teamId] ?? {};
    const pick = pickCpuProspect({
      saveSeed: args.saveSeed,
      season: sim.season,
      teamId,
      slot,
      prospects: args.prospects,
      availableIds,
      rosterCountsByBucket: rosterCounts,
      draftedCountsByBucket: draftedCounts,
    });

    if (!pick) {
      sim = { ...sim, complete: true };
      break;
    }

    const pid = s((pick as any).prospectId ?? (pick as any).prospect_id ?? (pick as any).id ?? (pick as any)["Player ID"]);
    delete availableIds[pid];

    sim = applySelection({ state: sim, slot, prospect: pick });

    const pos = s((pick as any).pos ?? (pick as any).POS).toUpperCase();
    const bucket = posToNeedBucket(pos);
    drafted[teamId] = { ...draftedCounts, [bucket]: (draftedCounts[bucket] ?? 0) + 1 };
  }

  return { sim, draftedCountsByTeamBucket: drafted };
}
