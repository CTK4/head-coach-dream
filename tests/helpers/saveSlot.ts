/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Page } from "@playwright/test";

export async function updateActiveSave(page: Page, updater: (state: any, args?: any) => any, args?: unknown) {
  await page.evaluate(({ applyUpdateSource, updaterArgs }) => {
    const ACTIVE_KEY = "hc_career_active_save_id";
    const INDEX_KEY = "hc_career_saves_index";
    const LEGACY_KEY = "hc_career_save";

    const applyUpdate = new Function("state", "args", `return (${applyUpdateSource})(state, args);`) as (state: any, args?: any) => any;

    const activeSaveId = window.localStorage.getItem(ACTIVE_KEY);
    let storageKey = activeSaveId ? `hc_career_save__${activeSaveId}` : null;

    if (!storageKey) {
      try {
        const rows = JSON.parse(window.localStorage.getItem(INDEX_KEY) ?? "[]") as Array<{ saveId?: string; storageKey?: string }>;
        const first = rows[0];
        if (first?.saveId && first?.storageKey) {
          window.localStorage.setItem(ACTIVE_KEY, first.saveId);
          storageKey = first.storageKey;
        }
      } catch {
        // ignore and fall through to legacy slot
      }
    }

    const primaryKey = storageKey ?? LEGACY_KEY;
    const raw = window.localStorage.getItem(primaryKey) ?? window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return;

    const state = JSON.parse(raw);
    const nextState = applyUpdate(state, updaterArgs);
    const serialized = JSON.stringify(nextState);

    window.localStorage.setItem(primaryKey, serialized);
    window.localStorage.setItem(LEGACY_KEY, serialized);
  }, { applyUpdateSource: updater.toString(), updaterArgs: args });
}

export async function seedActiveSaveViaManagerKeys(page: Page, seedState: Record<string, unknown>, saveId = "e2e-save") {
  await page.addInitScript(
    ({ initialState, id }) => {
      const ACTIVE_KEY = "hc_career_active_save_id";
      const INDEX_KEY = "hc_career_saves_index";
      const LEGACY_KEY = "hc_career_save";
      const storageKey = `hc_career_save__${id}`;
      const serialized = JSON.stringify(initialState);

      window.localStorage.setItem(storageKey, serialized);
      window.localStorage.setItem(ACTIVE_KEY, id);
      window.localStorage.setItem(
        INDEX_KEY,
        JSON.stringify([
          {
            saveId: id,
            storageKey,
            coachName: "E2E Coach",
            teamName: "E2E Team",
            season: 1,
            week: 1,
            record: { wins: 0, losses: 0 },
            lastPlayed: Date.now(),
            careerStage: "REGULAR_SEASON",
          },
        ]),
      );
      window.localStorage.setItem(LEGACY_KEY, serialized);
    },
    { initialState: seedState, id: saveId },
  );
}
