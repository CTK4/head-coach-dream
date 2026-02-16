import leagueDbJson from "@/data/leagueDB.json";

export type TeamRow = {
  teamId: string;
  abbrev?: string;
  name: string;
  region?: string;
  conferenceId?: string;
  divisionId?: string;
  stadium?: string;
  logoKey?: string;
  isActive?: boolean;
};

export type PlayerRow = {
  playerId: string;
  fullName: string;
  pos?: string;
  teamId?: string;
  status?: string;
  age?: number;
  overall?: number;
  potential?: number;
  college?: string;
  contractId?: string;
  Archetype?: string;
  Traits?: string;
  [key: string]: unknown;
};

export type PersonnelRow = {
  personId: string;
  fullName: string;
  role?: string;
  teamId?: string;
  Column1?: string;
  status?: string;
  age?: number;
  reputation?: number;
  contractId?: string;
  scheme?: string;
  [key: string]: unknown;
};

export type ContractRow = {
  contractId: string;
  entityType: string;
  personId: string;
  teamId?: string;
  startSeason?: number;
  endSeason?: number;
  salaryY1?: number;
  [key: string]: unknown;
};

const root = leagueDbJson as Record<string, unknown[]>;

const teams: TeamRow[] = (root.Teams ?? []) as TeamRow[];
const players: PlayerRow[] = (root.Players ?? []) as PlayerRow[];
const personnel: PersonnelRow[] = (root.Personnel ?? []) as PersonnelRow[];
const contracts: ContractRow[] = (root.Contracts ?? []) as ContractRow[];

const teamsById = new Map(teams.map((team) => [team.teamId, team]));
const personnelById = new Map(personnel.map((p) => [p.personId, p]));

const EXCLUDED_ASSISTANT_HC_ROLES = new Set(["OWNER", "GENERAL_MANAGER", "HEAD_COACH"]);

export type PositionCoachRole = "QB_COACH" | "OL_COACH" | "DL_COACH" | "LB_COACH" | "DB_COACH" | "RB_COACH" | "WR_COACH";

function isFreeAgentPersonnel(person: PersonnelRow): boolean {
  const status = String(person.status ?? "").toUpperCase();
  const teamId = String(person.teamId ?? "").toUpperCase();
  return status === "FREE_AGENT" || !teamId || teamId === "FREE_AGENT";
}

export function getTeams(): TeamRow[] {
  return teams;
}

export function getTeamById(teamId: string): TeamRow | undefined {
  return teamsById.get(teamId);
}

export function getPersonnelById(personId: string): PersonnelRow | undefined {
  return personnelById.get(personId);
}

export function getLeagueCities(): string[] {
  return Array.from(
    new Set(
      teams
        .map((team) => team.region?.trim())
        .filter((region): region is string => Boolean(region))
    )
  ).sort((a, b) => a.localeCompare(b));
}

export function getPlayersByTeam(teamId: string): PlayerRow[] {
  return players.filter((player) => player.teamId === teamId);
}

export function getPlayers(): PlayerRow[] {
  return players;
}

export function getPersonnel(): PersonnelRow[] {
  return personnel;
}

export function getOwnerByTeam(teamId: string): PersonnelRow | undefined {
  return personnel.find(
    (person) => person.teamId === teamId && String(person.role ?? "").toUpperCase() === "OWNER"
  );
}

export function getPersonnelFreeAgents(): PersonnelRow[] {
  return personnel.filter(isFreeAgentPersonnel);
}

export function getCoordinatorFreeAgents(role: "OC" | "DC" | "STC"): PersonnelRow[] {
  const roleMap: Record<string, string> = {
    OC: "OFF_COORDINATOR",
    DC: "DEF_COORDINATOR",
    STC: "ST_COORDINATOR",
  };

  return getPersonnelFreeAgents().filter(
    (person) => String(person.role ?? "").toUpperCase() === roleMap[role]
  );
}

export function getAssistantHeadCoachCandidates(): PersonnelRow[] {
  return getPersonnelFreeAgents().filter((person) => {
    const role = String(person.role ?? "").toUpperCase();
    return !EXCLUDED_ASSISTANT_HC_ROLES.has(role);
  });
}

export function getPositionCoachCandidates(role: PositionCoachRole): PersonnelRow[] {
  return getPersonnelFreeAgents().filter(
    (person) => String(person.role ?? "").toUpperCase() === role
  );
}

export function normalizeCoordRole(role: string): "OC" | "DC" | "STC" | null {
  const upper = role.toUpperCase();
  if (upper === "OFF_COORDINATOR") return "OC";
  if (upper === "DEF_COORDINATOR") return "DC";
  if (upper === "ST_COORDINATOR") return "STC";
  return null;
}

export function getTeamSummary(teamId: string) {
  const team = getTeamById(teamId);
  if (!team) return null;

  const teamPlayers = getPlayersByTeam(teamId);
  const overall = teamPlayers.length
    ? Math.round(teamPlayers.reduce((sum, player) => sum + Number(player.overall ?? 0), 0) / teamPlayers.length)
    : 0;

  const capHits = contracts
    .filter((contract) => contract.entityType === "PLAYER" && contract.teamId === teamId)
    .reduce((sum, contract) => sum + Number(contract.salaryY1 ?? 0), 0);

  const capSpace = 250_000_000 - capHits;

  return {
    team,
    overall,
    capSpace,
    playerCount: teamPlayers.length,
  };
}
