import type { GameState } from "@/context/GameContext";
import { buildRosterIndex } from "./applyTransactions";
import { buildContractIndex } from "./contractIndex";

export function validateLeagueIntegrity(state: GameState): void {
  const roster = buildRosterIndex(state);
  const contracts = buildContractIndex(state);
  const seen = new Set<string>();

  for (const [teamId, playerIds] of Object.entries(roster.teamToPlayers)) {
    if (!teamId) throw new Error("integrity: empty team id bucket");
    for (const playerId of playerIds) {
      if (seen.has(playerId)) throw new Error(`integrity: duplicate player ${playerId}`);
      seen.add(playerId);
      if (roster.playerToTeam[playerId] !== teamId) throw new Error(`integrity: player/team mismatch ${playerId}`);
    }
  }

  for (const playerId of roster.freeAgents) {
    if (seen.has(playerId)) throw new Error(`integrity: duplicate FA player ${playerId}`);
    seen.add(playerId);
    if (roster.playerToTeam[playerId] !== "FREE_AGENT") throw new Error(`integrity: FA mismatch ${playerId}`);
  }

  for (const [playerId, contract] of Object.entries(contracts)) {
    const yearsRemaining = Number(contract.endSeason ?? 0) - Number(state.season ?? 0) + 1;
    if (yearsRemaining < 0) throw new Error(`integrity: negative contract years ${playerId}`);
    for (const salary of contract.salaries ?? []) {
      if (!Number.isFinite(Number(salary))) throw new Error(`integrity: invalid salary ${playerId}`);
    }
    if (!Number.isFinite(Number(contract.signingBonus ?? 0))) throw new Error(`integrity: invalid bonus ${playerId}`);
  }

  const replayA = buildRosterIndex(state);
  const replayB = buildRosterIndex(state);
  if (JSON.stringify(replayA) !== JSON.stringify(replayB)) throw new Error("integrity: non-deterministic transaction replay");
}
