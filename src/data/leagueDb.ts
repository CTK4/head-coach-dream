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
  entityId: string;
  teamId?: string;
  startSeason?: number;
  endSeason?: number;
  salaryY1?: number;
  [key: string]: unknown;
};

// The JSON is flat (not wrapped in "sheets")
const root = leagueDbJson as Record<string, unknown[]>;

const teams: TeamRow[] = (root.Teams ?? []) as TeamRow[];
const players: PlayerRow[] = (root.Players ?? []) as PlayerRow[];
const personnel: PersonnelRow[] = (root.Personnel ?? []) as PersonnelRow[];
const contracts: ContractRow[] = (root.Contracts ?? []) as ContractRow[];

const teamsById = new Map(teams.map((t) => [t.teamId, t]));

export function getTeams(): TeamRow[] { return teams; }
export function getTeamById(teamId: string): TeamRow | undefined { return teamsById.get(teamId); }

export function getLeagueCities(): string[] {
  return Array.from(
    new Set(
      getTeams()
        .map((team) => team.region?.trim())
        .filter((region): region is string => Boolean(region))
    )
  ).sort((a, b) => a.localeCompare(b));
}

export function getPlayersByTeam(teamId: string): PlayerRow[] {
  return players.filter((p) => p.teamId === teamId);
}

export function getPlayers(): PlayerRow[] { return players; }

export function getPersonnel(): PersonnelRow[] { return personnel; }

export function getPersonnelFreeAgents(): PersonnelRow[] {
  return personnel.filter((p) => {
    const status = String(p.status ?? "").toUpperCase();
    const teamId = String(p.teamId ?? "");
    return status === "FREE_AGENT" || !teamId || teamId === "FREE_AGENT";
  });
}

export function getCoordinatorFreeAgents(role: "OC" | "DC" | "STC"): PersonnelRow[] {
  const roleMap: Record<string, string> = {
    OC: "OFF_COORDINATOR",
    DC: "DEF_COORDINATOR",
    STC: "ST_COORDINATOR",
  };
  const targetRole = roleMap[role];
  return getPersonnelFreeAgents().filter(
    (p) => String(p.role ?? "").toUpperCase() === targetRole
  );
}

export function normalizeCoordRole(role: string): "OC" | "DC" | "STC" | null {
  const r = role.toUpperCase();
  if (r === "OFF_COORDINATOR") return "OC";
  if (r === "DEF_COORDINATOR") return "DC";
  if (r === "ST_COORDINATOR") return "STC";
  return null;
}

export function getTeamSummary(teamId: string) {
  const team = getTeamById(teamId);
  if (!team) return null;
  const teamPlayers = getPlayersByTeam(teamId);
  const overall = teamPlayers.length
    ? Math.round(teamPlayers.reduce((s, p) => s + Number(p.overall ?? 0), 0) / teamPlayers.length)
    : 0;
  const capHits = contracts
    .filter((c) => c.entityType === "PLAYER" && c.teamId === teamId)
    .reduce((s, c) => s + Number(c.salaryY1 ?? 0), 0);
  const capSpace = 250_000_000 - capHits;
  return { team, overall, capSpace, playerCount: teamPlayers.length };
}
