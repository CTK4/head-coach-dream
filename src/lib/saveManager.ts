import type { GameState } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { LATEST_SAVE_SCHEMA_VERSION, migrateSaveSchema, validateCriticalSaveState, type SaveValidationErrorCode } from "@/lib/migrations/saveSchema";
import { logError, logInfo, logWarn } from "@/lib/logger";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SaveMetadata {
  saveId: string;
  coachName: string;
  teamName: string;
  season: number;
  week: number;
  record: { wins: number; losses: number };
  lastPlayed: number;
  careerStage: string;
}

type SaveIndexRow = SaveMetadata & { storageKey: string };

const LEGACY_KEY = "hc_career_save";
const SAVE_INDEX_KEY = "hc_career_saves_index";
const SAVE_ACTIVE_ID_KEY = "hc_career_active_save_id";
const SAVE_ID_COUNTER_KEY = "hc_career_save_id_counter";
const UNSLOTTED_SAVE_ID = "unslotted-initial-state";


function isPersistableSaveId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value !== UNSLOTTED_SAVE_ID && !value.startsWith("transient-career-");
}

function getStorageKey(saveId: string) {
  return `hc_career_save__${saveId}`;
}

function getBackupKey(storageKey: string) {
  return `${storageKey}__bak`;
}

function getTempKey(storageKey: string) {
  return `${storageKey}__tmp`;
}

function getDefaultStorage(): StorageLike {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  if (typeof globalThis !== "undefined" && "localStorage" in globalThis && globalThis.localStorage) {
    return globalThis.localStorage as StorageLike;
  }

  throw new Error("localStorage is not available in this environment.");
}

export type LoadSaveErrorCode = "MISSING_SAVE" | "CORRUPT_SAVE" | "INVALID_SAVE";

export type LoadSaveResult =
  | { ok: true; state: GameState }
  | {
      ok: false;
      code: LoadSaveErrorCode;
      saveId: string;
      restoredFromBackup: boolean;
      validationCode?: SaveValidationErrorCode;
      message: string;
    };

type StorageWriteResult = { ok: true } | { ok: false; error: Error };

class SaveWriteError extends Error {
  constructor(
    message: string,
    readonly operation: "set" | "remove",
    readonly key: string,
    readonly cause: Error,
  ) {
    super(message);
    this.name = "SaveWriteError";
  }
}

function assertStorageWrite(result: StorageWriteResult, operation: "set" | "remove", key: string, context: string): void {
  if (result.ok) return;
  if (!("error" in result)) return;
  throw new SaveWriteError(`Failed to ${operation} localStorage key \"${key}\" during ${context}.`, operation, key, result.error);
}

