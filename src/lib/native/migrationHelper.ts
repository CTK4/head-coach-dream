/**
 * Helper to perform one-time migration from localStorage to native store.
 * Called during app initialization on iOS.
 * Marks migration complete in Preferences; does NOT delete localStorage.
 */

import { logInfo, logWarn } from "@/lib/logger";
import type { SaveStoreApi } from "@/lib/native/saveStore";

const MIGRATION_MARKER_KEY = "hc_native_migration_complete_v1";

type PreferencesApi = {
  get(options: { key: string }): Promise<{ value: string | null }>;
  set(options: { key: string; value: string }): Promise<void>;
};

async function getPreferences(): Promise<PreferencesApi> {
  const moduleName = "@capacitor/preferences";
  const { Preferences } = await import(/* @vite-ignore */ moduleName);
  return Preferences;
}

export async function performNativeMigrationIfNeeded(nativeStore: SaveStoreApi): Promise<void> {
  try {
    const Preferences = await getPreferences();

    // Check if already migrated
    const marker = await Preferences.get({ key: MIGRATION_MARKER_KEY });
    if (marker.value) {
      logInfo("native.migration.already_done", {});
      return;
    }

    // Collect localStorage saves (don't delete them)
    const localStorageData = new Map<string, string>();
    if (typeof window !== "undefined" && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key) continue;
        if (key.startsWith("hc_career_save__")) {
          const value = window.localStorage.getItem(key);
          if (value) {
            localStorageData.set(key, value);
          }
        }
      }
    }

    if (localStorageData.size === 0) {
      logInfo("native.migration.no_saves_found", {});
      await Preferences.set({
        key: MIGRATION_MARKER_KEY,
        value: JSON.stringify({ migratedAt: Date.now(), count: 0 }),
      });
      return;
    }

    // Migrate to native store
    await nativeStore.migrate(localStorageData);

    // Mark migration complete
    await Preferences.set({
      key: MIGRATION_MARKER_KEY,
      value: JSON.stringify({ migratedAt: Date.now(), count: localStorageData.size }),
    });

    logInfo("native.migration.success", { meta: { count: localStorageData.size } });
  } catch (error) {
    logWarn("native.migration.error", {
      meta: { message: error instanceof Error ? error.message : String(error) },
    });
    // Don't throw; let app continue with localStorage fallback
  }
}
