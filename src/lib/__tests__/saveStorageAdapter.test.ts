import { describe, expect, it } from "vitest";
import { createCapacitorPreferencesSqliteAdapter, createLocalStorageAdapter, isCapacitorIosEnvironment } from "@/lib/saveStorageAdapter";

class MockStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }
  get length() {
    return this.store.size;
  }
}

describe("saveStorageAdapter", () => {
  it("creates localStorage adapter with key enumeration", () => {
    const storage = new MockStorage();
    storage.setItem("hc_career_save", "a");
    storage.setItem("other", "b");

    const adapter = createLocalStorageAdapter(storage);
    expect(adapter.backend).toBe("localStorage");
    expect(adapter.listKeys("hc_")).toEqual(["hc_career_save"]);
  });

  it("creates capacitor preferences/sqlite adapter", () => {
    const storage = new MockStorage();
    const adapter = createCapacitorPreferencesSqliteAdapter(storage);

    expect(adapter.backend).toBe("capacitor-preferences-sqlite");
  });

  it("detects non-capacitor environment", () => {
    expect(isCapacitorIosEnvironment()).toBe(false);
  });
});
