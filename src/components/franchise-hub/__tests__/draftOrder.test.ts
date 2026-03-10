import { describe, expect, it } from "vitest";
import type { LeagueState } from "@/engine/leagueSim";
import { computeFirstRoundOrderTeamIds, computeFirstRoundPickNumber } from "@/components/franchise-hub/draftOrder";

type TestStanding = { w: number; l: number; pf: number; pa: number };

type TestGame = {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
};

function makeLeagueState(standings: Record<string, TestStanding>, results: TestGame[] = []): LeagueState {
  return {
    standings,
    results: results.map((result, week) => ({ gameType: "REGULAR_SEASON", week: week + 1, ...result })),
    postseason: { season: 2026, resultsByTeamId: {} },
  };
}

describe("computeFirstRoundPickNumber", () => {
  it("returns null when teamId is not in standings", () => {
    const league = makeLeagueState({ A: { w: 1, l: 16, pf: 200, pa: 320 } });

    expect(computeFirstRoundPickNumber({ league, userTeamId: "Z" })).toBeNull();
  });

  it("orders by winPct ascending", () => {
    const league = makeLeagueState({
      A: { w: 2, l: 15, pf: 200, pa: 320 },
      B: { w: 3, l: 14, pf: 220, pa: 330 },
      C: { w: 4, l: 13, pf: 240, pa: 340 },
    });

    expect(computeFirstRoundPickNumber({ league, userTeamId: "A" })).toBe(1);
    expect(computeFirstRoundPickNumber({ league, userTeamId: "B" })).toBe(2);
    expect(computeFirstRoundPickNumber({ league, userTeamId: "C" })).toBe(3);
  });

  it("breaks equal records by SOS before point differential", () => {
    const league = makeLeagueState(
      {
        A: { w: 5, l: 12, pf: 260, pa: 320 },
        B: { w: 5, l: 12, pf: 220, pa: 280 },
        C: { w: 10, l: 7, pf: 350, pa: 300 },
        D: { w: 2, l: 15, pf: 150, pa: 350 },
      },
      [
        { homeTeamId: "A", awayTeamId: "C", homeScore: 10, awayScore: 17 },
        { homeTeamId: "B", awayTeamId: "D", homeScore: 21, awayScore: 14 },
      ]
    );

    const order = computeFirstRoundOrderTeamIds({ league, userTeamId: "A" });
    expect(order.indexOf("B")).toBeLessThan(order.indexOf("A"));
  });

  it("breaks ties by point differential ascending", () => {
    const league = makeLeagueState({
      A: { w: 5, l: 12, pf: 200, pa: 320 },
      B: { w: 5, l: 12, pf: 200, pa: 260 },
    });

    expect(computeFirstRoundPickNumber({ league, userTeamId: "A" })).toBe(1);
    expect(computeFirstRoundPickNumber({ league, userTeamId: "B" })).toBe(2);
  });

  it("uses PF ascending when winPct and point differential are equal", () => {
    const league = makeLeagueState({
      A: { w: 5, l: 12, pf: 180, pa: 230 },
      B: { w: 5, l: 12, pf: 220, pa: 270 },
    });

    expect(computeFirstRoundPickNumber({ league, userTeamId: "A" })).toBe(1);
    expect(computeFirstRoundPickNumber({ league, userTeamId: "B" })).toBe(2);
  });

  it("uses teamId as deterministic final tiebreak", () => {
    const league = makeLeagueState({
      BBB: { w: 5, l: 12, pf: 180, pa: 260 },
      AAA: { w: 5, l: 12, pf: 180, pa: 260 },
    });

    expect(computeFirstRoundPickNumber({ league, userTeamId: "AAA" })).toBe(1);
    expect(computeFirstRoundPickNumber({ league, userTeamId: "BBB" })).toBe(2);
  });

  it("places playoff teams after non-playoff teams and champion last", () => {
    const league = makeLeagueState({
      NP: { w: 8, l: 9, pf: 300, pa: 310 },
      WC: { w: 4, l: 13, pf: 210, pa: 330 },
      CHAMP: { w: 1, l: 16, pf: 150, pa: 410 },
    });

    const order = computeFirstRoundOrderTeamIds({
      league,
      userTeamId: "NP",
      postseason: { playoffFinishRankByTeamId: { WC: 1, CHAMP: 5 } },
    });

    expect(order).toEqual(["NP", "WC", "CHAMP"]);
  });
});
