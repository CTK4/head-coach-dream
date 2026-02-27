import type { GameState, PlayerContractOverride } from "@/context/GameContext";
import { getPlayerById, getContractById, getPlayers } from "@/data/leagueDb";

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

function parseMoney(value: unknown, fallback = 0): number {
  if (value == null) return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const cleaned = value.trim().replace(/\$/g, "").replace(/,/g, "").replace(/\s+/g, "");
    if (!cleaned) return fallback;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

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
  const salary = parseMoney(o.salaries[Math.max(0, Math.min(o.salaries.length - 1, idx))], 0);
  const bonus = o.prorationBySeason?.[season] ?? (o.signingBonus > 0 ? round50k(parseMoney(o.signingBonus, 0) / years) : 0);
  return round50k(salary + parseMoney(bonus, 0));
}

export function getContractSummaryForPlayer(state: GameState, playerId: string) {
  const depthSlotLabel = getDepthSlotLabel(state, playerId);
  const o = state.playerContractOverrides[playerId];
  if (o) {
    const startSeason = o.startSeason;
    const endSeason = o.endSeason;
    const years = Math.max(1, endSeason - startSeason + 1);
    const idx = Math.max(0, Math.min(o.salaries.length - 1, state.season - startSeason));
    const salary = parseMoney(o.salaries[idx], 0);

    const signingBonus = parseMoney(o.signingBonus, 0);
    const fallbackProrationPerYear = signingBonus > 0 ? round50k(signingBonus / years) : 0;

    const capHitBySeason = buildCapHitBySeason(
      startSeason,
      endSeason,
      o.salaries.map((x) => parseMoney(x, 0)),
      o.prorationBySeason,
      fallbackProrationPerYear,
    );

    const capHit = round50k(parseMoney(capHitBySeason[state.season], 0));
    const yearsRemaining = Math.max(0, endSeason - state.season + 1);

    const totalValue = o.salaries.reduce((a, b) => a + parseMoney(b, 0), 0) + signingBonus;

    const bonusRemaining = o.prorationBySeason
      ? sumObj(o.prorationBySeason, state.season, endSeason)
      : Math.max(0, signingBonus - fallbackProrationPerYear * Math.max(0, state.season - startSeason));

    const deadCapIfCutNow = round50k(parseMoney(bonusRemaining, 0));
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
      signingBonus,
      prorationPerYear,
      total: totalValue,
      totalValue,
      deadCapIfCutNow,
      isOverride: true,
      depthSlotLabel,
      apy: years > 0 ? round50k(totalValue / years) : 0,
    };
  }

  const p = getPlayerById(playerId);
  if (!p?.contractId) return null;
  const c = getContractById(p.contractId);
  if (!c) return null;

  const startSeason = parseMoney(c.startSeason, state.season);
  const endSeason = parseMoney(c.endSeason, startSeason);
  const years = Math.max(1, endSeason - startSeason + 1);
  const idx = Math.max(0, Math.min(3, state.season - startSeason));
  const salByIdx = [
    parseMoney((c as any).salaryY1, 0),
    parseMoney((c as any).salaryY2, 0),
    parseMoney((c as any).salaryY3, 0),
    parseMoney((c as any).salaryY4, 0),
  ];

  const salary = parseMoney(salByIdx[idx], 0);
  const capHitBySeason: Record<number, number> = {};
  for (let i = 0; i < years; i++) capHitBySeason[startSeason + i] = round50k(salByIdx[Math.min(i, salByIdx.length - 1)] ?? 0);
  const yearsRemaining = Math.max(0, endSeason - state.season + 1);
  const totalValue = round50k(salByIdx.reduce((a, b) => a + parseMoney(b, 0), 0));

  return {
    startSeason,
    endSeason,
    years,
    yearsRemaining,
    salary,
    proration: 0,
    capHit: round50k(salary),
    capHitBySeason,
    total: totalValue,
    totalValue,
    signingBonus: 0,
    prorationPerYear: 0,
    deadCapIfCutNow: 0,
    isOverride: false,
    depthSlotLabel,
    apy: years > 0 ? round50k(totalValue / years) : 0,
  };
}

export function getEffectivePlayers(state: GameState): any[] {
  const base = getPlayers().map((p: any) => {
    const playerId = String(p.playerId);
    const delta = Number(state.playerAgingDeltasById?.[playerId] ?? 0);
    const ageOffset = Number(state.playerAgeOffsetById?.[playerId] ?? 0);
    return {
      ...p,
      overall: Math.max(40, Math.min(99, Number(p.overall ?? 60) + delta)),
      age: Number(p.age ?? 22) + ageOffset,
      teamId: state.playerTeamOverrides[playerId] ?? p.teamId,
    };
  });

  const rookies = (state.rookies ?? []).map((r: any) => ({
    playerId: r.playerId,
    fullName: r.name,
    name: r.name,
    pos: String(r.pos ?? "UNK"),
    overall: Number(r.ovr ?? 60),
    age: Number(r.age ?? 22),
    teamId: state.playerTeamOverrides[String(r.playerId)] ?? String(r.teamId ?? ""),
    status: "ACTIVE",
    isRookie: true,
  }));

  return [...base, ...rookies];
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
    const playerId = String(p.playerId ?? "");
    if (state.franchiseTags[playerId]?.season && Number(state.franchiseTags[playerId].season) >= Number(state.season)) return false;
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
  const slots: Record<string, string> = {};

  const fill = (key: string, list: any[]) => {
    for (let i = 0; i < (SLOT_TEMPLATES[key] ?? []).length; i++) {
      const slot = SLOT_TEMPLATES[key][i];
      const p = list[i];
      if (!p) continue;
      slots[slot] = String(p.playerId);
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
  const base = getPlayerById(playerId);
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
