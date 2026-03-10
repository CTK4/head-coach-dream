export type PlayoffRound = "WILD_CARD" | "DIVISIONAL" | "CONF_FINALS" | "SUPER_BOWL";

export type PostseasonTeamResult = {
  teamId: string;
  madePlayoffs: boolean;
  eliminatedIn?: PlayoffRound;
  isChampion?: boolean;
};

export type PostseasonState = {
  season: number;
  resultsByTeamId: Record<string, PostseasonTeamResult>;
};

export type PlayoffGame = {
  gameId: string;
  round: PlayoffRound;
  homeTeamId: string;
  awayTeamId: string;
  conferenceId?: string;
};

export type ConferenceBracket = {
  conferenceId: string;
  seeds: string[];
  gamesByRound: Partial<Record<Exclude<PlayoffRound, "SUPER_BOWL">, PlayoffGame[]>>;
};

export type PlayoffsBracket = {
  conferences: Record<string, ConferenceBracket>;
  superBowl?: PlayoffGame;
};

export type PlayoffsState = {
  season: number;
  round: PlayoffRound;
  bracket: PlayoffsBracket;
  pendingUserGame?: {
    round: PlayoffRound;
    gameId: string;
    homeTeamId: string;
    awayTeamId: string;
  };
  completedGames: Record<string, { homeScore: number; awayScore: number; winnerTeamId: string }>;
};
