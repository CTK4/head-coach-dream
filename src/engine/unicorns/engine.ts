import type { GameState } from "@/context/GameContext";
import { getPlayers, type PlayerRow } from "@/data/leagueDb";
import { getEffectivePlayers } from "@/engine/rosterOverlay";
import { hashSeed, mulberry32 } from "@/engine/rng";
import type { PlayerUnicorn, UnicornDefinition } from "@/engine/unicorns/types";

const MAX_DRAFT_DISCOVERIES = 3;
const MAX_BREAKOUT_DISCOVERIES = 2;

export const UNICORN_DEFINITIONS: UnicornDefinition[] = [
  {
    id: "QB_UNICORN_ARM_POWER",
    name: "Arm + Size + Chaos Control",
    description: "Elite arm talent with designed-run short-yardage upside.",
    rarity: 0.03,
    requiredTraits: ["ARM_TALENT_ELITE", "UNICORN_FRAME"],
    statThresholds: [
      { stat: "armStrength", value: 94, operator: "ge" },
      { stat: "throwOnMove", value: 82, operator: "ge" },
      { stat: "processing", value: 75, operator: "ge" },
    ],
    minAge: 21,
    maxAge: 30,
  },
  {
    id: "QB_UNICORN_POWER_DUAL",
    name: "Power Dual Threat",
    description: "Big-framed QB run force with explosive designed-carry upside.",
    rarity: 0.02,
    requiredTraits: ["UNICORN_FRAME", "RARE_BURST"],
    statThresholds: [
      { stat: "speed", value: 82, operator: "ge" },
      { stat: "strength", value: 84, operator: "ge" },
      { stat: "truck", value: 80, operator: "ge" },
    ],
    minAge: 21,
    maxAge: 29,
  },
  {
    id: "QB_UNICORN_RAW_SUPERATH",
    name: "Prototype Volatility",
    description: "Extreme tools QB with wide outcome distribution and huge upside.",
    rarity: 0.015,
    requiredTraits: ["RARE_BURST", "GAMEBREAKERS"],
    statThresholds: [
      { stat: "speed", value: 90, operator: "ge" },
      { stat: "armStrength", value: 94, operator: "ge" },
    ],
    minAge: 20,
    maxAge: 25,
  },
  {
    id: "RB_UNICORN_MYTHIC",
    name: "Mythic Explosion",
    description: "Home-run hitting back with uncommon burst + contact balance.",
    rarity: 0.02,
    requiredTraits: ["RARE_BURST", "CONTACT_BALANCE_ELITE"],
    statThresholds: [
      { stat: "speed", value: 95, operator: "ge" },
      { stat: "burst", value: 95, operator: "ge" },
    ],
    minAge: 20,
    maxAge: 28,
  },
  {
    id: "RB_UNICORN_TITAN",
    name: "Mass/Speed Wear-Down",
    description: "Power-volume unicorn who improves as game fatigue climbs.",
    rarity: 0.025,
    requiredTraits: ["UNICORN_FRAME", "ANTI_FRAGILE"],
    statThresholds: [
      { stat: "truck", value: 92, operator: "ge" },
      { stat: "contactBalance", value: 92, operator: "ge" },
    ],
    minAge: 21,
    maxAge: 31,
  },
  {
    id: "WR_UNICORN_MEGAX",
    name: "Mega X",
    description: "Catch-radius outlier who warps coverage structure.",
    rarity: 0.02,
    requiredTraits: ["UNICORN_FRAME", "COVERAGE_ERASER"],
    statThresholds: [
      { stat: "catchRadius", value: 96, operator: "ge" },
      { stat: "contested", value: 92, operator: "ge" },
    ],
    minAge: 21,
    maxAge: 31,
  },
  {
    id: "WR_UNICORN_VERTICAL_ALIEN",
    name: "Vertical Alien",
    description: "Deep-tracking alien that enforces permanent safety help.",
    rarity: 0.015,
    requiredTraits: ["GAMEBREAKERS", "COVERAGE_ERASER"],
    statThresholds: [
      { stat: "speed", value: 96, operator: "ge" },
      { stat: "deepTracking", value: 96, operator: "ge" },
    ],
    minAge: 20,
    maxAge: 30,
  },
  {
    id: "TE_UNICORN_INLINE_DOMINATOR",
    name: "Dominant Inline",
    description: "Two-way TE who dominates in-line and in contested passing windows.",
    rarity: 0.02,
    requiredTraits: ["UNICORN_FRAME", "VIOLENCE_FINISHER"],
    statThresholds: [
      { stat: "hands", value: 88, operator: "ge" },
      { stat: "block", value: 86, operator: "ge" },
    ],
    minAge: 21,
    maxAge: 32,
  },
  {
    id: "DT_UNICORN_DISRUPTOR",
    name: "Disruptor",
    description: "Interior wrecking ball with unblockable first-step burst.",
    rarity: 0.02,
    requiredTraits: ["RARE_BURST", "RUSHER_GRAVITY"],
    statThresholds: [
      { stat: "passRush", value: 92, operator: "ge" },
      { stat: "burst", value: 94, operator: "ge" },
    ],
    minAge: 21,
    maxAge: 31,
  },
  {
    id: "EDGE_UNICORN_BURST",
    name: "Explosion",
    description: "Edge speed-to-power rusher who forces chip and slide help.",
    rarity: 0.02,
    requiredTraits: ["RUSHER_GRAVITY", "GAMEBREAKERS"],
    statThresholds: [
      { stat: "burst", value: 94, operator: "ge" },
      { stat: "bend", value: 86, operator: "ge" },
    ],
    minAge: 21,
    maxAge: 30,
  },
  {
    id: "CB_UNICORN_ERASER",
    name: "True Eraser",
    description: "Coverage suppressor that deletes route families and target share.",
    rarity: 0.02,
    requiredTraits: ["COVERAGE_ERASER", "GAMEBREAKERS"],
    statThresholds: [
      { stat: "speed", value: 95, operator: "ge" },
      { stat: "man", value: 92, operator: "ge" },
      { stat: "ballSkills", value: 88, operator: "ge" },
    ],
    minAge: 21,
    maxAge: 30,
  },
  {
    id: "K_UNICORN_SNIPER",
    name: "Accuracy King",
    description: "Distance+accuracy specialist with reduced weather miss drag.",
    rarity: 0.02,
    requiredTraits: ["ANTI_FRAGILE"],
    statThresholds: [
      { stat: "accuracy", value: 95, operator: "ge" },
      { stat: "clutch", value: 92, operator: "ge" },
    ],
    minAge: 22,
    maxAge: 37,
  },
];

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function getPlayerAge(player: Record<string, unknown>): number {
  return Number(player.age ?? 0);
}

