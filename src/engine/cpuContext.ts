import { getEffectivePlayersByTeam, normalizePos } from "@/engine/rosterOverlay";
import { computeCapLedger } from "@/engine/capLedger";
import { buildTeamProfile } from "@/models/teamProfile";
import type { CpuPlayer, CpuTeamContext } from "@/systems/cpuOffseasonAI";

const MIN_STARTERS: Record<string, number> = {
  QB: 1, RB: 2, WR: 3, TE: 1, OL: 5, DL: 4, EDGE: 2, LB: 3, CB: 3, S: 2,
};

const PLAYOFF_ROUND_MAP: Record<string, "missed" | "wc" | "div" | "conf" | "sb" | "champ"> = {
  WILD_CARD: "wc",
  DIVISIONAL: "div",
  CONF_FINALS: "conf",
  SUPER_BOWL: "sb",
};

function toCpuPlayer(p: any): CpuPlayer {
  return {
    playerId: String(p.playerId),
    pos: String(p.pos ?? "UNK"),
    age: Number(p.age ?? 26),
    overall: Number(p.overall ?? p.ovr ?? 60),
    devTrait: typeof p?.development?.trait === "string" ? p.development.trait : p.devTrait,
    yearsRemaining: Number(p.yearsRemaining ?? 0),
    capHit: Number(p.capHit ?? 0),
    deadCap: Number(p.deadCap ?? 0),
    marketValue: Number(p.marketValue ?? 0),
  };
}

export function buildCpuTeamContext(state: any, teamId: string): CpuTeamContext {
  const roster = getEffectivePlayersByTeam(state, teamId);
  const rosterByPos: Record<string, CpuPlayer[]> = {};
  for (const p of roster) {
    const pos = normalizePos(String((p as any)?.pos ?? "UNK"));
    (rosterByPos[pos] ??= []).push(toCpuPlayer(p));
  }

  const cap = computeCapLedger(state, teamId);
  const standing = state.league?.standings?.[teamId];
  const wins = Number(standing?.w ?? 0);
  const losses = Number(standing?.l ?? 0);
  const winPct = wins + losses > 0 ? wins / (wins + losses) : 0.5;
  const capTotal = Number(cap.capTotal ?? 0);
  const capUsed = Number(cap.capUsed ?? 0);
  const capSpace = Math.max(0, capTotal - capUsed);
  const avgRosterAge = roster.length ? roster.reduce((sum: number, p: any) => sum + Number(p.age ?? 26), 0) / roster.length : 26;

  const postseasonResult = state.league?.postseason?.resultsByTeamId?.[teamId];
  const playoffResult = postseasonResult?.isChampion
    ? "champ"
    : PLAYOFF_ROUND_MAP[String(postseasonResult?.eliminatedIn ?? "")] ?? "missed";

  const positionalNeeds: Record<string, number> = {};
  for (const [pos, min] of Object.entries(MIN_STARTERS)) {
    const have = (rosterByPos[pos] ?? []).length;
    positionalNeeds[pos] = Math.max(0, min - have);
  }

  const prior = state.seasonHistory?.at?.(-1);
  const priorWinPct = prior && Number(prior.wins) + Number(prior.losses) > 0
    ? Number(prior.wins) / (Number(prior.wins) + Number(prior.losses))
    : undefined;

  return {
    teamId,
    capSpace,
    capTotal,
    rosterByPos,
    profile: buildTeamProfile({
      winPct,
      capSpace,
      capTotal,
      avgRosterAge,
      playoffResult,
      positionalNeeds,
      priorWinPct,
    }),
  };
}
