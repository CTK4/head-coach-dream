/**
 * Native import/export for Capacitor iOS using Share and Document Picker.
 * Handles file I/O for save bundles with proper error handling.
 */

import { loadCapacitorFilesystem, loadCapacitorShare } from "@/lib/capacitorRuntime";
import { logInfo, logError } from "@/lib/logger";

const TEMP_EXPORT_DIR = "temp_exports";

type ShareApi = {
  share(options: { title: string; text: string; url: string; dialogTitle: string }): Promise<void>;
};

type FilesystemApi = {
  mkdir(options: { path: string; directory: string; recursive?: boolean }): Promise<void>;
  writeFile(options: { path: string; data: string; directory: string; encoding: string }): Promise<void>;
  getUri(options: { path: string; directory: string }): Promise<{ uri: string }>;
  deleteFile(options: { path: string; directory: string }): Promise<void>;
};

type FilesystemModule = {
  Filesystem?: FilesystemApi;
  Directory?: { Documents?: string };
  Encoding?: { UTF8?: string };
};

export interface ImportExportApi {
  exportToShare(fileName: string, jsonData: string): Promise<void>;
  importFromFiles(): Promise<string | null>;
}

/**
 * Create import/export API for Capacitor iOS.
 * Note: Document picker requires a native plugin; this provides the Filesystem/Share integration.
 */
export async function createImportExportApi(): Promise<ImportExportApi> {
  const [shareModule, fsModule] = await Promise.all([loadCapacitorShare(), loadCapacitorFilesystem()]);
  const share = shareModule?.Share as ShareApi | undefined;
  const filesystemModule = fsModule as FilesystemModule | null;
  const filesystem = filesystemModule?.Filesystem;
  const documentsDir = filesystemModule?.Directory?.Documents;
  const utf8 = filesystemModule?.Encoding?.UTF8;

  if (!share || !filesystem || !documentsDir || !utf8) {
    throw new Error("Capacitor import/export APIs are unavailable.");
  }

  // Ensure temp directory exists
  try {
    await filesystem.mkdir({
      path: TEMP_EXPORT_DIR,
      directory: documentsDir,
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
        await filesystem.writeFile({
          path: filePath,
          data: jsonData,
          directory: documentsDir,
          encoding: utf8,
        });

        // Get the file URI for sharing
        const fileUri = await filesystem.getUri({
          path: filePath,
          directory: documentsDir,
        });

        // Share the file
        await share.share({
          title: "Export Head Coach Dream Save",
          text: `Exporting save: ${fileName}`,
          url: fileUri.uri,
          dialogTitle: "Share Save File",
        });

        logInfo("native.importexport.export.success", { meta: { fileName } });

        // Clean up after share
        setTimeout(async () => {
          try {
            await filesystem.deleteFile({
              path: filePath,
              directory: documentsDir,
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
