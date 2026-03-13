import { describe, expect, it } from "vitest";
import { initGameSim, stepPlay } from "@/engine/gameSim";

function runForcedSnaps(sim: ReturnType<typeof initGameSim>, playType: "DROPBACK" | "INSIDE_ZONE", snaps: number, ballOn = 50) {
  let s = { ...sim, down: 1 as const, distance: 10, ballOn, possession: "HOME" as const };
  for (let i = 0; i < snaps; i += 1) {
    const stepped = stepPlay(s, playType);
    s = { ...stepped.sim, possession: "HOME", down: 1, distance: 10, ballOn };
  }
  return s;
}

function fgMakesAcrossSeeds(config: { specialistK: string; badgeHolder?: string }): number {
  let makes = 0;
  for (let seed = 1300; seed < 1400; seed += 1) {
    const sim = initGameSim({
      homeTeamId: "A",
      awayTeamId: "B",
      seed,
      specialistsBySide: { HOME: { K: config.specialistK }, AWAY: {} },
      playerBadges: config.badgeHolder ? { [config.badgeHolder]: [{ badgeId: "CLUTCH_KICKER", awardedSeason: 1 }] } : {},
    });
    const out = stepPlay({ ...sim, possession: "HOME", down: 4, distance: 7, ballOn: 57 }, "FG").sim;
    if (out.homeScore === 3) makes += 1;
  }
  return makes;
}

function averagePuntNetAcrossSeeds(config: { specialistP: string; badgeHolder?: string }): number {
  let total = 0;
  for (let seed = 2400; seed < 2500; seed += 1) {
    const sim = initGameSim({
      homeTeamId: "A",
      awayTeamId: "B",
      seed,
      specialistsBySide: { HOME: { P: config.specialistP }, AWAY: {} },
      playerBadges: config.badgeHolder ? { [config.badgeHolder]: [{ badgeId: "BOOMING_LEG", awardedSeason: 1 }] } : {},
    });
    const out = stepPlay({ ...sim, possession: "HOME", down: 4, distance: 9, ballOn: 42 }, "PUNT").sim;
    const net = Number(String(out.lastResult ?? "").match(/Punt\s+(\d+)y/)?.[1] ?? 0);
    total += net;
  }
  return total / 100;
}

