import { getContracts, getPlayers, type PlayerRow } from "@/data/leagueDb";
import type { GameState, PlayerContractOverride } from "@/context/GameContext";

export type ContractSummary = {
  years: number;
  yearsRemaining: number;
  salary: number;
  proration: number;
  capHit: number;
  total: number;
  signingBonus: number;
  isOverride: boolean;
};

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

function proration(o: PlayerContractOverride): number {
  const years = Math.max(1, o.salaries.length);
  return Math.round((o.signingBonus / years) / 50_000) * 50_000;
}

export function capHitForOverride(o: PlayerContractOverride, season: number): number {
  const idx = season - o.startSeason;
  const salary = o.salaries[Math.max(0, Math.min(o.salaries.length - 1, idx))] ?? 0;
  return salary + proration(o);
}

export function getContractSummaryForPlayer(state: GameState, playerId: string): ContractSummary | null {
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

  const p = getPlayers().find((x) => String(x.playerId) === String(playerId));
  if (!p?.contractId) return null;

  const c = getContracts().find((x) => x.contractId === p.contractId);
  if (!c) return null;

  const years = c.startSeason && c.endSeason ? Math.max(1, c.endSeason - c.startSeason + 1) : 1;
  const yearsRemaining = c.endSeason ? Math.max(0, c.endSeason - state.season + 1) : 0;
  const salary = Number(c.salaryY1 ?? 0);
  const capHit = salary;

  return {
    years,
    yearsRemaining,
    salary,
    proration: 0,
    capHit,
    total: salary * years,
    signingBonus: 0,
    isOverride: false,
  };
}

export function getEffectivePlayers(state: GameState): PlayerRow[] {
  return getPlayers().map((p) => {
    const pid = String(p.playerId);
    const teamId = state.playerTeamOverrides[pid] ?? p.teamId;
    return { ...p, teamId };
  });
}

export function getEffectivePlayersByTeam(state: GameState, teamId: string): PlayerRow[] {
  const t = String(teamId);
  return getEffectivePlayers(state).filter((p) => String(p.teamId ?? "") === t);
}

export function getEffectivePlayer(state: GameState, playerId: string): PlayerRow | undefined {
  return getEffectivePlayers(state).find((p) => String(p.playerId) === String(playerId));
}

export function getEffectiveFreeAgents(state: GameState): PlayerRow[] {
  return getEffectivePlayers(state).filter((p) => String(p.teamId ?? "").toUpperCase() === "FREE_AGENT");
}

export function getDepthSlotLabel(state: GameState, playerId: string): string | null {
  for (const [slot, pid] of Object.entries(state.depthChart.startersByPos)) {
    if (String(pid ?? "") === String(playerId)) return slot;
  }
  return null;
}
