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

function proration(o: PlayerContractOverride): number {
  const years = Math.max(1, o.salaries.length);
  return Math.round((o.signingBonus / years) / 50_000) * 50_000;
}

export function capHitForOverride(o: PlayerContractOverride, season: number): number {
  const idx = season - o.startSeason;
  const salary = o.salaries[Math.max(0, Math.min(o.salaries.length - 1, idx))] ?? 0;
  return salary + proration(o);
}

export function getContractSummaryForPlayer(state: GameState, playerId: string) {
  const o = state.playerContractOverrides[playerId];
  if (o) {
    const years = Math.max(1, o.salaries.length);
    const idx = state.season - o.startSeason;
    const salary = o.salaries[Math.max(0, Math.min(o.salaries.length - 1, idx))] ?? 0;
    const pro = proration(o);
    const capHit = salary + pro;
    const total = o.salaries.reduce((a, b) => a + b, 0) + o.signingBonus;
    const yearsRemaining = Math.max(0, o.endSeason - state.season + 1);
    return { years, yearsRemaining, salary, proration: pro, capHit, total, signingBonus: o.signingBonus, isOverride: true };
  }

  const p = getPlayers().find((x: any) => String(x.playerId) === String(playerId));
  if (!p?.contractId) return null;
  const c = getContracts().find((x: any) => x.contractId === p.contractId);
  if (!c) return null;
  const years = c.startSeason && c.endSeason ? Math.max(1, c.endSeason - c.startSeason + 1) : 1;
  const yearsRemaining = c.endSeason ? Math.max(0, c.endSeason - state.season + 1) : 0;
  const salary = Number(c.salaryY1 ?? 0);
  return { years, yearsRemaining, salary, proration: 0, capHit: salary, total: salary * years, signingBonus: 0, isOverride: false };
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
