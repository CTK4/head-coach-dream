import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer } from "@/context/GameContext";
import { getPlayers } from "@/data/leagueDb";
import { computeCapLedgerV2 } from "@/engine/capLedger";
import { getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { buildContractIndex } from "@/engine/transactions/contractIndex";

function firstRosterPlayer() {
  const p = getPlayers().find((x: any) => String(x.teamId ?? "") && String(x.teamId) !== "FREE_AGENT");
  if (!p) throw new Error("no roster player");
  return { playerId: String((p as any).playerId), teamId: String((p as any).teamId) };
}

describe("franchise tag apply/remove ledger flow", () => {
  it("apply emits ledger event and contract index reflects 1-year tag contract", () => {
    const { playerId, teamId } = firstRosterPlayer();
    const start = createInitialStateForTests();
    const state = {
      ...start,
      teamId,
      userTeamId: teamId,
      acceptedOffer: { ...(start.acceptedOffer ?? ({} as any)), teamId } as any,
      transactions: [{ id: "legacy" } as any],
      playerContractOverrides: {
        ...start.playerContractOverrides,
        [playerId]: {
          startSeason: start.season,
          endSeason: start.season,
          salaries: [5_000_000],
          signingBonus: 0,
        },
      },
    };

    const next = gameReducer(state as any, { type: "APPLY_FRANCHISE_TAG", payload: { playerId } });
    const applied = next.offseasonData.tagCenter.applied;

    expect(next.transactionLedger.events.at(-1)?.kind).toBe("FRANCHISE_TAG");
    expect(next.transactionLedger.events.at(-1)?.details?.contract?.contractType).toBe("FRANCHISE_TAG");
    expect(next.transactionLedger.events.at(-1)?.details?.contract?.startSeason).toBe(state.season + 1);
    expect(next.transactionLedger.events.at(-1)?.details?.contract?.endSeason).toBe(state.season + 1);
    expect(next.transactionLedger.events.at(-1)?.details?.contract?.salaries?.[0]).toBe(applied?.cost);

    const contractIndex = buildContractIndex({ ...next, playerContractOverrides: {} } as any);
    expect(contractIndex[playerId]?.contractType).toBe("FRANCHISE_TAG");
    expect(contractIndex[playerId]?.startSeason).toBe(state.season + 1);
    expect(contractIndex[playerId]?.endSeason).toBe(state.season + 1);

    expect(next.transactions).toHaveLength(1);
  });

  it("remove emits ledger event, restores prior contract, and cap ledger reflects tag cap hit", () => {
    const { playerId, teamId } = firstRosterPlayer();
    const start = createInitialStateForTests();
    const priorContract = {
      startSeason: start.season,
      endSeason: start.season,
      salaries: [6_000_000],
      signingBonus: 0,
    };

    let state: any = {
      ...start,
      teamId,
      userTeamId: teamId,
      acceptedOffer: { ...(start.acceptedOffer ?? ({} as any)), teamId } as any,
      playerContractOverrides: {
        ...start.playerContractOverrides,
        [playerId]: priorContract,
      },
    };

    state = gameReducer(state, { type: "APPLY_FRANCHISE_TAG", payload: { playerId } });
    const tagAmount = Number(state.offseasonData.tagCenter.applied?.cost ?? 0);

    const seasonAdvanced = { ...state, season: state.season + 1 };
    const capV2 = computeCapLedgerV2(seasonAdvanced, teamId);
    const taggedLine = capV2.top51.items.find((item) => item.playerId === playerId);
    expect(taggedLine?.capHit).toBe(tagAmount);

    const removed = gameReducer(state, { type: "TAG_REMOVE" });

    expect(removed.transactionLedger.events.at(-1)?.kind).toBe("FRANCHISE_TAG_REMOVE");

    const contractIndex = buildContractIndex({ ...removed, playerContractOverrides: {} } as any);
    expect(contractIndex[playerId]?.startSeason).toBe(priorContract.startSeason);
    expect(contractIndex[playerId]?.endSeason).toBe(priorContract.endSeason);
    expect(contractIndex[playerId]?.salaries).toEqual(priorContract.salaries);

    const summary = getContractSummaryForPlayer(removed, playerId);
    expect(summary?.endSeason).toBe(priorContract.endSeason);
    expect(removed.offseasonData.tagCenter.applied).toBeUndefined();
  });
});
