import { describe, expect, it } from "vitest";
import { buildTeamProfile } from "@/models/teamProfile";
import { cpuResignPlayers } from "@/systems/cpuOffseasonAI";
import { computeWeeklyPowerRankings } from "@/systems/powerRankings";
import { createAwardsState, finalizeAwards, updateAwardsRace } from "@/systems/awardsEngine";
import { calculateTradeValue } from "@/systems/tradeValuation";
import { computeSnapBasedDevelopmentDelta } from "@/systems/snapProgression";

describe("phase2 systems", () => {
  it("builds deterministic team profiles", () => {
    const profile = buildTeamProfile({
      winPct: 0.72,
      capSpace: 30_000_000,
      capTotal: 250_000_000,
      avgRosterAge: 26.2,
      playoffResult: "conference",
      positionalNeeds: { QB: 0.1, WR: 0.4 },
    });
    expect(profile.rebuildStage).toBe("competitive");
    expect(profile.aggressiveness).toBeGreaterThan(0.5);
  });

  it("keeps cpu re-signing under cap", () => {
    const profile = buildTeamProfile({
      winPct: 0.5,
      capSpace: 15_000_000,
      capTotal: 250_000_000,
      avgRosterAge: 27.9,
      playoffResult: "missed",
      positionalNeeds: { QB: 0.8, EDGE: 0.6 },
    });

    const offers = cpuResignPlayers({
      teamId: "T1",
      capSpace: 15_000_000,
      capTotal: 250_000_000,
      profile,
      rosterByPos: {},
    }, [
      { playerId: "P1", pos: "QB", age: 25, overall: 84, devTrait: "STAR" },
      { playerId: "P2", pos: "WR", age: 31, overall: 79, devTrait: "NORMAL" },
    ]);

    const totalApy = offers.reduce((sum, o) => sum + o.offerApy, 0);
    expect(totalApy).toBeLessThanOrEqual(15_000_000);
  });

  it("creates ranked power table and season awards", () => {
    const rankings = computeWeeklyPowerRankings([
      { teamId: "A", wins: 9, losses: 2, pointsFor: 300, pointsAgainst: 200, strengthOfSchedule: 0.6, last4Wins: 3, last4Games: 4, offensiveEfficiency: 0.72, defensiveEfficiency: 0.66 },
      { teamId: "B", wins: 5, losses: 6, pointsFor: 210, pointsAgainst: 240, strengthOfSchedule: 0.5, last4Wins: 1, last4Games: 4, offensiveEfficiency: 0.51, defensiveEfficiency: 0.43 },
    ]);
    expect(rankings[0].teamId).toBe("A");

    const awards = updateAwardsRace(createAwardsState(), [{
      id: "qb-a",
      name: "QB A",
      teamId: "A",
      position: "QB",
      teamWins: 9,
      passYards: 330,
      passTds: 3,
      ints: 1,
      totalYards: 340,
      totalTds: 3,
      explosivePlays: 4,
      snaps: 68,
    }]);
    expect(finalizeAwards(awards).MVP).toBe("qb-a");
  });

  it("values rookie contracts and snap growth", () => {
    const rookie = calculateTradeValue({ overall: 76, age: 23, isRookieContract: true, capHit: 2_000_000, yearsRemaining: 3 }, { teamStage: "rebuild", positionalNeed: 0.8 });
    const aging = calculateTradeValue({ overall: 80, age: 32, capHit: 17_000_000, yearsRemaining: 2, deadCap: 8_000_000 }, { teamStage: "rebuild", positionalNeed: 0.8 });
    expect(rookie).toBeGreaterThan(aging);

    const delta = computeSnapBasedDevelopmentDelta({
      age: 23,
      devTrait: "STAR",
      overall: 74,
      snaps: { offensiveSnaps: 900 },
      maxTeamSnaps: 1100,
      efficiencyScore: 0.75,
      teamSuccess: 0.65,
    });
    expect(delta).toBeGreaterThan(0);
  });
});
