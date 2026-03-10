import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { applySeasonUnicorns, evaluatePlayerUnicorn, UNICORN_DEFINITIONS } from "@/engine/unicorns/engine";

function initState(teamId = "MILWAUKEE_NORTHSHORE"): GameState {
  const seeded = gameReducer({} as GameState, {
    type: "INIT_NEW_GAME_FROM_STORY",
    payload: {
      offer: {
        teamId,
        years: 4,
        salary: 4_000_000,
        autonomy: 65,
        patience: 55,
        mediaNarrativeKey: "story_start",
        base: { years: 4, salary: 4_000_000, autonomy: 65 },
      },
      teamName: "Test Team",
    },
  });
  return gameReducer(seeded, { type: "INIT_FREE_PLAY_CAREER", payload: { teamId, teamName: "Test Team" } });
}

describe("unicorn engine", () => {
  it("assigns unicorn when prospect meets thresholds + traits", () => {
    const base = initState();
    const savedRarity = UNICORN_DEFINITIONS[0].rarity;
    UNICORN_DEFINITIONS[0].rarity = 1;
    const state: GameState = {
      ...base,
      upcomingDraftClass: [{ prospectId: "P1", id: "P1", name: "Rocket Arm", pos: "QB", age: 22 } as any],
      scoutingState: {
        ...(base.scoutingState as any),
        trueProfiles: {
          P1: {
            trueOVR: 90,
            trueAttributes: { armStrength: 99, throwOnMove: 88, processing: 80 },
            traits: ["ARM_TALENT_ELITE", "UNICORN_FRAME"],
          },
        },
      },
    };

    const found = evaluatePlayerUnicorn(state, "P1", state.season);
    UNICORN_DEFINITIONS[0].rarity = savedRarity;
    expect(found?.archetypeId).toBe("QB_UNICORN_ARM_POWER");
    expect((found?.confidence ?? 0) >= 0.7).toBe(true);
  });

  it("does not assign when confidence is low", () => {
    const base = initState();
    const state: GameState = {
      ...base,
      upcomingDraftClass: [{ prospectId: "P2", id: "P2", name: "Raw Prospect", pos: "QB", age: 22 } as any],
      scoutingState: {
        ...(base.scoutingState as any),
        trueProfiles: {
          P2: {
            trueOVR: 72,
            trueAttributes: { armStrength: 70, throwOnMove: 64, processing: 61 },
            traits: [],
          },
        },
      },
    };

    expect(evaluatePlayerUnicorn(state, "P2", state.season)).toBeNull();
  });

  it("does not re-evaluate existing unicorn", () => {
    const base = initState();
    const state: GameState = {
      ...base,
      playerUnicorns: {
        EXISTING: { archetypeId: "QB_UNICORN_ARM_POWER", discoveredSeason: base.season - 1, confidence: 0.92 },
      },
    };

    expect(evaluatePlayerUnicorn(state, "EXISTING", state.season)).toBeNull();
  });

  it("news generated only for high-confidence unicorn discoveries", () => {
    const base = initState();
    const savedRarity = UNICORN_DEFINITIONS[0].rarity;
    UNICORN_DEFINITIONS[0].rarity = 1;
    const state: GameState = {
      ...base,
      upcomingDraftClass: [{ prospectId: "P3", id: "P3", name: "Elite Prospect", pos: "QB", age: 22 } as any],
      scoutingState: {
        ...(base.scoutingState as any),
        trueProfiles: {
          P3: {
            trueOVR: 95,
            trueAttributes: { armStrength: 99, throwOnMove: 90, processing: 88 },
            traits: ["ARM_TALENT_ELITE", "UNICORN_FRAME"],
          },
        },
      },
    };

    const next = applySeasonUnicorns(state);
    UNICORN_DEFINITIONS[0].rarity = savedRarity;
    expect(next.playerUnicorns.P3).toBeTruthy();
    expect((next.hub.news ?? []).some((n) => String(n.title).includes("unicorn candidate"))).toBe(true);
  });

  it("save migration adds empty playerUnicorns map", () => {
    const base = initState();
    const migrated = migrateSave({ ...base, playerUnicorns: undefined }) as GameState;
    expect(migrated.playerUnicorns).toEqual({});
  });
});
