import { describe, expect, it } from "vitest";
import { migrateSave } from "@/context/GameContext";
import { deriveSaveSeedFromIdentity } from "@/context/state/seedPolicy";

describe("save seed derivation policy", () => {
  it("derives unique seeds for different fresh save identities", () => {
    const a = deriveSaveSeedFromIdentity({ saveId: "career-1" });
    const b = deriveSaveSeedFromIdentity({ saveId: "career-2" });

    expect(a).not.toBe(b);
  });

  it("derives stable seed for the same fresh save identity", () => {
    const first = deriveSaveSeedFromIdentity({ saveId: "career-42" });
    const second = deriveSaveSeedFromIdentity({ saveId: "career-42" });

    expect(first).toBe(second);
  });

  it("derives identical saveSeed when loading the same legacy blob twice", () => {
    const legacyBlob = {
      season: 2031,
      week: 9,
      saveId: "legacy-slot-7",
      teamId: "CHI",
      userTeamId: "CHI",
      coach: { coachId: "USER_COACH" },
      acceptedOffer: { teamId: "CHI" },
      league: { week: 9, tradeDeadlineWeek: 10, standings: { CHI: { teamId: "CHI", wins: 5, losses: 3, ties: 0, pf: 180, pa: 150, divWins: 2, divLosses: 1, confWins: 4, confLosses: 2, streak: 1 } } },
      finances: { cap: 255_000_000, carryover: 3_500_000, cash: 64_500_000, deadCapThisYear: 1_000_000 },
      deterministicCounters: { autosaveCounter: 4, manualSaveCounter: 2 },
      saveSeed: undefined,
    } as any;

    const first = migrateSave(legacyBlob);
    const second = migrateSave(legacyBlob);

    expect(first.saveSeed).toBeDefined();
    expect(first.saveSeed).toBe(second.saveSeed);
  });

  it("migration remains deterministic across repeated runs when saveSeed is missing", () => {
    const input = {
      season: 2028,
      week: 3,
      userTeamId: "MILWAUKEE_NORTHSHORE",
      teamId: "MILWAUKEE_NORTHSHORE",
      saveSeed: undefined,
    } as any;

    const runs = Array.from({ length: 5 }, () => migrateSave(input).saveSeed);

    expect(new Set(runs).size).toBe(1);
    expect(runs[0]).toBeGreaterThan(0);
  });

  it("keeps derived schedule stable for repeated migration of the same legacy blob", () => {
    const input = {
      season: 2029,
      week: 1,
      saveId: "legacy-slot-9",
      userTeamId: "CHI",
      teamId: "CHI",
      saveSeed: undefined,
    } as any;

    const first = migrateSave(input);
    const second = migrateSave(input);

    expect(first.saveSeed).toBe(second.saveSeed);
    expect(first.hub?.schedule).toEqual(second.hub?.schedule);
  });
});
