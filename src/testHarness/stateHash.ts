import type { GameState } from "@/context/GameContext";

type JsonLike = null | boolean | number | string | JsonLike[] | { [k: string]: JsonLike };

function sanitize(value: unknown): JsonLike {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return value.map((v) => sanitize(v));
  if (typeof value === "object") {
    const out: Record<string, JsonLike> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "lastPlayed" || k === "ui" || k === "uiToast") continue;
      out[k] = sanitize(v);
    }
    return out;
  }
  return String(value);
}

function canonicalize(value: JsonLike): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => canonicalize(v)).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize((value as Record<string, JsonLike>)[k])}`).join(",")}}`;
}

function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function stableStateHash(state: GameState): string {
  const relevant = {
    season: state.season,
    week: state.week,
    careerStage: state.careerStage,
    offseason: state.offseason,
    league: state.league,
    standings: state.currentStandings,
    weeklyResults: state.weeklyResults,
    gameHistory: state.gameHistory,
    staff: state.staff,
    orgRoles: state.orgRoles,
    assistantStaff: state.assistantStaff,
    rosterMgmt: state.rosterMgmt,
    draft: state.draft,
    playerTeamOverrides: state.playerTeamOverrides,
    playerContractOverrides: state.playerContractOverrides,
    injuries: state.injuries,
    acceptedOffer: state.acceptedOffer,
    userTeamId: state.userTeamId,
  };
  return fnv1a(canonicalize(sanitize(relevant)));
}
