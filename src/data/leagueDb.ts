import leagueDbJson from "@/data/leagueDB.json";
import { hashStr, mulberry32 } from "@/engine/scouting/rng";
import type { QBArchetypeTag } from "@/config/qbTuning";
import { normalizeCityState } from "@/lib/formatters";

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
  jerseyNumber?: number;
  Archetype?: string;
  Traits?: string;
  snapCounts?: { offense: number; defense: number; specialTeams: number };
  seasonStats?: { gamesPlayed: number; starts: number; performanceScore: number; injuryGamesMissed?: number };
  development?: { trait: "normal" | "impact" | "elite" | "generational"; hiddenDev: boolean; highSnapSeasons?: number };
  armStrength?: number;
  accuracyShort?: number;
  accuracyMid?: number;
  accuracyDeep?: number;
  anticipation?: number;
  decisionSpeed?: number;
  pocketPresence?: number;
  speed?: number;
  acceleration?: number;
  elusiveness?: number;
  readSpeed?: number;
  truckContactBalance?: number;
  slideRate?: number;
  rpoRating?: number;
  scrambleDiscipline?: number;
  pocketEscapeAngle?: "LEFT" | "RIGHT" | "BALANCED";
  armOnRunAccuracy?: number;
  qbArchetypeAutoTag?: QBArchetypeTag;
  qbArchetypeManualOverride?: QBArchetypeTag;
  qbArchetypeResolved?: QBArchetypeTag;
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
  jerseyNumber?: number;
  scheme?: string;
  avatarUrl?: string;
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

export type TeamFinancesRow = {
  teamId: string;
  season: number;
  capSpace: number;
  cash: number;
  revenue?: number;
  expenses?: number;
  notes?: string | null;
};

export type LeagueRow = {
  leagueId: string;
  season: number;
  salaryCap: number;
  currency?: string;
  notes?: string | null;
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
    region: t.region != null ? normalizeCityState(String(t.region)) : undefined,
    conferenceId: t.conferenceId != null ? String(t.conferenceId) : undefined,
    divisionId: t.divisionId != null ? String(t.divisionId) : undefined,
    stadium: t.stadium != null ? String(t.stadium) : undefined,
    logoKey: t.logoKey != null ? String(t.logoKey) : undefined,
    isActive: t.isActive != null ? Boolean(t.isActive) : undefined,
  };
}

function normalizePlayerRow(p: any): PlayerRow {
  const normalized: PlayerRow = {
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
    jerseyNumber: coerceInt(p.jerseyNumber),
    Archetype: p.Archetype != null ? String(p.Archetype) : undefined,
    Traits: p.Traits != null ? String(p.Traits) : undefined,
  };
  return hydrateQbAttributes(normalized);
}

function toBounded(n: number): number {
  return Math.max(40, Math.min(99, Math.round(n)));
}

