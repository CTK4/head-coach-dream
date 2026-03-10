import type { PlayerContractOverride } from "@/context/GameContext";
import type { TransactionEvent } from "./types";

type TradePickSwap = { round: number; year?: number; originalTeamId: string; fromTeamId: string; toTeamId: string };
type TradePackage = { playerIdsFrom: string[]; playerIdsTo: string[]; pickSwaps?: TradePickSwap[]; details?: Record<string, any> };

export const Tx = {
  resign(teamId: string, playerId: string, offer: PlayerContractOverride): Omit<TransactionEvent, "txId" | "season" | "weekIndex" | "ts"> {
    return { kind: "RESIGN", teamId, playerIds: [playerId], details: { contract: offer } };
  },
  franchiseTag(teamId: string, playerId: string, contract: PlayerContractOverride, priorContract?: PlayerContractOverride): Omit<TransactionEvent, "txId" | "season" | "weekIndex" | "ts"> {
    return {
      kind: "FRANCHISE_TAG",
      teamId,
      playerIds: [playerId],
      details: {
        contract,
        ...(priorContract ? { priorContract } : {}),
      },
    };
  },
  franchiseTagRemove(teamId: string, playerId: string, priorContract?: PlayerContractOverride): Omit<TransactionEvent, "txId" | "season" | "weekIndex" | "ts"> {
    return {
      kind: "FRANCHISE_TAG_REMOVE",
      teamId,
      playerIds: [playerId],
      details: {
        ...(priorContract ? { contract: priorContract } : {}),
      },
    };
  },
  cut(teamId: string, playerId: string, reason?: string): Omit<TransactionEvent, "txId" | "season" | "weekIndex" | "ts"> {
    return { kind: "CUT", teamId, playerIds: [playerId], details: { reason } };
  },
  release(teamId: string, playerId: string, reason?: string): Omit<TransactionEvent, "txId" | "season" | "weekIndex" | "ts"> {
    return { kind: "RELEASE", teamId, playerIds: [playerId], details: { reason } };
  },
  signFA(teamId: string, playerId: string, offer: PlayerContractOverride): Omit<TransactionEvent, "txId" | "season" | "weekIndex" | "ts"> {
    return { kind: "SIGN_FA", teamId, playerIds: [playerId], details: { contract: offer } };
  },
  trade(teamAId: string, teamBId: string, pkg: TradePackage): Omit<TransactionEvent, "txId" | "season" | "weekIndex" | "ts"> {
    const toTeamByPlayer: Record<string, string> = {};
    for (const p of pkg.playerIdsFrom) toTeamByPlayer[p] = teamBId;
    for (const p of pkg.playerIdsTo) toTeamByPlayer[p] = teamAId;
    return {
      kind: "TRADE",
      teamId: teamAId,
      otherTeamId: teamBId,
      playerIds: [...pkg.playerIdsFrom, ...pkg.playerIdsTo],
      details: { ...(pkg.details ?? {}), toTeamByPlayer, pickSwaps: pkg.pickSwaps ?? [] },
    };
  },
  draftPick(teamId: string, prospectId: string, pickMeta: Record<string, any>): Omit<TransactionEvent, "txId" | "season" | "weekIndex" | "ts"> {
    return { kind: "DRAFT_PICK", teamId, playerIds: [prospectId], details: { pickMeta } };
  },
  rookieSign(teamId: string, playerId: string, rookieDeal: PlayerContractOverride): Omit<TransactionEvent, "txId" | "season" | "weekIndex" | "ts"> {
    return { kind: "ROOKIE_SIGN", teamId, playerIds: [playerId], details: { contract: rookieDeal } };
  },
};
