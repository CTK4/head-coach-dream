import type { GameState } from "@/context/GameContext";
import { logWarn } from "@/lib/logger";

type SaveWriteManager = {
  syncCurrentSave: (state: GameState, saveId?: string) => void;
  deleteSave: (saveId: string) => void;
  getActiveSaveId: () => string | null;
  setActiveSaveId: (saveId: string) => void;
  allocateSaveId: (prefix?: string) => string;
};

export function isApiSaveModeEnabled(env: ImportMetaEnv): boolean {
  return env.VITE_ENABLE_API_SAVE_MODE === "true";
}

export function getSaveApiBaseUrl(env: ImportMetaEnv): string {
  return env.VITE_SAVE_API_BASE_URL ?? "http://localhost:8787";
}

export function createApiSaveManager<T extends SaveWriteManager>(baseUrl: string, fallback: T): T {
  const root = baseUrl.replace(/\/$/, "");

  return {
    ...fallback,
    syncCurrentSave: (state: GameState, saveId?: string) => {
      fallback.syncCurrentSave(state, saveId);
      const effectiveSaveId = saveId ?? state.saveId ?? fallback.getActiveSaveId() ?? fallback.allocateSaveId("career");
      fallback.setActiveSaveId(effectiveSaveId);
      void fetch(`${root}/api/v1/saves/${encodeURIComponent(effectiveSaveId)}/snapshot`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state: { ...state, saveId: effectiveSaveId } }),
      }).catch((error) => {
        logWarn("save.api.sync.failed", {
          meta: { saveId: effectiveSaveId, reason: error instanceof Error ? error.message : String(error) },
        });
      });
    },
    deleteSave: (saveId: string) => {
      fallback.deleteSave(saveId);
      void fetch(`${root}/api/v1/saves/${encodeURIComponent(saveId)}/snapshot`, { method: "DELETE" }).catch((error) => {
        logWarn("save.api.delete.failed", {
          meta: { saveId, reason: error instanceof Error ? error.message : String(error) },
        });
      });
    },
  };
}