function hydrateQbAttributes(p: PlayerRow): PlayerRow {
  if (String(p.pos ?? "").toUpperCase() !== "QB") return p;
  const seeded = mulberry32(hashStr(String(p.playerId)));
  const ovr = Number(p.overall ?? 68);
  const baseSpeed = Number(p.speed ?? p.Speed ?? 64);
  const baseAccel = Number(p.acceleration ?? p.Acceleration ?? 64);
  const baseAgility = Number(p.elusiveness ?? p.Agility ?? 64);
  const awareness = Number(p.decisionSpeed ?? p.Awareness ?? ovr);
  const mobilityHint = (baseSpeed + baseAccel + baseAgility) / 3;
  const mobile = mobilityHint >= 78;
  const pickAngle = seeded();
  return {
    ...p,
    armStrength: p.armStrength ?? toBounded(ovr + (seeded() - 0.5) * 16),
    accuracyShort: p.accuracyShort ?? toBounded(ovr + 4 + (seeded() - 0.5) * 14),
    accuracyMid: p.accuracyMid ?? toBounded(ovr + 1 + (seeded() - 0.5) * 14),
    accuracyDeep: p.accuracyDeep ?? toBounded(ovr - 3 + (seeded() - 0.5) * 18),
    anticipation: p.anticipation ?? toBounded(awareness + (seeded() - 0.5) * 12),
    decisionSpeed: p.decisionSpeed ?? toBounded(awareness + (seeded() - 0.5) * 10),
    pocketPresence: p.pocketPresence ?? toBounded((mobile ? ovr - 4 : ovr + 3) + (seeded() - 0.5) * 12),
    speed: p.speed ?? toBounded(baseSpeed + (mobile ? 6 : -8) + (seeded() - 0.5) * 8),
    acceleration: p.acceleration ?? toBounded(baseAccel + (mobile ? 5 : -8) + (seeded() - 0.5) * 8),
    elusiveness: p.elusiveness ?? toBounded(baseAgility + (mobile ? 4 : -10) + (seeded() - 0.5) * 10),
    readSpeed: p.readSpeed ?? toBounded(awareness + (mobile ? 2 : -2) + (seeded() - 0.5) * 10),
    truckContactBalance: p.truckContactBalance ?? toBounded(58 + (seeded() - 0.5) * 16),
    slideRate: p.slideRate ?? toBounded((mobile ? 58 : 70) + (seeded() - 0.5) * 24),
    rpoRating: p.rpoRating ?? toBounded((mobile ? 72 : 56) + (seeded() - 0.5) * 18),
    scrambleDiscipline: p.scrambleDiscipline ?? toBounded((mobile ? 66 : 58) + (seeded() - 0.5) * 20),
    pocketEscapeAngle: p.pocketEscapeAngle ?? (pickAngle < 0.33 ? "LEFT" : pickAngle < 0.66 ? "RIGHT" : "BALANCED"),
    armOnRunAccuracy: p.armOnRunAccuracy ?? toBounded((mobile ? ovr + 1 : ovr - 8) + (seeded() - 0.5) * 16),
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
    jerseyNumber: coerceInt(p.jerseyNumber),
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
const teamFinances: TeamFinancesRow[] = ((root.TeamFinances ?? []) as any[]).map((row) => ({
  teamId: String(row.teamId ?? ""),
  season: coerceInt(row.season) ?? 0,
  capSpace: coerceNumber(row.capSpace) ?? 0,
  cash: coerceNumber(row.cash) ?? 0,
  revenue: coerceNumber(row.revenue),
  expenses: coerceNumber(row.expenses),
  notes: row.notes != null ? String(row.notes) : null,
}));
const leagueRows: LeagueRow[] = ((root.League ?? []) as any[]).map((row) => ({
  leagueId: String(row.leagueId ?? "UGF"),
  season: coerceInt(row.season) ?? 2026,
  salaryCap: coerceNumber(row.salaryCap) ?? 0,
  currency: row.currency != null ? String(row.currency) : undefined,
  notes: row.notes != null ? String(row.notes) : null,
}));

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

export function getLeague(): LeagueRow {
  return leagueRows[0] ?? { leagueId: "UGF", season: 2026, salaryCap: 0, currency: "USD", notes: null };
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
}): { contractId: string; _contract: ContractRow } | null {
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

  return { contractId, _contract: c };
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

  const capSpace = getLeague().salaryCap - capHits;

  return {
    team,
    overall,
    capSpace,
    playerCount: teamPlayers.length,
  };
}

export function getTeamFinancesRow(teamId: string, season: number): TeamFinancesRow | undefined {
  return teamFinances.find((row) => String(row.teamId) === String(teamId) && Number(row.season) === Number(season));
}

export type PersonnelOverride = {
  teamId: string;
  status: string;
  contractId?: string;
  jerseyNumber?: number;
};

/**
 * Replays personnelTeamOverrides and staffContractsByPersonId from saved state
 * onto the module-level DB objects.
 *
 * Called once in loadState() after the save is merged. This means all existing
 * consumers of getPersonnelById / getPersonnelFreeAgents / getPersonnelContract
 * continue to work correctly without changes, because the DB reflects the
 * saved state after load just as it did when the save was written.
 *
 * Design: keep DB mutations for current session; persist deltas in state and
 * replay on reload.
 */
export function replayPersonnelOverrides(
  overrides: Record<string, PersonnelOverride>,
  contractsByPersonId: Record<string, ContractRow>,
): void {
  // Replay personnel team/status/contractId overrides
  for (const [personId, override] of Object.entries(overrides)) {
    const p = personnelById.get(personId);
    if (!p) continue;
    p.teamId = override.teamId;
    p.status = override.status;
    if (override.contractId) p.contractId = override.contractId;
    personnelById.set(personId, p);
  }

  // Replay staff contracts (generated at runtime; not present in JSON)
  for (const [personId, contract] of Object.entries(contractsByPersonId)) {
    const existing = contractsById.get(contract.contractId);
    if (!existing) {
      contracts.push(contract);
      contractsById.set(contract.contractId, contract);
    } else {
      Object.assign(existing, contract);
      contractsById.set(contract.contractId, existing);
    }

    // Re-link on the person row so getPersonnelContract works
    const p = personnelById.get(personId);
    if (p) {
      p.contractId = contract.contractId;
      personnelById.set(personId, p);
    }
  }
}
