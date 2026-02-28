import { describe, expect, it } from "vitest";
import { calculateProgressionDelta, defaultDevelopmentTrait, type ProgressionPlayer } from "@/engine/snapBasedProgression";

function makePlayer(partial: Partial<ProgressionPlayer>): ProgressionPlayer {
  return {
    playerId: partial.playerId ?? "P1",
    fullName: partial.fullName ?? "Test Player",
    pos: partial.pos ?? "WR",
    age: partial.age ?? 24,
    overall: partial.overall ?? 78,
    snapCounts: partial.snapCounts ?? { offense: 850, defense: 0, specialTeams: 30 },
    seasonStats: partial.seasonStats ?? { gamesPlayed: 17, starts: 17, performanceScore: 0.8, injuryGamesMissed: 0 },
    development: partial.development ?? { trait: "normal", hiddenDev: true, highSnapSeasons: 0 },
  };
}

describe("snap-based progression", () => {
  it("young high-snap WR progresses", () => {
    const p = makePlayer({ pos: "WR", age: 24, snapCounts: { offense: 900, defense: 0, specialTeams: 20 }, seasonStats: { gamesPlayed: 17, starts: 17, performanceScore: 0.9 } });
    const out = calculateProgressionDelta(p, 1100);
    expect(out.delta).toBeGreaterThan(0);
  });

  it("aging RB declines", () => {
    const p = makePlayer({ pos: "RB", age: 31, snapCounts: { offense: 350, defense: 0, specialTeams: 10 }, seasonStats: { gamesPlayed: 10, starts: 4, performanceScore: 0.35, injuryGamesMissed: 7 } });
    const out = calculateProgressionDelta(p, 1000);
    expect(out.delta).toBeLessThan(0);
  });

  it("low snap backup stagnates", () => {
    const p = makePlayer({ pos: "QB", age: 30, snapCounts: { offense: 60, defense: 0, specialTeams: 0 }, seasonStats: { gamesPlayed: 3, starts: 0, performanceScore: 0.2, injuryGamesMissed: 8 } });
    const out = calculateProgressionDelta(p, 1100);
    expect(out.delta).toBeLessThanOrEqual(0);
  });

  it("elite dev reveals properly", () => {
    const p = makePlayer({
      development: { trait: "elite", hiddenDev: true, highSnapSeasons: 1 },
      snapCounts: { offense: 800, defense: 0, specialTeams: 0 },
      seasonStats: { gamesPlayed: 17, starts: 17, performanceScore: 0.78 },
    });
    const out = calculateProgressionDelta(p, 1200);
    expect(out.revealed).toBe(true);
  });

  it("is deterministic across identical seeds", () => {
    const traitA = defaultDevelopmentTrait("P_DET", 1337);
    const traitB = defaultDevelopmentTrait("P_DET", 1337);
    expect(traitA).toBe(traitB);

    const p = makePlayer({ playerId: "P_DET", development: { trait: traitA, hiddenDev: true, highSnapSeasons: 0 } });
    const out1 = calculateProgressionDelta(p, 1100);
    const out2 = calculateProgressionDelta(p, 1100);
    expect(out1).toEqual(out2);
  });
});
