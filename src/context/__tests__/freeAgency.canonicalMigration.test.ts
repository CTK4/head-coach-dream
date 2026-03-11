import { describe, expect, it } from "vitest";
import { createInitialStateForTests, migrateSave, type GameState } from "@/context/GameContext";

describe("free agency canonical migration", () => {
  it("migrates legacy offseason free-agency signings into canonical state.freeAgency", () => {
    const base = createInitialStateForTests();
    const migrated = migrateSave({
      ...base,
      saveVersion: 1,
      season: 2027,
      acceptedOffer: { teamId: "CHI", years: 4, salary: 4_000_000, autonomy: 65, patience: 55, mediaNarrativeKey: "x", base: { years: 4, salary: 4_000_000, autonomy: 65 } },
      freeAgency: undefined,
      offseasonData: {
        ...base.offseasonData,
        freeAgency: {
          ...base.offseasonData.freeAgency,
          signings: ["P100"],
          capHitsByPlayerId: { P100: 6_500_000 },
        },
      },
    } as any) as GameState;

    expect(migrated.freeAgency.signingsByPlayerId.P100).toMatchObject({
      teamId: "CHI",
      aav: 6_500_000,
      years: 1,
    });
  });

  it("preserves canonical freeAgency state across save migration roundtrip", () => {
    const base = createInitialStateForTests();
    const canonical = {
      ...base,
      freeAgency: {
        ...base.freeAgency,
        initStatus: "ready" as const,
        offersByPlayerId: {
          P1: [{ offerId: "O1", playerId: "P1", teamId: "CHI", isUser: true, years: 3, aav: 5_000_000, createdWeek: 1, status: "PENDING" as const }],
        },
      },
    } as GameState;

    const migrated = migrateSave(canonical) as GameState;
    expect(migrated.freeAgency.offersByPlayerId.P1?.[0]).toMatchObject({ offerId: "O1", status: "PENDING" });
    expect(migrated.freeAgency.initStatus).toBe("ready");
  });
});
