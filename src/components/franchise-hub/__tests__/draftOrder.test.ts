import { describe, expect, it } from "vitest";
import type { LeagueState } from "@/engine/leagueSim";
import { computeOverallPickNumber } from "@/components/franchise-hub/draftOrder";

type TestStanding = { w: number; l: number; pf: number; pa: number };

function makeLeagueState(standings: Record<string, TestStanding>): LeagueState {
  return { standings, results: [] } as unknown as LeagueState;
}

describe("computeOverallPickNumber", () => {
  it("returns null when teamId is not in standings", () => {
    const league = makeLeagueState({ A: { w: 1, l: 16, pf: 200, pa: 320 } });

    expect(computeOverallPickNumber(league, "Z")).toBeNull();
  });

  it("assigns earlier picks to worse records (wins ascending)", () => {
    const league = makeLeagueState({
      A: { w: 1, l: 16, pf: 200, pa: 320 },
      B: { w: 2, l: 15, pf: 220, pa: 330 },
      C: { w: 3, l: 14, pf: 240, pa: 340 },
    });

    expect(computeOverallPickNumber(league, "A")).toBe(1);
    expect(computeOverallPickNumber(league, "B")).toBe(2);
    expect(computeOverallPickNumber(league, "C")).toBe(3);
  });

  it("breaks ties by point differential ascending", () => {
    const league = makeLeagueState({
      A: { w: 5, l: 12, pf: 200, pa: 300 },
      B: { w: 5, l: 12, pf: 210, pa: 250 },
      C: { w: 6, l: 11, pf: 260, pa: 260 },
    });

    expect(computeOverallPickNumber(league, "A")).toBeLessThan(computeOverallPickNumber(league, "B") as number);
  });

  it("uses PF ascending as the next tiebreak when records and differential match", () => {
    const league = makeLeagueState({
      A: { w: 5, l: 12, pf: 180, pa: 260 },
      B: { w: 5, l: 12, pf: 200, pa: 280 },
      C: { w: 6, l: 11, pf: 250, pa: 260 },
    });

    expect(computeOverallPickNumber(league, "A")).toBeLessThan(computeOverallPickNumber(league, "B") as number);
  });

  it("uses teamId string comparison as a deterministic final tiebreak", () => {
    const league = makeLeagueState({
      B: { w: 5, l: 12, pf: 180, pa: 260 },
      A: { w: 5, l: 12, pf: 180, pa: 260 },
      C: { w: 6, l: 11, pf: 250, pa: 260 },
    });

    expect(computeOverallPickNumber(league, "A")).toBeLessThan(computeOverallPickNumber(league, "B") as number);
    expect(computeOverallPickNumber(league, "A")).toBe(1);
    expect(computeOverallPickNumber(league, "B")).toBe(2);
  });
});
