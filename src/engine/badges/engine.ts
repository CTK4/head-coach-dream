import type { GameState } from "@/context/GameContext";
import { getPlayers, getTeams, type PlayerRow } from "@/data/leagueDb";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import type { PlayerSeasonStats } from "@/types/stats";
import type { BadgeDefinition, PlayerBadge } from "@/engine/badges/types";

const RARE_PLUS = new Set(["RARE", "EPIC", "LEGENDARY"]);

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "IRONMAN",
    name: "Ironman",
    description: "Stayed available all season and answered every bell.",
    rarity: "COMMON",
    thresholds: [
      { stat: "gamesPlayed", value: 17, operator: "ge" },
      { stat: "interceptions", value: 0, operator: "ge" },
    ],
  },
  {
    id: "GUNSLINGER",
    name: "Gunslinger",
    description: "Pushed the ball with elite production through the air.",
    rarity: "EPIC",
    thresholds: [
      { stat: "passingYards", value: 4500, operator: "ge" },
      { stat: "passingTDs", value: 35, operator: "ge" },
    ],
    eligibility: (player) => String(player.pos ?? "").toUpperCase() === "QB",
  },
  {
    id: "LOCKDOWN",
    name: "Lockdown",
    description: "Erased throwing windows and forced quarterbacks elsewhere.",
    rarity: "EPIC",
    thresholds: [
      { stat: "passDeflections", value: 16, operator: "ge" },
      { stat: "interceptionsDef", value: 4, operator: "ge" },
    ],
    eligibility: (player) => ["CB", "DB", "S", "FS", "SS"].includes(String(player.pos ?? "").toUpperCase()),
  },
  {
    id: "ROAD_WARRIOR",
    name: "Road Warrior",
    description: "Delivered star-level output in a full workload season.",
    rarity: "RARE",
    thresholds: [
      { stat: "gamesPlayed", value: 17, operator: "ge" },
      { stat: "performanceScore", value: 0.8, operator: "ge" },
    ],
  },
  {
    id: "BALLHAWK",
    name: "Ballhawk",
    description: "Lived around the football and took it away repeatedly.",
    rarity: "RARE",
    thresholds: [{ stat: "interceptionsDef", value: 6, operator: "ge" }],
    eligibility: (player) => ["CB", "DB", "S", "FS", "SS", "LB"].includes(String(player.pos ?? "").toUpperCase()),
  },
  {
    id: "SACK_ARTIST",
    name: "Sack Artist",
    description: "Collapsed pockets and finished drives behind the sticks.",
    rarity: "RARE",
    thresholds: [{ stat: "sacks", value: 12, operator: "ge" }],
    eligibility: (player) => ["EDGE", "DE", "DL", "DT", "LB", "OLB"].includes(String(player.pos ?? "").toUpperCase()),
  },
  {
    id: "WORKHORSE",
    name: "Workhorse",
    description: "Carried the offense with high-volume rushing output.",
    rarity: "COMMON",
    thresholds: [
      { stat: "rushingYards", value: 1200, operator: "ge" },
      { stat: "gamesPlayed", value: 12, operator: "ge" },
    ],
    eligibility: (player) => ["RB", "HB", "FB", "QB"].includes(String(player.pos ?? "").toUpperCase()),
  },
  {
    id: "CHAIN_MOVER",
    name: "Chain Mover",
    description: "Reliable receiving production week after week.",
    rarity: "COMMON",
    thresholds: [
      { stat: "receptions", value: 80, operator: "ge" },
      { stat: "receivingYards", value: 900, operator: "ge" },
    ],
    eligibility: (player) => ["WR", "TE", "RB", "HB"].includes(String(player.pos ?? "").toUpperCase()),
  },
  {
    id: "RED_ZONE_REAPER",
    name: "Red Zone Reaper",
    description: "Elite touchdown conversion in high-leverage territory.",
    rarity: "LEGENDARY",
    thresholds: [
      { stat: "receivingTDs", value: 12, operator: "ge" },
      { stat: "rushingTDs", value: 10, operator: "ge" },
      { stat: "passingTDs", value: 40, operator: "ge" },
    ],
    eligibility: (player) => ["QB", "RB", "HB", "WR", "TE"].includes(String(player.pos ?? "").toUpperCase()),
  },
  {
    id: "CLUTCH_KICKER",
    name: "Clutch Kicker",
    description: "Converted under pressure with elite efficiency.",
    rarity: "RARE",
    thresholds: [
      { stat: "fieldGoalsMade", value: 30, operator: "ge" },
      { stat: "fieldGoalPct", value: 0.9, operator: "ge" },
    ],
    eligibility: (player) => String(player.pos ?? "").toUpperCase() === "K",
  },
  {
    id: "BOOMING_LEG",
    name: "Booming Leg",
    description: "Flipped field position with outstanding punt average.",
    rarity: "COMMON",
    thresholds: [{ stat: "puntAverage", value: 48, operator: "ge" }],
    eligibility: (player) => String(player.pos ?? "").toUpperCase() === "P",
  },
  {
    id: "SHUTDOWN_CORNER",
    name: "Shutdown Corner",
    description: "High-volume coverage impact over a full season.",
    rarity: "LEGENDARY",
    thresholds: [
      { stat: "passDeflections", value: 20, operator: "ge" },
      { stat: "interceptionsDef", value: 7, operator: "ge" },
    ],
    eligibility: (player) => ["CB", "DB"].includes(String(player.pos ?? "").toUpperCase()),
  },
];

