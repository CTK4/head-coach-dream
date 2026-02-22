import { describe, expect, it } from "vitest";
import type { LeagueState } from "@/engine/leagueSim";
import { simulatePlayoffs } from "@/engine/playoffsSim";

function mkLeague(): LeagueState {
  return {
    standings: {
      A: { w: 12, l: 5, pf: 400, pa: 300 },
      B: { w: 11, l: 6, pf: 390, pa: 310 },
      C: { w: 10, l: 7, pf: 380, pa: 320 },
      D: { w: 9, l: 8, pf: 370, pa: 330 },
      E: { w: 8, l: 9, pf: 360, pa: 340 },
    },
    results: [],
    gmByTeamId: {},
    postseason: { season: 2026, resultsByTeamId: {} },
  } as any;
}

describe("playoffsSim MVP bracket", () => {
  it("crowns a champion deterministically", () => {
    const league = mkLeague();
    const r1 = simulatePlayoffs({ league, season: 2026, seed: 999 });
    const r2 = simulatePlayoffs({ league, season: 2026, seed: 999 });
    expect(r1.championTeamId).toBe(r2.championTeamId);
    expect(Object.values(r1.postseason.resultsByTeamId).some((x) => x.isChampion)).toBe(true);
  });
});
