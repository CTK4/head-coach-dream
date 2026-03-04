import type { DefSchemeId, OffSchemeId } from "@/lib/constants";

export type TeamId = string;
export type PlayerId = string;
export type CoachId = string;

export type Player = {
  id: PlayerId;
  fullName: string;
  pos: string;
  age: number;
  overall: number;
  teamId: TeamId | "FA";
  attributes: Record<string, number>;
};

export type Team = {
  id: TeamId;
  abbrev: string;
  name: string;
  conferenceId: string;
  divisionId: string;
  offenseScheme: OffSchemeId;
  defenseScheme: DefSchemeId;
};

export type Contract = {
  id: string;
  playerId: PlayerId;
  teamId: TeamId;
  startSeason: number;
  endSeason: number;
  apy: number;
  guaranteed: number;
  isFranchiseTag?: boolean;
};

export type Coach = {
  id: CoachId;
  name: string;
  role: "HC" | "OC" | "DC" | "ST";
  side: "OFFENSE" | "DEFENSE" | "ST";
  schemePrefs: { offense?: OffSchemeId; defense?: DefSchemeId };
  ratings: { teaching: number; strategy: number; discipline: number; recruiting: number };
  traits: string[];
  cost: number;
  teamId?: TeamId;
};

export type TxEvent =
  | {
      id: string;
      type: "SIGN_FA";
      createdAt: string;
      teamId: TeamId;
      playerId: PlayerId;
      contract: Omit<Contract, "id" | "playerId" | "teamId">;
    }
  | { id: string; type: "RELEASE_PLAYER"; createdAt: string; teamId: TeamId; playerId: PlayerId }
  | {
      id: string;
      type: "RE_SIGN";
      createdAt: string;
      teamId: TeamId;
      playerId: PlayerId;
      contract: Omit<Contract, "id" | "playerId" | "teamId">;
    }
  | {
      id: string;
      type: "FRANCHISE_TAG";
      createdAt: string;
      teamId: TeamId;
      playerId: PlayerId;
      apy: number;
      season: number;
    }
  | {
      id: string;
      type: "TRADE";
      createdAt: string;
      fromTeamId: TeamId;
      toTeamId: TeamId;
      playerIds: PlayerId[];
    }
  | { id: string; type: "RETIRE"; createdAt: string; playerId: PlayerId };

export type LeaguePhase =
  | "FRONT_OFFICE_HUB"
  | "STAFF"
  | "ROSTER_AUDIT"
  | "FREE_AGENCY"
  | "DRAFT_PREP"
  | "DRAFT"
  | "PRESEASON"
  | "REGULAR_SEASON_WEEK"
  | "PLAYOFFS"
  | "ROLLOVER";

export type SaveState = {
  meta: {
    saveVersion: number;
    createdAt: string;
    seed: number;
    userTeamId: TeamId;
  };
  league: {
    teams: Record<TeamId, Team>;
    schedule: Array<{ week: number; homeTeamId: TeamId; awayTeamId: TeamId }>;
    standings: Record<TeamId, { wins: number; losses: number; ties: number }>;
    week: number;
    phase: LeaguePhase;
  };
  roster: {
    playersById: Record<PlayerId, Player>;
    assignments: Record<PlayerId, TeamId | "FA">;
  };
  contracts: {
    records: Record<PlayerId, Contract | undefined>;
    capTable: Record<TeamId, number>;
  };
  coaches: {
    byId: Record<CoachId, Coach>;
    staffByTeam: Record<TeamId, Partial<Record<Coach["role"], CoachId>>>;
    marketCoachIds: CoachId[];
  };
  scouting: {
    knowledge: Record<string, { confidence: number; observed: Record<string, number> }>;
  };
  transactions: TxEvent[];
  ui?: {
    lastRoute?: string;
    filters?: Record<string, string>;
    sort?: { key: string; dir: "asc" | "desc" };
    pinnedPlayers?: PlayerId[];
  };
};