function buildSeasonStats(state: GameState, playerId: string, season: number): PlayerSeasonStats {
  const seasonStats = (state.playerSeasonStatsById?.[playerId] ?? []).find((s) => Number(s.season) === Number(season));
  const progression = state.playerProgressionSeasonStatsById?.[playerId];
  return {
    season,
    teamId: String((seasonStats as any)?.teamId ?? ""),
    gamesPlayed: Number((seasonStats as any)?.gamesPlayed ?? progression?.gamesPlayed ?? 0),
    passingYards: Number((seasonStats as any)?.passingYards ?? 0),
    passingTDs: Number((seasonStats as any)?.passingTDs ?? 0),
    interceptions: Number((seasonStats as any)?.interceptions ?? 0),
    rushingYards: Number((seasonStats as any)?.rushingYards ?? 0),
    rushingTDs: Number((seasonStats as any)?.rushingTDs ?? 0),
    receptions: Number((seasonStats as any)?.receptions ?? 0),
    receivingYards: Number((seasonStats as any)?.receivingYards ?? 0),
    receivingTDs: Number((seasonStats as any)?.receivingTDs ?? 0),
    tackles: Number((seasonStats as any)?.tackles ?? 0),
    sacks: Number((seasonStats as any)?.sacks ?? 0),
    interceptionsDef: Number((seasonStats as any)?.interceptionsDef ?? 0),
    passDeflections: Number((seasonStats as any)?.passDeflections ?? 0),
    fieldGoalsMade: Number((seasonStats as any)?.fieldGoalsMade ?? 0),
    fieldGoalAttempts: Number((seasonStats as any)?.fieldGoalAttempts ?? 0),
    puntAverage: Number((seasonStats as any)?.puntAverage ?? 0),
    performanceScore: Number(progression?.performanceScore ?? 0),
  } as PlayerSeasonStats;
}

function statValue(stats: PlayerSeasonStats, stat: string): number {
  if (stat === "fieldGoalPct") {
    const made = Number(stats.fieldGoalsMade ?? 0);
    const attempts = Math.max(1, Number(stats.fieldGoalAttempts ?? 0));
    return made / attempts;
  }
  return Number((stats as unknown as Record<string, unknown>)[stat] ?? 0);
}

function meetsDefinition(definition: BadgeDefinition, player: PlayerRow, stats: PlayerSeasonStats): boolean {
  if (definition.eligibility && !definition.eligibility(player, stats)) return false;
  if (definition.id === "RED_ZONE_REAPER") {
    return ["receivingTDs", "rushingTDs", "passingTDs"].some((stat) => statValue(stats, stat) >= (stat === "passingTDs" ? 40 : 10));
  }
  return definition.thresholds.every((threshold) => {
    const v = statValue(stats, threshold.stat);
    return threshold.operator === "ge" ? v >= threshold.value : v <= threshold.value;
  });
}

export function evaluatePlayerBadges(state: GameState, playerId: string, season: number): PlayerBadge[] {
  const player = getPlayers().find((p) => String(p.playerId) === String(playerId));
  if (!player) return [];

  const prior = new Set((state.playerBadges?.[playerId] ?? []).map((b) => b.badgeId));
  const stats = buildSeasonStats(state, playerId, season);

  return BADGE_DEFINITIONS
    .filter((definition) => !prior.has(definition.id) && meetsDefinition(definition, player, stats))
    .map((definition) => ({
      badgeId: definition.id,
      awardedSeason: season,
      level: definition.rarity === "LEGENDARY" ? 3 : definition.rarity === "EPIC" ? 2 : 1,
    }));
}

export function applySeasonBadges(state: GameState): GameState {
  const season = Number(state.season ?? 0);
  const nextPlayerBadges = { ...(state.playerBadges ?? {}) };
  const nextNews = [...(state.hub.news ?? [])];

  for (const team of getTeams().filter((t) => t.isActive !== false)) {
    const roster = getEffectivePlayersByTeam(state, String(team.teamId ?? ""));
    for (const player of roster) {
      const playerId = String((player as any).playerId ?? "");
      if (!playerId) continue;
      const earned = evaluatePlayerBadges(state, playerId, season);
      if (earned.length === 0) continue;

      nextPlayerBadges[playerId] = [...(nextPlayerBadges[playerId] ?? []), ...earned];

      for (const badge of earned) {
        const definition = BADGE_DEFINITIONS.find((d) => d.id === badge.badgeId);
        if (!definition || !RARE_PLUS.has(definition.rarity)) continue;
        nextNews.unshift({
          id: `badge-${season}-${playerId}-${badge.badgeId}`,
          title: `${String((player as any).fullName ?? playerId)} earns ${definition.rarity} ${definition.name} badge!`,
          body: definition.description,
          createdAt: season * 1_000_000 + nextNews.length,
          category: "LEAGUE",
        });
      }
    }
  }

  return {
    ...state,
    playerBadges: nextPlayerBadges,
    hub: {
      ...state.hub,
      news: nextNews.slice(0, 200),
    },
  };
}
