import { beforeEach, describe, expect, it } from "vitest";
import { createSaveManager } from "@/lib/saveManager";
import { LATEST_SAVE_SCHEMA_VERSION, migrateSaveSchema, validateCriticalSaveState } from "@/lib/migrations/saveSchema";

class LocalStorageMock {
  private store = new Map<string, string>();
  failOnSetItemKey: string | null = null;
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    if (this.failOnSetItemKey === key) {
      throw new Error(`setItem failed for ${key}`);
    }
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

const baseState = {
  phase: "HUB",
  season: 2026,
  week: 1,
  coach: { name: "Coach Test" },
  teamId: "MILWAUKEE_NORTHSHORE",
  offseason: { stepId: "RESIGNING" },
  hub: { regularSeasonWeek: 1 },
  currentStandings: [],
  careerStage: "OFFSEASON_HUB",
};

describe("saveManager", () => {
  let storage: LocalStorageMock;
  let saveManager: ReturnType<typeof createSaveManager>;

  beforeEach(() => {
    storage = new LocalStorageMock();
    saveManager = createSaveManager({ storage });
  });

  describe("validateCriticalSaveState — phase domain", () => {
    it("accepts CREATE phase", () => {
      expect(validateCriticalSaveState({ ...baseState, phase: "CREATE" }).ok).toBe(true);
    });

    it("accepts BACKGROUND phase", () => {
      expect(validateCriticalSaveState({ ...baseState, phase: "BACKGROUND" }).ok).toBe(true);
    });

    it("accepts INTERVIEWS phase", () => {
      expect(validateCriticalSaveState({ ...baseState, phase: "INTERVIEWS" }).ok).toBe(true);
    });

    it("accepts OFFERS phase", () => {
      expect(validateCriticalSaveState({ ...baseState, phase: "OFFERS" }).ok).toBe(true);
    });

    it("accepts COORD_HIRING phase", () => {
      expect(validateCriticalSaveState({ ...baseState, phase: "COORD_HIRING" }).ok).toBe(true);
    });

    it("accepts HUB phase", () => {
      expect(validateCriticalSaveState({ ...baseState, phase: "HUB" }).ok).toBe(true);
    });

    it("rejects careerStage values used as phase", () => {
      const invalidCareerPhases = ["OFFSEASON_HUB", "REGULAR_SEASON", "PLAYOFFS", "DRAFT", "PRESEASON", "SEASON_AWARDS"];
      for (const phase of invalidCareerPhases) {
        const result = validateCriticalSaveState({ ...baseState, phase });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.code).toBe("INVALID_PHASE");
        }
      }
    });

    it("rejects empty or missing phase", () => {
      const emptyPhase = validateCriticalSaveState({ ...baseState, phase: "" });
      expect(emptyPhase.ok).toBe(false);
      if (!emptyPhase.ok) {
        expect(emptyPhase.code).toBe("INVALID_PHASE");
      }

      const missingPhaseState = { ...baseState } as any;
      delete missingPhaseState.phase;
      const missingPhase = validateCriticalSaveState(missingPhaseState);
      expect(missingPhase.ok).toBe(false);
      if (!missingPhase.ok) {
        expect(missingPhase.code).toBe("INVALID_PHASE");
      }
    });

    it("rejects unknown phase string", () => {
      const result = validateCriticalSaveState({ ...baseState, phase: "BANANA" });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe("INVALID_PHASE");
      }
    });
  });

  describe("validateCriticalSaveState — careerStage domain", () => {
    it("accepts valid careerStage with HUB phase", () => {
      expect(validateCriticalSaveState({ ...baseState, phase: "HUB", careerStage: "REGULAR_SEASON" }).ok).toBe(true);
    });

    it("accepts missing careerStage for backward compatibility", () => {
      const state = { ...baseState } as any;
      delete state.careerStage;
      expect(validateCriticalSaveState(state).ok).toBe(true);
    });

    it("rejects invalid careerStage string", () => {
      const result = validateCriticalSaveState({ ...baseState, careerStage: "BANANA" });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe("INVALID_CAREER_STAGE");
      }
    });
  });

  describe("validateCriticalSaveState — real-world save shapes", () => {
    it("accepts regular-season in-hub save", () => {
      const result = validateCriticalSaveState({
        ...baseState,
        phase: "HUB",
        careerStage: "REGULAR_SEASON",
        season: 2026,
        hub: { regularSeasonWeek: 8 },
        acceptedOffer: { teamId: "MILWAUKEE_NORTHSHORE" },
        coach: { name: "Coach Test" },
      });
      expect(result.ok).toBe(true);
    });

    it("accepts playoff save", () => {
      const result = validateCriticalSaveState({
        ...baseState,
        phase: "HUB",
        careerStage: "PLAYOFFS",
        hub: { regularSeasonWeek: 18 },
        acceptedOffer: { teamId: "MILWAUKEE_NORTHSHORE" },
        coach: { name: "Coach Test" },
      });
      expect(result.ok).toBe(true);
    });

    it("accepts onboarding pre-hub save", () => {
      const result = validateCriticalSaveState({
        ...baseState,
        phase: "CREATE",
        season: 2026,
        teamId: "MILWAUKEE_NORTHSHORE",
        coach: { name: "Coach Test" },
      });
      expect(result.ok).toBe(true);
    });
  });

  it("loads legacy save without schemaVersion and migrates to latest", () => {
    const saveId = "legacy-save";
    const storageKey = `hc_career_save__${saveId}`;
    storage.setItem(storageKey, JSON.stringify(baseState));
    storage.setItem(
      "hc_career_saves_index",
      JSON.stringify([
        {
          saveId,
          storageKey,
          coachName: "Coach Test",
          teamName: "Milwaukee Northshore",
          season: 2026,
          week: 1,
          record: { wins: 0, losses: 0 },
          lastPlayed: Date.now(),
          careerStage: "OFFSEASON_HUB",
        },
      ]),
    );

    const loaded = saveManager.loadSaveResult(saveId);
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.state.schemaVersion).toBe(LATEST_SAVE_SCHEMA_VERSION);
      expect(loaded.state.saveId).toBe(saveId);
    }
  });

  it("backfills userTeamId during migration", () => {
    const migrated = migrateSaveSchema({ ...baseState, userTeamId: undefined, acceptedOffer: { teamId: "MILWAUKEE_NORTHSHORE" } } as any, "slot-a");
    expect(migrated.userTeamId).toBe("MILWAUKEE_NORTHSHORE");
  });

  it("detects corrupt JSON and restores from backup", () => {
    const saveId = "corrupt-save";
    const storageKey = `hc_career_save__${saveId}`;
    storage.setItem(storageKey, "{bad json");
    storage.setItem(`${storageKey}__bak`, JSON.stringify({ ...baseState, schemaVersion: 1, saveId }));
    storage.setItem(
      "hc_career_saves_index",
      JSON.stringify([
        {
          saveId,
          storageKey,
          coachName: "Coach Test",
          teamName: "Milwaukee Northshore",
          season: 2026,
          week: 1,
          record: { wins: 0, losses: 0 },
          lastPlayed: Date.now(),
          careerStage: "OFFSEASON_HUB",
        },
      ]),
    );

    const loaded = saveManager.loadSaveResult(saveId);
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.state.saveId).toBe(saveId);
    }
  });

  it("exportSave_is_pure_does_not_change_active_or_legacy", async () => {
    const saveId = "slot-pure";
    const storageKey = `hc_career_save__${saveId}`;
    const initialSlot = JSON.stringify({ ...baseState, schemaVersion: 1, saveId });
    const initialLegacy = JSON.stringify({ ...baseState, schemaVersion: 1, saveId: "legacy" });

    storage.setItem(storageKey, initialSlot);
    storage.setItem("hc_career_save", initialLegacy);
    storage.setItem("hc_career_active_save_id", "different-active-slot");
    storage.setItem(
      "hc_career_saves_index",
      JSON.stringify([
        {
          saveId,
          storageKey,
          coachName: "Coach Test",
          teamName: "Milwaukee Northshore",
          season: 2026,
          week: 1,
          record: { wins: 0, losses: 0 },
          lastPlayed: Date.now(),
          careerStage: "OFFSEASON_HUB",
        },
      ]),
    );

    const exported = saveManager.exportSave(saveId);
    expect(exported).toBeTruthy();
    expect(storage.getItem("hc_career_active_save_id")).toBe("different-active-slot");
    expect(storage.getItem("hc_career_save")).toBe(initialLegacy);
    expect(storage.getItem(storageKey)).toBe(initialSlot);

    const exportText = await exported!.blob.text();
    const parsed = JSON.parse(exportText);
    expect(parsed.saveId).toBe(saveId);
    expect(parsed.schemaVersion).toBe(LATEST_SAVE_SCHEMA_VERSION);
  });

  it("import/export round trip preserves critical state", async () => {
    saveManager.syncCurrentSave({ ...baseState, schemaVersion: 1, saveId: "slot-a" } as any, "slot-a");
    const exported = saveManager.exportSave("slot-a");
    expect(exported).toBeTruthy();
    const text = await exported!.blob.text();

    const imported = saveManager.importSave(text);
    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.state.coach.name).toBe("Coach Test");
      expect(imported.state.season).toBe(2026);
      expect(imported.state.teamId).toBe("MILWAUKEE_NORTHSHORE");
      expect(imported.state.schemaVersion).toBe(LATEST_SAVE_SCHEMA_VERSION);
    }
  });

  it("commitAtomic_throws_and_does_not_mutate_index_on_failure", () => {
    const saveId = "slot-a";
    const storageKey = `hc_career_save__${saveId}`;
    const previousIndex = [
      {
        saveId,
        storageKey,
        coachName: "Coach Existing",
        teamName: "Milwaukee Northshore",
        season: 2025,
        week: 10,
        record: { wins: 7, losses: 3 },
        lastPlayed: 100,
        careerStage: "REGULAR_SEASON",
      },
    ];

    storage.setItem(storageKey, JSON.stringify({ ...baseState, schemaVersion: 1, saveId, season: 2025 }));
    storage.setItem("hc_career_saves_index", JSON.stringify(previousIndex));
    storage.setItem("hc_career_active_save_id", saveId);

    storage.failOnSetItemKey = `${storageKey}__tmp`;

    expect(() => saveManager.syncCurrentSave({ ...baseState, schemaVersion: 1, season: 2026, saveId } as any, saveId)).toThrow(/Failed to set localStorage key/);

    expect(storage.getItem("hc_career_saves_index")).toBe(JSON.stringify(previousIndex));
    expect(storage.getItem("hc_career_active_save_id")).toBe(saveId);

    storage.failOnSetItemKey = null;
    const loaded = saveManager.loadSaveResult(saveId);
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.state.season).toBe(2025);
    }
  });
});
