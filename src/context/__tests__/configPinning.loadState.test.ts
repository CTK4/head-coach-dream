import { beforeEach, describe, expect, it } from "vitest";
import { createInitialStateForTests, loadStateForTests } from "@/context/GameContext";
import { DEFAULT_CALIBRATION_PACK_ID, DEFAULT_CONFIG_VERSION } from "@/engine/config/configRegistry";
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
  clear() {
    this.store.clear();
  }
}

describe("loadState config pinning", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new LocalStorageMock(),
      configurable: true,
      writable: true,
    });
  });

  it("flags recovery path when saved config pins mismatch active registry", () => {
    const saveManager = createSaveManager();
    const base = createInitialStateForTests();
    const bad = {
      ...base,
      phase: "HUB",
      configVersion: "9.9.9",
      calibrationPackId: "bad-pack",
    };
    saveManager.syncCurrentSave({ ...bad, saveId: "slot-bad-pins" } as any, "slot-bad-pins");

    const loaded = loadStateForTests();
    expect(loaded.recoveryNeeded).toBe(true);
    expect(loaded.recoveryErrors?.[0]).toContain("Save appears corrupted");
  });

  it("backfills default pins for legacy saves during migration", () => {
    const saveManager = createSaveManager();
    const base = createInitialStateForTests();
    const legacy = {
      ...base,
      phase: "HUB",
      saveVersion: 0,
      configVersion: undefined,
      calibrationPackId: undefined,
    };
    saveManager.syncCurrentSave({ ...legacy, saveId: "slot-legacy-pins" } as any, "slot-legacy-pins");

    const loaded = loadStateForTests();
    expect(loaded.recoveryNeeded ?? false).toBe(false);
    expect(loaded.configVersion).toBe(DEFAULT_CONFIG_VERSION);
    expect(loaded.calibrationPackId).toBe(DEFAULT_CALIBRATION_PACK_ID);
  });
});
