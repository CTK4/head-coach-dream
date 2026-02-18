import type { GameState } from "@/context/GameContext";
import { getEffectivePlayersByTeam, getContractSummaryForPlayer } from "@/engine/rosterOverlay";

const moneyRound = (n: number) => Math.round(n / 50_000) * 50_000;

export function computeDeadCapNextYear(state: GameState, _teamId: string): number {
  return moneyRound(Number(state.finances.deadCapNextYear ?? 0));
}

export function computeDeadCapThisYear(state: GameState, _teamId: string): number {
  return moneyRound(Number(state.finances.deadCapThisYear ?? 0));
}

export function computeCapLedger(state: GameState, teamId: string) {
  const roster = getEffectivePlayersByTeam(state, teamId).map((p: any) => ({
    p,
    s: getContractSummaryForPlayer(state, String(p.playerId)),
  }));

  const deadItems = roster
    .filter((r) => (r.s?.deadCapIfCutNow ?? 0) > 0)
    .map((r) => ({
      playerId: String(r.p.playerId),
      name: String(r.p.fullName ?? "Unknown"),
      pos: String(r.p.pos ?? "UNK"),
      deadNow: moneyRound(r.s?.deadCapIfCutNow ?? 0),
      proration: moneyRound(r.s?.prorationPerYear ?? 0),
      bonusRemaining: moneyRound(r.s?.deadCapIfCutNow ?? 0),
    }))
    .sort((a, b) => b.deadNow - a.deadNow)
    .slice(0, 25);

  return {
    cap: state.finances.cap,
    committed: state.finances.capCommitted,
    capSpace: state.finances.capSpace,
    deadThisYear: computeDeadCapThisYear(state, teamId),
    deadNextYear: computeDeadCapNextYear(state, teamId),
    deadItems,
  };
}
