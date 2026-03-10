import type { PlayoffResult } from "@/types/season";

export interface PlayerSeasonStats {
  playerId?: string;
  season: number;
  teamId: string;
  gamesPlayed: number;
  passingYards?: number;
  passingTDs?: number;
  interceptions?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receptions?: number;
  receivingYards?: number;
  receivingTDs?: number;
  tackles?: number;
  sacks?: number;
  interceptionsDef?: number;
  passDeflections?: number;
  fieldGoalsMade?: number;
  fieldGoalAttempts?: number;
  puntAverage?: number;
}

export interface PlayerCareerStats {
  playerId: string;
  seasons: PlayerSeasonStats[];
  careerTotals: Omit<PlayerSeasonStats, "season" | "teamId">;
}

export interface CoachCareerRecord {
  coachId: string;
  seasons: {
    season: number;
    teamId: string;
    wins: number;
    losses: number;
    playoffResult: PlayoffResult | null;
    divisionWinner: boolean;
    finalStanding: number;
  }[];
  allTimeRecord: { wins: number; losses: number };
  playoffAppearances: number;
  championships: number;
}