function parseTraits(raw: unknown): Set<string> {
  const out = new Set<string>();
  const push = (v: unknown) => {
    const t = String(v ?? "").trim().toUpperCase();
    if (t) out.add(t);
  };
  if (Array.isArray(raw)) {
    for (const value of raw) push(value);
    return out;
  }
  const text = String(raw ?? "");
  for (const token of text.split(/[,|/;]+/g)) push(token);
  return out;
}

function resolveStat(player: Record<string, unknown>, stat: string): number {
  const aliases: Record<string, string[]> = {
    throwOnMove: ["throwOnMove", "armOnRunAccuracy"],
    processing: ["processing", "readSpeed", "decisionSpeed"],
    truck: ["truck", "truckContactBalance"],
    burst: ["burst", "acceleration"],
    contactBalance: ["contactBalance", "truckContactBalance"],
    catchRadius: ["catchRadius", "height"],
    contested: ["contested", "catchInTraffic"],
    block: ["block", "runBlock"],
    passRush: ["passRush", "shed"],
    bend: ["bend", "agility"],
    man: ["man", "manCoverage"],
    ballSkills: ["ballSkills", "hands"],
  };
  const keys = aliases[stat] ?? [stat];
  for (const key of keys) {
    const n = Number(player[key]);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function definitionEligible(definition: UnicornDefinition, player: Record<string, unknown>): boolean {
  const age = getPlayerAge(player);
  if (definition.minAge != null && age < definition.minAge) return false;
  if (definition.maxAge != null && age > definition.maxAge) return false;
  return true;
}

function computeConfidence(definition: UnicornDefinition, player: Record<string, unknown>, traitSet: Set<string>): number {
  const required = definition.requiredTraits.length;
  const traitMatches = definition.requiredTraits.filter((t) => traitSet.has(t.toUpperCase())).length;
  const traitRatio = required > 0 ? traitMatches / required : 1;

  const thresholds = definition.statThresholds;
  let statMatches = 0;
  let overage = 0;
  for (const threshold of thresholds) {
    const actual = resolveStat(player, threshold.stat);
    if (actual >= threshold.value) {
      statMatches += 1;
      overage += Math.min(1, (actual - threshold.value) / 25);
    }
  }
  const statRatio = thresholds.length > 0 ? statMatches / thresholds.length : 1;
  const overageBoost = thresholds.length > 0 ? overage / thresholds.length : 0;

  return clamp01(0.3 + traitRatio * 0.25 + statRatio * 0.35 + overageBoost * 0.1);
}

function maybeSelectDefinition(state: GameState, player: Record<string, unknown>, season: number): PlayerUnicorn | null {
  const playerId = String(player.playerId ?? player.prospectId ?? "");
  if (!playerId || state.playerUnicorns?.[playerId]) return null;

  const traitSet = parseTraits(player.Traits);
  if (String((player as PlayerRow).development?.trait ?? "").toLowerCase() === "generational") {
    traitSet.add("GAMEBREAKERS");
    traitSet.add("UNICORN_FRAME");
  }

  let best: PlayerUnicorn | null = null;
  for (const definition of UNICORN_DEFINITIONS) {
    if (!definitionEligible(definition, player)) continue;
    const confidence = computeConfidence(definition, player, traitSet);
    if (confidence < 0.7) continue;
    const roll = mulberry32(hashSeed(state.saveSeed ?? 1, "UNICORN_DISCOVERY", season, playerId, definition.id))();
    if (roll > definition.rarity) continue;
    if (!best || confidence > best.confidence) {
      best = { archetypeId: definition.id, discoveredSeason: season, confidence };
    }
  }
  return best;
}

export function evaluatePlayerUnicorn(state: GameState, playerId: string, season: number): PlayerUnicorn | null {
  if (state.playerUnicorns?.[playerId]) return null;

  const fromLeague = getPlayers().find((p) => String(p.playerId) === String(playerId));
  if (fromLeague) {
    return maybeSelectDefinition(state, fromLeague as Record<string, unknown>, season);
  }

  const profile = state.scoutingState?.trueProfiles?.[String(playerId)];
  const draftClassRow = state.upcomingDraftClass?.find((p: any) => String(p.prospectId ?? p.id ?? "") === String(playerId));
  if (!profile || !draftClassRow) return null;

  return maybeSelectDefinition(
    state,
    {
      ...profile.trueAttributes,
      ...draftClassRow,
      playerId: String(playerId),
      age: Number((draftClassRow as any).age ?? 21),
      Traits: (profile as any).traits ?? "",
    },
    season,
  );
}

export function applySeasonUnicorns(state: GameState): GameState {
  const season = Number(state.season ?? 0);
  const nextMap = { ...(state.playerUnicorns ?? {}) };
  const news = [...(state.hub.news ?? [])];

  const draftCandidates = (state.upcomingDraftClass ?? [])
    .map((p: any) => String(p.prospectId ?? p.id ?? ""))
    .filter(Boolean)
    .filter((id, index, arr) => arr.indexOf(id) === index);
  let draftDiscoveries = 0;
  for (const id of draftCandidates) {
    if (draftDiscoveries >= MAX_DRAFT_DISCOVERIES) break;
    const found = evaluatePlayerUnicorn({ ...state, playerUnicorns: nextMap }, id, season);
    if (!found) continue;
    nextMap[id] = found;
    draftDiscoveries += 1;
    if (found.confidence >= 0.85) {
      const row = state.upcomingDraftClass.find((p: any) => String(p.prospectId ?? p.id ?? "") === id) as Record<string, unknown> | undefined;
      news.unshift({
        id: `unicorn-prospect-${season}-${id}-${found.archetypeId}`,
        title: `Scouts flag ${String(row?.name ?? id)} as a unicorn candidate`,
        body: `Team scouts believe ${String(row?.pos ?? "this prospect")} ${String(row?.name ?? id)} is a generational talent (${Math.round(found.confidence * 100)}% confidence).`,
        createdAt: season * 1_000_000 + news.length,
        category: "LEAGUE",
      });
    }
  }

  const breakoutCandidates = getEffectivePlayers(state)
    .filter((player) => Number((player as any).age ?? 99) <= 26)
    .sort((a, b) => Number((b as any).overall ?? 0) - Number((a as any).overall ?? 0));

  let breakoutDiscoveries = 0;
  for (const player of breakoutCandidates) {
    if (breakoutDiscoveries >= MAX_BREAKOUT_DISCOVERIES) break;
    const playerId = String((player as any).playerId ?? "");
    if (!playerId || nextMap[playerId]) continue;
    const found = evaluatePlayerUnicorn({ ...state, playerUnicorns: nextMap }, playerId, season);
    if (!found) continue;
    nextMap[playerId] = found;
    breakoutDiscoveries += 1;
    if (found.confidence >= 0.85) {
      news.unshift({
        id: `unicorn-player-${season}-${playerId}-${found.archetypeId}`,
        title: `${String((player as any).fullName ?? playerId)} emerges as unicorn talent`,
        body: `League evaluators now view ${String((player as any).fullName ?? playerId)} as a rare ${found.archetypeId} archetype (${Math.round(found.confidence * 100)}% confidence).`,
        createdAt: season * 1_000_000 + news.length,
        category: "LEAGUE",
      });
    }
  }

  return {
    ...state,
    playerUnicorns: nextMap,
    hub: {
      ...state.hub,
      news: news.slice(0, 200),
    },
  };
}

export function getProspectUnicornSignal(state: GameState, prospectId: string): number {
  const known = state.playerUnicorns?.[prospectId];
  if (known) return known.confidence;
  const evaluated = evaluatePlayerUnicorn(state, prospectId, Number(state.season ?? 0));
  return Number(evaluated?.confidence ?? 0);
}
