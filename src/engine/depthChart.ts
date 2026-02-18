import type { GameState } from "@/context/GameContext";
import { getEffectivePlayersByTeam, normalizePos } from "@/engine/rosterOverlay";

export type DepthSlotsLike = {
  startersByPos: Record<string, string | undefined>;
};

const GROUP_ORDER = ["QB", "RB", "WR", "TE", "OL", "DL", "EDGE", "LB", "CB", "S", "K", "P"] as const;

const SLOT_TEMPLATES: Record<string, string[]> = {
  QB: ["QB1", "QB2", "QB3"],
  RB: ["RB1", "RB2", "RB3"],
  WR: ["WR1", "WR2", "WR3", "WR4", "WR5"],
  TE: ["TE1", "TE2", "TE3"],
  OL: ["LT", "LG", "C", "RG", "RT", "OL6", "OL7"],
  DL: ["DT1", "DT2", "DL3", "DL4"],
  EDGE: ["EDGE1", "EDGE2", "EDGE3"],
  LB: ["LB1", "LB2", "LB3"],
  CB: ["CB1", "CB2", "CB3", "CB4"],
  S: ["FS", "SS", "S3"],
  K: ["K"],
  P: ["P"],
};

function orderedSlots(): string[] {
  const out: string[] = [];
  for (const g of GROUP_ORDER) out.push(...(SLOT_TEMPLATES[g] ?? []));
  return out;
}

function slotGroup(slot: string): string | null {
  for (const [g, slots] of Object.entries(SLOT_TEMPLATES)) {
    if (slots.includes(slot)) return g;
  }
  return null;
}

export function eligiblePositionsForSlot(slot: string): string[] {
  const group = slotGroup(slot);
  if (!group) return [];

  if (group === "OL") return ["OT", "OG", "C", "OL"];
  if (group === "DL") return ["DT", "DE", "DL"];
  if (group === "S") return ["S", "FS", "SS", "DB"];
  return [group];
}

export function eligibleRosterForSlot<T extends { id: string; pos: string }>(
  slot: string,
  roster: T[],
  includeId?: string,
  usedIds?: Set<string>,
) {
  const eligible = new Set(eligiblePositionsForSlot(slot));
  return roster.filter((p) => {
    const pid = String(p.id);
    const okPos = eligible.has(normalizePos(p.pos)) || (includeId && pid === String(includeId));
    if (!okPos) return false;
    if (!usedIds) return true;
    if (includeId && pid === String(includeId)) return true;
    return !usedIds.has(pid);
  });
}

export function usedPlayerIds(depth: DepthSlotsLike): Set<string> {
  const used = new Set<string>();
  for (const v of Object.values(depth.startersByPos)) {
    if (v) used.add(String(v));
  }
  return used;
}

function isEligible(posGroup: string, playerPos: string): boolean {
  const p = normalizePos(playerPos);
  if (posGroup === "OL") return p === "OL";
  return p === posGroup;
}

export function autoFillDepthChartGaps(state: GameState, teamId: string): Record<string, string> {
  const slots = orderedSlots();
  const roster = getEffectivePlayersByTeam(state, teamId)
    .map((p: any) => ({
      id: String(p.playerId),
      pos: String(p.pos ?? "UNK"),
      ovr: Number(p.overall ?? 0),
    }))
    .sort((a, b) => b.ovr - a.ovr);

  const onTeam = new Set(roster.map((p) => p.id));

  const next = { ...(state.depthChart?.startersByPos ?? {}) };
  const used = new Set<string>();

  for (const s of slots) {
    const pid = next[s];
    if (pid && onTeam.has(String(pid))) used.add(String(pid));
    else delete next[s];
  }

  for (const s of slots) {
    if (next[s]) continue;
    const g = slotGroup(s);
    if (!g) continue;

    const pick = roster.find((p) => !used.has(p.id) && isEligible(g, p.pos));
    if (!pick) continue;

    next[s] = pick.id;
    used.add(pick.id);
  }

  return next;
}
