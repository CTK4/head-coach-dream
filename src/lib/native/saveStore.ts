/**
 * Native save store for Capacitor iOS using Filesystem + Preferences.
 * Provides migration-safe persistence that survives force-quit.
 *
 * Architecture:
 * - Each save is a JSON file in app's Documents directory
 * - Preferences stores an index of all saves (list of saveIds)
 * - Atomic writes: write temp, rotate backup, commit primary, cleanup temp
 * - One-time migration from localStorage; localStorage NOT deleted
 */

import { logInfo, logWarn, logError } from "@/lib/logger";

const SAVE_INDEX_KEY = "hc_native_save_index";
const SAVE_DIR = "saves";

export interface SaveStoreApi {
  list(): Promise<string[]>;
  load(saveId: string): Promise<string | null>;
  save(saveId: string, data: string): Promise<void>;
  delete(saveId: string): Promise<void>;
  migrate(localStorageData: Map<string, string>): Promise<void>;
}

type NativeModule = {
  Preferences: {
    get(options: { key: string }): Promise<{ value: string | null }>;
    set(options: { key: string; value: string }): Promise<void>;
  };
  Filesystem: {
    mkdir(options: { path: string; directory: string; recursive?: boolean }): Promise<void>;
    writeFile(options: { path: string; data: string; directory: string; encoding?: string }): Promise<void>;
    readFile(options: { path: string; directory: string; encoding?: string }): Promise<{ data: string }>;
    deleteFile(options: { path: string; directory: string }): Promise<void>;
    rename(options: { from: string; to: string; directory: string }): Promise<void>;
  };
  Directory: { Documents: string };
  Encoding: { UTF8: string };
};

async function getNativeModule(): Promise<NativeModule> {
  const preferencesModuleName = "@capacitor/preferences";
  const filesystemModuleName = "@capacitor/filesystem";
  const [{ Preferences }, { Filesystem, Directory, Encoding }] = await Promise.all([
    import(/* @vite-ignore */ preferencesModuleName),
    import(/* @vite-ignore */ filesystemModuleName),
  ]);
  return { Preferences, Filesystem, Directory, Encoding };
}

/**
 * Create a native save store for Capacitor iOS.
 * Handles Filesystem + Preferences for migration-safe persistence.
 */
export async function createNativeSaveStore(): Promise<SaveStoreApi> {
  const { Preferences, Filesystem, Directory, Encoding } = await getNativeModule();

  // Ensure save directory exists
  try {
    await Filesystem.mkdir({
      path: SAVE_DIR,
      directory: Directory.Documents,
      recursive: true,
    });
  } catch (error) {
    logWarn("native.savestore.mkdir.error", { meta: { message: error instanceof Error ? error.message : String(error) } });
  }

  async function getSaveIndex(): Promise<string[]> {
    try {
      const result = await Preferences.get({ key: SAVE_INDEX_KEY });
      if (!result.value) return [];
      const parsed = JSON.parse(result.value) as unknown;
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
    } catch (error) {
      logWarn("native.savestore.index.read.error", { meta: { message: error instanceof Error ? error.message : String(error) } });
      return [];
    }
  }

  async function setSaveIndex(saveIds: string[]): Promise<void> {
    try {
      await Preferences.set({
        key: SAVE_INDEX_KEY,
        value: JSON.stringify(saveIds),
      });
    } catch (error) {
      logError("native.savestore.index.write.error", { meta: { message: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  function getSaveFileName(saveId: string): string {
    return `${saveId}.json`;
  }

  async function getSaveFilePath(saveId: string): Promise<string> {
    return `${SAVE_DIR}/${getSaveFileName(saveId)}`;
  }

  async function atomicWrite(saveId: string, data: string): Promise<void> {
    const fileName = getSaveFileName(saveId);
    const filePath = await getSaveFilePath(saveId);
    const tempPath = `${SAVE_DIR}/${fileName}.tmp`;
    const backupPath = `${SAVE_DIR}/${fileName}.bak`;

    try {
      // 1. Write to temp file
      await Filesystem.writeFile({
        path: tempPath,
        data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      // 2. Backup existing file if it exists
      try {
        const existing = await Filesystem.readFile({
          path: filePath,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        await Filesystem.writeFile({
          path: backupPath,
          data: existing.data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
      } catch {
        // No existing file to backup
      }

      // 3. Move temp to primary
      await Filesystem.deleteFile({
        path: filePath,
        directory: Directory.Documents,
      }).catch(() => {
        // File may not exist
      });

      await Filesystem.rename({
        from: tempPath,
        to: fileName,
        directory: Directory.Documents,
      });

      // 4. Clean up temp (in case rename didn't remove it)
      await Filesystem.deleteFile({
        path: tempPath,
        directory: Directory.Documents,
      }).catch(() => {
        // Already cleaned
      });
    } catch (error) {
      // Cleanup on error
      await Filesystem.deleteFile({
        path: tempPath,
        directory: Directory.Documents,
      }).catch(() => {
        // Ignore cleanup errors
      });
      throw error;
    }
  }

  return {
    async list(): Promise<string[]> {
      return getSaveIndex();
    },

    async load(saveId: string): Promise<string | null> {
      try {
        const filePath = await getSaveFilePath(saveId);
        const result = await Filesystem.readFile({
          path: filePath,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        return typeof result.data === "string" ? result.data : null;
      } catch (error) {
        logWarn("native.savestore.load.error", { meta: { saveId, message: error instanceof Error ? error.message : String(error) } });
        return null;
      }
    },

    async save(saveId: string, data: string): Promise<void> {
      try {
        await atomicWrite(saveId, data);

        // Update index
        const index = await getSaveIndex();
        if (!index.includes(saveId)) {
          index.push(saveId);
          await setSaveIndex(index);
        }

        logInfo("native.savestore.save.success", { meta: { saveId } });
      } catch (error) {
        logError("native.savestore.save.error", { meta: { saveId, message: error instanceof Error ? error.message : String(error) } });
        throw error;
      }
    },

    async delete(saveId: string): Promise<void> {
      try {
        const filePath = await getSaveFilePath(saveId);
        await Filesystem.deleteFile({
          path: filePath,
          directory: Directory.Documents,
        });

        // Update index
        const index = await getSaveIndex();
        const updated = index.filter((id) => id !== saveId);
        await setSaveIndex(updated);

        logInfo("native.savestore.delete.success", { meta: { saveId } });
      } catch (error) {
        logError("native.savestore.delete.error", { meta: { saveId, message: error instanceof Error ? error.message : String(error) } });
        throw error;
      }
    },

    async migrate(localStorageData: Map<string, string>): Promise<void> {
      try {
        const migratedIds: string[] = [];

        for (const [key, value] of localStorageData.entries()) {
          if (!key.startsWith("hc_career_save__")) continue;

          const saveId = key.replace("hc_career_save__", "");
          if (!saveId) continue;

          try {
            await atomicWrite(saveId, value);
            migratedIds.push(saveId);
          } catch (error) {
            logWarn("native.savestore.migrate.item.error", {
              meta: { saveId, message: error instanceof Error ? error.message : String(error) },
            });
          }
        }

        if (migratedIds.length > 0) {
          await setSaveIndex(migratedIds);
          logInfo("native.savestore.migrate.success", { meta: { count: migratedIds.length } });
        }
      } catch (error) {
        logError("native.savestore.migrate.error", { meta: { message: error instanceof Error ? error.message : String(error) } });
        throw error;
      }
    },
  };
}
