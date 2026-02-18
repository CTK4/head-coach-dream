import { describe, expect, it } from "vitest";
import type { LeagueState } from "@/engine/leagueSim";
import { computeOverallPickNumber } from "@/components/franchise-hub/draftOrder";

type StandingInput = { w: number; l: number; pf: number; pa: number };

function createLeague(standings: Record<string, StandingInput>): LeagueState {
  return {
    standings,
    results: [],
  } as unknown as LeagueState;
}

describe("computeOverallPickNumber", () => {
  it("returns null when teamId is not in standings", () => {
    const league = createLeague({
      A: { w: 1, l: 16, pf: 200, pa: 400 },
      B: { w: 2, l: 15, pf: 220, pa: 390 },
    });

    expect(computeOverallPickNumber(league, "MISSING")).toBeNull();
  });

  it("gives the worst team pick 1 by wins ascending", () => {
    const league = createLeague({
      A: { w: 1, l: 16, pf: 200, pa: 400 },
      B: { w: 2, l: 15, pf: 220, pa: 390 },
      C: { w: 3, l: 14, pf: 240, pa: 380 },
    });

    expect(computeOverallPickNumber(league, "A")).toBe(1);
    expect(computeOverallPickNumber(league, "B")).toBe(2);
    expect(computeOverallPickNumber(league, "C")).toBe(3);
  });

  it("uses point differential ascending as the next tiebreaker", () => {
    const league = createLeague({
      A: { w: 5, l: 12, pf: 200, pa: 300 }, // diff -100
      B: { w: 5, l: 12, pf: 210, pa: 250 }, // diff -40
    });

    expect(computeOverallPickNumber(league, "A")).toBeLessThan(computeOverallPickNumber(league, "B") as number);
  });

  it("uses points for ascending as an additional tiebreaker", () => {
    const league = createLeague({
      A: { w: 6, l: 11, pf: 250, pa: 300 }, // diff -50
      B: { w: 6, l: 11, pf: 260, pa: 310 }, // diff -50, higher PF
    });

    expect(computeOverallPickNumber(league, "A")).toBeLessThan(computeOverallPickNumber(league, "B") as number);
  });

  it("uses teamId string compare as the final deterministic tiebreaker", () => {
    const league = createLeague({
      B: { w: 6, l: 11, pf: 250, pa: 300 },
      A: { w: 6, l: 11, pf: 250, pa: 300 },
    });

    expect(computeOverallPickNumber(league, "A")).toBe(1);
    expect(computeOverallPickNumber(league, "B")).toBe(2);
  });
});
