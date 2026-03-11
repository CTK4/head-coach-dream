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
  keys() {
    return [...this.store.keys()];
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
    expect(parsed.state.saveId).toBe(saveId);
    expect(parsed.state.schemaVersion).toBe(LATEST_SAVE_SCHEMA_VERSION);
  });

  it("import/export round trip preserves critical state", async () => {
    saveManager.syncCurrentSave({ ...baseState, schemaVersion: 1, saveId: "slot-a" } as any, "slot-a");
    const exported = saveManager.exportSave("slot-a");
    expect(exported).toBeTruthy();
    const text = await exported!.blob.text();
    const payload = JSON.parse(text);
    expect(payload.format).toBe("hc_save_export_v1");
    expect(payload.metadata.saveId).toBe("slot-a");
    expect(payload.metadata.version).toBeGreaterThan(0);
    expect(payload.state.saveId).toBe("slot-a");

    const imported = saveManager.importSave(text);
    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.state.coach.name).toBe("Coach Test");
      expect(imported.state.season).toBe(2026);
      expect(imported.state.teamId).toBe("MILWAUKEE_NORTHSHORE");
      expect(imported.state.schemaVersion).toBe(LATEST_SAVE_SCHEMA_VERSION);
      expect(imported.state.saveId).toMatch(/^import-\d+$/);
    }
  });

  it("auto-migrates legacy single-save into slot index", () => {
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 1 }));

    const saves = saveManager.listSaves();
    expect(saves).toHaveLength(1);
    const slot = saves[0];
    expect(slot.saveId).toBe("career-1");
    expect(slot.version).toBeGreaterThan(0);
    expect(storage.getItem("hc_career_saves_index")).toContain("career-1");
    expect(storage.getItem("hc_career_save__career-1")).toBeTruthy();
    expect(storage.getItem("hc_career_active_save_id")).toBe("career-1");
  });


  it("auto-migrates legacy save when index exists but is empty", () => {
    storage.setItem("hc_career_saves_index", "[]");
    storage.setItem("hc_career_active_save_id", "career-99");
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 1 }));

    const saves = saveManager.listSaves();
    expect(saves).toHaveLength(1);
    expect(saves[0].saveId).toBe("career-1");
    expect(storage.getItem("hc_career_saves_index")).toContain("career-1");
  });

  it("auto-migrates legacy save when index is corrupt", () => {
    storage.setItem("hc_career_saves_index", "{not-json");
    storage.setItem("hc_career_active_save_id", "career-88");
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 1 }));

    const saves = saveManager.listSaves();
    expect(saves).toHaveLength(1);
    expect(saves[0].saveId).toBe("career-1");
    expect(storage.getItem("hc_career_saves_index")).toContain("career-1");
  });


  it("falls back to legacy when index is malformed non-empty object row", () => {
    storage.setItem("hc_career_saves_index", "[{}]");
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 1 }));

    const saves = saveManager.listSaves();
    expect(saves).toHaveLength(1);
    const recovered = saves[0].saveId;
    expect(recovered).toMatch(/^career-\d+$/);
    expect(storage.getItem(`hc_career_save__${recovered}`)).toBeTruthy();
  });

  it("falls back to legacy when index has partial row", () => {
    storage.setItem("hc_career_saves_index", JSON.stringify([{ saveId: "career-1" }]));
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 1 }));

    const saves = saveManager.listSaves();
    expect(saves).toHaveLength(1);
    const recovered = saves[0].saveId;
    expect(recovered).toBe("career-1");
    expect(storage.getItem("hc_career_saves_index")).toContain("hc_career_save__career-1");
  });

  it("partial row with saveId+storageKey only falls back to legacy metadata", () => {
    storage.setItem("hc_career_saves_index", JSON.stringify([{ saveId: "career-1", storageKey: "hc_career_save__career-1" }]));
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 1 }));

    const saves = saveManager.listSaves();
    expect(saves).toHaveLength(1);
    expect(saves[0].coachName).toBe("Coach Test");
    expect(saves[0].teamName).toBe("Milwaukee Northshore");
    expect(saves[0].season).toBe(2026);
  });

  it("corrupt index recovery avoids clobbering existing career-1 slot", () => {
    storage.setItem("hc_career_saves_index", "{not-json");
    storage.setItem("hc_career_save__career-1", JSON.stringify({ ...baseState, season: 2035, saveId: "career-1", schemaVersion: 2 }));
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 1 }));

    const saves = saveManager.listSaves();
    expect(saves).toHaveLength(1);
    expect(saves[0].saveId).not.toBe("career-1");

    const existing = JSON.parse(storage.getItem("hc_career_save__career-1") ?? "null");
    expect(existing?.season).toBe(2035);
  });


  it("legacy payload saveId collision does not clobber existing slot", () => {
    storage.setItem("hc_career_saves_index", "{not-json");
    storage.setItem("hc_career_save__career-7", JSON.stringify({ ...baseState, season: 2040, saveId: "career-7", schemaVersion: 2 }));
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 1, saveId: "career-7" }));

    const saves = saveManager.listSaves();
    expect(saves).toHaveLength(1);
    expect(saves[0].saveId).toBe("career-7");

    const existing = JSON.parse(storage.getItem("hc_career_save__career-7") ?? "null");
    expect(existing?.season).toBe(2040);
  });

  it("delete last save does not resurrect from legacy mirror", () => {
    saveManager.syncCurrentSave({ ...baseState, schemaVersion: 1, saveId: "career-1" } as any, "career-1");
    expect(storage.getItem("hc_career_save__bak")).toBeTruthy();

    const activeId = saveManager.getActiveSaveId();
    expect(activeId).toBeTruthy();
    saveManager.deleteSave(activeId!);

    expect(storage.getItem("hc_career_save")).toBeNull();
    expect(storage.getItem("hc_career_save__bak")).toBeNull();
    expect(storage.getItem("hc_career_save__tmp")).toBeNull();
    expect(storage.getItem("hc_career_active_save_id")).toBeNull();
    expect(saveManager.listSaves()).toHaveLength(0);
  });

  it("legacy recovery repairs stale active id pointer", () => {
    storage.setItem("hc_career_saves_index", "[]");
    storage.setItem("hc_career_active_save_id", "unslotted-initial-state");
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 1 }));

    const saves = saveManager.listSaves();
    expect(saves).toHaveLength(1);
    const recovered = saves[0].saveId;
    expect(storage.getItem("hc_career_active_save_id")).toBe(recovered);
  });

  it("legacy payload valid saveId is respected and active id matches", () => {
    storage.setItem("hc_career_saves_index", "[]");
    storage.setItem("hc_career_active_save_id", "career-404");
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 1, saveId: "career-7" }));

    const saves = saveManager.listSaves();
    expect(saves).toHaveLength(1);
    expect(saves[0].saveId).toBe("career-7");
    expect(storage.getItem("hc_career_active_save_id")).toBe("career-7");
  });


  it("legacy recovery rewrites legacy mirror to migrated state", () => {
    storage.setItem("hc_career_saves_index", "[]");
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 1 }));

    saveManager.listSaves();

    const legacy = JSON.parse(storage.getItem("hc_career_save") ?? "null");
    expect(legacy?.schemaVersion).toBe(LATEST_SAVE_SCHEMA_VERSION);
    expect(legacy?.saveId).toMatch(/^career-\d+$/);
  });

  function expectNoFailedImportWrites() {
    expect(storage.getItem("hc_career_save_id_counter")).toBeNull();
    expect(storage.getItem("hc_career_saves_index")).toBeNull();
    expect(storage.getItem("hc_career_active_save_id")).toBeNull();
    expect(storage.keys().some((k) => k.startsWith("hc_career_save__"))).toBe(false);
  }

  it("rejects invalid import payload", () => {
    const imported = saveManager.importSave("{ definitely-not-json");
    expect(imported.ok).toBe(false);
    if (!imported.ok) {
      expect(imported.code).toBe("CORRUPT_SAVE");
    }
    expectNoFailedImportWrites();
  });


  it("rejects malformed envelope import", () => {
    const imported = saveManager.importSave(JSON.stringify({
      format: "hc_save_export_v1",
      exportedAt: Date.now(),
      metadata: { saveId: "slot-a" },
      state: "not-an-object",
    }));
    expect(imported.ok).toBe(false);
    if (!imported.ok) {
      expect(imported.code).toBe("INVALID_SAVE");
      expect(imported.message).toContain("malformed");
    }
    expectNoFailedImportWrites();
  });

  it("rejects arbitrary object import", () => {
    const imported = saveManager.importSave(JSON.stringify({ hello: "world" }));
    expect(imported.ok).toBe(false);
    if (!imported.ok) {
      expect(imported.code).toBe("INVALID_SAVE");
      expect(imported.message).toContain("not a valid save object");
    }
    expectNoFailedImportWrites();
  });

  it("rejects import with unsupported future schema version", () => {
    const imported = saveManager.importSave(JSON.stringify({
      ...baseState,
      schemaVersion: LATEST_SAVE_SCHEMA_VERSION + 1,
      saveId: "future-save",
    }));
    expect(imported.ok).toBe(false);
    if (!imported.ok) {
      expect(imported.code).toBe("INVALID_SAVE");
      expect(imported.message).toContain("newer than supported");
    }
    expectNoFailedImportWrites();
  });

  it("rejects structurally invalid save that fails critical validation without writes", () => {
    const imported = saveManager.importSave(JSON.stringify({
      ...baseState,
      phase: "BANANA",
    }));
    expect(imported.ok).toBe(false);
    if (!imported.ok) {
      expect(imported.code).toBe("INVALID_SAVE");
      expect(imported.validationCode).toBe("INVALID_PHASE");
    }
    expectNoFailedImportWrites();
  });

  it("successful import writes slot, active id, and latest schema", () => {
    const imported = saveManager.importSave(JSON.stringify({ ...baseState, schemaVersion: 1 }));
    expect(imported.ok).toBe(true);
    if (!imported.ok) return;
    expect(imported.state.saveId).toMatch(/^import-\d+$/);
    expect(imported.state.schemaVersion).toBe(LATEST_SAVE_SCHEMA_VERSION);

    const saveId = imported.state.saveId;
    expect(storage.getItem("hc_career_active_save_id")).toBe(saveId);
    expect(storage.getItem("hc_career_saves_index")).toContain(saveId);
    expect(storage.getItem(`hc_career_save__${saveId}`)).toBeTruthy();
    expect(storage.getItem("hc_career_save_id_counter")).toBeTruthy();
  });


  it("deleting active save repoints legacy and active to survivor", () => {
    saveManager.syncCurrentSave({ ...baseState, schemaVersion: 1, saveId: "career-1", season: 2026 } as any, "career-1");
    saveManager.syncCurrentSave({ ...baseState, schemaVersion: 1, saveId: "career-2", season: 2027 } as any, "career-2");

    saveManager.deleteSave("career-2");

    expect(storage.getItem("hc_career_active_save_id")).toBe("career-1");
    const legacy = JSON.parse(storage.getItem("hc_career_save") ?? "null");
    expect(legacy?.saveId).toBe("career-1");
  });


  it("deleting active save with no loadable survivors clears active and legacy mirror", () => {
    const now = Date.now();
    storage.setItem("hc_career_saves_index", JSON.stringify([
      {
        saveId: "career-1",
        storageKey: "hc_career_save__career-1",
        coachName: "Coach 1",
        teamName: "Milwaukee Northshore",
        season: 2026,
        week: 5,
        record: { wins: 3, losses: 2 },
        lastPlayed: now + 10,
        updatedAt: now + 10,
        careerStage: "REGULAR_SEASON",
      },
      {
        saveId: "career-2",
        storageKey: "hc_career_save__career-2",
        coachName: "Coach 2",
        teamName: "Milwaukee Northshore",
        season: 2027,
        week: 6,
        record: { wins: 4, losses: 2 },
        lastPlayed: now,
        updatedAt: now,
        careerStage: "REGULAR_SEASON",
      },
    ]));
    storage.setItem("hc_career_active_save_id", "career-1");
    storage.setItem("hc_career_save__career-1", JSON.stringify({ ...baseState, schemaVersion: 2, saveId: "career-1", season: 2026 }));
    storage.setItem("hc_career_save__career-2", "{broken-json");
    storage.setItem("hc_career_save", JSON.stringify({ ...baseState, schemaVersion: 2, saveId: "career-1" }));

    saveManager.deleteSave("career-1");

    expect(storage.getItem("hc_career_active_save_id")).toBeNull();
    expect(storage.getItem("hc_career_save")).toBeNull();
    expect(storage.getItem("hc_career_save__bak")).toBeNull();
    expect(storage.getItem("hc_career_save__tmp")).toBeNull();
    expect(storage.getItem("hc_career_save__career-1")).toBeNull();
    expect(storage.getItem("hc_career_save__career-2")).toBe("{broken-json");
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

  it("preserves jerseyNumber in player attribute overrides through migration", () => {
    const migrated = migrateSaveSchema({
      ...baseState,
      playerAttrOverrides: { "player-1": { jerseyNumber: 22 } },
      playerTeamOverrides: {},
      playerContractOverrides: {},
      userTeamId: "MILWAUKEE_NORTHSHORE",
      saveVersion: 6,
      schemaVersion: 2,
    } as any, "slot-jersey");
    expect((migrated.playerAttrOverrides as any)["player-1"].jerseyNumber).toBe(22);
  });

  it("allocateSaveId skips existing ids when counter is missing or stale", () => {
    const rows = [
      {
        saveId: "career-1",
        storageKey: "hc_career_save__career-1",
        coachName: "Coach 1",
        teamName: "Team",
        season: 2026,
        week: 1,
        record: { wins: 0, losses: 0 },
        lastPlayed: 1,
        careerStage: "OFFSEASON_HUB",
      },
      {
        saveId: "career-2",
        storageKey: "hc_career_save__career-2",
        coachName: "Coach 2",
        teamName: "Team",
        season: 2026,
        week: 1,
        record: { wins: 0, losses: 0 },
        lastPlayed: 2,
        careerStage: "OFFSEASON_HUB",
      },
      {
        saveId: "career-3",
        storageKey: "hc_career_save__career-3",
        coachName: "Coach 3",
        teamName: "Team",
        season: 2026,
        week: 1,
        record: { wins: 0, losses: 0 },
        lastPlayed: 3,
        careerStage: "OFFSEASON_HUB",
      },
    ];
    storage.setItem("hc_career_saves_index", JSON.stringify(rows));
    storage.setItem("hc_career_save_id_counter", "1");

    const next = saveManager.allocateSaveId("career");
    expect(next).toBe("career-4");
  });




  it("syncCurrentSave allocates a real slot when state has transient save id", () => {
    storage.setItem("hc_career_active_save_id", "career-9");
    storage.setItem("hc_career_save__career-9", JSON.stringify({ saveId: "career-9", season: 2029 }));
    const state = { ...baseState, schemaVersion: 1, saveId: "transient-career-1", season: 2033 } as any;

    saveManager.syncCurrentSave(state);

    expect(storage.getItem("hc_career_save__transient-career-1")).toBeNull();
    expect(storage.getItem("hc_career_save__career-9")).toBe(JSON.stringify({ saveId: "career-9", season: 2029 }));
    const activeId = storage.getItem("hc_career_active_save_id");
    expect(activeId).toMatch(/^career-\d+$/);
    expect(activeId).not.toBe("career-9");
    const persisted = JSON.parse(storage.getItem(`hc_career_save__${activeId}`) ?? "null");
    expect(persisted?.saveId).toBe(activeId);
    expect(persisted?.season).toBe(2033);

    const index = JSON.parse(storage.getItem("hc_career_saves_index") ?? "[]");
    expect(index.some((row: any) => row.saveId === "transient-career-1")).toBe(false);
  });

  it("syncCurrentSave ignores placeholder active save id and allocates a real slot", () => {
    storage.setItem("hc_career_active_save_id", "unslotted-initial-state");
    const state = { ...baseState, schemaVersion: 1, saveId: "unslotted-initial-state", season: 2032 } as any;

    saveManager.syncCurrentSave(state);

    expect(storage.getItem("hc_career_save__unslotted-initial-state")).toBeNull();
    const nextActive = storage.getItem("hc_career_active_save_id");
    expect(nextActive).toMatch(/^career-\d+$/);

    const persisted = JSON.parse(storage.getItem(`hc_career_save__${nextActive}`) ?? "null");
    expect(persisted?.saveId).toBe(nextActive);
    expect(persisted?.season).toBe(2032);

    const index = JSON.parse(storage.getItem("hc_career_saves_index") ?? "[]");
    expect(index.some((row: any) => row.saveId === "unslotted-initial-state")).toBe(false);
  });

  it("syncCurrentSave never persists unslotted placeholder id", () => {
    storage.setItem("hc_career_active_save_id", "career-7");
    storage.setItem("hc_career_save__career-7", JSON.stringify({ saveId: "career-7", season: 2027 }));
    const state = { ...baseState, schemaVersion: 1, saveId: "unslotted-initial-state", season: 2031 } as any;

    saveManager.syncCurrentSave(state);

    expect(storage.getItem("hc_career_save__unslotted-initial-state")).toBeNull();
    expect(storage.getItem("hc_career_save__career-7")).toBe(JSON.stringify({ saveId: "career-7", season: 2027 }));
    const activeId = storage.getItem("hc_career_active_save_id");
    expect(activeId).toMatch(/^career-\d+$/);
    expect(activeId).not.toBe("career-7");
    const persisted = JSON.parse(storage.getItem(`hc_career_save__${activeId}`) ?? "null");
    expect(persisted?.saveId).toBe(activeId);
    expect(persisted?.season).toBe(2031);
  });

  it("syncCurrentSave prefers state.saveId over active save id", () => {
    storage.setItem("hc_career_active_save_id", "career-1");
    storage.setItem("hc_career_saves_index", JSON.stringify([{
      saveId: "career-1",
      storageKey: "hc_career_save__career-1",
      coachName: "Coach Existing",
      teamName: "Milwaukee Northshore",
      season: 2025,
      week: 10,
      record: { wins: 7, losses: 3 },
      lastPlayed: 100,
      careerStage: "REGULAR_SEASON",
    }]));
    const state = { ...baseState, schemaVersion: 1, saveId: "career-2", season: 2030 } as any;

    saveManager.syncCurrentSave(state);

    const savedNew = JSON.parse(storage.getItem("hc_career_save__career-2") ?? "null");
    const savedOld = storage.getItem("hc_career_save__career-1");
    expect(savedNew?.saveId).toBe("career-2");
    expect(savedNew?.season).toBe(2030);
    expect(savedOld).toBeNull();
    expect(storage.getItem("hc_career_active_save_id")).toBe("career-2");
  });

});
