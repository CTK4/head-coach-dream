import type { GameState } from "@/context/GameContext";
import type { Prospect } from "@/engine/offseasonData";
import { genProspects } from "@/engine/offseasonGen";
import { getEffectiveFreeAgents } from "@/engine/rosterOverlay";
import { getPlayers } from "@/data/leagueDb";

export type DevAction =
  | "SPAWN_FREE_AGENTS"
  | "REGEN_DRAFT_CLASS"
  | "ADVANCE_PHASE"
  | "CLEAR_INJURIES"
  | "FILL_ROSTER_NEEDS"
  | "RESET_UNREAD_NEWS"
  | "GIVE_CAP_SPACE";

const POSITIONS = ["QB", "RB", "WR", "TE", "OL", "DL", "EDGE", "LB", "CB", "S"];

function seededPick<T>(items: T[], seed: number, key: string, count: number): T[] {
  if (!items.length || count <= 0) return [];
  const out: T[] = [];
  let s = Math.abs((seed ^ key.length) >>> 0) + 1;
  const pool = items.slice();
  for (let i = 0; i < count && pool.length > 0; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const idx = s % pool.length;
    out.push(pool[idx]!);
    pool.splice(idx, 1);
  }
  return out;
}

function regenerateDraftClass(state: GameState, payload?: Record<string, unknown>): GameState {
  const year = Number(payload?.year ?? Number(state.season) + 1);
  const existingCount = state.offseasonData.preDraft.board?.length || state.offseasonData.combine.prospects?.length || 220;
  const count = Math.max(1, Number(payload?.count ?? existingCount));
  const base = genProspects(state.saveSeed ^ year, count, count);
  const prospects: Prospect[] = base.map((p, index) => ({ ...p, id: `DEV_DC_${year}_${String(index + 1).padStart(4, "0")}` }));
  return {
    ...state,
    offseasonData: {
      ...state.offseasonData,
      combine: { ...state.offseasonData.combine, prospects, results: {}, generated: false },
      preDraft: { ...state.offseasonData.preDraft, board: prospects.slice(), visits: {}, workouts: {}, reveals: {} },
      draft: { ...state.offseasonData.draft, board: prospects.slice(), picks: [] },
    },
  };
}

function spawnFreeAgents(state: GameState, payload?: Record<string, unknown>): GameState {
  const count = Math.max(1, Number(payload?.count ?? 50));
  const taken = new Set(Object.values(state.playerTeamOverrides ?? {}).filter(Boolean));
  const candidates = getPlayers().filter((p) => {
    const pid = String((p as any).playerId ?? "");
    const teamId = String((p as any).teamId ?? "");
    if (!pid || !teamId) return false;
    if (String(state.acceptedOffer?.teamId ?? "") === teamId) return false;
    return !taken.has(pid);
  });
  const selected = seededPick(candidates, state.saveSeed, `dev-fa-${state.season}-${state.week ?? 0}`, count);
  const overrides = { ...(state.playerTeamOverrides ?? {}) };
  for (const p of selected) {
    const pid = String((p as any).playerId ?? "");
    if (!pid) continue;
    overrides[pid] = "";
  }
  const offseasonFA = state.offseasonData.freeAgency ?? {
    offers: [],
    signings: [],
    rejected: {},
    withdrawn: {},
    capTotal: 0,
    capUsed: 0,
    capHitsByPlayerId: {},
    decisionReasonByPlayerId: {},
  };
  return { ...state, playerTeamOverrides: overrides, offseasonData: { ...state.offseasonData, freeAgency: offseasonFA } };
}

function fillRosterNeeds(state: GameState, payload?: Record<string, unknown>): GameState {
  const teamId = String(payload?.teamId ?? state.acceptedOffer?.teamId ?? "");
  if (!teamId) return state;
  const positions = Array.isArray(payload?.positions) ? payload.positions.map((p) => String(p).toUpperCase()) : ["OL", "DL"];
  const countPerPosition = Math.max(1, Number(payload?.countPerPosition ?? 1));
  const freeAgents = getEffectiveFreeAgents(state);
  const overrides = { ...(state.playerTeamOverrides ?? {}) };
  const contractOverrides = { ...(state.playerContractOverrides ?? {}) };
  for (const pos of positions) {
    const filtered = freeAgents.filter((p: any) => String(p.pos ?? "").toUpperCase() === pos);
    const picks = seededPick(filtered, state.saveSeed, `fill-${teamId}-${pos}-${state.season}`, countPerPosition);
    for (const player of picks) {
      const playerId = String((player as any).playerId ?? "");
      if (!playerId) continue;
      overrides[playerId] = teamId;
      contractOverrides[playerId] = {
        startSeason: state.season,
        endSeason: state.season,
        salaries: [1_200_000],
        signingBonus: 0,
        guaranteedAtSigning: 0,
        prorationBySeason: { [state.season]: 0 },
      };
    }
  }
  return { ...state, playerTeamOverrides: overrides, playerContractOverrides: contractOverrides };
}

export function runDevAction(state: GameState, action: DevAction, payload?: Record<string, unknown>): GameState {
  switch (action) {
    case "SPAWN_FREE_AGENTS":
      return spawnFreeAgents(state, payload);
    case "REGEN_DRAFT_CLASS":
      return regenerateDraftClass(state, payload);
    case "CLEAR_INJURIES":
      return { ...state, injuries: [], pendingInjuryAlert: undefined };
    case "FILL_ROSTER_NEEDS":
      return fillRosterNeeds(state, payload);
    case "RESET_UNREAD_NEWS":
      return { ...state, unreadNewsCount: 0, lastNewsReadWeek: Number(state.week ?? state.hub.regularSeasonWeek ?? 0) };
    case "GIVE_CAP_SPACE": {
      const amount = Math.max(0, Number(payload?.amount ?? 50_000_000));
      const capCommitted = Math.max(0, Number(state.finances.capCommitted ?? 0) - amount);
      const capSpace = Math.max(0, Number(state.finances.cap ?? 0) - capCommitted);
      return { ...state, finances: { ...state.finances, capCommitted, capSpace } };
    }
    default:
      return state;
  }
}

export const DEV_POSITIONS = POSITIONS;
