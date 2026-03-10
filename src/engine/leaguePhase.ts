export type LeaguePhase =
  | "PRESEASON"
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
  | "POST_DRAFT"
  | "OFFSEASON_COMPLETE";

export type LeagueGameResult = {
  homeScore: number;
  awayScore: number;
  winnerTeamId: string;
};

export type PlayoffMatchup = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  seedHome: number;
  seedAway: number;
  winner?: string;
};

export type LeaguePlayoffs = {
  bracket: {
    wildCard: PlayoffMatchup[];
    divisional: PlayoffMatchup[];
    conference: PlayoffMatchup[];
    championship: PlayoffMatchup | null;
  };
  results: Record<string, LeagueGameResult>;
  activeSeasonTeams: string[];
};

export function advanceLeaguePhase(current: LeaguePhase): LeaguePhase {
  switch (current) {
    case "REGULAR_SEASON":
      return "REGULAR_SEASON_GAMEPLAN";
    case "REGULAR_SEASON_GAMEPLAN":
      return "REGULAR_SEASON_GAME";
    case "REGULAR_SEASON_GAME":
      return "REGULAR_SEASON";
    case "WILD_CARD":
      return "DIVISIONAL";
    case "DIVISIONAL":
      return "CONFERENCE";
    case "CONFERENCE":
      return "CHAMPIONSHIP";
    case "CHAMPIONSHIP":
      return "SEASON_COMPLETE";
    case "SEASON_COMPLETE":
      return "STAFF_EVAL";
    case "STAFF_EVAL":
      return "RE_SIGN";
    case "RE_SIGN":
      return "FRANCHISE_TAG";
    case "FRANCHISE_TAG":
      return "FREE_AGENCY";
    case "FREE_AGENCY":
      return "DRAFT";
    case "DRAFT":
      return "POST_DRAFT";
    case "POST_DRAFT":
      return "OFFSEASON_COMPLETE";
    case "OFFSEASON_COMPLETE":
      return "PRESEASON";
    case "PRESEASON":
      return "REGULAR_SEASON";
    default:
      throw new Error(`Illegal league phase transition from '${current}'.`);
  }
}
