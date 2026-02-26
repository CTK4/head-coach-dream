export type MvpEntry = {
  player: string;
  team: string;
  position: string;
};

export type SeasonHistory = {
  season: number;
  champion: string;
  runnerUp: string;
  ironCrownMvp: MvpEntry | null;
  regularSeasonMvp: MvpEntry | null;
};

export type HofInductee = {
  player: string;
  position: string;
  team: string;
  classYear: number;
};

export type ChampionshipsByTeam = {
  team: string;
  titles: number;
  runnerUps?: number;
};

export type LeagueHistoryData = {
  version: string;
  system_id: string;
  seasons: SeasonHistory[];
  hallOfFame: HofInductee[];
  championshipsByTeam: ChampionshipsByTeam[];
};
