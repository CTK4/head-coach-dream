import { describe, expect, it } from "vitest";
import { gameReducer, createInitialStateForTests, type GameState } from "@/context/GameContext";
import { validateCriticalSaveState } from "@/lib/migrations/saveSchema";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";
import { buildContractIndex } from "@/engine/transactions/contractIndex";

describe("recoveryMode", () => {
  it("RECOVERY_RETURN_TO_HUB clears recoveryNeeded and resets phase to HUB", () => {
    const base = createInitialStateForTests();
    const state: GameState = { ...base, phase: "HUB", recoveryNeeded: true, recoveryErrors: ["bad phase"] };

    const next = gameReducer(state, { type: "RECOVERY_RETURN_TO_HUB" });
    expect(next.recoveryNeeded).toBe(false);
    expect(next.recoveryErrors).toEqual([]);
    expect(next.phase).toBe("HUB");
    expect(next.careerStage).toBe("OFFSEASON_HUB");
  });

  it("RECOVERY_REBUILD_INDICES clears recoveryNeeded and rebuilds from source state", () => {
    const base = createInitialStateForTests();
    const state: GameState = {
      ...base,
      recoveryNeeded: true,
      recoveryErrors: ["tx error"],
      playerTeamOverrides: { p_recovery_1: "BUF", p_recovery_2: "FREE_AGENT" },
      playerContractOverrides: {
        p_recovery_1: { startSeason: 2028, endSeason: 2029, salaries: [1200000, 1400000], signingBonus: 100000 },
      },
    };

    const next = gameReducer(state, { type: "RECOVERY_REBUILD_INDICES" });
    expect(next.recoveryNeeded).toBe(false);
    expect(next.recoveryErrors).toEqual([]);
    expect(next.playerTeamOverrides).toEqual({});
    expect(next.playerContractOverrides).toEqual({});
    expect(next.transactionLedger.migrationComplete).toBe(true);
    expect(next.transactionLedger.counter).toBe(next.transactionLedger.events.length);

    const rosterIndex = buildRosterIndex(next);
    const contractIndex = buildContractIndex(next);
    expect(rosterIndex.playerToTeam.p_recovery_1).toBe("BUF");
    expect(rosterIndex.playerToTeam.p_recovery_2).toBe("FREE_AGENT");
    expect(contractIndex.p_recovery_1).toMatchObject({
      startSeason: 2028,
      endSeason: 2029,
      salaries: [1200000, 1400000],
      signingBonus: 100000,
    });
  });

  it("validateCriticalSaveState detects an invalid phase", () => {
    const state = createInitialStateForTests();
    const badState = { ...state, phase: "INVALID_PHASE" as any };
    const result = validateCriticalSaveState(badState);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("INVALID_PHASE");
    }
  });

  it("validateCriticalSaveState accepts valid HUB phase", () => {
    const state = createInitialStateForTests();
    const result = validateCriticalSaveState({ ...state, phase: "HUB" });
    expect(result.ok).toBe(true);
  });

  it("RECOVERY_RESTORE_BACKUP is not equivalent to RESET fresh-save semantics", () => {
    const base = createInitialStateForTests();
    const state: GameState = {
      ...base,
      season: 2034,
      recoveryNeeded: true,
      recoveryErrors: ["corrupt"],
      coach: { ...base.coach, name: "Corrupted Coach" },
    };

    const restoreAttempt = gameReducer(state, { type: "RECOVERY_RESTORE_BACKUP" });
    const freshReset = gameReducer(state, { type: "RESET" });

    expect(restoreAttempt).toMatchObject({
      season: 2034,
      recoveryNeeded: true,
      recoveryErrors: ["Backup restore must run from the recovery controller."],
      coach: { name: "Corrupted Coach" },
    });

    expect(freshReset.recoveryNeeded ?? false).toBe(false);
    expect(freshReset.coach.name).toBe(createInitialStateForTests().coach.name);
    expect(restoreAttempt).not.toEqual(freshReset);
  });

  it("RECOVERY_REBUILD_INDICES prefers canonical ledger when present", () => {
    const base = createInitialStateForTests();
    const state: GameState = {
      ...base,
      recoveryNeeded: true,
      recoveryErrors: ["tx error"],
      playerTeamOverrides: { p_preserve_1: "BUF" },
      transactionLedger: {
        events: [{
          txId: "tx_1",
          season: base.season,
          weekIndex: Number(base.week ?? 1),
          ts: Date.now(),
          kind: "MIGRATION",
          teamId: "KC",
          playerIds: ["p_preserve_1"],
          details: { teamId: "KC" },
        }],
        counter: 1,
        migrationComplete: true,
      },
    };

    const next = gameReducer(state, { type: "RECOVERY_REBUILD_INDICES" });
    const rosterIndex = buildRosterIndex(next);

    expect(next.recoveryNeeded).toBe(true);
    expect(next.recoveryErrors).toEqual(["Rebuild indices consistency check failed"]);
    expect(next.playerTeamOverrides).toEqual({});
    expect(rosterIndex.playerToTeam.p_preserve_1).toBe("KC");
  });
});
