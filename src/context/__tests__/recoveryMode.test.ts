import { describe, expect, it } from "vitest";
import { gameReducer, createInitialStateForTests, type GameState } from "@/context/GameContext";
import { validateCriticalSaveState } from "@/lib/migrations/saveSchema";

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

  it("RECOVERY_REBUILD_INDICES clears recoveryNeeded and rebuilds from ledger", () => {
    const base = createInitialStateForTests();
    const state: GameState = { ...base, recoveryNeeded: true, recoveryErrors: ["tx error"] };

    const next = gameReducer(state, { type: "RECOVERY_REBUILD_INDICES" });
    expect(next.recoveryNeeded).toBe(false);
    expect(next.recoveryErrors).toEqual([]);
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
});
