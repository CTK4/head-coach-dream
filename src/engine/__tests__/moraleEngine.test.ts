import { describe, expect, it } from "vitest";
import { updateMorale, moraleChipColor } from "@/engine/moraleEngine";

describe("moraleEngine", () => {
  it("increases morale with high playing time", () => {
    const player = { morale: 60, roleExpectation: "STARTER" as const, playingTimeSatisfaction: 0 };
    const ctx = { teamWins: 8, teamLosses: 2, isContractYear: false };
    const stats = { snapsPlayed: 60, snapsExpected: 40 };
    const result = updateMorale(player, ctx, stats);
    expect(result.morale).toBeGreaterThan(60);
  });

  it("decreases morale with low playing time", () => {
    const player = { morale: 70, roleExpectation: "STARTER" as const, playingTimeSatisfaction: 0 };
    const ctx = { teamWins: 3, teamLosses: 7, isContractYear: false };
    const stats = { snapsPlayed: 10, snapsExpected: 60 };
    const result = updateMorale(player, ctx, stats);
    expect(result.morale).toBeLessThan(70);
  });

  it("sets tradeRequest when morale < 30", () => {
    const player = { morale: 25, roleExpectation: "DEPTH" as const, playingTimeSatisfaction: -80 };
    const ctx = { teamWins: 1, teamLosses: 9, isContractYear: false };
    const stats = { snapsPlayed: 0, snapsExpected: 30 };
    const result = updateMorale(player, ctx, stats);
    expect(result.tradeRequest).toBe(true);
  });

  it("topModifiers has at most 3 entries", () => {
    const player = { morale: 60, roleExpectation: "ROTATIONAL" as const, playingTimeSatisfaction: 0 };
    const ctx = { teamWins: 5, teamLosses: 5, isContractYear: true, roleChanged: true, strategyModeFit: 80 };
    const stats = { snapsPlayed: 25, snapsExpected: 25 };
    const result = updateMorale(player, ctx, stats);
    expect(result.topModifiers.length).toBeLessThanOrEqual(3);
  });

  it("moraleChipColor returns green for high morale", () => {
    expect(moraleChipColor(85)).toContain("emerald");
  });

  it("moraleChipColor returns red for low morale", () => {
    expect(moraleChipColor(20)).toContain("red");
  });
});
