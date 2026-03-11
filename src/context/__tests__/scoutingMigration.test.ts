import { describe, expect, it } from "vitest";
import remapFile from "@/data/migrations/draftClassIdRemap_v1.json";
import { getDraftClassProspectIds } from "@/data/draftClass";
import { migrateSave, type GameState } from "@/context/GameContext";

const draftIds = getDraftClassProspectIds();
const validRemapEntry = Object.entries((remapFile as { remap?: Record<string, string> }).remap ?? {}).find(([, to]) => draftIds.has(String(to)));
const [legacyId, canonicalId] = validRemapEntry ?? ["2697", "PLY_11697"];

describe("scouting migration canonical scaffolding", () => {
  it("upgrades older save shapes with canonical scouting containers", () => {
    const migrated = migrateSave({
      saveVersion: 1,
      season: 2026,
      saveSeed: 42,
      upcomingDraftClass: [{ id: "P1", name: "Prospect One", pos: "QB", grade: 78 }],
      scoutingState: undefined,
    }) as GameState;

    expect(migrated.upcomingDraftClass.length).toBeGreaterThan(0);
    expect(migrated.scoutingState).toBeTruthy();
    expect(Object.keys(migrated.scoutingState?.scoutProfiles ?? {}).length).toBeGreaterThan(0);
    expect(migrated.scoutingState?.combine?.resultsByProspectId).toBeTruthy();
    expect(migrated.scoutingState?.interviews?.resultsByProspectId).toBeTruthy();
    expect(migrated.scoutingState?.medical?.resultsByProspectId).toBeTruthy();
    expect(migrated.scoutingState?.workouts?.resultsByProspectId).toBeTruthy();
  });

  it("preserves legacy scouting payloads under canonical IDs and dedupes board order", () => {
    const migrated = migrateSave({
      saveVersion: 1,
      season: 2026,
      saveSeed: 7,
      upcomingDraftClass: [{ id: canonicalId, name: "Legacy Prospect", pos: "QB", grade: 80 }],
      scoutingState: {
        myBoardOrder: [legacyId, canonicalId, legacyId],
        scoutProfiles: { [legacyId]: { prospectId: legacyId, estCenter: 91, notes: { source: "legacy" } } },
        combine: {
          resultsByProspectId: { [legacyId]: { forty: "4.61", vert: "35" } },
          interviewResultsByProspectId: { [legacyId]: { category: "IQ", score: 74 } },
          prospects: { [legacyId]: { notes: ["legacy-note"] } },
        },
        interviews: {
          history: { [legacyId]: [{ id: 1, category: "IQ" }] },
          modelARevealByProspectId: { [legacyId]: { characterRevealPct: 50 } },
          resultsByProspectId: { [legacyId]: [{ score: 60 }] },
        },
        medical: { requests: { [legacyId]: true }, resultsByProspectId: { [legacyId]: { riskTier: "GREEN" } } },
        workouts: { resultsByProspectId: { [legacyId]: { completed: true, score: 77 } } },
      },
    } as unknown as Partial<GameState>) as GameState;

    const scouting = migrated.scoutingState!;
    expect(scouting.myBoardOrder).toEqual([canonicalId]);
    expect(scouting.scoutProfiles[canonicalId]?.estCenter).toBe(91);
    expect((scouting.combine.resultsByProspectId as Record<string, any>)[canonicalId]?.forty).toBe("4.61");
    expect((scouting.combine.interviewResultsByProspectId as Record<string, any>)[canonicalId]?.score).toBe(74);
    expect((scouting.combine.prospects as Record<string, any>)[canonicalId]?.notes?.[0]).toBe("legacy-note");
    expect((scouting.interviews.history as Record<string, any>)[canonicalId]?.[0]?.category).toBe("IQ");
    expect((scouting.interviews.modelARevealByProspectId as Record<string, any>)[canonicalId]?.characterRevealPct).toBe(50);
    expect((scouting.interviews.resultsByProspectId as Record<string, any>)[canonicalId]?.[0]?.score).toBe(60);
    expect((scouting.medical.resultsByProspectId as Record<string, any>)[canonicalId]?.riskTier).toBe("GREEN");
    expect((scouting.workouts.resultsByProspectId as Record<string, any>)[canonicalId]?.score).toBe(77);
  });

  it("prefers populated legacy payload over empty canonical scaffolding on collision", () => {
    const migrated = migrateSave({
      saveVersion: 1,
      season: 2026,
      saveSeed: 9,
      upcomingDraftClass: [{ id: canonicalId, name: "Collision Prospect", pos: "QB", grade: 80 }],
      scoutingState: {
        scoutProfiles: {
          [canonicalId]: {},
          [legacyId]: { estCenter: 88, confidence: 42 },
        },
      },
    } as unknown as Partial<GameState>) as GameState;

    const profile = migrated.scoutingState?.scoutProfiles?.[canonicalId] as Record<string, unknown>;
    expect(profile?.estCenter).toBe(88);
    expect(profile?.confidence).toBe(42);
  });
});
