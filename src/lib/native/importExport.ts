/**
 * Native import/export for Capacitor iOS using Share and Document Picker.
 * Handles file I/O for save bundles with proper error handling.
 */

import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { logInfo, logError } from "@/lib/logger";

const TEMP_EXPORT_DIR = "temp_exports";

type SharePlugin = {
  share(options: { title?: string; text?: string; url?: string; dialogTitle?: string }): Promise<void>;
};

async function loadSharePlugin(): Promise<SharePlugin | null> {
  try {
    const mod = await import(/* @vite-ignore */ "@capacitor/share");
    return mod.Share as SharePlugin;
  } catch (error) {
    logError("native.importexport.share.unavailable", {
      meta: { message: error instanceof Error ? error.message : String(error) },
    });
    return null;
  }
}

export interface ImportExportApi {
  exportToShare(fileName: string, jsonData: string): Promise<void>;
  importFromFiles(): Promise<string | null>;
}

/**
 * Create import/export API for Capacitor iOS.
 * Note: Document picker requires a native plugin; this provides the Filesystem/Share integration.
 */
export async function createImportExportApi(): Promise<ImportExportApi> {
  // Ensure temp directory exists
  try {
    await Filesystem.mkdir({
      path: TEMP_EXPORT_DIR,
      directory: Directory.Documents,
      recursive: true,
    });
  } catch (error) {
    logError("native.importexport.mkdir.error", {
      meta: { message: error instanceof Error ? error.message : String(error) },
    });
  }

  return {
    async exportToShare(fileName: string, jsonData: string): Promise<void> {
      try {
        const filePath = `${TEMP_EXPORT_DIR}/${fileName}`;

        // Write JSON to Filesystem
        await Filesystem.writeFile({
          path: filePath,
          data: jsonData,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });

        // Get the file URI for sharing
        const fileUri = await Filesystem.getUri({
          path: filePath,
          directory: Directory.Documents,
        });

        const sharePlugin = await loadSharePlugin();
        if (!sharePlugin) {
          throw new Error("@capacitor/share is not available in this environment");
        }

        // Share the file
        await sharePlugin.share({
          title: "Export Head Coach Dream Save",
          text: `Exporting save: ${fileName}`,
          url: fileUri.uri,
          dialogTitle: "Share Save File",
        });

        logInfo("native.importexport.export.success", { meta: { fileName } });

        // Clean up after share
        setTimeout(async () => {
          try {
            await Filesystem.deleteFile({
              path: filePath,
              directory: Directory.Documents,
            });
          } catch {
            // Ignore cleanup errors
          }
        }, 2000);
      } catch (error) {
        logError("native.importexport.export.error", {
          meta: { fileName, message: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    },

    async importFromFiles(): Promise<string | null> {
      try {
        // Note: This requires a document picker plugin like @capacitor/file-picker or similar.
        // For now, this is a placeholder that returns null.
        // Implementation depends on the chosen document picker plugin.
        logError("native.importexport.import.not_implemented", {});
        return null;
      } catch (error) {
        logError("native.importexport.import.error", {
          meta: { message: error instanceof Error ? error.message : String(error) },
        });
        return null;
      }
    },
  };
}
