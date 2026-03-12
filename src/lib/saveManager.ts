import type { GameState } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { LATEST_SAVE_SCHEMA_VERSION, migrateSaveSchema, validateCriticalSaveState, type SaveValidationErrorCode } from "@/lib/migrations/saveSchema";
import { logError, logInfo, logWarn } from "@/lib/logger";
import {
  createCapacitorPreferencesSqliteAdapter,
  createLocalStorageAdapter,
  isCapacitorIosEnvironment,
  type SaveStorageAdapter,
  type StorageLike,
} from "@/lib/saveStorageAdapter";

export interface SaveMetadata {
  saveId: string;
  coachName: string;
  teamName: string;
  season: number;
  week: number;
  record: { wins: number; losses: number };
  updatedAt: number;
  lastPlayed: number;
  careerStage: string;
  version: number;
}

type SaveIndexRow = Omit<SaveMetadata, "updatedAt" | "version"> & {
  updatedAt?: number;
  version?: number;
  storageKey: string;
};

type SaveExportEnvelope = {
  format: "hc_save_export_v1";
  exportedAt: number;
  metadata: SaveMetadata;
  state: GameState;
};

const LEGACY_KEY = "hc_career_save";
const SAVE_INDEX_KEY = "hc_career_saves_index";
const SAVE_ACTIVE_ID_KEY = "hc_career_active_save_id";
const SAVE_ID_COUNTER_KEY = "hc_career_save_id_counter";
const STORAGE_MIGRATION_MARKER_KEY = "hc_career_storage_backend_migration_v1";
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

function createDefaultAdapter(storage: StorageLike): SaveStorageAdapter {
  if (isCapacitorIosEnvironment()) {
    return createCapacitorPreferencesSqliteAdapter(storage);
  }
  return createLocalStorageAdapter(storage);
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
  throw new SaveWriteError(`Failed to ${operation} storage key \"${key}\" during ${context}.`, operation, key, result.error);
}

