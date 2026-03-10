import { describe, expect, it } from "vitest";
import type { LeagueState } from "@/engine/leagueSim";
import type { PlayoffsState } from "@/engine/postseason";
import { buildPostseasonResults } from "@/engine/playoffsSim";

describe("postseason results", () => {
  it("postseasonResults.requiresSuperBowlFinal", () => {
    const league: LeagueState = {
      standings: {
        A: { w: 14, l: 3, pf: 400, pa: 280 },
        B: { w: 13, l: 4, pf: 390, pa: 300 },
      },
      results: [],
      gmByTeamId: {},
      postseason: { season: 2026, resultsByTeamId: {} },
    } as any;

    const playoffs: PlayoffsState = {
      season: 2026,
      round: "SUPER_BOWL",
      bracket: {
        conferences: {
          AFC: { conferenceId: "AFC", seeds: ["A"], gamesByRound: {} },
          NFC: { conferenceId: "NFC", seeds: ["B"], gamesByRound: {} },
        },
        superBowl: {
          gameId: "SUPER_BOWL:LEAGUE:1:A:B",
          round: "SUPER_BOWL",
          homeTeamId: "A",
          awayTeamId: "B",
        },
      },
      completedGames: {},
    };

    expect(() => buildPostseasonResults({ league, playoffs })).toThrow(/Super Bowl is finalized/i);
  });
});
