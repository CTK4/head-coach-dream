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

import { loadCapacitorFilesystem, loadCapacitorPreferences } from "@/lib/capacitorRuntime";
import { logInfo, logWarn, logError } from "@/lib/logger";

const SAVE_INDEX_KEY = "hc_native_save_index";
const SAVE_DIR = "saves";

type PreferencesApi = {
  get(options: { key: string }): Promise<{ value: string | null }>;
  set(options: { key: string; value: string }): Promise<void>;
};

type FilesystemApi = {
  mkdir(options: { path: string; directory: string; recursive?: boolean }): Promise<void>;
  readFile(options: { path: string; directory: string; encoding: string }): Promise<{ data: string }>;
  writeFile(options: { path: string; data: string; directory: string; encoding: string }): Promise<void>;
  deleteFile(options: { path: string; directory: string }): Promise<void>;
  rename(options: { from: string; to: string; directory: string }): Promise<void>;
};

type FilesystemModule = {
  Filesystem?: FilesystemApi;
  Directory?: { Documents?: string };
  Encoding?: { UTF8?: string };
};

async function getNativeApis(): Promise<{ preferences: PreferencesApi; filesystem: FilesystemApi; documentsDir: string; utf8: string } | null> {
  const [prefsModule, fsModule] = await Promise.all([loadCapacitorPreferences(), loadCapacitorFilesystem()]);
  const preferences = prefsModule?.Preferences as PreferencesApi | undefined;
  const filesystemModule = fsModule as FilesystemModule | null;
  const filesystem = filesystemModule?.Filesystem;
  const documentsDir = filesystemModule?.Directory?.Documents;
  const utf8 = filesystemModule?.Encoding?.UTF8;

  if (!preferences || !filesystem || !documentsDir || !utf8) {
    return null;
  }

  return { preferences, filesystem, documentsDir, utf8 };
}


export interface SaveStoreApi {
  list(): Promise<string[]>;
  load(saveId: string): Promise<string | null>;
  save(saveId: string, data: string): Promise<void>;
  delete(saveId: string): Promise<void>;
  migrate(localStorageData: Map<string, string>): Promise<void>;
}

/**
 * Create a native save store for Capacitor iOS.
 * Handles Filesystem + Preferences for migration-safe persistence.
 */
export async function createNativeSaveStore(): Promise<SaveStoreApi> {
  const apis = await getNativeApis();
  if (!apis) {
    throw new Error("Capacitor native save APIs are unavailable.");
  }

  // Ensure save directory exists
  try {
    await apis.filesystem.mkdir({
      path: SAVE_DIR,
      directory: apis.documentsDir,
      recursive: true,
    });
  } catch (error) {
    logWarn("native.savestore.mkdir.error", { meta: { message: error instanceof Error ? error.message : String(error) } });
  }

  async function getSaveIndex(): Promise<string[]> {
    try {
      const result = await apis.preferences.get({ key: SAVE_INDEX_KEY });
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
      await apis.preferences.set({
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
      await apis.filesystem.writeFile({
        path: tempPath,
        data,
        directory: apis.documentsDir,
        encoding: apis.utf8,
      });

      // 2. Backup existing file if it exists
      try {
        const existing = await apis.filesystem.readFile({
          path: filePath,
          directory: apis.documentsDir,
          encoding: apis.utf8,
        });
        await apis.filesystem.writeFile({
          path: backupPath,
          data: existing.data,
          directory: apis.documentsDir,
          encoding: apis.utf8,
        });
      } catch {
        // No existing file to backup
      }

      // 3. Move temp to primary
      await apis.filesystem.deleteFile({
        path: filePath,
        directory: apis.documentsDir,
      }).catch(() => {
        // File may not exist
      });

      await apis.filesystem.rename({
        from: tempPath,
        to: fileName,
        directory: apis.documentsDir,
      });

      // 4. Clean up temp (in case rename didn't remove it)
      await apis.filesystem.deleteFile({
        path: tempPath,
        directory: apis.documentsDir,
      }).catch(() => {
        // Already cleaned
      });
    } catch (error) {
      // Cleanup on error
      await apis.filesystem.deleteFile({
        path: tempPath,
        directory: apis.documentsDir,
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
        const result = await apis.filesystem.readFile({
          path: filePath,
          directory: apis.documentsDir,
          encoding: apis.utf8,
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
        await apis.filesystem.deleteFile({
          path: filePath,
          directory: apis.documentsDir,
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
