import type { GameState, PlayerContractOverride } from "@/context/GameContext";
import { getLeague } from "@/data/leagueDb";
import { getPlayers } from "@/data/leagueDb";
import { buildRosterIndex } from "./applyTransactions";
import { buildContractIndex } from "./contractIndex";

function getCurrentSeasonCapHit(contract: PlayerContractOverride | undefined, season: number): number {
  if (!contract) return 0;
  const startSeason = Number(contract.startSeason ?? season);
  const endSeason = Number(contract.endSeason ?? startSeason);
  const years = Math.max(1, endSeason - startSeason + 1);
  const salaryIndex = season - startSeason;
  const salary = Number(contract.salaries?.[salaryIndex] ?? 0);

  const proratedBonus = contract.prorationBySeason
    ? Number(contract.prorationBySeason?.[season] ?? 0)
    : Number(contract.signingBonus ?? 0) > 0
      ? Number(contract.signingBonus ?? 0) / years
      : 0;

  return (Number.isFinite(salary) ? salary : 0) + (Number.isFinite(proratedBonus) ? proratedBonus : 0);
}

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

  // Validate all contracts (both overrides and DB-sourced).
  // This catches desynced contracts that could cause cap calculation errors.
  for (const [pid, c] of Object.entries(contracts)) {
    const team = roster.playerToTeam[pid];
    // Skip validation for free agents (they have no contract).
    if (!team || team === "FREE_AGENT") continue;
    
    // Validate contract structure.
    if (Number(c.endSeason) < Number(c.startSeason)) {
      errors.push(`invalid contract span ${pid}: endSeason < startSeason`);
    }
    if ((c.salaries ?? []).some((n) => !Number.isFinite(Number(n)))) {
      errors.push(`invalid salary ${pid}: contains non-finite values`);
    }
    if (!Number.isFinite(Number(c.signingBonus ?? 0))) {
      errors.push(`invalid bonus ${pid}: signingBonus is not finite`);
    }
    if (Number(c.endSeason) - Number(state.season) + 1 < 0) {
      errors.push(`negative yearsRemaining ${pid}: contract already expired`);
    }
  }

  // Validate team cap usage from effective roster + effective contracts.
  // Intentionally includes every rostered player (no Top-51 exclusions).
  const leagueCapDefault = Number(getLeague().salaryCap ?? 0);
  const teamCap = Number.isFinite(Number(state.finances?.cap)) ? Number(state.finances?.cap) : leagueCapDefault;
  const teamCapUsage: Record<string, number> = {};

  for (const [teamId, playerIds] of Object.entries(roster.teamToPlayers)) {
    let used = 0;
    for (const pid of playerIds) used += getCurrentSeasonCapHit(contracts[pid], Number(state.season));
    teamCapUsage[teamId] = used;
  }

  for (const teamId of Object.keys(teamCapUsage).sort()) {
    const used = Math.round(teamCapUsage[teamId] ?? 0);
    const cap = Math.round(teamCap);
    const delta = used - cap;
    if (delta > 0) errors.push(`cap overage ${teamId}: used=${used} cap=${cap} delta=${delta}`);
  }

  if ((roster.freeAgents?.length ?? 0) < 0) errors.push("negative FA pool");
  return errors.length ? { ok: false, errors } : { ok: true };
}
