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
  salaryY2?: number;
  salaryY3?: number;
  salaryY4?: number;
  guaranteed?: number | null;
  isExpired?: boolean;
  notes?: string | null;
  [key: string]: unknown;
};

const root = leagueDbJson as Record<string, unknown[]>;

const teams: TeamRow[] = (root.Teams ?? []) as TeamRow[];
const players: PlayerRow[] = (root.Players ?? []) as PlayerRow[];
const personnel: PersonnelRow[] = (root.Personnel ?? []) as PersonnelRow[];
const contracts: ContractRow[] = (root.Contracts ?? []) as ContractRow[];

const teamsById = new Map(teams.map((team) => [team.teamId, team]));
const playersById = new Map(players.map((player) => [player.playerId, player]));
const personnelById = new Map(personnel.map((p) => [p.personId, p]));
const contractsById = new Map(contracts.map((c) => [c.contractId, c]));

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

export function getPlayerById(playerId: string): PlayerRow | undefined {
  return playersById.get(playerId);
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

export function getTeamRosterPlayers(teamId: string): PlayerRow[] {
  return getPlayersByTeam(teamId);
}

export function getPlayers(): PlayerRow[] {
  return players;
}

export function getPersonnel(): PersonnelRow[] {
  return personnel;
}

export function getAllPersonnel(): PersonnelRow[] {
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

export function getCoordinatorCandidates(role: "OC" | "DC" | "STC"): PersonnelRow[] {
  return getCoordinatorFreeAgents(role);
}

export function getAssistantHeadCoachCandidates(): PersonnelRow[] {
  const pool = getAllPersonnel()
    .filter((p) => String(p.teamId ?? "") === "FREE_AGENT")
    .filter((p) => String(p.status ?? "ACTIVE").toUpperCase() !== "RETIRED");

  return pool.filter((p) => {
    const role = String(p.role ?? "").toUpperCase();
    if (role.includes("COORDINATOR")) return false;
    if (role === "HEAD_COACH" || role === "OWNER" || role === "GENERAL_MANAGER") return false;
    return true;
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

export function getContractById(contractId: string): ContractRow | undefined {
  return contractsById.get(contractId);
}

export function getContracts(): ContractRow[] {
  return contracts;
}

export function upsertContract(row: ContractRow): ContractRow {
  const existing = row.contractId ? contractsById.get(row.contractId) : undefined;
  if (existing) {
    Object.assign(existing, row);
    contractsById.set(existing.contractId, existing);
    return existing;
  }
  contracts.push(row);
  contractsById.set(row.contractId, row);
  return row;
}

function nextContractId(prefix: string): string {
  const n = contracts.length + 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
}

export function setPersonnelTeamAndContract(args: {
  personId: string;
  teamId: string;
  status?: string;
  startSeason: number;
  years: number;
  salary: number;
  notes?: string;
}): { contractId: string } | null {
  const p = getPersonnelById(args.personId);
  if (!p) return null;

  const contractId = nextContractId("CON_STF_");
  const endSeason = args.startSeason + Math.max(1, args.years) - 1;

  const c: ContractRow = {
    contractId,
    entityType: "PERSONNEL",
    personId: args.personId,
    teamId: args.teamId,
    startSeason: args.startSeason,
    endSeason,
    salaryY1: args.salary,
    salaryY2: args.salary,
    salaryY3: args.salary,
    salaryY4: args.salary,
    guaranteed: null,
    isExpired: false,
    notes: args.notes ?? null,
  };

  upsertContract(c);

  p.teamId = args.teamId;
  p.status = args.status ?? "ACTIVE";
  p.contractId = contractId;

  return { contractId };
}


export function expireContract(contractId: string, endSeason?: number): boolean {
  const c = contractsById.get(contractId);
  if (!c) return false;
  c.isExpired = true;
  if (endSeason != null) c.endSeason = endSeason;
  contractsById.set(contractId, c);
  return true;
}

export function clearPersonnelTeam(personId: string): boolean {
  const p = personnelById.get(personId);
  if (!p) return false;
  p.teamId = "FREE_AGENT";
  p.status = "FREE_AGENT";
  personnelById.set(p.personId, p);
  return true;
}

export function getPersonnelContract(personId: string): ContractRow | undefined {
  const p = personnelById.get(personId);
  const cid = p?.contractId ? String(p.contractId) : "";
  return cid ? contractsById.get(cid) : undefined;
}

export function cutPlayerToFreeAgent(playerId: string): boolean {
  const p = getPlayerById(playerId);
  if (!p) return false;
  p.teamId = "FREE_AGENT";
  p.status = "FREE_AGENT";
  return true;
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
