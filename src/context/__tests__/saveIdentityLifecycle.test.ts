import { beforeEach, describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer, loadStateForTests, type GameState } from "@/context/GameContext";
import { getActiveSaveId, syncCurrentSave } from "@/lib/saveManager";

class LocalStorageSpy {
  private store = new Map<string, string>();
  setCalls = 0;
  failOnSetItemKey: string | null = null;

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string) {
    if (this.failOnSetItemKey === key) throw new Error(`setItem failed for ${key}`);
    this.setCalls += 1;
    this.store.set(key, String(value));
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
    this.setCalls = 0;
    this.failOnSetItemKey = null;
  }

  keys() {
    return Array.from(this.store.keys());
  }
}

const OFFER = {
  teamId: "ATLANTA_APEX",
  years: 4,
  salary: 4_000_000,
  autonomy: 65,
  patience: 55,
  mediaNarrativeKey: "story_start",
  base: { years: 4, salary: 4_000_000, autonomy: 65 },
};

describe("save identity lifecycle", () => {
  let local: LocalStorageSpy;

  beforeEach(() => {
    local = new LocalStorageSpy();
    Object.defineProperty(globalThis, "localStorage", {
      value: local,
      configurable: true,
      writable: true,
    });
  });

  it("boot initial-state construction is pure and does not mutate storage", () => {
    expect(getActiveSaveId()).toBeNull();

    const state = loadStateForTests();

    expect(state.saveId).toBe("unslotted-initial-state");
    expect(getActiveSaveId()).toBeNull();
    expect(local.getItem("hc_career_save_id_counter")).toBeNull();
    expect(local.setCalls).toBe(0);
  });

  it("starting a new career allocates and activates a new save id", () => {
    local.setItem("hc_career_active_save_id", "career-12");
    const seeded = createInitialStateForTests();
    const next = gameReducer(seeded as GameState, {
      type: "INIT_NEW_GAME_FROM_STORY",
      payload: { offer: OFFER, teamName: "Apex" },
    });

    expect(next.saveId).toMatch(/^career-\d+$/);
    expect(next.saveId).not.toBe("career-12");
    expect(getActiveSaveId()).toBe(next.saveId);
  });


  it("INIT_NEW_GAME_FROM_STORY falls back to transient id when storage write fails", () => {
    local.failOnSetItemKey = "hc_career_save_id_counter";
    const seeded = createInitialStateForTests();

    const next = gameReducer(seeded as GameState, {
      type: "INIT_NEW_GAME_FROM_STORY",
      payload: { offer: OFFER, teamName: "Apex" },
    });

    expect(next.saveId).toMatch(/^transient-career-\d+$/);
    expect(getActiveSaveId()).toBeNull();
    expect(local.keys().some((k) => k.startsWith("hc_career_save__career-"))).toBe(false);
  });


  it("INIT_NEW_GAME_FROM_STORY keeps allocated career id when active-save update fails", () => {
    local.setItem("hc_career_active_save_id", "career-9");
    local.setItem("hc_career_saves_index", JSON.stringify([{
      saveId: "career-9",
      storageKey: "hc_career_save__career-9",
      coachName: "Coach Existing",
      teamName: "Team",
      season: 2029,
      week: 4,
      record: { wins: 3, losses: 1 },
      lastPlayed: 1,
      careerStage: "REGULAR_SEASON",
    }]));
    local.setItem("hc_career_save__career-9", JSON.stringify({ saveId: "career-9", season: 2029 }));
    local.failOnSetItemKey = "hc_career_active_save_id";

    const seeded = createInitialStateForTests();
    const next = gameReducer(seeded as GameState, {
      type: "INIT_NEW_GAME_FROM_STORY",
      payload: { offer: OFFER, teamName: "Apex" },
    });

    expect(next.saveId).toMatch(/^career-\d+$/);
    expect(next.saveId).not.toBe("career-9");
    expect(next.saveId).not.toMatch(/^transient-career-\d+$/);
    expect(getActiveSaveId()).toBe("career-9");

    local.failOnSetItemKey = null;
    syncCurrentSave(next);

    expect(local.getItem("hc_career_save__career-9")).toBe(JSON.stringify({ saveId: "career-9", season: 2029 }));
    expect(local.getItem(`hc_career_save__${next.saveId}`)).toBeTruthy();
  });

  it("RESET falls back to transient id when storage write fails", () => {
    local.failOnSetItemKey = "hc_career_save_id_counter";
    const seeded = createInitialStateForTests();

    const reset = gameReducer(seeded as GameState, { type: "RESET" } as any);

    expect(reset.saveId).toMatch(/^transient-career-\d+$/);
    expect(getActiveSaveId()).toBeNull();
    expect(local.keys().some((k) => k.startsWith("hc_career_save__career-"))).toBe(false);
  });

  it("autosave targets newly started career slot instead of prior active slot", () => {
    local.setItem("hc_career_active_save_id", "career-1");
    local.setItem("hc_career_saves_index", JSON.stringify([{
      saveId: "career-1",
      storageKey: "hc_career_save__career-1",
      coachName: "Coach Existing",
      teamName: "Team",
      season: 2027,
      week: 4,
      record: { wins: 2, losses: 2 },
      lastPlayed: 1,
      careerStage: "REGULAR_SEASON",
    }]));
    local.setItem("hc_career_save__career-1", JSON.stringify({ saveId: "career-1", season: 2027 }));

    const seeded = createInitialStateForTests();
    const next = gameReducer(seeded as GameState, {
      type: "INIT_NEW_GAME_FROM_STORY",
      payload: { offer: OFFER, teamName: "Apex" },
    });

    syncCurrentSave(next);

    expect(next.saveId).not.toBe("career-1");
    expect(local.getItem("hc_career_save__career-1")).toBe(JSON.stringify({ saveId: "career-1", season: 2027 }));
    expect(local.getItem(`hc_career_save__${next.saveId}`)).toBeTruthy();
    expect(getActiveSaveId()).toBe(next.saveId);
  });

  it("RESET starts a fresh career in a newly activated slot", () => {
    local.setItem("hc_career_active_save_id", "career-9");
    const seeded = createInitialStateForTests();

    const reset = gameReducer(seeded as GameState, { type: "RESET" } as any);

    expect(reset.saveId).toMatch(/^career-\d+$/);
    expect(reset.saveId).not.toBe("career-9");
    expect(getActiveSaveId()).toBe(reset.saveId);
  });
});
