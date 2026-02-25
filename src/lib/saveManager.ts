import type { GameState } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";

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

function parseSave(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
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
    const parsed = JSON.parse(localStorage.getItem(SAVE_INDEX_KEY) ?? "[]") as SaveIndexRow[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // no-op
  }

  const legacy = parseSave(localStorage.getItem(LEGACY_KEY));
  if (!legacy) return [];
  const saveId = "legacy-default";
  return [{ ...toMetadata(saveId, legacy), storageKey: LEGACY_KEY }];
}

function writeIndex(rows: SaveIndexRow[]) {
  localStorage.setItem(SAVE_INDEX_KEY, JSON.stringify(rows));
}

export function getActiveSaveId(): string | null {
  return localStorage.getItem(SAVE_ACTIVE_ID_KEY);
}

export function setActiveSaveId(saveId: string) {
  localStorage.setItem(SAVE_ACTIVE_ID_KEY, saveId);
}

export function syncCurrentSave(state: GameState, saveId?: string) {
  const id = saveId || getActiveSaveId() || `save-${Date.now()}`;
  const storageKey = getStorageKey(id);
  setActiveSaveId(id);
  localStorage.setItem(storageKey, JSON.stringify(state));
  localStorage.setItem(LEGACY_KEY, JSON.stringify(state));

  const rows = readIndex().filter((row) => row.saveId !== id);
  rows.push({ ...toMetadata(id, state), storageKey });
  writeIndex(rows.sort((a, b) => b.lastPlayed - a.lastPlayed));
}

export function listSaves(): SaveMetadata[] {
  return readIndex()
    .sort((a, b) => b.lastPlayed - a.lastPlayed)
    .map(({ storageKey: _storageKey, ...meta }) => meta);
}

export function loadSave(saveId: string): GameState | null {
  const row = readIndex().find((s) => s.saveId === saveId);
  const key = row?.storageKey ?? getStorageKey(saveId);
  const state = parseSave(localStorage.getItem(key));
  if (state) {
    setActiveSaveId(saveId);
    localStorage.setItem(LEGACY_KEY, JSON.stringify(state));
  }
  return state;
}

export function deleteSave(saveId: string): void {
  const rows = readIndex();
  const row = rows.find((s) => s.saveId === saveId);
  localStorage.removeItem(row?.storageKey ?? getStorageKey(saveId));
  writeIndex(rows.filter((s) => s.saveId !== saveId));
  if (getActiveSaveId() === saveId) {
    localStorage.removeItem(SAVE_ACTIVE_ID_KEY);
  }
}
