import { describe, expect, it } from "vitest";
import { BADGE_DEFINITIONS } from "@/engine/badges/engine";
import { BADGE_EFFECT_MATRIX, resolveBadgeSimModifiers } from "@/engine/badges/effects";

describe("badge effects matrix", () => {
  it("covers every badge with a mechanical mapping", () => {
    const defs = new Set(BADGE_DEFINITIONS.map((d) => d.id));
    const mapped = new Set(BADGE_EFFECT_MATRIX.map((r) => r.badgeId));
    expect(mapped).toEqual(defs);
    expect(BADGE_EFFECT_MATRIX.every((row) => row.mechanical)).toBe(true);
  });

  it("keeps matrix text aligned with implemented mechanics for known drift points", () => {
    const rowById = Object.fromEntries(BADGE_EFFECT_MATRIX.map((r) => [r.badgeId, r] as const));
    expect(String(rowById.GUNSLINGER.effect)).toContain("+1 pass yards");
    expect(String(rowById.CHAIN_MOVER.effect)).toContain("+1 pass yards");
    expect(String(rowById.CLUTCH_KICKER.appliesIn)).toContain("active kicker only");
    expect(String(rowById.BOOMING_LEG.appliesIn)).toContain("active punter only");

    const mods = resolveBadgeSimModifiers(
      {
        qb: [{ badgeId: "GUNSLINGER", awardedSeason: 1 }],
        rb: [{ badgeId: "CHAIN_MOVER", awardedSeason: 1 }],
      } as any,
      { playType: "DROPBACK", ballOn: 55, offenseIds: { QB: "qb", RB: "rb" }, defenseIds: {} },
    );

    expect(mods.pasDelta).toBeGreaterThan(0);
    expect(mods.passYardsDelta).toBe(2);
  });

  it("applies RED_ZONE_REAPER only in red zone and without multi-player stacking", () => {
    const badges = {
      qb: [{ badgeId: "RED_ZONE_REAPER", awardedSeason: 1 }],
      wr: [{ badgeId: "RED_ZONE_REAPER", awardedSeason: 1 }],
      te: [{ badgeId: "RED_ZONE_REAPER", awardedSeason: 1 }],
    } as any;

    const outside = resolveBadgeSimModifiers(badges, { playType: "DROPBACK", ballOn: 70, offenseIds: { QB: "qb", WR: "wr", TE: "te" }, defenseIds: {} });
    const inRedZone = resolveBadgeSimModifiers(badges, { playType: "DROPBACK", ballOn: 85, offenseIds: { QB: "qb", WR: "wr", TE: "te" }, defenseIds: {} });

    expect(outside.pasDelta).toBe(0);
    expect(inRedZone.pasDelta).toBe(0.03);
  });


  it("applies defensive pass badges", () => {
    const mods = resolveBadgeSimModifiers(
      {
        db: [{ badgeId: "LOCKDOWN", awardedSeason: 1 }, { badgeId: "SHUTDOWN_CORNER", awardedSeason: 1 }],
        dl: [{ badgeId: "SACK_ARTIST", awardedSeason: 1 }],
      } as any,
      { playType: "DROPBACK", ballOn: 55, offenseIds: { QB: "qb" }, defenseIds: { DB: "db", DL: "dl" } },
    );

    expect(mods.pasDelta).toBeLessThan(0);
  });

  it("applies specialist badges only for active specialist ids", () => {
    const wrongFg = resolveBadgeSimModifiers({ qb: [{ badgeId: "CLUTCH_KICKER", awardedSeason: 1 }] } as any, {
      playType: "FG",
      ballOn: 65,
      offenseIds: { QB: "qb" },
      defenseIds: {},
      specialistIds: { K: "k" },
    });
    const rightFg = resolveBadgeSimModifiers({ k: [{ badgeId: "CLUTCH_KICKER", awardedSeason: 1 }] } as any, {
      playType: "FG",
      ballOn: 65,
      offenseIds: {},
      defenseIds: {},
      specialistIds: { K: "k" },
    });

    const wrongPunt = resolveBadgeSimModifiers({ wr: [{ badgeId: "BOOMING_LEG", awardedSeason: 1 }] } as any, {
      playType: "PUNT",
      ballOn: 40,
      offenseIds: { WR: "wr" },
      defenseIds: {},
      specialistIds: { P: "p" },
    });
    const rightPunt = resolveBadgeSimModifiers({ p: [{ badgeId: "BOOMING_LEG", awardedSeason: 1 }] } as any, {
      playType: "PUNT",
      ballOn: 40,
      offenseIds: {},
      defenseIds: {},
      specialistIds: { P: "p" },
    });

    expect(wrongFg.fgAccuracyDelta).toBe(0);
    expect(wrongFg.fgPowerDelta).toBe(0);
    expect(rightFg.fgAccuracyDelta).toBe(3);
    expect(rightFg.fgPowerDelta).toBe(1);

    expect(wrongPunt.puntPowerDelta).toBe(0);
    expect(wrongPunt.puntHangDelta).toBe(0);
    expect(rightPunt.puntPowerDelta).toBe(3);
    expect(rightPunt.puntHangDelta).toBe(2);
  });

  it("matrix mechanical entries are represented by resolver outputs", () => {
    const matrix = Object.fromEntries(BADGE_EFFECT_MATRIX.map((row) => [row.badgeId, row] as const));

    const ironman = resolveBadgeSimModifiers({ qb: [{ badgeId: "IRONMAN", awardedSeason: 1 }] } as any, { playType: "DROPBACK", ballOn: 50, offenseIds: { QB: "qb" }, defenseIds: {} });
    const gunslinger = resolveBadgeSimModifiers({ qb: [{ badgeId: "GUNSLINGER", awardedSeason: 1 }] } as any, { playType: "DROPBACK", ballOn: 50, offenseIds: { QB: "qb" }, defenseIds: {} });
    const chainMover = resolveBadgeSimModifiers({ wr: [{ badgeId: "CHAIN_MOVER", awardedSeason: 1 }] } as any, { playType: "DROPBACK", ballOn: 50, offenseIds: { WR: "wr" }, defenseIds: {} });
    const workhorse = resolveBadgeSimModifiers({ rb: [{ badgeId: "WORKHORSE", awardedSeason: 1 }] } as any, { playType: "INSIDE_ZONE", ballOn: 50, offenseIds: { RB: "rb" }, defenseIds: {} });
    const lockdown = resolveBadgeSimModifiers({ db: [{ badgeId: "LOCKDOWN", awardedSeason: 1 }] } as any, { playType: "DROPBACK", ballOn: 50, offenseIds: {}, defenseIds: { DB: "db" } });
    const sackArtist = resolveBadgeSimModifiers({ dl: [{ badgeId: "SACK_ARTIST", awardedSeason: 1 }] } as any, { playType: "DROPBACK", ballOn: 50, offenseIds: {}, defenseIds: { DL: "dl" } });
    const clutch = resolveBadgeSimModifiers({ k: [{ badgeId: "CLUTCH_KICKER", awardedSeason: 1 }] } as any, { playType: "FG", ballOn: 60, offenseIds: {}, defenseIds: {}, specialistIds: { K: "k" } });
    const booming = resolveBadgeSimModifiers({ p: [{ badgeId: "BOOMING_LEG", awardedSeason: 1 }] } as any, { playType: "PUNT", ballOn: 40, offenseIds: {}, defenseIds: {}, specialistIds: { P: "p" } });

    expect(matrix.IRONMAN.mechanical).toBe(true);
    expect(ironman.pasDelta).toBeGreaterThan(0);
    expect(gunslinger.pasDelta).toBeGreaterThan(0);
    expect(gunslinger.passYardsDelta).toBeGreaterThan(0);
    expect(chainMover.pasDelta).toBeGreaterThan(0);
    expect(chainMover.passYardsDelta).toBeGreaterThan(0);
    expect(workhorse.runYardsDelta).toBeGreaterThan(0);
    expect(lockdown.pasDelta).toBeLessThan(0);
    expect(sackArtist.pasDelta).toBeLessThan(0);
    expect(clutch.fgAccuracyDelta).toBeGreaterThan(0);
    expect(booming.puntPowerDelta).toBeGreaterThan(0);
  });


  it("bounds combined modifiers", () => {
    const playerBadges = {
      qb: ["IRONMAN", "GUNSLINGER", "ROAD_WARRIOR", "RED_ZONE_REAPER"].map((badgeId) => ({ badgeId, awardedSeason: 1 })),
      rb: ["WORKHORSE", "CHAIN_MOVER", "RED_ZONE_REAPER"].map((badgeId) => ({ badgeId, awardedSeason: 1 })),
      wr: ["CHAIN_MOVER", "RED_ZONE_REAPER"].map((badgeId) => ({ badgeId, awardedSeason: 1 })),
      db: ["LOCKDOWN", "BALLHAWK", "SHUTDOWN_CORNER"].map((badgeId) => ({ badgeId, awardedSeason: 1 })),
      dl: ["SACK_ARTIST"].map((badgeId) => ({ badgeId, awardedSeason: 1 })),
      k: [{ badgeId: "CLUTCH_KICKER", awardedSeason: 1 }],
      p: [{ badgeId: "BOOMING_LEG", awardedSeason: 1 }],
    } as any;

    const mods = resolveBadgeSimModifiers(playerBadges, {
      playType: "DROPBACK",
      ballOn: 85,
      offenseIds: { QB: "qb", RB: "rb", WR: "wr" },
      defenseIds: { DB: "db", DL: "dl" },
      specialistIds: { K: "k", P: "p" },
    });

    expect(mods.pasDelta).toBeGreaterThanOrEqual(-0.12);
    expect(mods.pasDelta).toBeLessThanOrEqual(0.12);
    expect(mods.runYardsDelta).toBeGreaterThanOrEqual(-2);
    expect(mods.runYardsDelta).toBeLessThanOrEqual(2);
    expect(mods.passYardsDelta).toBeGreaterThanOrEqual(-2);
    expect(mods.passYardsDelta).toBeLessThanOrEqual(2);
  });
});
