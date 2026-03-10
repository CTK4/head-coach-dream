import type { PlayerRow } from "@/data/leagueDb";
import type { PlayerSeasonStats } from "@/types/stats";

export type BadgeId =
  | "IRONMAN"
  | "GUNSLINGER"
  | "LOCKDOWN"
  | "ROAD_WARRIOR"
  | "BALLHAWK"
  | "SACK_ARTIST"
  | "WORKHORSE"
  | "CHAIN_MOVER"
  | "RED_ZONE_REAPER"
  | "CLUTCH_KICKER"
  | "BOOMING_LEG"
  | "SHUTDOWN_CORNER";

export type BadgeRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type SeasonStats = PlayerSeasonStats;

export interface BadgeDefinition {
  id: BadgeId;
  name: string;
  description: string;
  rarity: BadgeRarity;
  thresholds: { stat: string; value: number; operator: "ge" | "le" }[];
  eligibility?: (player: PlayerRow, seasonStats: SeasonStats) => boolean;
}

export type PlayerBadge = {
  badgeId: BadgeId;
  awardedSeason: number;
  level?: 1 | 2 | 3;
};
