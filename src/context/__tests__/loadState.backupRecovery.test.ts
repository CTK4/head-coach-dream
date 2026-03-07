import { beforeEach, describe, expect, it } from "vitest";
import { createInitialStateForTests, loadStateForTests } from "@/context/GameContext";
import { createSaveManager } from "@/lib/saveManager";

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
}

describe("loadState backup recovery", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new LocalStorageMock(),
      configurable: true,
      writable: true,
    });
  });

  it("boots from backup when active save primary payload is corrupted", () => {
    const saveId = "boot-backup-recovery";
    const saveManager = createSaveManager();
    const base = createInitialStateForTests();

    saveManager.syncCurrentSave({ ...base, saveId, coach: { ...base.coach, name: "Backup Coach" } } as any, saveId);
    saveManager.syncCurrentSave({ ...base, saveId, coach: { ...base.coach, name: "Primary Coach" } } as any, saveId);

    localStorage.setItem(`hc_career_save__${saveId}`, "{invalid json");

    const loaded = loadStateForTests();

    expect(loaded.coach.name).toBe("Backup Coach");
    expect(loaded.recoveryNeeded ?? false).toBe(false);
  });

  it("restores through backup key path when primary key is corrupted", () => {
    const saveId = "backup-key-path";
    const saveManager = createSaveManager();
    const base = createInitialStateForTests();

    saveManager.syncCurrentSave({ ...base, saveId, coach: { ...base.coach, name: "Old Backup" } } as any, saveId);
    saveManager.syncCurrentSave({ ...base, saveId, coach: { ...base.coach, name: "New Primary" } } as any, saveId);

    localStorage.setItem(`hc_career_save__${saveId}`, "{invalid json");

    const result = saveManager.loadSaveResult(saveId);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.coach.name).toBe("Old Backup");
    }

    const repairedPrimary = localStorage.getItem(`hc_career_save__${saveId}`);
    expect(repairedPrimary).toContain("Old Backup");
  });
});
