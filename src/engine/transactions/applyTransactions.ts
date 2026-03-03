import type { GameState } from "@/context/GameContext";
import { getPlayers } from "@/data/leagueDb";
import { getTransactionState, sortTransactionEvents } from "./transactionLedger";
import type { TransactionEvent } from "./types";

export type RosterIndex = {
  teamToPlayers: Record<string, string[]>;
  freeAgents: string[];
  playerToTeam: Record<string, string | "FREE_AGENT">;
};

function normTeamId(v: unknown): string | "FREE_AGENT" {
  const id = String(v ?? "").trim();
  return !id || id.toUpperCase() === "FREE_AGENT" ? "FREE_AGENT" : id;
}

function applyMovement(playerToTeam: Record<string, string | "FREE_AGENT">, event: TransactionEvent) {
  switch (event.kind) {
    case "RESIGN":
    case "FRANCHISE_TAG":
    case "SIGN_FA":
    case "DRAFT_PICK":
    case "ROOKIE_SIGN":
      for (const playerId of event.playerIds) playerToTeam[String(playerId)] = normTeamId(event.teamId);
      break;
    case "CUT":
    case "RELEASE":
      for (const playerId of event.playerIds) playerToTeam[String(playerId)] = "FREE_AGENT";
      break;
    case "TRADE": {
      const toTeamByPlayer: Record<string, string> = event.details?.toTeamByPlayer ?? {};
      for (const playerId of event.playerIds) {
        playerToTeam[String(playerId)] = normTeamId(toTeamByPlayer[String(playerId)] ?? event.otherTeamId ?? event.teamId);
      }
      break;
    }
    case "MIGRATION":
      for (const playerId of event.playerIds) {
        playerToTeam[String(playerId)] = normTeamId(event.details?.teamId ?? event.teamId);
      }
      break;
    default:
      break;
  }
}

export function buildRosterIndex(state: GameState): RosterIndex {
  const playerToTeam: Record<string, string | "FREE_AGENT"> = {};
  for (const p of getPlayers()) playerToTeam[String(p.playerId)] = normTeamId(p.teamId);
  for (const r of state.rookies ?? []) playerToTeam[String(r.playerId)] = normTeamId(r.teamId);

  const events = sortTransactionEvents(getTransactionState(state).events ?? []);
  for (const event of events) applyMovement(playerToTeam, event as TransactionEvent);

  const teamToPlayers: Record<string, string[]> = {};
  const freeAgents: string[] = [];
  for (const [playerId, teamId] of Object.entries(playerToTeam)) {
    if (teamId === "FREE_AGENT") freeAgents.push(playerId);
    else (teamToPlayers[teamId] ||= []).push(playerId);
  }

  for (const key of Object.keys(teamToPlayers)) teamToPlayers[key] = [...new Set(teamToPlayers[key])].sort();

  return { teamToPlayers, freeAgents: [...new Set(freeAgents)].sort(), playerToTeam };
}
