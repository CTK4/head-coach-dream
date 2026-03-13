/**
 * Native import/export for Capacitor iOS using Share and Document Picker.
 * Handles file I/O for save bundles with proper error handling.
 */

import { logInfo, logError } from "@/lib/logger";

const TEMP_EXPORT_DIR = "temp_exports";

export interface ImportExportApi {
  exportToShare(fileName: string, jsonData: string): Promise<void>;
  importFromFiles(): Promise<string | null>;
}

type NativeModule = {
  Share: {
    share(options: { title: string; text: string; url: string; dialogTitle: string }): Promise<void>;
  };
  Filesystem: {
    mkdir(options: { path: string; directory: string; recursive?: boolean }): Promise<void>;
    writeFile(options: { path: string; data: string; directory: string; encoding?: string }): Promise<void>;
    getUri(options: { path: string; directory: string }): Promise<{ uri: string }>;
    deleteFile(options: { path: string; directory: string }): Promise<void>;
  };
  Directory: { Documents: string };
  Encoding: { UTF8: string };
};

async function getNativeModule(): Promise<NativeModule | null> {
  try {
    const shareModuleName = "@capacitor/share";
    const filesystemModuleName = "@capacitor/filesystem";
    const [{ Share }, { Filesystem, Directory, Encoding }] = await Promise.all([
      import(/* @vite-ignore */ shareModuleName),
      import(/* @vite-ignore */ filesystemModuleName),
    ]);
    return { Share, Filesystem, Directory, Encoding };
  } catch {
    return null;
  }
}

/**
 * Create import/export API for Capacitor iOS.
 * Note: Document picker requires a native plugin; this provides the Filesystem/Share integration.
 */
export async function createImportExportApi(): Promise<ImportExportApi> {
  const nativeModule = await getNativeModule();

  if (!nativeModule) {
    throw new Error("Native import/export unavailable");
  }

  const { Filesystem, Directory, Encoding, Share } = nativeModule;

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

        // Share the file
        await Share.share({
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
