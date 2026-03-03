import { describe, expect, it } from "vitest";
import { getPlayers } from "@/data/leagueDb";
import { getEffectivePlayersByTeam, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { applyTransaction, buildTxId } from "@/engine/transactions/applyTransaction";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";
import { buildContractIndex } from "@/engine/transactions/contractIndex";
import { Tx } from "@/engine/transactions/transactionAPI";

function withTx(state: any, draft: any) {
  return applyTransaction(state, {
    ...draft,
    txId: buildTxId(state),
    season: state.season,
    weekIndex: state.week,
    ts: state.season * 10_000 + state.week * 100 + state.transactionLedger.counter + 1,
  });
}

describe("fa signings are ledger-backed", () => {
  it("appends SIGN_FA and drives roster + contract indices", () => {
    const player = getPlayers().find((p: any) => String(p.teamId ?? "") === "FREE_AGENT");
    expect(player).toBeTruthy();

    const playerId = String((player as any).playerId);
    const signingTeamId = "CHI";
    const season = 2025;
    const contract = {
      startSeason: season,
      endSeason: season + 2,
      salaries: [4_000_000, 6_000_000, 8_000_000],
      signingBonus: 3_000_000,
      guaranteedAtSigning: 7_000_000,
    };

    const base: any = {
      season,
      week: 1,
      rookies: [],
      playerTeamOverrides: {},
      playerContractOverrides: {},
      transactions: [],
      transactionLedger: { events: [], counter: 0 },
      finances: { cash: 100_000_000, capSpace: 50_000_000 },
      playerAgingDeltasById: {},
      playerAgeOffsetById: {},
      playerAttributeDeltasById: {},
      playerSnapCountsById: {},
      playerProgressionSeasonStatsById: {},
      playerDevelopmentById: {},
      playerAttrOverrides: {},
      depthChartByTeam: {},
    };

    const signed = withTx(base, Tx.signFA(signingTeamId, playerId, contract));

    expect(signed.transactionLedger.events.at(-1)?.kind).toBe("SIGN_FA");

    const rosterIndex = buildRosterIndex({ ...signed, playerTeamOverrides: {} } as any);
    expect(rosterIndex.playerToTeam[playerId]).toBe(signingTeamId);

    const contractIndex = buildContractIndex({ ...signed, playerContractOverrides: {} } as any);
    expect(contractIndex[playerId]).toBeTruthy();

    const summary = getContractSummaryForPlayer({ ...signed, playerContractOverrides: {} } as any, playerId);
    expect(summary).toBeTruthy();
    expect(Number(summary?.capHit ?? 0)).toBeGreaterThan(0);

    const teamPlayers = getEffectivePlayersByTeam({ ...signed, playerTeamOverrides: {} } as any, signingTeamId);
    expect(teamPlayers.some((p: any) => String(p.playerId) === playerId)).toBe(true);
  });
});
