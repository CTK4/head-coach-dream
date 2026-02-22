import { describe, expect, it } from "vitest";
import type { GameState } from "@/context/GameContext";
import { resolveInjuries } from "@/engine/injuries";

function mkState(overrides: Partial<GameState>): GameState {
  return {
    saveSeed: 123,
    acceptedOffer: {
      teamId: "MILWAUKEE_NORTHSHORE",
      years: 3,
      salary: 2_000_000,
      autonomy: 50,
      patience: 50,
      mediaNarrativeKey: "STANDARD",
      base: { years: 3, salary: 2_000_000, autonomy: 50 },
    } as any,
    hub: { regularSeasonWeek: 5, preseasonWeek: 1, schedule: null, news: [], newsReadIds: {}, newsFilter: "ALL" } as any,
    injuries: [],
    ...overrides,
  } as any;
}

describe("injuries lifecycle", () => {
  it("is deterministic given seed+week", () => {
    const a = resolveInjuries(mkState({ hub: { regularSeasonWeek: 6 } as any }));
    const b = resolveInjuries(mkState({ hub: { regularSeasonWeek: 6 } as any }));
    expect(a.injuries?.map((x) => x.id)).toEqual(b.injuries?.map((x) => x.id));
  });

  it("injuries can return after expectedReturnWeek", () => {
    const s = mkState({
      hub: { regularSeasonWeek: 10 } as any,
      injuries: [
        {
          id: "INJ_1",
          playerId: "PLY_1",
          teamId: "MILWAUKEE_NORTHSHORE",
          injuryType: "Hamstring",
          bodyArea: "UPPER_LEG",
          severity: "MINOR",
          status: "OUT",
          startWeek: 8,
          expectedReturnWeek: 9,
          isSeasonEnding: false,
          badges: ["NEW"],
        },
      ] as any,
    });
    const tick = resolveInjuries(s);
    const tracked = tick.injuries?.find((x) => x.id === "INJ_1");
    expect(tracked).toBeTruthy();
    expect(tracked?.badges?.includes("RETURNING")).toBe(true);

    const tick2 = resolveInjuries({ ...(tick as any), hub: { ...(tick.hub as any), regularSeasonWeek: 11 } });
    expect(tick2.injuries?.some((x) => x.id === "INJ_1")).toBe(false);
  });
});