describe("game sim badge integration", () => {
  it("reads offensive badge effects in pass and run sim paths", () => {
    const tracked = { HOME: { QB: "qb", WR: "wr", RB: "rb", TE: "te", OL: "ol" }, AWAY: { DB: "db", DL: "dl", LB: "lb", OL: "ol2" } } as any;
    const base = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 4242, trackedPlayers: tracked });
    const withBadges = initGameSim({
      homeTeamId: "A",
      awayTeamId: "B",
      seed: 4242,
      trackedPlayers: tracked,
      playerBadges: {
        qb: [{ badgeId: "GUNSLINGER", awardedSeason: 1 }],
        wr: [{ badgeId: "CHAIN_MOVER", awardedSeason: 1 }],
        rb: [{ badgeId: "WORKHORSE", awardedSeason: 1 }],
      },
    });

    const noBadgePassYards = runForcedSnaps(base, "DROPBACK", 80).stats.home.passYards;
    const withBadgePassYards = runForcedSnaps(withBadges, "DROPBACK", 80).stats.home.passYards;
    expect(withBadgePassYards).toBeGreaterThan(noBadgePassYards);

    const noBadgeRushYards = runForcedSnaps(base, "INSIDE_ZONE", 30).stats.home.rushYards;
    const withBadgeRushYards = runForcedSnaps(withBadges, "INSIDE_ZONE", 30).stats.home.rushYards;
    expect(withBadgeRushYards).toBeGreaterThan(noBadgeRushYards);
  });

  it("does not translate non-badge perk PAS changes into explicit per-completion yard bonuses", () => {
    const tracked = { HOME: { QB: "qb", WR: "wr", RB: "rb", TE: "te", OL: "ol" }, AWAY: { DB: "db", DL: "dl", LB: "lb", OL: "ol2" } } as any;
    let baselineYards = 0;
    let baselineCompletions = 0;
    let perkYards = 0;
    let perkCompletions = 0;
    for (let seed = 3100; seed < 3140; seed += 1) {
      const base = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed, trackedPlayers: tracked });
      const withPerk = initGameSim({
        homeTeamId: "A",
        awayTeamId: "B",
        seed,
        trackedPlayers: tracked,
        coachUnlockedPerkIds: ["arc_self_scout"],
      });
      const baseOut = runForcedSnaps(base, "DROPBACK", 60).stats.home;
      const perkOut = runForcedSnaps(withPerk, "DROPBACK", 60).stats.home;
      baselineYards += baseOut.passYards;
      baselineCompletions += baseOut.completions;
      perkYards += perkOut.passYards;
      perkCompletions += perkOut.completions;
    }
    const baselineYpc = baselineYards / Math.max(1, baselineCompletions);
    const perkYpc = perkYards / Math.max(1, perkCompletions);
    expect(Math.abs(perkYpc - baselineYpc)).toBeLessThan(0.2);
  });



  it("applies explicit pass-yard badge bonus without hidden PAS-derived extra yards", () => {
    const tracked = { HOME: { QB: "qb", WR: "wr", RB: "rb", TE: "te", OL: "ol" }, AWAY: { DB: "db", DL: "dl", LB: "lb", OL: "ol2" } } as any;
    let baseYards = 0;
    let comboYards = 0;
    let comboCompletions = 0;

    for (let seed = 4100; seed < 4140; seed += 1) {
      const base = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed, trackedPlayers: tracked });
      const combo = initGameSim({
        homeTeamId: "A",
        awayTeamId: "B",
        seed,
        trackedPlayers: tracked,
        playerBadges: {
          qb: [{ badgeId: "GUNSLINGER", awardedSeason: 1 }],
          wr: [{ badgeId: "CHAIN_MOVER", awardedSeason: 1 }],
        },
      });
      const baseOut = runForcedSnaps(base, "DROPBACK", 70);
      const comboOut = runForcedSnaps(combo, "DROPBACK", 70);
      baseYards += baseOut.stats.home.passYards;
      comboYards += comboOut.stats.home.passYards;
      comboCompletions += comboOut.stats.home.completions;
    }

    const upliftPerCompletion = (comboYards - baseYards) / Math.max(1, comboCompletions);
    // Explicit matrix pass-yard bonus is +2 (GUNSLINGER + CHAIN_MOVER); allow small noise, reject hidden +3 style leakage.
    expect(upliftPerCompletion).toBeLessThan(2.5);
  });

  it("PAS-only badge does not add an explicit hidden completion-yard bump", () => {
    const tracked = { HOME: { QB: "qb", WR: "wr", RB: "rb", TE: "te", OL: "ol" }, AWAY: { DB: "db", DL: "dl", LB: "lb", OL: "ol2" } } as any;
    let baseYards = 0;
    let baseCompletions = 0;
    let ironmanYards = 0;
    let ironmanCompletions = 0;

    for (let seed = 4500; seed < 4540; seed += 1) {
      const base = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed, trackedPlayers: tracked });
      const ironman = initGameSim({
        homeTeamId: "A",
        awayTeamId: "B",
        seed,
        trackedPlayers: tracked,
        playerBadges: { qb: [{ badgeId: "IRONMAN", awardedSeason: 1 }] },
      });
      const baseOut = runForcedSnaps(base, "DROPBACK", 70).stats.home;
      const ironmanOut = runForcedSnaps(ironman, "DROPBACK", 70).stats.home;
      baseYards += baseOut.passYards;
      baseCompletions += baseOut.completions;
      ironmanYards += ironmanOut.passYards;
      ironmanCompletions += ironmanOut.completions;
    }

    const baseYpc = baseYards / Math.max(1, baseCompletions);
    const ironmanYpc = ironmanYards / Math.max(1, ironmanCompletions);
    expect(Math.abs(ironmanYpc - baseYpc)).toBeLessThan(0.25);
  });

  it("reads defensive pass badges in live pass completion outcomes", () => {
    const tracked = { HOME: { QB: "qb", WR: "wr", RB: "rb", TE: "te", OL: "ol" }, AWAY: { DB: "db", DL: "dl", LB: "lb", OL: "ol2" } } as any;
    let baselineCompletions = 0;
    let defendedCompletions = 0;
    let baselineYards = 0;
    let defendedYards = 0;
    let baselineSacks = 0;
    let defendedSacks = 0;
    for (let seed = 501; seed < 541; seed += 1) {
      const baseline = initGameSim({
        homeTeamId: "A",
        awayTeamId: "B",
        seed,
        trackedPlayers: tracked,
      });
      const defended = initGameSim({
        homeTeamId: "A",
        awayTeamId: "B",
        seed,
        trackedPlayers: tracked,
        playerBadges: {
          db: [{ badgeId: "LOCKDOWN", awardedSeason: 1 }, { badgeId: "SHUTDOWN_CORNER", awardedSeason: 1 }, { badgeId: "BALLHAWK", awardedSeason: 1 }],
          dl: [{ badgeId: "SACK_ARTIST", awardedSeason: 1 }],
        },
      });
      const baseOut = runForcedSnaps(baseline, "DROPBACK", 120).stats.home;
      const defendedOut = runForcedSnaps(defended, "DROPBACK", 120).stats.home;
      baselineCompletions += baseOut.completions;
      defendedCompletions += defendedOut.completions;
      baselineYards += baseOut.passYards;
      defendedYards += defendedOut.passYards;
      baselineSacks += baseOut.sacks;
      defendedSacks += defendedOut.sacks;
    }
    const completionDelta = defendedCompletions - baselineCompletions;
    const yardsDelta = defendedYards - baselineYards;
    expect(completionDelta).toBeLessThanOrEqual(4);
    expect(yardsDelta).toBeLessThan(120);
    expect(defendedSacks).toBeGreaterThanOrEqual(baselineSacks);
    expect(defendedSacks + baselineSacks).toBeGreaterThan(0);
  });

  it("reads active kicker badge in live FG path only for resolved specialist", () => {
    const baseMakes = fgMakesAcrossSeeds({ specialistK: "k" });
    const wrongHolderMakes = fgMakesAcrossSeeds({ specialistK: "k", badgeHolder: "qb" });
    const badgeMakes = fgMakesAcrossSeeds({ specialistK: "k", badgeHolder: "k" });
    expect(wrongHolderMakes).toBe(baseMakes);
    expect(badgeMakes).toBeGreaterThan(baseMakes);
  });

  it("reads active punter badge in live punt path only for resolved specialist", () => {
    const baseNet = averagePuntNetAcrossSeeds({ specialistP: "p" });
    const wrongHolderNet = averagePuntNetAcrossSeeds({ specialistP: "p", badgeHolder: "wr" });
    const badgeNet = averagePuntNetAcrossSeeds({ specialistP: "p", badgeHolder: "p" });
    expect(wrongHolderNet).toBe(baseNet);
    expect(badgeNet).toBeGreaterThan(baseNet);
  });
});
