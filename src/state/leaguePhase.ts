export type LeaguePhase =
  | "PRESEASON"
  | "CUTDOWN"
  | "REGULAR_SEASON"
  | "REGULAR_SEASON_GAMEPLAN"
  | "REGULAR_SEASON_GAME"
  | "WILD_CARD"
  | "DIVISIONAL"
  | "CONFERENCE"
  | "CHAMPIONSHIP"
  | "SEASON_COMPLETE"
  | "STAFF_EVAL"
  | "RE_SIGN"
  | "FRANCHISE_TAG"
  | "FREE_AGENCY"
  | "DRAFT"
  | "POST_DRAFT";

export interface LeagueState {
  phase: LeaguePhase;
  weekIndex: number;
  seasonYear: number;
  playoffRound?: 1 | 2 | 3 | 4;
}
