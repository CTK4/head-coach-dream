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

function coerceNumber(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.trim().replace(/\$/g, "").replace(/,/g, "").replace(/\s+/g, "");
    if (cleaned.length === 0) return undefined;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function coerceInt(value: unknown): number | undefined {
  const n = coerceNumber(value);
  if (n == null) return undefined;
  return Math.trunc(n);
}

function normalizeTeamRow(t: any): TeamRow {
  return {
    ...t,
    teamId: String(t.teamId ?? ""),
    abbrev: t.abbrev != null ? String(t.abbrev) : undefined,
    name: String(t.name ?? ""),
    region: t.region != null ? String(t.region) : undefined,
    conferenceId: t.conferenceId != null ? String(t.conferenceId) : undefined,
    divisionId: t.divisionId != null ? String(t.divisionId) : undefined,
    stadium: t.stadium != null ? String(t.stadium) : undefined,
    logoKey: t.logoKey != null ? String(t.logoKey) : undefined,
    isActive: t.isActive != null ? Boolean(t.isActive) : undefined,
  };
}

function normalizePlayerRow(p: any): PlayerRow {
  return {
    ...p,
    playerId: String(p.playerId ?? ""),
    fullName: String(p.fullName ?? p.name ?? ""),
    pos: p.pos != null ? String(p.pos) : undefined,
    teamId: p.teamId != null ? String(p.teamId) : undefined,
    status: p.status != null ? String(p.status) : undefined,
    age: coerceInt(p.age),
    overall: coerceInt(p.overall ?? p.ovr),
    potential: coerceInt(p.potential),
    college: p.college != null ? String(p.college) : undefined,
    contractId: p.contractId != null ? String(p.contractId) : undefined,
    Archetype: p.Archetype != null ? String(p.Archetype) : undefined,
    Traits: p.Traits != null ? String(p.Traits) : undefined,
  };
}

function normalizePersonnelRow(p: any): PersonnelRow {
  return {
    ...p,
    personId: String(p.personId ?? ""),
    fullName: String(p.fullName ?? p.name ?? ""),
    role: p.role != null ? String(p.role) : undefined,
    teamId: p.teamId != null ? String(p.teamId) : undefined,
    status: p.status != null ? String(p.status) : undefined,
    age: coerceInt(p.age),
    reputation: coerceNumber(p.reputation) ?? 55,
    contractId: p.contractId != null ? String(p.contractId) : undefined,
    scheme: p.scheme != null ? String(p.scheme) : undefined,
  };
}

function normalizeContractRow(c: any): ContractRow {
  return {
    ...c,
    contractId: String(c.contractId ?? ""),
    entityType: String(c.entityType ?? ""),
    personId: String(c.personId ?? ""),
    teamId: c.teamId != null ? String(c.teamId) : undefined,
    startSeason: coerceInt(c.startSeason),
    endSeason: coerceInt(c.endSeason),
    salaryY1: coerceNumber(c.salaryY1) ?? 0,
    salaryY2: coerceNumber(c.salaryY2) ?? 0,
    salaryY3: coerceNumber(c.salaryY3) ?? 0,
    salaryY4: coerceNumber(c.salaryY4) ?? 0,
    guaranteed: c.guaranteed == null ? null : coerceNumber(c.guaranteed) ?? 0,
    isExpired: c.isExpired != null ? Boolean(c.isExpired) : undefined,
    notes: c.notes != null ? String(c.notes) : null,
  };
}

const teams: TeamRow[] = ((root.Teams ?? []) as any[]).map(normalizeTeamRow);
const players: PlayerRow[] = ((root.Players ?? []) as any[]).map(normalizePlayerRow);
const personnel: PersonnelRow[] = ((root.Personnel ?? []) as any[]).map(normalizePersonnelRow);
const contracts: ContractRow[] = ((root.Contracts ?? []) as any[]).map(normalizeContractRow);

const teamsById = new Map(teams.map((team) => [team.teamId, team]));
const playersById = new Map(players.map((player) => [player.playerId, player]));
const personnelById = new Map(personnel.map((p) => [p.personId, p]));
const contractsById = new Map(contracts.map((c) => [c.contractId, c]));

export type PositionCoachRole = "QB_COACH" | "OL_COACH" | "DL_COACH" | "LB_COACH" | "DB_COACH" | "RB_COACH" | "WR_COACH";

export const AUTO_ACCEPT_COACH_REP_MAX = 50;

function isFreeAgentPersonnel(person: PersonnelRow) {
  return String(person.teamId ?? "") === "FREE_AGENT" && String(person.status ?? "ACTIVE").toUpperCase() !== "RETIRED";
}

export function getTeams(): TeamRow[] {
  return teams;
}

export function getTeamById(teamId: string): TeamRow | undefined {
  return teamsById.get(String(teamId));
}

export function getPlayerById(playerId: string): PlayerRow | undefined {
  return playersById.get(String(playerId));
}

export function getPlayers(): PlayerRow[] {
  return players;
}

export function getPlayersByTeam(teamId: string): PlayerRow[] {
  const t = String(teamId);
  return players.filter((p) => String(p.teamId ?? "") === t);
}

export function getTeamRosterPlayers(teamId: string): PlayerRow[] {
  return getPlayersByTeam(teamId);
}

export function getLeagueCities(): string[] {
  return Array.from(new Set(teams.map((team) => team.region?.trim()).filter((region): region is string => Boolean(region)))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getFreeAgents(): PlayerRow[] {
  return players.filter((p) => {
    const teamId = String(p.teamId ?? "").toUpperCase();
    const status = String(p.status ?? "").toUpperCase();
    return teamId === "FREE_AGENT" || status === "FREE_AGENT" || !teamId;
  });
}

export function getPersonnelById(personId: string): PersonnelRow | undefined {
  return personnelById.get(String(personId));
}

export function getPersonnel(): PersonnelRow[] {
  return personnel;
}

export function getAllPersonnel(): PersonnelRow[] {
  return personnel;
}

export function getOwnerByTeam(teamId: string): PersonnelRow | undefined {
  return personnel.find((person) => person.teamId === teamId && String(person.role ?? "").toUpperCase() === "OWNER");
}

export function getPersonnelFreeAgents(): PersonnelRow[] {
  return personnel.filter(isFreeAgentPersonnel);
}

export function coachAutoAccept(person: PersonnelRow): boolean {
  return Number(person.reputation ?? 0) <= AUTO_ACCEPT_COACH_REP_MAX;
}

export function getCoordinatorFreeAgents(role: "OC" | "DC" | "STC"): PersonnelRow[] {
  const targetRole = role === "OC" ? "OFF_COORDINATOR" : role === "DC" ? "DEF_COORDINATOR" : "ST_COORDINATOR";
  return getPersonnelFreeAgents()
    .filter((person) => String(person.role ?? "").toUpperCase() === targetRole)
    .filter((person) => coachAutoAccept(person));
}

export function getCoordinatorCandidates(role: "OC" | "DC" | "STC"): PersonnelRow[] {
  return getCoordinatorFreeAgents(role);
}

export function getCoordinatorFreeAgentsAll(role: "OC" | "DC" | "STC"): PersonnelRow[] {
  const targetRole = role === "OC" ? "OFF_COORDINATOR" : role === "DC" ? "DEF_COORDINATOR" : "ST_COORDINATOR";
  return getPersonnelFreeAgents().filter((person) => String(person.role ?? "").toUpperCase() === targetRole);
}

export function getAssistantHeadCoachCandidates(): PersonnelRow[] {
  const pool = getAllPersonnel()
    .filter(isFreeAgentPersonnel)
    .filter((p) => {
      const role = String(p.role ?? "").toUpperCase();
      if (role.includes("COORDINATOR")) return false;
      if (role === "HEAD_COACH" || role === "OWNER" || role === "GENERAL_MANAGER") return false;
      return true;
    });

  return pool.filter((p) => coachAutoAccept(p));
}

export function getAssistantHeadCoachCandidatesAll(): PersonnelRow[] {
  return getAllPersonnel()
    .filter(isFreeAgentPersonnel)
    .filter((p) => {
      const role = String(p.role ?? "").toUpperCase();
      if (role.includes("COORDINATOR")) return false;
      if (role === "HEAD_COACH" || role === "OWNER" || role === "GENERAL_MANAGER") return false;
      return true;
    });
}

export function getPositionCoachCandidates(role: PositionCoachRole): PersonnelRow[] {
  return getPersonnelFreeAgents()
    .filter((person) => String(person.role ?? "").toUpperCase() === role)
    .filter((person) => coachAutoAccept(person));
}

export function getPositionCoachCandidatesAll(role: PositionCoachRole): PersonnelRow[] {
  return getPersonnelFreeAgents().filter((person) => String(person.role ?? "").toUpperCase() === role);
}

export function normalizeCoordRole(role: string): "OC" | "DC" | "STC" | null {
  const upper = role.toUpperCase();
  if (upper === "OFF_COORDINATOR") return "OC";
  if (upper === "DEF_COORDINATOR") return "DC";
  if (upper === "ST_COORDINATOR") return "STC";
  return null;
}

export function getContracts(): ContractRow[] {
  return contracts;
}

export function getContractById(contractId: string): ContractRow | undefined {
  return contractsById.get(String(contractId));
}

export function getPlayerContract(playerId: string): ContractRow | undefined {
  const p = getPlayerById(playerId);
  const cid = p?.contractId ? String(p.contractId) : "";
  return cid ? getContractById(cid) : undefined;
}

export function getPlayerSeasonStats(playerId: string, season: number): Record<string, unknown> | undefined {
  const rows = (root.PlayerSeasonStats ?? []) as Record<string, unknown>[];
  return rows.find((r) => String(r.playerId) === String(playerId) && Number(r.season) === Number(season));
}

export function getPlayerAwards(playerId: string): Record<string, unknown>[] {
  const rows = (root.PlayerAwards ?? []) as Record<string, unknown>[];
  return rows.filter((r) => String(r.playerId) === String(playerId));
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
