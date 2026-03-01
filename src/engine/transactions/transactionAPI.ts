import type { GameState, PlayerContractOverride } from "@/context/GameContext";
import { buildRosterIndex } from "./applyTransactions";
import { appendTransactionEvent } from "./transactionLedger";
import { validateLeagueIntegrity } from "./validateLeagueIntegrity";

type TxResult = { ok: true; txDraft: any } | { ok: false; reason: string };

function devValidate(state: GameState): GameState {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.DEV) validateLeagueIntegrity(state);
  return state;
}

function ensureOwnedBy(state: GameState, teamId: string, playerId: string): boolean {
  const roster = buildRosterIndex(state);
  return String(roster.playerToTeam[String(playerId)] ?? "FREE_AGENT") === String(teamId);
}

export function proposeResign(state: GameState, teamId: string, playerId: string, offer: PlayerContractOverride): TxResult {
  if (!ensureOwnedBy(state, teamId, playerId)) return { ok: false, reason: "PLAYER_NOT_ON_TEAM" };
  if (Number(offer.endSeason) < Number(offer.startSeason)) return { ok: false, reason: "INVALID_CONTRACT_RANGE" };
  return {
    ok: true,
    txDraft: {
      season: Number(state.season ?? 1),
      weekIndex: Number(state.week ?? 0),
      kind: "RESIGN" as const,
      teamId: String(teamId),
      playerIds: [String(playerId)],
      details: { contract: offer },
    },
  };
}

export function applyResign(state: GameState, txDraft: any): GameState {
  const next = appendTransactionEvent(state, txDraft);
  return devValidate(next);
}

export function applyFranchiseTag(state: GameState, teamId: string, playerId: string): GameState {
  const offer: PlayerContractOverride = { startSeason: state.season, endSeason: state.season, salaries: [20_000_000], signingBonus: 0, contractType: "FRANCHISE_TAG" };
  return devValidate(
    appendTransactionEvent(state, { season: state.season, weekIndex: Number(state.week ?? 0), kind: "FRANCHISE_TAG", teamId, playerIds: [playerId], details: { contract: offer } }),
  );
}

export function applyCut(state: GameState, teamId: string, playerId: string, reason?: string): GameState {
  return devValidate(appendTransactionEvent(state, { season: state.season, weekIndex: Number(state.week ?? 0), kind: "CUT", teamId, playerIds: [playerId], details: { reason } }));
}

export function applySignFA(state: GameState, teamId: string, playerId: string, offer: PlayerContractOverride): GameState {
  return devValidate(appendTransactionEvent(state, { season: state.season, weekIndex: Number(state.week ?? 0), kind: "SIGN_FA", teamId, playerIds: [playerId], details: { contract: offer } }));
}

export function applyTrade(
  state: GameState,
  tradePackage: { fromTeamId: string; toTeamId: string; playerIdsFrom: string[]; playerIdsTo: string[]; details?: Record<string, any> },
): GameState {
  const toTeamByPlayer: Record<string, string> = {};
  for (const p of tradePackage.playerIdsFrom) toTeamByPlayer[p] = tradePackage.toTeamId;
  for (const p of tradePackage.playerIdsTo) toTeamByPlayer[p] = tradePackage.fromTeamId;
  const next = appendTransactionEvent(state, {
    season: state.season,
    weekIndex: Number(state.week ?? 0),
    kind: "TRADE",
    teamId: tradePackage.fromTeamId,
    otherTeamId: tradePackage.toTeamId,
    playerIds: [...tradePackage.playerIdsFrom, ...tradePackage.playerIdsTo],
    details: { ...(tradePackage.details ?? {}), toTeamByPlayer },
  });
  return devValidate(next);
}

export function applyDraftPick(state: GameState, teamId: string, prospectId: string, pickMeta: Record<string, any>): GameState {
  return devValidate(appendTransactionEvent(state, { season: state.season, weekIndex: Number(state.week ?? 0), kind: "DRAFT_PICK", teamId, playerIds: [prospectId], details: { pickMeta } }));
}

export function applyRookieSign(state: GameState, teamId: string, playerId: string, rookieContract: PlayerContractOverride): GameState {
  return devValidate(appendTransactionEvent(state, { season: state.season, weekIndex: Number(state.week ?? 0), kind: "ROOKIE_SIGN", teamId, playerIds: [playerId], details: { contract: rookieContract } }));
}
