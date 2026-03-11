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

  it("does not translate non-badge perk PAS changes into generic pass-yards bonuses", () => {
    const tracked = { HOME: { QB: "qb", WR: "wr", RB: "rb", TE: "te", OL: "ol" }, AWAY: { DB: "db", DL: "dl", LB: "lb", OL: "ol2" } } as any;
    let baseline = 0;
    let perkOnly = 0;
    for (let seed = 3100; seed < 3140; seed += 1) {
      const base = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed, trackedPlayers: tracked });
      const withPerk = initGameSim({
        homeTeamId: "A",
        awayTeamId: "B",
        seed,
        trackedPlayers: tracked,
        coachUnlockedPerkIds: ["arc_self_scout"],
      });
      baseline += runForcedSnaps(base, "DROPBACK", 60).stats.home.passYards;
      perkOnly += runForcedSnaps(withPerk, "DROPBACK", 60).stats.home.passYards;
    }
    expect(Math.abs(perkOnly - baseline)).toBeLessThan(120);
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

  it("reads defensive pass badges in live pass resolution", () => {
    const tracked = { HOME: { QB: "qb", WR: "wr", RB: "rb", TE: "te", OL: "ol" }, AWAY: { DB: "db", DL: "dl", LB: "lb", OL: "ol2" } } as any;
    let offenseBoostedTotal = 0;
    let defendedTotal = 0;
    for (let seed = 501; seed < 541; seed += 1) {
      const offenseBoosted = initGameSim({
        homeTeamId: "A",
        awayTeamId: "B",
        seed,
        trackedPlayers: tracked,
        playerBadges: { qb: [{ badgeId: "GUNSLINGER", awardedSeason: 1 }], wr: [{ badgeId: "CHAIN_MOVER", awardedSeason: 1 }] },
      });
      const defended = initGameSim({
        homeTeamId: "A",
        awayTeamId: "B",
        seed,
        trackedPlayers: tracked,
        playerBadges: {
          qb: [{ badgeId: "GUNSLINGER", awardedSeason: 1 }],
          wr: [{ badgeId: "CHAIN_MOVER", awardedSeason: 1 }],
          db: [{ badgeId: "LOCKDOWN", awardedSeason: 1 }, { badgeId: "SHUTDOWN_CORNER", awardedSeason: 1 }, { badgeId: "BALLHAWK", awardedSeason: 1 }],
          dl: [{ badgeId: "SACK_ARTIST", awardedSeason: 1 }],
        },
      });
      offenseBoostedTotal += runForcedSnaps(offenseBoosted, "DROPBACK", 120).stats.home.passYards;
      defendedTotal += runForcedSnaps(defended, "DROPBACK", 120).stats.home.passYards;
    }
    expect(defendedTotal).toBeLessThan(offenseBoostedTotal);
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
