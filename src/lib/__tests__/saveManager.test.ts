import { beforeEach, describe, expect, it } from "vitest";
import { exportSave, importSave, loadSaveResult, syncCurrentSave } from "@/lib/saveManager";
import { LATEST_SAVE_SCHEMA_VERSION } from "@/lib/migrations/saveSchema";

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
  phase: "OFFSEASON_HUB",
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
