import { describe, expect, it } from "vitest";
import { buildPlayoffBracket } from "@/engine/playoffsSim";
import type { LeagueState } from "@/engine/leagueSim";

const league: LeagueState = {
  standings: {
    MILWAUKEE_NORTHSHORE: { w: 14, l: 3, pf: 450, pa: 280 },
    ATLANTA_APEX: { w: 13, l: 4, pf: 430, pa: 300 },
    BIRMINGHAM_VULCANS: { w: 12, l: 5, pf: 410, pa: 320 },
    CLEVELAND_BULLDOGS: { w: 11, l: 6, pf: 390, pa: 340 },
  },
  results: [],
  gmByTeamId: {},
  postseason: { season: 2026, resultsByTeamId: {} },
  week: 18,
  tradeDeadlineWeek: 10,
};

describe("playoff bracket", () => {
  it("builds deterministic matchups from fixed standings", () => {
    const a = buildPlayoffBracket({ league, season: 2026 });
    const b = buildPlayoffBracket({ league, season: 2026 });
    expect(a.round).toBe(b.round);
    expect(a.bracket).toEqual(b.bracket);
  });
});
