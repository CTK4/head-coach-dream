import type { GameState, PlayerContractOverride } from "@/context/GameContext";
import { getLeague } from "@/data/leagueDb";
import { getPlayers } from "@/data/leagueDb";
import { capHitForOverride } from "@/engine/rosterOverlay";
import { buildRosterIndex } from "./applyTransactions";
import { buildContractIndex } from "./contractIndex";

function isInactiveForCap(playerStatus: string | undefined, teamId: string): boolean {
  const normalizedStatus = String(playerStatus ?? "").toUpperCase();
  const normalizedTeamId = String(teamId ?? "").toUpperCase();
  return normalizedStatus === "RETIRED" || normalizedStatus === "FREE_AGENT" || normalizedTeamId === "FREE_AGENT";
}

export function validatePostTx(state: GameState): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const currentSeason = Number(state.season);
  const playerStatusById: Record<string, string | undefined> = {};
  for (const player of getPlayers()) playerStatusById[String(player.playerId)] = player.status;
  for (const rookie of state.rookies ?? []) playerStatusById[String(rookie.playerId)] = String((rookie as { status?: string }).status ?? "ACTIVE");

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
    for (const pid of playerIds) {
      const contract = contracts[pid] as PlayerContractOverride | undefined;
      if (!contract) {
        if (!isInactiveForCap(playerStatusById[pid], teamId)) {
          errors.push(`missing active contract mapping ${pid}: team=${teamId}`);
        }
        continue;
      }
      used += capHitForOverride(contract, currentSeason);
    }
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
