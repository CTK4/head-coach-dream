import type { GameState } from "@/context/GameContext";
import { getPlayers } from "@/data/leagueDb";
import { buildRosterIndex } from "./applyTransactions";
import { buildContractIndex } from "./contractIndex";

export function validatePostTx(state: GameState): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const roster = buildRosterIndex(state);
  const contracts = buildContractIndex(state);
  const seen = new Set<string>();

  for (const [teamId, pids] of Object.entries(roster.teamToPlayers)) {
    if (!teamId) errors.push("empty team bucket");
    for (const pid of pids) {
      if (seen.has(pid)) errors.push(`duplicate player ${pid}`);
      seen.add(pid);
    }
  }
  for (const pid of roster.freeAgents) {
    if (seen.has(pid)) errors.push(`duplicate player ${pid}`);
    seen.add(pid);
  }

  for (const p of getPlayers()) {
    const pid = String(p.playerId);
    if (!seen.has(pid)) errors.push(`missing player bucket ${pid}`);
  }

  for (const [pid, team] of Object.entries(roster.playerToTeam)) {
    if (team == null || String(team).trim() === "") errors.push(`null team ${pid}`);
  }

  // Only validate game-managed contracts (explicit overrides). Base DB contracts
  // may be stale/uninitialized and are intentionally excluded from validation.
  for (const [pid, c] of Object.entries(contracts)) {
    if (!(pid in (state.playerContractOverrides ?? {}))) continue;
    const team = roster.playerToTeam[pid];
    if (!team || team === "FREE_AGENT") continue;
    if (Number(c.endSeason) < Number(c.startSeason)) errors.push(`invalid contract span ${pid}`);
    if ((c.salaries ?? []).some((n) => !Number.isFinite(Number(n)))) errors.push(`invalid salary ${pid}`);
    if (!Number.isFinite(Number(c.signingBonus ?? 0))) errors.push(`invalid bonus ${pid}`);
    if (Number(c.endSeason) - Number(state.season) + 1 < 0) errors.push(`negative yearsRemaining ${pid}`);
  }

  if ((roster.freeAgents?.length ?? 0) < 0) errors.push("negative FA pool");
  return errors.length ? { ok: false, errors } : { ok: true };
}
