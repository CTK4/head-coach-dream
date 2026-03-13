import { beforeEach, describe, expect, it } from "vitest";
import { readSettingsSync, writeSettings } from "@/lib/settings";

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

describe("settings sim tuning persistence", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new LocalStorageMock(),
      configurable: true,
      writable: true,
    });
  });

  it("persists and restores difficulty/realism presets", () => {
    writeSettings({ difficultyPreset: "CHALLENGING", realismPreset: "SIM" });
    const loaded = readSettingsSync();
    expect(loaded.difficultyPreset).toBe("CHALLENGING");
    expect(loaded.realismPreset).toBe("SIM");
  });
});
