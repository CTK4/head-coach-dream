export type PlayoffRound = "WILD_CARD" | "DIVISIONAL" | "CONFERENCE" | "SUPER_BOWL";

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