function parseSave(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isRecord(parsed) ? (parsed as GameState) : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function looksLikeRawSavePayload(value: unknown): value is Partial<GameState> {
  if (!isRecord(value)) return false;
  const hasPhase = typeof value.phase === "string";
  const hasSeason = Number.isFinite(Number((value as any).season));
  const hasCoach = isRecord((value as any).coach) && typeof ((value as any).coach as Record<string, unknown>).name === "string";
  return hasPhase || hasSeason || hasCoach;
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

export function createSaveManager({ storage, adapter }: { storage?: StorageLike; adapter?: SaveStorageAdapter } = {}) {
  const activeStorage = adapter ?? createDefaultAdapter(storage ?? createDefaultStorageProxy());

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



  function safeListKeys(prefix?: string): string[] {
    try {
      return activeStorage.listKeys(prefix);
    } catch {
      return [];
    }
  }

  function readMigrationMarker(): string | null {
    return safeGetItem(STORAGE_MIGRATION_MARKER_KEY);
  }

  function validateStorageIntegrity(): boolean {
    const rawIndex = safeGetItem(SAVE_INDEX_KEY);
    if (!rawIndex) return true;

    try {
      const parsed = JSON.parse(rawIndex) as unknown;
      if (!Array.isArray(parsed)) return false;
      const rows = parsed.filter(isValidIndexRow).map(normalizeIndexRow);
      if (rows.length === 0 && parsed.length > 0) return false;
      return rows.every((row) => {
        const primary = safeGetItem(row.storageKey);
        const backup = safeGetItem(getBackupKey(row.storageKey));
        return primary !== null || backup !== null;
      });
    } catch {
      return false;
    }
  }

  function markMigrationComplete() {
    const marker = JSON.stringify({ backend: activeStorage.backend, migratedAt: Date.now() });
    assertStorageWrite(safeSetItem(STORAGE_MIGRATION_MARKER_KEY, marker), "set", STORAGE_MIGRATION_MARKER_KEY, "storage migration marker");
  }

  function rollbackMigration(snapshot: Map<string, string | null>) {
    for (const [key, value] of snapshot.entries()) {
      if (value === null) {
        safeRemoveItem(key);
      } else {
        safeSetItem(key, value);
      }
    }
  }

  function migrateLegacyKeysToAdapter() {
    const marker = readMigrationMarker();
    if (marker) {
      try {
        const parsed = JSON.parse(marker) as { backend?: string };
        if (parsed.backend === activeStorage.backend) return;
      } catch {
        // continue to migration if marker is corrupt
      }
    }

    const legacyKeys = [
      LEGACY_KEY,
      SAVE_INDEX_KEY,
      SAVE_ACTIVE_ID_KEY,
      SAVE_ID_COUNTER_KEY,
      getBackupKey(LEGACY_KEY),
      getTempKey(LEGACY_KEY),
      ...safeListKeys("hc_career_save__"),
    ];

    const uniqueKeys = [...new Set(legacyKeys)];
    if (uniqueKeys.length === 0) {
      markMigrationComplete();
      return;
    }

    const snapshot = new Map<string, string | null>();
    for (const key of uniqueKeys) {
      snapshot.set(key, safeGetItem(key));
    }

    try {
      for (const [key, value] of snapshot.entries()) {
        if (value === null) continue;
        assertStorageWrite(safeSetItem(key, value), "set", key, "legacy migration copy");
      }
      if (!validateStorageIntegrity()) {
        rollbackMigration(snapshot);
        throw new Error("Post-migration storage integrity validation failed.");
      }
      markMigrationComplete();
      logInfo("save.storage.migration.success", { meta: { backend: activeStorage.backend, keyCount: uniqueKeys.length } });
    } catch (error) {
      rollbackMigration(snapshot);
      logWarn("save.storage.migration.rollback", { meta: { backend: activeStorage.backend, message: error instanceof Error ? error.message : String(error) } });
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

  migrateLegacyKeysToAdapter();

  function toMetadata(saveId: string, state: GameState): SaveMetadata {
    const now = Date.now();
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
      updatedAt: now,
      lastPlayed: now,
      careerStage: String(state.careerStage ?? "PRE_SEASON"),
      version: Number((state as any).schemaVersion ?? LATEST_SAVE_SCHEMA_VERSION),
    };
  }

  function normalizeIndexRow(row: SaveIndexRow): SaveIndexRow {
    const normalizedUpdatedAt = Number(row.updatedAt ?? row.lastPlayed ?? Date.now());
    const normalizedVersion = Number.isFinite(Number(row.version)) ? Number(row.version) : LATEST_SAVE_SCHEMA_VERSION;
    return {
      ...row,
      updatedAt: normalizedUpdatedAt,
      lastPlayed: Number(row.lastPlayed ?? normalizedUpdatedAt),
      version: normalizedVersion,
    };
  }

  function isValidIndexRow(row: unknown): row is SaveIndexRow {
    if (!isRecord(row)) return false;
    if (!isPersistableSaveId(row.saveId)) return false;
    if (typeof row.storageKey !== "string" || row.storageKey.length === 0) return false;
    if (typeof row.coachName !== "string" || row.coachName.length === 0) return false;
    if (typeof row.teamName !== "string" || row.teamName.length === 0) return false;
    if (!Number.isFinite(Number(row.season))) return false;
    if (!Number.isFinite(Number(row.week))) return false;
    if (!isRecord(row.record)) return false;
    if (!Number.isFinite(Number(row.record.wins)) || !Number.isFinite(Number(row.record.losses))) return false;
    if (typeof row.careerStage !== "string" || row.careerStage.length === 0) return false;
    if (!Number.isFinite(Number(row.lastPlayed))) return false;
    return true;
  }

  function pickLegacyRecoverySaveId(legacySaveId?: string): string {
    if (legacySaveId && isPersistableSaveId(legacySaveId) && !safeGetItem(getStorageKey(legacySaveId))) {
      return legacySaveId;
    }

    let suffix = 1;
    while (suffix < 1_000_000) {
      const candidate = `career-${suffix}`;
      if (!safeGetItem(getStorageKey(candidate))) {
        return candidate;
      }
      suffix += 1;
    }

    return `career-${Date.now()}`;
  }

  function ensureLegacySlotMigration(): SaveIndexRow[] {
    const legacyRaw = safeGetItem(LEGACY_KEY);
    if (!legacyRaw) return [];

    const parsed = parseSave(legacyRaw);
    if (!parsed) return [];

    const legacySaveId = isPersistableSaveId((parsed as Partial<GameState>).saveId)
      ? String((parsed as Partial<GameState>).saveId)
      : undefined;

    if (legacySaveId) {
      const existingSlotState = readAndValidateState(safeGetItem(getStorageKey(legacySaveId)), legacySaveId);
      if (existingSlotState.state) {
        const row: SaveIndexRow = { ...toMetadata(legacySaveId, existingSlotState.state), storageKey: getStorageKey(legacySaveId) };
        commitAtomic(LEGACY_KEY, JSON.stringify(existingSlotState.state));
        writeIndex([row]);
        setActiveSaveId(legacySaveId);
        return [row];
      }
    }

    const preferredId = pickLegacyRecoverySaveId(legacySaveId);
    const migrated = migrateSaveSchema(parsed, preferredId);
    const migratedMeta = toMetadata(migrated.saveId ?? preferredId, migrated);
    const storageKey = getStorageKey(migratedMeta.saveId);
    const row: SaveIndexRow = { ...migratedMeta, storageKey };

    // Keep legacy key for backward compatibility, but seed slot-based storage/index.
    const serialized = JSON.stringify(migrated);
    commitAtomic(storageKey, serialized);
    commitAtomic(LEGACY_KEY, serialized);
    writeIndex([row]);
    // Legacy recovery is authoritative here because we had no valid indexed saves.
    setActiveSaveId(migratedMeta.saveId);
    return [row];
  }

  function readIndex(): SaveIndexRow[] {
    const rawIndex = safeGetItem(SAVE_INDEX_KEY);
    let parsedRows: SaveIndexRow[] = [];

    try {
      const parsed = JSON.parse(rawIndex ?? "[]") as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsedRows = parsed.filter(isValidIndexRow).map(normalizeIndexRow);
      }
    } catch {
      parsedRows = [];
    }

    if (parsedRows.length > 0) return parsedRows;

    const migrated = ensureLegacySlotMigration();
    if (migrated.length > 0) return migrated;
    return [];
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
      writeIndex(rows.sort((a, b) => (b.updatedAt ?? b.lastPlayed) - (a.updatedAt ?? a.lastPlayed)));
      setActiveSaveId(id);
      logInfo("save.sync.success", { saveId: id, phase: state.phase, season: state.season, week: state.week });
    } catch (error) {
      logError("save.sync.failure", { saveId: id, phase: state.phase, season: state.season, week: state.week, meta: { message: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  function listSaves(): SaveMetadata[] {
    return readIndex()
      .sort((a, b) => (b.updatedAt ?? b.lastPlayed) - (a.updatedAt ?? a.lastPlayed))
      .map(({ storageKey: _storageKey, ...meta }) => ({
        ...meta,
        updatedAt: Number(meta.updatedAt ?? meta.lastPlayed),
        version: Number(meta.version ?? LATEST_SAVE_SCHEMA_VERSION),
      }));
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
    const payload: SaveExportEnvelope = {
      format: "hc_save_export_v1",
      exportedAt: Date.now(),
      metadata: toMetadata(saveId, state),
      state,
    };
    return {
      blob: new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
      fileName: `head-coach-dream-${saveId}-v${LATEST_SAVE_SCHEMA_VERSION}.json`,
    };
  }

  function importSave(json: string): LoadSaveResult {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(json);
    } catch {
      parsed = null;
    }
    if (!parsed || typeof parsed !== "object") {
      return {
        ok: false,
        code: "CORRUPT_SAVE",
        saveId: "",
        restoredFromBackup: false,
        message: "Could not parse imported save JSON.",
      };
    }

    let importedState: Partial<GameState> | null = null;
    if ((parsed as Partial<SaveExportEnvelope>).format === "hc_save_export_v1") {
      if (!isRecord(parsed)) {
        return {
          ok: false,
          code: "INVALID_SAVE",
          saveId: "",
          restoredFromBackup: false,
          message: "Imported save envelope is malformed.",
        };
      }
      const envelopeState = (parsed as Partial<SaveExportEnvelope>).state;
      if (!isRecord(envelopeState) || !looksLikeRawSavePayload(envelopeState)) {
        return {
          ok: false,
          code: "INVALID_SAVE",
          saveId: "",
          restoredFromBackup: false,
          message: "Imported save envelope is malformed.",
        };
      }
      importedState = envelopeState as Partial<GameState>;
    } else {
      if (!looksLikeRawSavePayload(parsed)) {
        return {
          ok: false,
          code: "INVALID_SAVE",
          saveId: "",
          restoredFromBackup: false,
          message: "Imported save payload is not a valid save object.",
        };
      }
      importedState = parsed as Partial<GameState>;
    }

    const incomingVersion = Number((importedState as any)?.schemaVersion ?? 0);
    if (incomingVersion > LATEST_SAVE_SCHEMA_VERSION) {
      return {
        ok: false,
        code: "INVALID_SAVE",
        saveId: "",
        restoredFromBackup: false,
        message: `Imported save schema version ${incomingVersion} is newer than supported version ${LATEST_SAVE_SCHEMA_VERSION}.`,
      };
    }

    const preview = migrateSaveSchema(importedState, "import-preview");
    const validation = validateCriticalSaveState(preview);
    if (!validation.ok && "code" in validation) {
      return {
        ok: false,
        code: "INVALID_SAVE",
        validationCode: validation.code,
        saveId: "",
        restoredFromBackup: false,
        message: validation.message,
      };
    }

    const saveId = allocateSaveId("import");
    const migrated = migrateSaveSchema(importedState, saveId);
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

    const remainingRows = rows.filter((s) => s.saveId !== saveId);
    writeIndex(remainingRows);

    const activeId = getActiveSaveId();
    if (remainingRows.length === 0) {
      safeRemoveItem(SAVE_ACTIVE_ID_KEY);
      safeRemoveItem(LEGACY_KEY);
      safeRemoveItem(getBackupKey(LEGACY_KEY));
      safeRemoveItem(getTempKey(LEGACY_KEY));
      return;
    }

    if (activeId === saveId) {
      const orderedSurvivors = [...remainingRows].sort((a, b) => (b.updatedAt ?? b.lastPlayed) - (a.updatedAt ?? a.lastPlayed));
      const survivorEntry = orderedSurvivors
        .map((candidate) => ({ candidate, loaded: readSaveState(candidate.saveId) }))
        .find((entry) => entry.loaded.ok);

      if (!survivorEntry) {
        safeRemoveItem(SAVE_ACTIVE_ID_KEY);
        safeRemoveItem(LEGACY_KEY);
        safeRemoveItem(getBackupKey(LEGACY_KEY));
        safeRemoveItem(getTempKey(LEGACY_KEY));
        return;
      }

      const serialized = JSON.stringify(survivorEntry.loaded.state);
      commitAtomic(LEGACY_KEY, serialized);
      setActiveSaveId(survivorEntry.candidate.saveId);
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
