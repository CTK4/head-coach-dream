import { hashSeed } from "@/engine/rng";
import type { PlayerSeasonStats } from "@/types/stats";

export type TelemetryPositionGroup = "QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "LB" | "DB" | "K" | "P";

export type TelemetryPercentileMetricRule = {
  metric: keyof Pick<
    PlayerSeasonStats,
    | "passingYards"
    | "passingTDs"
    | "interceptions"
    | "rushingYards"
    | "rushingTDs"
    | "receptions"
    | "receivingYards"
    | "receivingTDs"
    | "tackles"
    | "sacks"
    | "interceptionsDef"
    | "passDeflections"
    | "fieldGoalsMade"
    | "puntAverage"
  >;
  sampleField: keyof Pick<PlayerSeasonStats, "gamesPlayed" | "fieldGoalAttempts">;
  minSamples: number;
  higherIsBetter?: boolean;
};

export type TelemetryPercentileTable = {
  season: number;
  posGroup: TelemetryPositionGroup;
  metric: string;
  sampleField: string;
  minSamples: number;
  sampleSize: number;
  valuesByPlayerId: Record<string, number>;
};

export type TelemetryPercentilesBySeason = Record<number, Record<string, TelemetryPercentileTable>>;

export const DEFAULT_PERCENTILE_WINDOW_SEASONS = 3;

export const DEFAULT_PERCENTILE_RULES: TelemetryPercentileMetricRule[] = [
  { metric: "passingYards", sampleField: "gamesPlayed", minSamples: 4 },
  { metric: "passingTDs", sampleField: "gamesPlayed", minSamples: 4 },
  { metric: "interceptions", sampleField: "gamesPlayed", minSamples: 4, higherIsBetter: false },
  { metric: "rushingYards", sampleField: "gamesPlayed", minSamples: 4 },
  { metric: "rushingTDs", sampleField: "gamesPlayed", minSamples: 4 },
  { metric: "receptions", sampleField: "gamesPlayed", minSamples: 4 },
  { metric: "receivingYards", sampleField: "gamesPlayed", minSamples: 4 },
  { metric: "receivingTDs", sampleField: "gamesPlayed", minSamples: 4 },
  { metric: "tackles", sampleField: "gamesPlayed", minSamples: 4 },
  { metric: "sacks", sampleField: "gamesPlayed", minSamples: 4 },
  { metric: "interceptionsDef", sampleField: "gamesPlayed", minSamples: 4 },
  { metric: "passDeflections", sampleField: "gamesPlayed", minSamples: 4 },
  { metric: "fieldGoalsMade", sampleField: "fieldGoalAttempts", minSamples: 4 },
  { metric: "puntAverage", sampleField: "gamesPlayed", minSamples: 4 },
];

function normalizePosGroup(pos: string | undefined): TelemetryPositionGroup {
  const p = String(pos ?? "").toUpperCase();
  if (p === "HB" || p === "FB") return "RB";
  if (p === "OT" || p === "OG" || p === "C") return "OL";
  if (p === "DE" || p === "DT" || p === "EDGE" || p === "NT") return "DL";
  if (p === "OLB" || p === "ILB" || p === "MLB") return "LB";
  if (p === "CB" || p === "S" || p === "DB" || p === "FS" || p === "SS") return "DB";
  if (["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"].includes(p)) return p as TelemetryPositionGroup;
  return "WR";
}

function tableKey(season: number, posGroup: TelemetryPositionGroup, metric: string, minSamples: number): string {
  return `${season}:${posGroup}:${metric}:${minSamples}`;
}

export function buildPercentiles(params: {
  season: number;
  players: Array<{ playerId: string; pos?: string }>;
  playerSeasonStatsById: Record<string, PlayerSeasonStats[]>;
  rules?: TelemetryPercentileMetricRule[];
}): Record<string, TelemetryPercentileTable> {
  const rules = params.rules ?? DEFAULT_PERCENTILE_RULES;
  const season = Number(params.season);
  const rows = params.players
    .map((player) => {
      const playerId = String(player.playerId ?? "");
      if (!playerId) return null;
      const seasonStats = (params.playerSeasonStatsById[playerId] ?? []).find((s) => Number(s.season) === season);
      if (!seasonStats) return null;
      return { playerId, posGroup: normalizePosGroup(player.pos), stats: seasonStats };
    })
    .filter((v): v is { playerId: string; posGroup: TelemetryPositionGroup; stats: PlayerSeasonStats } => Boolean(v));

  const out: Record<string, TelemetryPercentileTable> = {};

  for (const rule of rules) {
    const direction = rule.higherIsBetter === false ? -1 : 1;
    const groups = new Map<TelemetryPositionGroup, Array<{ playerId: string; value: number }>>();

    for (const row of rows) {
      const sampleCount = Number(row.stats[rule.sampleField] ?? 0);
      const value = Number(row.stats[rule.metric]);
      if (!Number.isFinite(value) || sampleCount < rule.minSamples) continue;
      const existing = groups.get(row.posGroup) ?? [];
      existing.push({ playerId: row.playerId, value });
      groups.set(row.posGroup, existing);
    }

    for (const [posGroup, entries] of groups.entries()) {
      const sorted = [...entries].sort((a, b) => {
        if (a.value !== b.value) return direction * (b.value - a.value);
        return hashSeed("telemetry-percentile-tiebreak", a.playerId) - hashSeed("telemetry-percentile-tiebreak", b.playerId);
      });

      const valuesByPlayerId: Record<string, number> = {};
      const denom = Math.max(1, sorted.length - 1);
      for (let i = 0; i < sorted.length; i += 1) {
        const item = sorted[i]!;
        const pct = sorted.length === 1 ? 100 : Math.round(((sorted.length - 1 - i) / denom) * 100);
        valuesByPlayerId[item.playerId] = pct;
      }

      const key = tableKey(season, posGroup, String(rule.metric), rule.minSamples);
      out[key] = {
        season,
        posGroup,
        metric: String(rule.metric),
        sampleField: String(rule.sampleField),
        minSamples: rule.minSamples,
        sampleSize: sorted.length,
        valuesByPlayerId,
      };
    }
  }

  return out;
}

export function upsertSeasonPercentiles(params: {
  existing: TelemetryPercentilesBySeason | undefined;
  season: number;
  tables: Record<string, TelemetryPercentileTable>;
  activeSeason: number;
  windowSeasons?: number;
}): TelemetryPercentilesBySeason {
  const bounded = { ...(params.existing ?? {}), [params.season]: params.tables };
  const minSeason = Number(params.activeSeason) - Math.max(1, Number(params.windowSeasons ?? DEFAULT_PERCENTILE_WINDOW_SEASONS)) + 1;
  const pruned = Object.fromEntries(Object.entries(bounded).filter(([k]) => Number(k) >= minSeason));
  return pruned;
}
