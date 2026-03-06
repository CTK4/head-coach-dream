import { describe, expect, it } from "vitest";
import { buildGameAggFromPlayLog } from "@/engine/telemetry/aggregateGame";
import type { PlayEventV1Minimal } from "@/engine/telemetry/types";

function play(partial: Partial<PlayEventV1Minimal>): PlayEventV1Minimal {
  return {
    version: 1,
    playIndex: 1,
    drive: 1,
    playInDrive: 1,
    quarter: 1,
    clockSec: 900,
    possession: "HOME",
    down: 1,
    distance: 10,
    ballOn: 25,
    playType: "DROPBACK",
    result: "Incomplete.",
    homeScore: 0,
    awayScore: 0,
    ...partial,
  };
}

describe("buildGameAggFromPlayLog", () => {
  it("builds deterministic game aggregate from synthetic play log", () => {
    const playLog: PlayEventV1Minimal[] = [
      play({ playIndex: 1, possession: "HOME", playType: "DROPBACK", result: "DROPBACK complete for 12y." }),
      play({ playIndex: 2, possession: "HOME", playType: "DROPBACK", result: "Sack for -7y." }),
      play({ playIndex: 3, possession: "HOME", playType: "QUICK_GAME", result: "Intercepted!" }),
      play({ playIndex: 4, possession: "HOME", playType: "INSIDE_ZONE", result: "INSIDE ZONE for 5y." }),
      play({ playIndex: 5, possession: "AWAY", playType: "RUN", result: "Run for 9y." }),
      play({ playIndex: 6, possession: "AWAY", playType: "SHORT_PASS", result: "SHORT PASS complete for 18y." }),
    ];

    const agg = buildGameAggFromPlayLog({
      season: 2026,
      weekType: "REGULAR_SEASON",
      weekNumber: 3,
      homeTeamId: "HOME_TEAM",
      awayTeamId: "AWAY_TEAM",
      playLog,
    });

    expect(agg).toEqual({
      version: 1,
      season: 2026,
      weekType: "REGULAR_SEASON",
      weekNumber: 3,
      homeTeamId: "HOME_TEAM",
      awayTeamId: "AWAY_TEAM",
      byTeamId: {
        HOME_TEAM: { passAttempts: 3, completions: 1, passYards: 12, interceptions: 1, sacksTaken: 1, rushAttempts: 1, rushYards: 5 },
        AWAY_TEAM: { passAttempts: 1, completions: 1, passYards: 18, interceptions: 0, sacksTaken: 0, rushAttempts: 1, rushYards: 9 },
      },
    });
  });
});
