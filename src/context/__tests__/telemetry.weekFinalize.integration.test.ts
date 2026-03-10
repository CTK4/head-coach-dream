import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducerMonolith, type GameState } from "@/context/GameContext";
import type { PlayEventV1Minimal } from "@/engine/telemetry/types";

function dispatch(state: GameState): GameState {
  return gameReducerMonolith(state, { type: "ADVANCE_WEEK" });
}

function syntheticPlayLog(): PlayEventV1Minimal[] {
  return [
    {
      version: 1,
      playIndex: 1,
      drive: 1,
      playInDrive: 1,
      quarter: 1,
      clockSec: 890,
      possession: "HOME",
      down: 1,
      distance: 10,
      ballOn: 35,
      playType: "DROPBACK",
      result: "DROPBACK complete for 14y.",
      homeScore: 0,
      awayScore: 0,
    },
  ];
}

describe("telemetry weekly finalize integration", () => {
  it("updates telemetry season aggregate during ADVANCE_WEEK finalization", () => {
    const base = createInitialStateForTests();
    const schedule = base.hub.schedule;
    const teamId = base.acceptedOffer?.teamId;
    if (!schedule || !teamId) return;

    const weekOne = schedule.regularSeasonWeeks.find((w) => w.week === 1);
    const matchup = weekOne?.matchups.find((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
    if (!matchup) return;

    const seeded: GameState = {
      ...base,
      careerStage: "REGULAR_SEASON",
      hub: { ...base.hub, regularSeasonWeek: 1 },
      game: {
        ...base.game,
        weekType: "REGULAR_SEASON",
        weekNumber: 1,
        homeTeamId: matchup.homeTeamId,
        awayTeamId: matchup.awayTeamId,
        playLog: syntheticPlayLog(),
      },
    };

    const after = dispatch(seeded);
    const telemetry = after.telemetry;
    expect(telemetry).toBeDefined();
    const keys = Object.keys(telemetry?.seasonAgg.appliedGameKeys ?? {});
    expect(keys).toHaveLength(1);
    const gameKey = keys[0]!;
    expect(telemetry?.gameAggsByGameKey[gameKey]).toBeDefined();
    expect(telemetry?.seasonAgg.byTeamId[matchup.homeTeamId]?.games ?? 0).toBeGreaterThanOrEqual(1);
  });
});
