import type { GameState, PlayerContractOverride } from "@/context/GameContext";
import { getPlayers, getContracts } from "@/data/leagueDb";

export function normalizePos(pos: string): string {
  const p = String(pos ?? "").toUpperCase();
  if (p === "HB") return "RB";
  if (["OLB", "ILB", "MLB"].includes(p)) return "LB";
  if (["FS", "SS"].includes(p)) return "S";
  if (p === "DB") return "CB";
  if (p === "DT") return "DL";
  if (p === "DE") return "EDGE";
  if (["OT", "OG", "C", "OL"].includes(p)) return "OL";
  return p || "UNK";
}

const SLOT_TEMPLATES: Record<string, string[]> = {
  QB: ["QB1", "QB2", "QB3"],
  RB: ["RB1", "RB2", "RB3"],
  WR: ["WR1", "WR2", "WR3", "WR4", "WR5"],
  TE: ["TE1", "TE2", "TE3"],
  OL: ["LT", "LG", "C", "RG", "RT", "OL6", "OL7"],
  DL: ["DT1", "DT2", "DL3", "DL4"],
  EDGE: ["EDGE1", "EDGE2", "EDGE3"],
  LB: ["LB1", "LB2", "LB3"],
  CB: ["CB1", "CB2", "CB3", "CB4"],
  S: ["FS", "SS", "S3"],
  K: ["K"],
  P: ["P"],
};

function round50k(v: number): number {
  return Math.round(v / 50_000) * 50_000;
}

function sumObj(vals: Record<number, number> | undefined, from: number, to: number) {
  if (!vals) return 0;
  let s = 0;
  for (let y = from; y <= to; y++) s += Number(vals[y] ?? 0);
  return s;
}

function buildCapHitBySeason(
  startSeason: number,
  endSeason: number,
  salaries: number[],
  prorationBySeason?: Record<number, number>,
  fallbackProrationPerYear?: number,
): Record<number, number> {
  const out: Record<number, number> = {};
  const years = Math.max(1, endSeason - startSeason + 1);
  for (let i = 0; i < years; i++) {
    const y = startSeason + i;
    const sal = salaries[Math.max(0, Math.min(salaries.length - 1, i))] ?? 0;
    const bonus = prorationBySeason?.[y] ?? (fallbackProrationPerYear ?? 0);
    out[y] = round50k(Number(sal ?? 0) + Number(bonus ?? 0));
  }
  return out;
}

export function capHitForOverride(o: PlayerContractOverride, season: number): number {
  const years = Math.max(1, o.endSeason - o.startSeason + 1);
  const idx = season - o.startSeason;
  const salary = o.salaries[Math.max(0, Math.min(o.salaries.length - 1, idx))] ?? 0;
  const bonus = o.prorationBySeason?.[season] ?? (o.signingBonus > 0 ? round50k(o.signingBonus / years) : 0);
  return round50k(Number(salary ?? 0) + Number(bonus ?? 0));
}

export function getContractSummaryForPlayer(state: GameState, playerId: string) {
  const depthSlotLabel = getDepthSlotLabel(state, playerId);
  const o = state.playerContractOverrides[playerId];
  if (o) {
    const startSeason = o.startSeason;
    const endSeason = o.endSeason;
    const years = Math.max(1, endSeason - startSeason + 1);
    const idx = Math.max(0, Math.min(o.salaries.length - 1, state.season - startSeason));
    const salary = Number(o.salaries[idx] ?? 0);

    const fallbackProrationPerYear = o.signingBonus > 0 ? round50k(o.signingBonus / years) : 0;
    const capHitBySeason = buildCapHitBySeason(startSeason, endSeason, o.salaries, o.prorationBySeason, fallbackProrationPerYear);
    const capHit = round50k(capHitBySeason[state.season] ?? 0);

    const yearsRemaining = Math.max(0, endSeason - state.season + 1);
    const totalValue = o.salaries.reduce((a, b) => a + (Number(b) || 0), 0) + Number(o.signingBonus ?? 0);

    const bonusRemaining = o.prorationBySeason
      ? sumObj(o.prorationBySeason, state.season, endSeason)
      : Math.max(0, Number(o.signingBonus ?? 0) - fallbackProrationPerYear * Math.max(0, state.season - startSeason));

    const deadCapIfCutNow = round50k(bonusRemaining);
    const prorationPerYear = o.prorationBySeason
      ? round50k(sumObj(o.prorationBySeason, state.season, endSeason) / Math.max(1, yearsRemaining))
      : fallbackProrationPerYear;

    return {
      startSeason,
      endSeason,
      years,
      yearsRemaining,
      salary,
      proration: prorationPerYear,
      capHit,
      capHitBySeason,
      signingBonus: Number(o.signingBonus ?? 0),
      prorationPerYear,
      total: totalValue,
      totalValue,
      deadCapIfCutNow,
      isOverride: true,
      depthSlotLabel,
    };
  }

  const p = getPlayers().find((x: any) => String(x.playerId) === String(playerId));
  if (!p?.contractId) return null;
  const c = getContracts().find((x: any) => x.contractId === p.contractId);
  if (!c) return null;

  const startSeason = Number(c.startSeason ?? state.season);
  const endSeason = Number(c.endSeason ?? startSeason);
  const years = Math.max(1, endSeason - startSeason + 1);
  const idx = Math.max(0, Math.min(3, state.season - startSeason));
  const salByIdx = [Number(c.salaryY1 ?? 0), Number(c.salaryY2 ?? 0), Number(c.salaryY3 ?? 0), Number(c.salaryY4 ?? 0)];
  const salary = Number(salByIdx[idx] ?? 0);
  const capHitBySeason: Record<number, number> = {};
  for (let i = 0; i < years; i++) capHitBySeason[startSeason + i] = round50k(salByIdx[Math.min(i, salByIdx.length - 1)] ?? 0);
  const yearsRemaining = Math.max(0, endSeason - state.season + 1);

  return {
    startSeason,
    endSeason,
    years,
    yearsRemaining,
    salary,
    proration: 0,
    capHit: round50k(salary),
    capHitBySeason,
    total: round50k(salByIdx.reduce((a, b) => a + Number(b || 0), 0)),
    totalValue: round50k(salByIdx.reduce((a, b) => a + Number(b || 0), 0)),
    signingBonus: 0,
    prorationPerYear: 0,
    deadCapIfCutNow: 0,
    isOverride: false,
    depthSlotLabel,
  };
}

