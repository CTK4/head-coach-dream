export type NewsCategory =
  | "GAME_RESULT"
  | "INJURY"
  | "TRADE"
  | "SIGNING"
  | "RELEASE"
  | "RETIREMENT"
  | "AWARD"
  | "MILESTONE"
  | "RUMOR"
  | "COACHING";

export interface NewsItem {
  id: string;
  week: number;
  season: number;
  category: NewsCategory;
  headline: string;
  body?: string;
  teamIds: string[];
  playerIds?: string[];
  isUserTeam: boolean;
}
