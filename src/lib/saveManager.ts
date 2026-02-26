import type { GameState } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { LATEST_SAVE_SCHEMA_VERSION, migrateSaveSchema, validateCriticalSaveState, type SaveValidationErrorCode } from "@/lib/migrations/saveSchema";
import { logError, logInfo, logWarn } from "@/lib/logger";

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

function getStorageKey(saveId: string) {
  return `hc_career_save__${saveId}`;
}

function getBackupKey(storageKey: string) {
  return `${storageKey}__bak`;
}

function getTempKey(storageKey: string) {
  return `${storageKey}__tmp`;
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

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op
  }
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
  if (!validation.ok) {
    return { state: null, validationCode: validation.code };
  }
  return { state: migrated };
}

function commitAtomic(storageKey: string, serializedState: string): void {
  const tempKey = getTempKey(storageKey);
  const backupKey = getBackupKey(storageKey);
  const existing = safeGetItem(storageKey);
  safeSetItem(tempKey, serializedState);
  if (existing !== null) {
    safeSetItem(backupKey, existing);
  }
  safeSetItem(storageKey, serializedState);
  safeRemoveItem(tempKey);
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
  safeSetItem(SAVE_INDEX_KEY, JSON.stringify(rows));
}

export function getActiveSaveId(): string | null {
  return safeGetItem(SAVE_ACTIVE_ID_KEY);
}

export function setActiveSaveId(saveId: string) {
  safeSetItem(SAVE_ACTIVE_ID_KEY, saveId);
}

export function syncCurrentSave(state: GameState, saveId?: string) {
  const id = saveId || getActiveSaveId() || `save-${Date.now()}`;
  const storageKey = getStorageKey(id);
  const nextState = migrateSaveSchema(state, id);
  const serialized = JSON.stringify(nextState);

  try {
    setActiveSaveId(id);
    commitAtomic(storageKey, serialized);
    commitAtomic(LEGACY_KEY, serialized);

    const rows = readIndex().filter((row) => row.saveId !== id);
    rows.push({ ...toMetadata(id, nextState), storageKey });
    writeIndex(rows.sort((a, b) => b.lastPlayed - a.lastPlayed));
    logInfo("save.sync.success", { saveId: id, phase: state.phase, season: state.season, week: state.week });
  } catch (error) {
    logError("save.sync.failure", { saveId: id, phase: state.phase, season: state.season, week: state.week, meta: { message: error instanceof Error ? error.message : String(error) } });
    throw error;
  }
}

export function listSaves(): SaveMetadata[] {
  return readIndex()
    .sort((a, b) => b.lastPlayed - a.lastPlayed)
    .map(({ storageKey: _storageKey, ...meta }) => meta);
}

export function loadSaveResult(saveId: string): LoadSaveResult {
  const row = readIndex().find((s) => s.saveId === saveId);
  const key = row?.storageKey ?? getStorageKey(saveId);

  const primary = readAndValidateState(safeGetItem(key), saveId);
  if (primary.state) {
    const serialized = JSON.stringify(primary.state);
    setActiveSaveId(saveId);
    commitAtomic(LEGACY_KEY, serialized);
    commitAtomic(key, serialized);
    logInfo("save.load.success", { saveId, phase: primary.state.phase, season: primary.state.season, week: primary.state.week, meta: { source: "primary" } });
    return { ok: true, state: primary.state };
  }

  const backup = readAndValidateState(safeGetItem(getBackupKey(key)), saveId);
  if (backup.state) {
    const serialized = JSON.stringify(backup.state);
    commitAtomic(key, serialized);
    setActiveSaveId(saveId);
    commitAtomic(LEGACY_KEY, serialized);
    logWarn("save.load.success_backup", { saveId, phase: backup.state.phase, season: backup.state.season, week: backup.state.week });
    return { ok: true, state: backup.state };
  }

  if (!safeGetItem(key)) {
    logWarn("save.load.failure", { saveId, meta: { code: "MISSING_SAVE" } });
    return {
      ok: false,
      code: "MISSING_SAVE",
      saveId,
      restoredFromBackup: false,
      message: "Save file is missing.",
    };
  }

  logError("save.load.failure", { saveId, meta: { code: primary.validationCode ? "INVALID_SAVE" : "CORRUPT_SAVE", validationCode: primary.validationCode ?? backup.validationCode } });

  return {
    ok: false,
    code: primary.validationCode ? "INVALID_SAVE" : "CORRUPT_SAVE",
    saveId,
    restoredFromBackup: false,
    validationCode: primary.validationCode ?? backup.validationCode,
    message: "Save appears corrupted. Backup restore failed.",
  };
}

export function getActiveSaveMetadata(): SaveMetadata | null {
  const activeId = getActiveSaveId();
  if (!activeId) return null;
  return listSaves().find((save) => save.saveId === activeId) ?? null;
}

export function loadSave(saveId: string): GameState | null {
  const result = loadSaveResult(saveId);
  return result.ok ? result.state : null;
}

export function exportSave(saveId: string): { blob: Blob; fileName: string } | null {
  const result = loadSaveResult(saveId);
  if (!result.ok) return null;
  const state = migrateSaveSchema(result.state, saveId);
  const payload = JSON.stringify(state, null, 2);
  return {
    blob: new Blob([payload], { type: "application/json" }),
    fileName: `head-coach-dream-${saveId}-v${LATEST_SAVE_SCHEMA_VERSION}.json`,
  };
}

export function importSave(json: string): LoadSaveResult {
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
  if (!validation.ok) {
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

export function deleteSave(saveId: string): void {
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