export function getEffectivePlayers(state: GameState): any[] {
  return getPlayers().map((p: any) => ({ ...p, teamId: state.playerTeamOverrides[String(p.playerId)] ?? p.teamId }));
}
export function getEffectivePlayersByTeam(state: GameState, teamId: string): any[] {
  const t = String(teamId);
  return getEffectivePlayers(state).filter((p: any) => String(p.teamId ?? "") === t);
}
export function getEffectivePlayer(state: GameState, playerId: string): any | undefined {
  return getEffectivePlayers(state).find((p: any) => String(p.playerId) === String(playerId));
}
export function getEffectiveFreeAgents(state: GameState): any[] {
  return getEffectivePlayers(state).filter((p: any) => {
    const teamId = String(p.teamId ?? "").toUpperCase();
    const status = String(p.status ?? "").toUpperCase();
    return teamId === "" || teamId === "FREE_AGENT" || status === "FREE_AGENT";
  });
}

function bestByPos(players: any[], posList: string[]) {
  return players
    .filter((p) => posList.includes(String(p.pos ?? "").toUpperCase()))
    .slice()
    .sort((a, b) => Number(b.overall ?? 0) - Number(a.overall ?? 0));
}

export function buildDepthSlotsForTeam(state: GameState, teamId: string): Record<string, string> {
  const roster = getEffectivePlayersByTeam(state, teamId);
  const used = new Set<string>();
  const slots: Record<string, string> = {};

  const fill = (key: string, list: any[]) => {
    for (let i = 0; i < (SLOT_TEMPLATES[key] ?? []).length; i++) {
      const slot = SLOT_TEMPLATES[key][i];
      const p = list[i];
      if (!p) continue;
      slots[slot] = String(p.playerId);
      used.add(String(p.playerId));
    }
  };

  fill("QB", bestByPos(roster, ["QB"]));
  fill("RB", bestByPos(roster, ["RB", "HB", "FB"]));
  fill("WR", bestByPos(roster, ["WR"]));
  fill("TE", bestByPos(roster, ["TE"]));
  fill("EDGE", bestByPos(roster, ["EDGE", "DE"]));
  fill("LB", bestByPos(roster, ["LB", "OLB", "ILB", "MLB"]));
  fill("CB", bestByPos(roster, ["CB", "DB"]));
  fill("DL", bestByPos(roster, ["DL", "DT"]));
  fill("S", bestByPos(roster, ["S", "FS", "SS"]));
  fill("K", bestByPos(roster, ["K"]));
  fill("P", bestByPos(roster, ["P"]));

  return slots;
}

export function getDepthSlotLabel(state: GameState, playerId: string): string | null {
  const base = getPlayers().find((p: any) => String(p.playerId) === String(playerId));
  const teamId = state.playerTeamOverrides[playerId] ?? base?.teamId;
  if (!teamId || String(teamId).toUpperCase() === "FREE_AGENT") return null;

  const starters = state.depthChart?.startersByPos ?? {};
  for (const [slot, pid] of Object.entries(starters)) if (String(pid) === String(playerId)) return String(slot).toUpperCase();

  const slots = buildDepthSlotsForTeam(state, String(teamId));
  for (const [slot, pid] of Object.entries(slots)) if (String(pid) === String(playerId)) return slot;

  const p = getEffectivePlayer(state, playerId);
  if (!p) return null;
  const group = normalizePos(String(p.pos ?? "UNK"));
  const roster = getEffectivePlayersByTeam(state, String(teamId))
    .filter((x: any) => normalizePos(String(x.pos ?? "UNK")) === group)
    .slice()
    .sort((a, b) => Number(b.overall ?? 0) - Number(a.overall ?? 0));
  const idx = roster.findIndex((x: any) => String(x.playerId) === String(playerId));
  return idx >= 0 ? `${group}${idx + 1}` : null;
}