function parseSave(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

function readAndValidateState(raw: string | null, saveId: string): { state: GameState | null; validationCode?: SaveValidationErrorCode } {
  const parsed = parseSave(raw);
  if (!parsed) return { state: null };
  const migrated = migrateSaveSchema(parsed, saveId);
  const validation = validateCriticalSaveState(migrated);
  if (!validation.ok && "code" in validation) {
    return { state: null, validationCode: validation.code };
  }
  return { state: migrated };
}

function createDefaultStorageProxy(): StorageLike {
  return {
    getItem: (key) => getDefaultStorage().getItem(key),
    setItem: (key, value) => getDefaultStorage().setItem(key, value),
    removeItem: (key) => getDefaultStorage().removeItem(key),
  };
}

export function createSaveManager({ storage }: { storage?: StorageLike } = {}) {
  const activeStorage = storage ?? createDefaultStorageProxy();

  function safeGetItem(key: string): string | null {
    try {
      return activeStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSetItem(key: string, value: string): StorageWriteResult {
    try {
      activeStorage.setItem(key, value);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  function safeRemoveItem(key: string): StorageWriteResult {
    try {
      activeStorage.removeItem(key);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  function commitAtomic(storageKey: string, serializedState: string): void {
    const tempKey = getTempKey(storageKey);
    const backupKey = getBackupKey(storageKey);
    const existing = safeGetItem(storageKey);
    assertStorageWrite(safeSetItem(tempKey, serializedState), "set", tempKey, "temp write");
    if (existing !== null) {
      assertStorageWrite(safeSetItem(backupKey, existing), "set", backupKey, "backup rotation");
    }
    assertStorageWrite(safeSetItem(storageKey, serializedState), "set", storageKey, "primary write");
    assertStorageWrite(safeRemoveItem(tempKey), "remove", tempKey, "temp cleanup");
  }

  function toMetadata(saveId: string, state: GameState): SaveMetadata {
    const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? "";
    const teamName = (getTeamById(teamId)?.name ?? teamId) || "Unassigned Team";
    const standing = (state.currentStandings ?? []).find((s) => s.teamId === teamId);
    return {
      saveId,
      coachName: state.coach?.name || "Unnamed Coach",
      teamName,
      season: Number(state.season ?? 1),
      week: Number(state.hub?.regularSeasonWeek ?? state.week ?? 1),
      record: {
        wins: Number(standing?.wins ?? 0),
        losses: Number(standing?.losses ?? 0),
      },
      lastPlayed: Date.now(),
      careerStage: String(state.careerStage ?? "PRE_SEASON"),
    };
  }

  function readIndex(): SaveIndexRow[] {
    try {
      const parsed = JSON.parse(safeGetItem(SAVE_INDEX_KEY) ?? "[]") as SaveIndexRow[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // no-op
    }

    const legacy = parseSave(safeGetItem(LEGACY_KEY));
    if (!legacy) return [];
    const saveId = "legacy-default";
    return [{ ...toMetadata(saveId, migrateSaveSchema(legacy, saveId)), storageKey: LEGACY_KEY }];
  }

  function writeIndex(rows: SaveIndexRow[]) {
    assertStorageWrite(safeSetItem(SAVE_INDEX_KEY, JSON.stringify(rows)), "set", SAVE_INDEX_KEY, "index write");
  }

  function readSaveState(saveId: string):
    | { ok: true; state: GameState; source: "primary" | "backup" }
    | { ok: false; error: Omit<Extract<LoadSaveResult, { ok: false }>, "restoredFromBackup"> } {
    const row = readIndex().find((s) => s.saveId === saveId);
    const key = row?.storageKey ?? getStorageKey(saveId);

    const primary = readAndValidateState(safeGetItem(key), saveId);
    if (primary.state) {
      return { ok: true, state: primary.state, source: "primary" };
    }

    const backup = readAndValidateState(safeGetItem(getBackupKey(key)), saveId);
    if (backup.state) {
      return { ok: true, state: backup.state, source: "backup" };
    }

    if (!safeGetItem(key)) {
      return {
        ok: false,
        error: {
          ok: false,
          code: "MISSING_SAVE",
          saveId,
          message: "Save file is missing.",
        },
      };
    }

    return {
      ok: false,
      error: {
        ok: false,
        code: primary.validationCode ? "INVALID_SAVE" : "CORRUPT_SAVE",
        saveId,
        validationCode: primary.validationCode ?? backup.validationCode,
        message: "Save appears corrupted. Backup restore failed.",
      },
    };
  }

  function getActiveSaveId(): string | null {
    return safeGetItem(SAVE_ACTIVE_ID_KEY);
  }

  function setActiveSaveId(saveId: string) {
    assertStorageWrite(safeSetItem(SAVE_ACTIVE_ID_KEY, saveId), "set", SAVE_ACTIVE_ID_KEY, "active save update");
  }

  function allocateSaveId(prefix = "save"): string {
    const rows = readIndex();
    const usedIds = new Set(rows.map((row) => row.saveId));
    const suffixRegex = new RegExp(`^${prefix}-(\\d+)$`);
    const maxExistingSuffix = rows.reduce((max, row) => {
      const m = suffixRegex.exec(row.saveId);
      if (!m) return max;
      const n = Number(m[1]);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);

    const rawCounter = Number(safeGetItem(SAVE_ID_COUNTER_KEY));
    const normalizedCounter = Number.isFinite(rawCounter) && rawCounter >= 0 ? Math.floor(rawCounter) : 0;
    let candidate = Math.max(normalizedCounter, maxExistingSuffix) + 1;
    while (usedIds.has(`${prefix}-${candidate}`)) candidate += 1;

    assertStorageWrite(safeSetItem(SAVE_ID_COUNTER_KEY, String(candidate)), "set", SAVE_ID_COUNTER_KEY, "save id allocation");
    return `${prefix}-${candidate}`;
  }

  function syncCurrentSave(state: GameState, saveId?: string) {
    const explicitId = isPersistableSaveId(saveId) ? saveId : undefined;
    const stateSaveIdWasProvided = state.saveId !== undefined && state.saveId !== null;
    const stateId = isPersistableSaveId(state.saveId) ? state.saveId : undefined;
    const rawActiveId = getActiveSaveId();
    const activeId = isPersistableSaveId(rawActiveId) ? rawActiveId : undefined;
    const id = explicitId || (stateSaveIdWasProvided ? (stateId ?? allocateSaveId("career")) : undefined) || activeId || allocateSaveId("career");
    const storageKey = getStorageKey(id);
    const nextState = migrateSaveSchema(state, id);
    const serialized = JSON.stringify(nextState);

    try {
      commitAtomic(storageKey, serialized);
      commitAtomic(LEGACY_KEY, serialized);

      const rows = readIndex().filter((row) => row.saveId !== id);
      rows.push({ ...toMetadata(id, nextState), storageKey });
      writeIndex(rows.sort((a, b) => b.lastPlayed - a.lastPlayed));
      setActiveSaveId(id);
      logInfo("save.sync.success", { saveId: id, phase: state.phase, season: state.season, week: state.week });
    } catch (error) {
      logError("save.sync.failure", { saveId: id, phase: state.phase, season: state.season, week: state.week, meta: { message: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  function listSaves(): SaveMetadata[] {
    return readIndex()
      .sort((a, b) => b.lastPlayed - a.lastPlayed)
      .map(({ storageKey: _storageKey, ...meta }) => meta);
  }

  function loadSaveResult(saveId: string): LoadSaveResult {
    const row = readIndex().find((s) => s.saveId === saveId);
    const key = row?.storageKey ?? getStorageKey(saveId);
    const readResult = readSaveState(saveId);

    if (readResult.ok) {
      const serialized = JSON.stringify(readResult.state);
      setActiveSaveId(saveId);
      commitAtomic(LEGACY_KEY, serialized);
      commitAtomic(key, serialized);
      if (readResult.source === "backup") {
        logWarn("save.load.success_backup", { saveId, phase: readResult.state.phase, season: readResult.state.season, week: readResult.state.week });
      } else {
        logInfo("save.load.success", { saveId, phase: readResult.state.phase, season: readResult.state.season, week: readResult.state.week, meta: { source: readResult.source } });
      }
      return { ok: true, state: readResult.state };
    }

    if (!("error" in readResult)) return { ok: false, code: "CORRUPT_SAVE", saveId, restoredFromBackup: false, message: "Unknown save read error." };
    const readError = readResult.error;
    if (readError.code === "MISSING_SAVE") {
      logWarn("save.load.failure", { saveId, meta: { code: "MISSING_SAVE" } });
    } else {
      logError("save.load.failure", { saveId, meta: { code: readError.code, validationCode: readError.validationCode } });
    }

    return { ...readError, restoredFromBackup: false };
  }

  function getActiveSaveMetadata(): SaveMetadata | null {
    const activeId = getActiveSaveId();
    if (!activeId) return null;
    return listSaves().find((save) => save.saveId === activeId) ?? null;
  }

  function loadSave(saveId: string): GameState | null {
    const result = loadSaveResult(saveId);
    return result.ok ? result.state : null;
  }

  function exportSave(saveId: string): { blob: Blob; fileName: string } | null {
    const result = readSaveState(saveId);
    if (!result.ok) return null;
    const state = migrateSaveSchema(result.state, saveId);
    const payload = JSON.stringify(state, null, 2);
    return {
      blob: new Blob([payload], { type: "application/json" }),
      fileName: `head-coach-dream-${saveId}-v${LATEST_SAVE_SCHEMA_VERSION}.json`,
    };
  }

  function importSave(json: string): LoadSaveResult {
    const parsed = parseSave(json);
    if (!parsed) {
      return {
        ok: false,
        code: "CORRUPT_SAVE",
        saveId: "",
        restoredFromBackup: false,
        message: "Could not parse imported save JSON.",
      };
    }

    const saveId = `import-${Date.now()}`;
    const migrated = migrateSaveSchema(parsed, saveId);
    const validation = validateCriticalSaveState(migrated);
    if (!validation.ok && "code" in validation) {
      return {
        ok: false,
        code: "INVALID_SAVE",
        validationCode: validation.code,
        saveId,
        restoredFromBackup: false,
        message: validation.message,
      };
    }

    syncCurrentSave(migrated, saveId);
    return { ok: true, state: migrated };
  }

  function deleteSave(saveId: string): void {
    const rows = readIndex();
    const row = rows.find((s) => s.saveId === saveId);
    const storageKey = row?.storageKey ?? getStorageKey(saveId);
    safeRemoveItem(storageKey);
    safeRemoveItem(getBackupKey(storageKey));
    safeRemoveItem(getTempKey(storageKey));
    writeIndex(rows.filter((s) => s.saveId !== saveId));
    if (getActiveSaveId() === saveId) {
      safeRemoveItem(SAVE_ACTIVE_ID_KEY);
    }
  }

  return {
    exportSave,
    importSave,
    loadSave,
    loadSaveResult,
    listSaves,
    syncCurrentSave,
    deleteSave,
    getActiveSaveId,
    setActiveSaveId,
    allocateSaveId,
    getActiveSaveMetadata,
  };
}

const defaultSaveManager = createSaveManager();

export const exportSave = defaultSaveManager.exportSave;
export const importSave = defaultSaveManager.importSave;
export const loadSave = defaultSaveManager.loadSave;
export const loadSaveResult = defaultSaveManager.loadSaveResult;
export const listSaves = defaultSaveManager.listSaves;
export const syncCurrentSave = defaultSaveManager.syncCurrentSave;
export const deleteSave = defaultSaveManager.deleteSave;
export const getActiveSaveId = defaultSaveManager.getActiveSaveId;
export const setActiveSaveId = defaultSaveManager.setActiveSaveId;
export const allocateSaveId = defaultSaveManager.allocateSaveId;
export const getActiveSaveMetadata = defaultSaveManager.getActiveSaveMetadata;
