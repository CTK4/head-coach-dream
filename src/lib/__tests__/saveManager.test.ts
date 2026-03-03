import { beforeEach, describe, expect, it } from "vitest";
import { exportSave, importSave, loadSaveResult, syncCurrentSave } from "@/lib/saveManager";
import { LATEST_SAVE_SCHEMA_VERSION, migrateSaveSchema, validateCriticalSaveState } from "@/lib/migrations/saveSchema";

class LocalStorageMock {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
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
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new LocalStorageMock(),
      configurable: true,
      writable: true,
    });
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
    localStorage.setItem(storageKey, JSON.stringify(baseState));
    localStorage.setItem(
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

    const loaded = loadSaveResult(saveId);
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
    localStorage.setItem(storageKey, "{bad json");
    localStorage.setItem(`${storageKey}__bak`, JSON.stringify({ ...baseState, schemaVersion: 1, saveId }));
    localStorage.setItem(
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

    const loaded = loadSaveResult(saveId);
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

    localStorage.setItem(storageKey, initialSlot);
    localStorage.setItem("hc_career_save", initialLegacy);
    localStorage.setItem("hc_career_active_save_id", "different-active-slot");
    localStorage.setItem(
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

    const exported = exportSave(saveId);
    expect(exported).toBeTruthy();
    expect(localStorage.getItem("hc_career_active_save_id")).toBe("different-active-slot");
    expect(localStorage.getItem("hc_career_save")).toBe(initialLegacy);
    expect(localStorage.getItem(storageKey)).toBe(initialSlot);

    const exportText = await exported!.blob.text();
    const parsed = JSON.parse(exportText);
    expect(parsed.saveId).toBe(saveId);
    expect(parsed.schemaVersion).toBe(LATEST_SAVE_SCHEMA_VERSION);
  });

  it("import/export round trip preserves critical state", async () => {
    syncCurrentSave({ ...baseState, schemaVersion: 1, saveId: "slot-a" } as any, "slot-a");
    const exported = exportSave("slot-a");
    expect(exported).toBeTruthy();
    const text = await exported!.blob.text();

    const imported = importSave(text);
    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.state.coach.name).toBe("Coach Test");
      expect(imported.state.season).toBe(2026);
      expect(imported.state.teamId).toBe("MILWAUKEE_NORTHSHORE");
      expect(imported.state.schemaVersion).toBe(LATEST_SAVE_SCHEMA_VERSION);
    }
  });
});
