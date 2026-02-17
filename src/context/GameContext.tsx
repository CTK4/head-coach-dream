import React, { createContext, useContext, useEffect, useReducer } from "react";
import draftClassJson from "@/data/draftClass.json";
import {
  clearPersonnelTeam,
  cutPlayerToFreeAgent,
  expireContract,
  getPersonnelById,
  getPersonnelContract,
  getPlayersByTeam,
  getTeamRosterPlayers,
  getTeams,
  setPersonnelTeamAndContract,
} from "@/data/leagueDb";
import type { CoachReputation } from "@/engine/reputation";
import { clamp01, clamp100, defenseInterestBoost, offenseInterestBoost } from "@/engine/reputation";
import { applyStaffRejection, computeStaffAcceptance, type RoleFocus } from "@/engine/assistantHiring";
import { expectedSalary, offerQualityScore, offerSalary } from "@/engine/staffSalary";
import { initGameSim, stepPlay, type GameSim, type PlayType } from "@/engine/gameSim";
import { initLeagueState, simulateLeagueWeek, type LeagueState } from "@/engine/leagueSim";
import { generateOffers } from "@/engine/offers";
import { genFreeAgents } from "@/engine/offseasonGen";
import { OFFSEASON_STEPS, nextOffseasonStepId, type OffseasonStepId } from "@/engine/offseason";
import { buyoutTotal, splitBuyout } from "@/engine/buyout";
import { computeTerminationRisk, shouldFireDeterministic } from "@/engine/termination";
import type {
  CampSettings,
  CutDecision,
  FreeAgentOffer,
  Prospect,
  ResignDecision,
  ScoutingCombineResult,
} from "@/engine/offseasonData";
import {
  PRESEASON_WEEKS,
  REGULAR_SEASON_WEEKS,
  generateLeagueSchedule,
  getTeamMatchup,
  type GameType,
  type LeagueSchedule,
} from "@/engine/schedule";

export type GamePhase = "CREATE" | "BACKGROUND" | "INTERVIEWS" | "OFFERS" | "COORD_HIRING" | "HUB";
export type CareerStage =
  | "OFFSEASON_HUB"
  | "ASSISTANT_HIRING"
  | "ROSTER_REVIEW"
  | "RESIGN"
  | "COMBINE"
  | "FREE_AGENCY"
  | "DRAFT"
  | "TRAINING_CAMP"
  | "PRESEASON"
  | "REGULAR_SEASON";

export type OffseasonTaskId = "SCOUTING" | "INSTALL" | "MEDIA" | "STAFF";

export type OffseasonState = {
  stepId: OffseasonStepId;
  completed: Record<OffseasonTaskId, boolean>;
  stepsComplete: Partial<Record<OffseasonStepId, boolean>>;
};

export type OffseasonData = {
  resigning: { decisions: Record<string, ResignDecision> };
  combine: { results: ScoutingCombineResult[]; generated: boolean };
  tampering: { offers: FreeAgentOffer[] };
  freeAgency: {
    offers: FreeAgentOffer[];
    signings: string[];
    rejected: Record<string, boolean>;
    withdrawn: Record<string, boolean>;
    capTotal: number;
    capUsed: number;
    capHitsByPlayerId: Record<string, number>;
  };
  preDraft: { board: Prospect[]; visits: Record<string, boolean>; workouts: Record<string, boolean> };
  draft: { board: Prospect[]; picks: Prospect[]; completed: boolean };
  camp: { settings: CampSettings };
  cutDowns: { decisions: Record<string, CutDecision> };
};

export type OrgRoles = {
  hcCoachId?: string;
  ocCoachId?: string;
  dcCoachId?: string;
  stcCoachId?: string;
  ahcCoachId?: string;
};

export type OfferTier = "PREMIUM" | "STANDARD" | "CONDITIONAL" | "REJECT";

const CAREER_STAGE_ORDER: CareerStage[] = [
  "OFFSEASON_HUB",
  "ASSISTANT_HIRING",
  "ROSTER_REVIEW",
  "RESIGN",
  "COMBINE",
  "FREE_AGENCY",
  "DRAFT",
  "TRAINING_CAMP",
  "PRESEASON",
  "REGULAR_SEASON",
];

export type InterviewResult = {
  ownerAlignScore: number;
  gmTrustScore: number;
  schemeFitScore: number;
  mediaScore: number;
  autonomyDelta: number;
  leashDelta: number;
  axisTotals: Record<string, number>;
  canonicalAxisTotals: Record<string, number>;
  interviewScore: number;
  offerTier: OfferTier;
  premiumGatesPassed: boolean;
};

export type InterviewItem = { teamId: string; completed: boolean; answers: Record<string, number>; result?: InterviewResult };
export type OfferItem = { teamId: string; years: number; salary: number; autonomy: number; patience: number; mediaNarrativeKey: string; score?: number };
export type MemoryEvent = { type: string; season: number; week?: number; payload: unknown };

const CURRENT_SAVE_VERSION = 2;
const INTERVIEW_TEAMS = ["MILWAUKEE_NORTHSHORE", "ATLANTA_APEX", "BIRMINGHAM_VULCANS"];
type DraftRow = Record<string, any>;
const DRAFT_ROWS = draftClassJson as DraftRow[];

const num = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const str = (v: any, d = "") => (v == null ? d : String(v));

function toProspect(r: DraftRow, idx: number): Prospect {
  const id = str(r["Player ID"], `DC_${String(idx + 1).padStart(4, "0")}`);
  const name = str(r["Name"], "Unknown");
  const pos = str(r["POS"], "UNK").toUpperCase();
  const grade = Math.round(num(r["Grade"], num(r["Overall"], 70)));
  const ras = Math.round(num(r["RAS"], 50));
  const interview = Math.round(num(r["Interview"], 50));
  const archetype = str(r["Archetype"], str(r["Style"], "Prospect"));
  return { id, name, pos, archetype, grade, ras, interview };
}

function draftBoard(): Prospect[] {
  const rows = DRAFT_ROWS.slice();
  rows.sort((a, b) => num(a["Rank"], 9999) - num(b["Rank"], 9999));
  return rows.map(toProspect);
}

function mergeOffers(a: FreeAgentOffer[], b: FreeAgentOffer[]): FreeAgentOffer[] {
  const out: FreeAgentOffer[] = [];
  const seen = new Set<string>();
  for (const o of [...a, ...b]) {
    if (seen.has(o.playerId)) continue;
    seen.add(o.playerId);
    out.push(o);
  }
  return out;
}

export type AssistantStaff = {
  assistantHcId?: string;
  qbCoachId?: string;
  olCoachId?: string;
  dlCoachId?: string;
  lbCoachId?: string;
  dbCoachId?: string;
  rbCoachId?: string;
  wrCoachId?: string;
};

export type BuyoutLedger = { bySeason: Record<number, number> };
export type DepthChart = { startersByPos: Record<string, string | undefined> };
export type PreseasonRotation = { byPlayerId: Record<string, number> };
export type FreeAgencyOfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export type FreeAgencyOffer = {
  offerId: string;
  playerId: string;
  teamId: string;
  isUser: boolean;
  years: number;
  aav: number;
  createdWeek: number;
  status: FreeAgencyOfferStatus;
};

export type FreeAgencyUI =
  | { mode: "NONE" }
  | { mode: "PLAYER"; playerId: string }
  | { mode: "MY_OFFERS" };

export type FreeAgencyState = {
  ui: FreeAgencyUI;
  offersByPlayerId: Record<string, FreeAgencyOffer[]>;
  signingsByPlayerId: Record<string, { teamId: string; years: number; aav: number }>;
  nextOfferSeq: number;
};

export type FiringMeter = {
  pWeekly: number;
  pSeasonEnd: number;
  drivers: Array<{ label: string; value: number }>;
  lastWeekComputed: number;
  lastSeasonComputed: number;
  fired: boolean;
  firedAt?: { season: number; week?: number; checkpoint: "WEEKLY" | "SEASON_END" };
};

export type GameState = {
  coach: {
    name: string;
    ageTier: string;
    hometown: string;
    archetypeId: string;
    hometownTeamId?: string;
    repBaseline?: number;
    autonomy?: number;
    ownerTrustBaseline?: number;
    gmRelationship?: number;
    coordDeferenceLevel?: number;
    mediaExpectation?: number;
    lockerRoomCred?: number;
    volatility?: number;
    tenureYear: number;
    reputation?: CoachReputation;
  };
  phase: GamePhase;
  careerStage: CareerStage;
  offseason: OffseasonState;
  offseasonData: OffseasonData;
  freeAgency: FreeAgencyState;
  interviews: { items: InterviewItem[]; completedCount: number };
  offers: OfferItem[];
  acceptedOffer?: OfferItem;
  autonomyRating?: number;
  ownerPatience?: number;
  season: number;
  week?: number;
  saveVersion: number;
  memoryLog: MemoryEvent[];
  teamFinances: { cash: number; deadMoneyBySeason: Record<number, number> };
  owner: { approval: number; budgetBreaches: number; financialRating: number; jobSecurity: number };
  staffBudget: { total: number; used: number; byPersonId: Record<string, number> };
  rosterMgmt: { active: Record<string, true>; cuts: Record<string, true>; finalized: boolean };
  buyouts: BuyoutLedger;
  depthChart: DepthChart;
  preseason: { rotation: PreseasonRotation; appliedWeeks: Record<number, true> };
  staff: { ocId?: string; dcId?: string; stcId?: string };
  orgRoles: OrgRoles;
  assistantStaff: AssistantStaff;
  scheme?: {
    offense?: { style: "BALANCED" | "RUN_HEAVY" | "PASS_HEAVY"; tempo: "SLOW" | "NORMAL" | "FAST" };
    defense?: { style: "MAN" | "ZONE" | "MIXED"; aggression: "CONSERVATIVE" | "NORMAL" | "AGGRESSIVE" };
  };
  scouting?: { boardSeed: number; combineRun?: boolean };
  hub: { news: string[]; preseasonWeek: number; regularSeasonWeek: number; schedule: LeagueSchedule | null };
  league: LeagueState;
  saveSeed: number;
  game: GameSim;
  draft: { picks: string[]; withdrawnBoardIds: Record<string, true> };
  rookies: RookiePlayer[];
  rookieContracts: Record<string, RookieContract>;
  playerTeamOverrides: Record<string, string>;
  playerContractOverrides: Record<string, { startSeason: number; endSeason: number; aav: number; signingBonus: number }>;
  firing: FiringMeter;
};

export type RookieContract = {
  startSeason: number;
  years: 4;
  capBySeason: Record<number, number>;
  total: number;
};

export type RookiePlayer = {
  playerId: string;
  prospectId: string;
  name: string;
  pos: string;
  age: number;
  ovr: number;
  dev: number;
  apy: number;
};

export type GameAction =
  | { type: "SET_COACH"; payload: Partial<GameState["coach"]> }
  | { type: "SET_PHASE"; payload: GamePhase }
  | { type: "COMPLETE_INTERVIEW"; payload: { teamId: string; answers: Record<string, number>; result: InterviewResult } }
  | { type: "GENERATE_OFFERS" }
  | { type: "ACCEPT_OFFER"; payload: OfferItem }
  | { type: "HIRE_STAFF"; payload: { role: "OC" | "DC" | "STC"; personId: string; salary: number } }
  | { type: "HIRE_ASSISTANT"; payload: { role: keyof AssistantStaff; personId: string; salary: number } }
  | { type: "COORD_ATTEMPT_HIRE"; payload: { role: "OC" | "DC" | "STC"; personId: string } }
  | { type: "ASSISTANT_ATTEMPT_HIRE"; payload: { role: keyof AssistantStaff; personId: string } }
  | { type: "SET_ORG_ROLE"; payload: { role: keyof OrgRoles; coachId: string | undefined } }
  | { type: "ADVANCE_CAREER_STAGE" }
  | { type: "SET_CAREER_STAGE"; payload: CareerStage }
  | { type: "START_GAME"; payload: { opponentTeamId: string; weekType?: GameType; weekNumber?: number; gameType?: GameType; week?: number } }
  | { type: "RESOLVE_PLAY"; payload: { playType: PlayType } }
  | { type: "EXIT_GAME" }
  | { type: "ADVANCE_WEEK" }
  | { type: "OFFSEASON_SET_TASK"; payload: { taskId: OffseasonTaskId; completed: boolean } }
  | { type: "OFFSEASON_APPLY_TASK_EFFECT"; payload: { taskId: OffseasonTaskId } }
  | { type: "OFFSEASON_COMPLETE_STEP"; payload: { stepId: OffseasonStepId } }
  | { type: "OFFSEASON_ADVANCE_STEP" }
  | { type: "OFFSEASON_SET_STEP"; payload: { stepId: OffseasonStepId } }
  | { type: "RESIGN_SET_DECISION"; payload: { playerId: string; decision: ResignDecision } }
  | { type: "COMBINE_GENERATE" }
  | { type: "TAMPERING_ADD_OFFER"; payload: { offer: FreeAgentOffer } }
  | { type: "FA_INIT_OFFERS" }
  | { type: "FA_REJECT"; payload: { playerId: string } }
  | { type: "FA_WITHDRAW"; payload: { offerId: string } }
  | { type: "FA_SIGN"; payload: { offerId: string } }
  | { type: "FA_OPEN_PLAYER"; payload: { playerId: string } }
  | { type: "FA_OPEN_MY_OFFERS" }
  | { type: "FA_CLOSE_MODAL" }
  | { type: "FA_SUBMIT_OFFER"; payload: { playerId: string; years: number; aav: number } }
  | { type: "FA_WITHDRAW_OFFER"; payload: { offerId: string; playerId: string } }
  | { type: "FA_RESOLVE_WEEK"; payload: { week: number } }
  | { type: "FA_ACCEPT_OFFER"; payload: { playerId: string; offerId: string } }
  | { type: "FA_REJECT_OFFER"; payload: { playerId: string; offerId: string } }
  | { type: "PREDRAFT_TOGGLE_VISIT"; payload: { prospectId: string } }
  | { type: "PREDRAFT_TOGGLE_WORKOUT"; payload: { prospectId: string } }
  | { type: "DRAFT_PICK"; payload: { prospectId: string } }
  | { type: "CAMP_SET"; payload: { settings: Partial<CampSettings> } }
  | { type: "CUT_TOGGLE"; payload: { playerId: string } }
  | { type: "INIT_TRAINING_CAMP_ROSTER" }
  | { type: "AUTO_CUT_TO_53" }
  | { type: "TOGGLE_ACTIVE"; payload: { playerId: string } }
  | { type: "FINALIZE_CUTS" }
  | { type: "OWNER_PENALTY"; payload: { reason: string; amount: number } }
  | { type: "FIRE_STAFF"; payload: { personId: string; roleLabel: string; spreadSeasons: 1 | 2 } }
  | { type: "CHARGE_BUYOUTS_FOR_SEASON"; payload: { season: number } }
  | { type: "SET_STARTER"; payload: { slot: string; playerId: string } }
  | { type: "RECALC_OWNER_FINANCIAL"; payload?: { season?: number } }
  | { type: "INIT_PRESEASON_ROTATION" }
  | { type: "SET_PLAYER_SNAP"; payload: { playerId: string; pct: number } }
  | { type: "APPLY_PRESEASON_DEV"; payload: { week: number } }
  | { type: "RESET_DEPTH_CHART_BEST" }
  | { type: "AUTOFILL_DEPTH_CHART" }
  | { type: "RECALC_FIRING_METER"; payload: { week: number; winPct?: number; goalsDelta?: number } }
  | { type: "CHECK_FIRING"; payload: { checkpoint: "WEEKLY" | "SEASON_END"; week?: number; winPct?: number; goalsDelta?: number } }
  | { type: "AUTO_ADVANCE_STAGE_IF_READY" }
  | { type: "RESET" };

function createSchedule(seed: number): LeagueSchedule {
  const teamIds = getTeams().filter((team) => team.isActive !== false).map((team) => team.teamId);
  return generateLeagueSchedule(teamIds, seed);
}

function createInitialAssistantStaff(): AssistantStaff {
  return {};
}

function createInitialState(): GameState {
  const teams = getTeams().filter((t) => t.isActive).map((t) => t.teamId);
  const saveSeed = Date.now();

  return {
    coach: { name: "", ageTier: "32-35", hometown: "", archetypeId: "", tenureYear: 1 },
    phase: "CREATE",
    careerStage: "OFFSEASON_HUB",
    offseason: {
      stepId: OFFSEASON_STEPS[0].id,
      completed: { SCOUTING: false, INSTALL: false, MEDIA: false, STAFF: false },
      stepsComplete: {},
    },
    offseasonData: {
      resigning: { decisions: {} },
      combine: { results: [], generated: false },
      tampering: { offers: [] },
      freeAgency: {
        offers: [],
        signings: [],
        rejected: {},
        withdrawn: {},
        capTotal: 82_000_000,
        capUsed: 54_000_000,
        capHitsByPlayerId: {},
      },
      preDraft: { board: [], visits: {}, workouts: {} },
      draft: { board: [], picks: [], completed: false },
      camp: { settings: { intensity: "NORMAL", installFocus: "BALANCED", positionFocus: "NONE" } },
      cutDowns: { decisions: {} },
    },
    interviews: { items: INTERVIEW_TEAMS.map((teamId) => ({ teamId, completed: false, answers: {} })), completedCount: 0 },
    freeAgency: { ui: { mode: "NONE" }, offersByPlayerId: {}, signingsByPlayerId: {}, nextOfferSeq: 1 },
    offers: [],
    season: 2026,
    week: 1,
    saveVersion: CURRENT_SAVE_VERSION,
    memoryLog: [],
    teamFinances: { cash: 60_000_000, deadMoneyBySeason: {} },
    owner: { approval: 65, budgetBreaches: 0, financialRating: 70, jobSecurity: 68 },
    staffBudget: { total: 18_000_000, used: 0, byPersonId: {} },
    rosterMgmt: { active: {}, cuts: {}, finalized: false },
    buyouts: { bySeason: {} },
    depthChart: { startersByPos: {} },
    preseason: { rotation: { byPlayerId: {} }, appliedWeeks: {} },
    staff: {},
    orgRoles: {},
    assistantStaff: createInitialAssistantStaff(),
    scheme: { offense: { style: "BALANCED", tempo: "NORMAL" }, defense: { style: "MIXED", aggression: "NORMAL" } },
    scouting: { boardSeed: saveSeed ^ 0x9e3779b9 },
    hub: { news: [], preseasonWeek: 1, regularSeasonWeek: 1, schedule: createSchedule(saveSeed) },
    league: initLeagueState(teams),
    saveSeed,
    game: initGameSim({ homeTeamId: "HOME", awayTeamId: "AWAY", seed: saveSeed }),
    draft: { picks: [], withdrawnBoardIds: {} },
    rookies: [],
    rookieContracts: {},
    playerTeamOverrides: {},
    playerContractOverrides: {},
    firing: { pWeekly: 0, pSeasonEnd: 0, drivers: [], lastWeekComputed: 0, lastSeasonComputed: 0, fired: false },
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function detRand(saveSeed: number, key: string): number {
  return mulberry32(saveSeed ^ hashStr(key))();
}

function makeOfferId(state: GameState) {
  return `FA_OFFER_${state.season}_${state.freeAgency.nextOfferSeq}`;
}

function upsertOffers(state: GameState, playerId: string, nextOffers: FreeAgencyOffer[]): FreeAgencyState {
  return {
    ...state.freeAgency,
    offersByPlayerId: { ...state.freeAgency.offersByPlayerId, [playerId]: nextOffers },
  };
}

function moneyRound(n: number) {
  return Math.round(n / 50_000) * 50_000;
}

function rookieApyFromRank(rank: number): number {
  const r = Math.max(1, Math.min(300, rank));
  const max = 6_000_000;
  const min = 850_000;
  const t = (300 - r) / 299;
  return moneyRound(min + (max - min) * t ** 1.25);
}

function rookieOvrFromRank(rank: number): number {
  const r = Math.max(1, Math.min(300, rank));
  const t = (300 - r) / 299;
  return Math.round(58 + t * 26);
}

function rookieDevFromTier(row: Record<string, unknown>): number {
  const x = Number(row["DraftTier"] ?? row["Tier"] ?? 60);
  if (!Number.isFinite(x)) return 60;
  return Math.max(40, Math.min(90, Math.round(x)));
}

function rookieContractFromApy(startSeason: number, apy: number): RookieContract {
  const y1 = moneyRound(apy);
  const y2 = moneyRound(apy * 1.05);
  const y3 = moneyRound(apy * 1.1);
  const y4 = moneyRound(apy * 1.15);
  const capBySeason: Record<number, number> = { [startSeason]: y1, [startSeason + 1]: y2, [startSeason + 2]: y3, [startSeason + 3]: y4 };
  return { startSeason, years: 4, capBySeason, total: y1 + y2 + y3 + y4 };
}

function getProspectRow(prospectId: string): Record<string, unknown> | null {
  return DRAFT_ROWS.find((r) => String(r["Player ID"]) === prospectId) ?? null;
}

function deriveCoordFocus(role: "OC" | "DC" | "STC"): RoleFocus {
  if (role === "OC") return "OFF";
  if (role === "DC") return "DEF";
  return "ST";
}

function deriveAssistantFocus(role: keyof AssistantStaff): RoleFocus {
  return role === "qbCoachId" || role === "olCoachId" || role === "rbCoachId" || role === "wrCoachId"
    ? "OFF"
    : role === "dlCoachId" || role === "lbCoachId" || role === "dbCoachId"
      ? "DEF"
      : "GEN";
}

function schemeCompatForPerson(state: GameState, personId: string): number {
  const person = getPersonnelById(personId);
  if (!person) return 60;
  const ocScheme = state.staff.ocId ? String(getPersonnelById(state.staff.ocId)?.scheme ?? "").toLowerCase() : "";
  const dcScheme = state.staff.dcId ? String(getPersonnelById(state.staff.dcId)?.scheme ?? "").toLowerCase() : "";
  const ps = new Set([ocScheme, dcScheme].filter(Boolean));
  const scheme = String(person.scheme ?? "").toLowerCase();
  return ps.size ? (Array.from(ps).some((x) => scheme.includes(x) || x.includes(scheme)) ? 80 : 55) : 60;
}

function areAllAssistantsHired(assistantStaff: AssistantStaff): boolean {
  return Boolean(
    assistantStaff.assistantHcId &&
      assistantStaff.qbCoachId &&
      assistantStaff.olCoachId &&
      assistantStaff.dlCoachId &&
      assistantStaff.lbCoachId &&
      assistantStaff.dbCoachId &&
      assistantStaff.rbCoachId &&
      assistantStaff.wrCoachId
  );
}

function nextCareerStage(stage: CareerStage): CareerStage {
  const idx = CAREER_STAGE_ORDER.indexOf(stage);
  if (idx < 0 || idx === CAREER_STAGE_ORDER.length - 1) return stage;
  return CAREER_STAGE_ORDER[idx + 1];
}

function addMemoryEvent(state: GameState, type: string, payload: unknown): MemoryEvent[] {
  return [...state.memoryLog, { type, season: state.season, week: state.week, payload }];
}

function applyOwnerPenalty(state: GameState, amount: number, reason: string): GameState {
  const approval = clamp100(state.owner.approval - amount);
  const budgetBreaches = state.owner.budgetBreaches + 1;
  const season = state.season;
  const tmp: GameState = {
    ...state,
    owner: { ...state.owner, approval, budgetBreaches },
    memoryLog: addMemoryEvent(state, "OWNER_PENALTY", { reason, amount }),
  };
  const financialRating = computeFinancialRating(tmp, season);
  return { ...tmp, owner: { ...tmp.owner, financialRating, jobSecurity: computeJobSecurity(approval, financialRating) } };
}

function overBudgetPenaltyAmount(overBy: number) {
  if (overBy <= 0) return 0;
  if (overBy <= 500_000) return 1;
  if (overBy <= 1_500_000) return 2;
  if (overBy <= 3_000_000) return 3;
  return 4;
}

function allowStaffOverageWithPenalty(state: GameState, salary: number, reason: string): GameState {
  const overBy = state.staffBudget.used + salary - state.staffBudget.total;
  const penalty = overBudgetPenaltyAmount(overBy);
  return penalty ? applyOwnerPenalty(state, penalty, `${reason} (over by $${Math.round(overBy / 1_000_000)}M)`) : state;
}

function addStaffSalaryAndCash(state: GameState, personId: string, salary: number): GameState {
  const nextCash = state.teamFinances.cash - salary;
  const base: GameState = {
    ...state,
    teamFinances: { ...state.teamFinances, cash: nextCash },
    staffBudget: {
      ...state.staffBudget,
      used: state.staffBudget.used + salary,
      byPersonId: { ...state.staffBudget.byPersonId, [personId]: salary },
    },
  };
  if (nextCash >= 0) return base;
  return applyOwnerPenalty(base, 6, "Staff payroll exceeded available cash");
}

function computeFinancialRating(state: GameState, season: number) {
  const dm = state.teamFinances.deadMoneyBySeason[season] ?? 0;
  const cash = state.teamFinances.cash;
  const dmHit = Math.min(30, (dm / 5_000_000) * 4);
  const cashHit = cash < 0 ? Math.min(25, (-cash / 5_000_000) * 5) : 0;
  const breachHit = Math.min(20, state.owner.budgetBreaches * 4);
  return clamp100(78 - dmHit - cashHit - breachHit);
}

function computeJobSecurity(approval: number, financialRating: number) {
  return clamp100(approval * 0.62 + financialRating * 0.38);
}

function addBuyoutToSeason(state: GameState, season: number, amount: number): GameState {
  if (amount <= 0) return state;
  const bySeason = { ...state.buyouts.bySeason, [season]: (state.buyouts.bySeason[season] ?? 0) + amount };
  return { ...state, buyouts: { bySeason } };
}

function addDeadMoney(state: GameState, season: number, amount: number): GameState {
  if (amount <= 0) return state;
  return {
    ...state,
    teamFinances: {
      ...state.teamFinances,
      deadMoneyBySeason: { ...state.teamFinances.deadMoneyBySeason, [season]: (state.teamFinances.deadMoneyBySeason[season] ?? 0) + amount },
    },
  };
}

function refundStaffBudget(state: GameState, personId: string): GameState {
  const cur = state.staffBudget.byPersonId[personId] ?? 0;
  if (!cur) return state;
  const byPersonId = { ...state.staffBudget.byPersonId };
  delete byPersonId[personId];
  return { ...state, staffBudget: { ...state.staffBudget, used: Math.max(0, state.staffBudget.used - cur), byPersonId } };
}

function chargeBuyouts(state: GameState, season: number): GameState {
  const due = state.buyouts.bySeason[season] ?? 0;
  if (!due) return state;
  const bySeason = { ...state.buyouts.bySeason };
  delete bySeason[season];
  let next: GameState = {
    ...state,
    buyouts: { bySeason },
    teamFinances: {
      ...state.teamFinances,
      cash: state.teamFinances.cash - due,
      deadMoneyBySeason: { ...state.teamFinances.deadMoneyBySeason, [season]: due },
    },
    memoryLog: addMemoryEvent(state, "BUYOUT_CHARGED", { season, amount: due }),
  };
  const financialRating = computeFinancialRating(next, season);
  next = { ...next, owner: { ...next.owner, financialRating, jobSecurity: computeJobSecurity(next.owner.approval, financialRating) } };
  if (next.teamFinances.cash < 0) next = applyOwnerPenalty(next, 4, "Cash went negative paying buyouts");
  return next;
}

function isActive53(state: GameState) {
  return state.rosterMgmt.finalized && Object.keys(state.rosterMgmt.active).length === 53;
}

function normalizePosKey(pos: string) {
  const p = pos.toUpperCase();
  if (["QB"].includes(p)) return "QB";
  if (["RB"].includes(p)) return "RB";
  if (["WR"].includes(p)) return "WR";
  if (["TE"].includes(p)) return "TE";
  if (["OT", "OG", "C", "OL"].includes(p)) return "OL";
  if (["EDGE", "DE", "DT", "DL"].includes(p)) return "DL";
  if (["LB"].includes(p)) return "LB";
  if (["CB", "S", "DB"].includes(p)) return "DB";
  return "OTHER";
}

function normalizeSlotToGroup(slot: string) {
  const s = slot.toUpperCase();
  if (s.startsWith("QB")) return "QB";
  if (s.startsWith("RB")) return "RB";
  if (s.startsWith("WR")) return "WR";
  if (s.startsWith("TE")) return "TE";
  if (["LT", "LG", "C", "RG", "RT", "OL"].includes(s)) return "OL";
  if (["EDGE", "DE", "DT", "DL"].includes(s)) return "DL";
  if (s.startsWith("LB")) return "LB";
  if (["CB1", "CB2", "FS", "SS", "DB"].includes(s) || s.startsWith("CB") || s.startsWith("S")) return "DB";
  return "OTHER";
}

function initRotationFromDepthChart(state: GameState): GameState {
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId || !isActive53(state)) return state;
  const activeIds = new Set(Object.keys(state.rosterMgmt.active));
  const roster = getTeamRosterPlayers(teamId)
    .filter((p) => activeIds.has(String((p as any).playerId)))
    .map((p) => ({ id: String((p as any).playerId), grp: normalizePosKey(String((p as any).pos ?? "OTHER")), ovr: Number((p as any).overall ?? 0) }));

  const byGroup: Record<string, Array<{ id: string; ovr: number }>> = {};
  for (const p of roster) (byGroup[p.grp] ??= []).push({ id: p.id, ovr: p.ovr });
  for (const k of Object.keys(byGroup)) byGroup[k].sort((a, b) => b.ovr - a.ovr);

  const starterByGroup: Record<string, string | undefined> = {};
  for (const [slot, playerId] of Object.entries(state.depthChart.startersByPos)) {
    if (!playerId) continue;
    const g = normalizeSlotToGroup(slot);
    if (g !== "OTHER" && activeIds.has(String(playerId)) && !starterByGroup[g]) starterByGroup[g] = String(playerId);
  }

  const byPlayerId: Record<string, number> = {};
  const applyGroup = (g: string, starterPct: number, backupPct: number, depthPct: number) => {
    const list = byGroup[g] ?? [];
    if (!list.length) return;
    const starterId = starterByGroup[g] ?? list[0].id;
    for (let i = 0; i < list.length; i++) {
      const id = list[i].id;
      if (id === starterId) byPlayerId[id] = starterPct;
      else if (i === 1 || (i === 0 && starterId !== list[0].id)) byPlayerId[id] = backupPct;
      else if (i < 5) byPlayerId[id] = depthPct;
      else byPlayerId[id] = 0;
    }
  };

  applyGroup("QB", 65, 55, 15);
  applyGroup("RB", 55, 45, 20);
  applyGroup("WR", 55, 45, 25);
  applyGroup("TE", 55, 45, 20);
  applyGroup("OL", 45, 35, 15);
  applyGroup("DL", 45, 35, 15);
  applyGroup("LB", 45, 35, 15);
  applyGroup("DB", 45, 35, 15);

  return { ...state, preseason: { ...state.preseason, rotation: { byPlayerId } } };
}

function preseasonDevFromRotation(state: GameState): { devById: Record<string, number>; riskById: Record<string, number> } {
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId || !isActive53(state)) return { devById: {}, riskById: {} };

  const activeIds = new Set(Object.keys(state.rosterMgmt.active));
  const roster = getTeamRosterPlayers(teamId)
    .filter((p) => activeIds.has(String((p as any).playerId)))
    .map((p) => ({ id: String((p as any).playerId), age: Number((p as any).age ?? 0) }));

  const devById: Record<string, number> = {};
  const riskById: Record<string, number> = {};

  for (const p of roster) {
    const pct = clamp100(state.preseason.rotation.byPlayerId[p.id] ?? 0);
    if (pct <= 0) continue;
    const share = pct / 100;
    const dev = Math.max(0, Math.round(1 + share * 3));
    const risk = Math.round(2 + share * 8 + Math.max(0, (p.age - 28) * 0.5));
    devById[p.id] = (devById[p.id] ?? 0) + dev;
    riskById[p.id] = Math.max(riskById[p.id] ?? 0, risk);
  }

  return { devById, riskById };
}

function applyPreseasonDevToRookies(state: GameState, devById: Record<string, number>): GameState {
  if (!Object.keys(devById).length) return state;
  const rookies = state.rookies.map((r) => {
    const t = devById[r.playerId] ?? 0;
    if (!t) return r;
    const bump = t >= 4 ? 2 : t >= 3 ? 1 : 0;
    return bump ? { ...r, ovr: Math.min(99, r.ovr + bump), dev: Math.min(90, r.dev + t) } : { ...r, dev: Math.min(90, r.dev + t) };
  });
  return { ...state, rookies };
}

function getUserTeamRosterIds(teamId: string) {
  return getTeamRosterPlayers(teamId)
    .filter((p) => String((p as any).status ?? "").toUpperCase() !== "IR")
    .map((p) => String((p as any).playerId));
}

function top53Active(teamId: string) {
  const roster = getTeamRosterPlayers(teamId)
    .filter((p) => String((p as any).status ?? "").toUpperCase() !== "IR")
    .sort((a, b) => Number((b as any).overall ?? 0) - Number((a as any).overall ?? 0));

  const active: Record<string, true> = {};
  const cuts: Record<string, true> = {};

  roster.forEach((p, i) => {
    const id = String((p as any).playerId);
    if (i < 53) active[id] = true;
    else cuts[id] = true;
  });

  return { active, cuts };
}

function ownerAxesFromState(state: GameState) {
  const owner: any = (state as any).acceptedOffer?.ownerProfile ?? (state as any).acceptedOffer?.owner;
  return owner?.axis_weights ?? owner?.axes;
}

function currentDeadMoney(state: GameState, season: number) {
  return state.teamFinances.deadMoneyBySeason[season] ?? 0;
}

function computeWinPctFallback(state: GameState): number {
  const w = Number((state as any).seasonRecord?.wins ?? 0);
  const l = Number((state as any).seasonRecord?.losses ?? 0);
  const t = Number((state as any).seasonRecord?.ties ?? 0);
  const g = Math.max(1, w + l + t);
  return Math.max(0, Math.min(1, (w + 0.5 * t) / g));
}

function computeGoalsDeltaFallback(state: GameState): number {
  return Number((state as any).ownerGoals?.delta ?? 0);
}

const SLOT_RULES: Array<{ slot: string; pos: string[] }> = [
  { slot: "QB1", pos: ["QB"] },
  { slot: "RB1", pos: ["RB"] },
  { slot: "WR1", pos: ["WR"] },
  { slot: "WR2", pos: ["WR"] },
  { slot: "TE1", pos: ["TE"] },
  { slot: "LT", pos: ["OT", "OL"] },
  { slot: "LG", pos: ["OG", "OL"] },
  { slot: "C", pos: ["C", "OL"] },
  { slot: "RG", pos: ["OG", "OL"] },
  { slot: "RT", pos: ["OT", "OL"] },
  { slot: "EDGE1", pos: ["EDGE", "DE", "DL"] },
  { slot: "DT1", pos: ["DT", "DL"] },
  { slot: "DT2", pos: ["DT", "DL"] },
  { slot: "EDGE2", pos: ["EDGE", "DE", "DL"] },
  { slot: "LB1", pos: ["LB"] },
  { slot: "LB2", pos: ["LB"] },
  { slot: "CB1", pos: ["CB", "DB"] },
  { slot: "CB2", pos: ["CB", "DB"] },
  { slot: "FS", pos: ["S", "DB"] },
  { slot: "SS", pos: ["S", "DB"] },
  { slot: "K", pos: ["K"] },
  { slot: "P", pos: ["P"] },
];

function fillDepthChart(state: GameState, mode: "RESET" | "AUTOFILL"): GameState {
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return state;

  const activeSet = new Set(Object.keys(state.rosterMgmt.active));
  const roster = getTeamRosterPlayers(teamId)
    .filter((p) => activeSet.has(String(p.playerId)))
    .map((p) => ({ id: String(p.playerId), pos: String(p.pos ?? "UNK").toUpperCase(), ovr: Number(p.overall ?? 0) }))
    .sort((a, b) => b.ovr - a.ovr);

  const starters = mode === "RESET" ? {} : { ...state.depthChart.startersByPos };
  const used = new Set<string>();
  if (mode !== "RESET") {
    for (const v of Object.values(starters)) if (v) used.add(String(v));
  }

  for (const rule of SLOT_RULES) {
    if (mode === "AUTOFILL" && starters[rule.slot]) continue;
    const eligible = roster.filter((p) => rule.pos.includes(p.pos));
    const pick = eligible.find((p) => !used.has(p.id)) ?? eligible[0];
    if (!pick) continue;
    starters[rule.slot] = pick.id;
    used.add(pick.id);
  }

  return { ...state, depthChart: { startersByPos: starters } };
}

function computeAndStoreFiringMeter(state: GameState, week: number, winPct?: number, goalsDelta?: number): GameState {
  const seasonYear = state.coach.tenureYear;
  const seasonNumber = state.season;
  const win = winPct ?? computeWinPctFallback(state);
  const goals = goalsDelta ?? computeGoalsDeltaFallback(state);
  const deadMoneyThisSeason = currentDeadMoney(state, seasonNumber);
  const ownerAxes = ownerAxesFromState(state);

  const weekly = computeTerminationRisk({
    saveSeed: state.saveSeed,
    seasonYear,
    seasonNumber,
    week,
    checkpoint: "WEEKLY",
    jobSecurity: state.owner.jobSecurity,
    ownerApproval: state.owner.approval,
    financialRating: state.owner.financialRating,
    cash: state.teamFinances.cash,
    deadMoneyThisSeason,
    budgetBreaches: state.owner.budgetBreaches,
    ownerAxes,
    goalsDelta: goals,
    winPct: win,
  });

  const seasonEnd = computeTerminationRisk({
    saveSeed: state.saveSeed,
    seasonYear,
    seasonNumber,
    week,
    checkpoint: "SEASON_END",
    jobSecurity: state.owner.jobSecurity,
    ownerApproval: state.owner.approval,
    financialRating: state.owner.financialRating,
    cash: state.teamFinances.cash,
    deadMoneyThisSeason,
    budgetBreaches: state.owner.budgetBreaches,
    ownerAxes,
    goalsDelta: goals,
    winPct: win,
  });

  return {
    ...state,
    firing: {
      ...state.firing,
      pWeekly: seasonYear === 1 ? 0 : weekly.p,
      pSeasonEnd: seasonEnd.p,
      drivers: seasonEnd.drivers,
      lastWeekComputed: week,
      lastSeasonComputed: seasonNumber,
    },
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_COACH":
      return { ...state, coach: { ...state.coach, ...action.payload } };
    case "SET_PHASE":
      return { ...state, phase: action.payload };
    case "SET_CAREER_STAGE":
      return { ...state, careerStage: action.payload };
    case "ADVANCE_CAREER_STAGE": {
      let next: GameState = { ...state, careerStage: nextCareerStage(state.careerStage) };
      if (next.season !== state.season) {
        next = gameReducer(next, { type: "CHARGE_BUYOUTS_FOR_SEASON", payload: { season: next.season } });
        next = gameReducer(next, { type: "RECALC_OWNER_FINANCIAL", payload: { season: next.season } });
      }
      return next;
    }
    case "SET_ORG_ROLE":
      return { ...state, orgRoles: { ...state.orgRoles, [action.payload.role]: action.payload.coachId } };
    case "COMPLETE_INTERVIEW": {
      const items = state.interviews.items.map((item) =>
        item.teamId === action.payload.teamId ? { ...item, completed: true, answers: action.payload.answers, result: action.payload.result } : item
      );
      return { ...state, interviews: { items, completedCount: items.filter((i) => i.completed).length } };
    }
    case "GENERATE_OFFERS":
      return { ...state, offers: generateOffers(state), phase: "OFFERS" };
    case "ACCEPT_OFFER":
      return {
        ...state,
        acceptedOffer: action.payload,
        autonomyRating: action.payload.autonomy,
        ownerPatience: action.payload.patience,
        memoryLog: addMemoryEvent(state, "HIRED_COACH", action.payload),
        phase: "COORD_HIRING",
      };
    case "COORD_ATTEMPT_HIRE": {
      const person = getPersonnelById(action.payload.personId);
      if (!person) return state;

      const rep = state.coach.reputation;
      const schemeCompat = schemeCompatForPerson(state, action.payload.personId);
      const teamOutlook = clamp100(45 + (state.acceptedOffer?.score ?? 0) * 40);

      const expected = expectedSalary(action.payload.role, Number((person as any).reputation ?? 55));
      const offered = offerSalary(expected, "FAIR");
      const offerQuality = offerQualityScore(offered, expected);

      const res = computeStaffAcceptance({
        saveSeed: state.saveSeed,
        rep,
        staffRep: Number((person as any).reputation ?? 0),
        personId: (person as any).personId,
        schemeCompat,
        offerQuality,
        teamOutlook,
        roleFocus: deriveCoordFocus(action.payload.role),
        kind: "COORDINATOR",
      });

      if (!res.accept) {
        return {
          ...state,
          coach: { ...state.coach, reputation: rep ? applyStaffRejection(rep) : rep },
          memoryLog: addMemoryEvent(state, "COORD_REJECTED", {
            ...action.payload,
            score: res.score,
            tier: res.tier,
            threshold: res.threshold,
          }),
        };
      }

      return gameReducer(state, {
        type: "HIRE_STAFF",
        payload: { role: action.payload.role, personId: action.payload.personId, salary: offered },
      });
    }
    case "HIRE_STAFF": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;

      let nextState = allowStaffOverageWithPenalty(state, action.payload.salary, "Staff budget exceeded");

      const staff =
        action.payload.role === "OC"
          ? { ...nextState.staff, ocId: action.payload.personId }
          : action.payload.role === "DC"
            ? { ...nextState.staff, dcId: action.payload.personId }
            : { ...nextState.staff, stcId: action.payload.personId };

      const res = setPersonnelTeamAndContract({
        personId: action.payload.personId,
        teamId,
        startSeason: nextState.season,
        years: 3,
        salary: action.payload.salary,
        notes: `${action.payload.role} hired`,
      });

      nextState = addStaffSalaryAndCash({ ...nextState, staff }, action.payload.personId, action.payload.salary);

      return {
        ...nextState,
        phase: staff.ocId && staff.dcId && staff.stcId ? "HUB" : nextState.phase,
        careerStage: staff.ocId && staff.dcId && staff.stcId ? "OFFSEASON_HUB" : nextState.careerStage,
        memoryLog: addMemoryEvent(nextState, "COORD_HIRED", { ...action.payload, contractId: res?.contractId }),
      };
    }
    case "ASSISTANT_ATTEMPT_HIRE": {
      const person = getPersonnelById(action.payload.personId);
      if (!person) return state;

      const rep = state.coach.reputation;
      const schemeCompat = schemeCompatForPerson(state, action.payload.personId);
      const teamOutlook = clamp100(45 + (state.acceptedOffer?.score ?? 0) * 40);

      const expected = expectedSalary(action.payload.role as any, Number((person as any).reputation ?? 55));
      const offered = offerSalary(expected, "FAIR");
      const offerQuality = offerQualityScore(offered, expected);

      const res = computeStaffAcceptance({
        saveSeed: state.saveSeed,
        rep,
        staffRep: Number((person as any).reputation ?? 0),
        personId: (person as any).personId,
        schemeCompat,
        offerQuality,
        teamOutlook,
        roleFocus: deriveAssistantFocus(action.payload.role),
        kind: "ASSISTANT",
      });

      if (!res.accept) {
        return {
          ...state,
          coach: { ...state.coach, reputation: rep ? applyStaffRejection(rep) : rep },
          memoryLog: addMemoryEvent(state, "ASSISTANT_REJECTED", {
            ...action.payload,
            score: res.score,
            tier: res.tier,
            threshold: res.threshold,
          }),
        };
      }

      return gameReducer(state, {
        type: "HIRE_ASSISTANT",
        payload: { role: action.payload.role, personId: action.payload.personId, salary: offered },
      });
    }
    case "HIRE_ASSISTANT": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;

      let nextState = allowStaffOverageWithPenalty(state, action.payload.salary, "Staff budget exceeded");

      const assistantStaff = { ...nextState.assistantStaff, [action.payload.role]: action.payload.personId };

      const res = setPersonnelTeamAndContract({
        personId: action.payload.personId,
        teamId,
        startSeason: nextState.season,
        years: 2,
        salary: action.payload.salary,
        notes: `${String(action.payload.role)} hired`,
      });

      nextState = addStaffSalaryAndCash(
        { ...nextState, assistantStaff },
        action.payload.personId,
        action.payload.salary
      );

      return {
        ...nextState,
        careerStage: areAllAssistantsHired(assistantStaff) ? "ROSTER_REVIEW" : nextState.careerStage,
        memoryLog: addMemoryEvent(nextState, "ASSISTANT_HIRED", { ...action.payload, contractId: res?.contractId }),
      };
    }
    case "OFFSEASON_SET_TASK": {
      const completed = { ...state.offseason.completed, [action.payload.taskId]: action.payload.completed };
      return { ...state, offseason: { ...state.offseason, completed } };
    }
    case "OFFSEASON_APPLY_TASK_EFFECT": {
      const id = action.payload.taskId;
      if (!state.offseason.completed[id]) return state;

      if (id === "INSTALL") {
        return {
          ...state,
          scheme: {
            offense: { style: "BALANCED", tempo: state.coach?.repBaseline && state.coach.repBaseline > 55 ? "FAST" : "NORMAL" },
            defense: { style: "MIXED", aggression: "NORMAL" },
          },
        };
      }

      if (id === "MEDIA") {
        return {
          ...state,
          coach: { ...state.coach, repBaseline: 55, mediaExpectation: 50, autonomy: state.coach.autonomy ?? 60 },
        };
      }

      if (id === "SCOUTING") {
        return {
          ...state,
          scouting: { ...(state.scouting ?? { boardSeed: state.saveSeed }), combineRun: true },
        };
      }

      if (id === "STAFF") {
        const ok = !!state.orgRoles.ocCoachId && !!state.orgRoles.dcCoachId && !!state.orgRoles.stcCoachId;
        if (!ok) return state;
        return state;
      }

      return state;
    }
    case "OFFSEASON_COMPLETE_STEP": {
      const stepsComplete = { ...state.offseason.stepsComplete, [action.payload.stepId]: true };
      return { ...state, offseason: { ...state.offseason, stepsComplete } };
    }
    case "OFFSEASON_SET_STEP": {
      const stepId = action.payload.stepId;
      if (stepId === "PRE_DRAFT" && !state.offseasonData.preDraft.board.length) {
        return {
          ...state,
          offseason: { ...state.offseason, stepId },
          offseasonData: { ...state.offseasonData, preDraft: { ...state.offseasonData.preDraft, board: draftBoard() } },
        };
      }
      if (stepId === "DRAFT" && !state.offseasonData.draft.board.length) {
        return {
          ...state,
          offseason: { ...state.offseason, stepId },
          offseasonData: { ...state.offseasonData, draft: { ...state.offseasonData.draft, board: draftBoard() } },
        };
      }
      return { ...state, offseason: { ...state.offseason, stepId } };
    }
    case "OFFSEASON_ADVANCE_STEP": {
      const cur = state.offseason.stepId;
      if (!state.offseason.stepsComplete[cur]) return state;
      const next = nextOffseasonStepId(cur);
      if (!next) return state;
      const stage: CareerStage =
        next === "TRAINING_CAMP"
          ? "TRAINING_CAMP"
          : next === "PRESEASON"
            ? "PRESEASON"
            : next === "CUT_DOWNS"
              ? "OFFSEASON_HUB"
              : state.careerStage;
      return { ...state, careerStage: stage, offseason: { ...state.offseason, stepId: next } };
    }
    case "RESIGN_SET_DECISION":
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          resigning: { decisions: { ...state.offseasonData.resigning.decisions, [action.payload.playerId]: action.payload.decision } },
        },
      };
    case "COMBINE_GENERATE": {
      const results = draftBoard()
        .slice(0, 80)
        .map((p, i) => ({
          id: p.id,
          name: p.name,
          pos: p.pos,
          forty: num(DRAFT_ROWS[i]?.["40"], 4.75),
          shuttle: num(DRAFT_ROWS[i]?.["Shuttle"], 4.35),
          threeCone: num(DRAFT_ROWS[i]?.["ThreeCone"], 7.15),
          grade: p.ras,
        }));
      return { ...state, offseasonData: { ...state.offseasonData, combine: { results, generated: true } } };
    }
    case "TAMPERING_ADD_OFFER":
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          tampering: { offers: [action.payload.offer, ...state.offseasonData.tampering.offers].slice(0, 30) },
        },
      };
    case "FA_INIT_OFFERS": {
      if (state.offseason.stepId !== "FREE_AGENCY") return state;
      if (state.offseasonData.freeAgency.offers.length) return state;

      const seed = state.saveSeed ^ 0x44444444;
      const pool = genFreeAgents(seed, 25);
      const carry = state.offseasonData.tampering.offers.slice(0, 10);
      const offers = mergeOffers(carry, pool).map((o) => {
        const rep = state.coach.reputation;
        if (!rep) return o;
        const p = String(o.pos ?? "").toUpperCase();
        const boost = ["QB", "RB", "WR", "TE", "OL", "OT", "OG", "C"].includes(p)
          ? offenseInterestBoost(rep)
          : ["DL", "EDGE", "DE", "DT", "LB", "DB", "CB", "S"].includes(p)
            ? defenseInterestBoost(rep)
            : 0;
        return { ...o, interest: clamp01(Number(o.interest ?? 0) + boost) };
      });

      return {
        ...state,
        offseasonData: { ...state.offseasonData, freeAgency: { ...state.offseasonData.freeAgency, offers } },
      };
    }
    case "FA_REJECT":
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          freeAgency: {
            ...state.offseasonData.freeAgency,
            rejected: { ...state.offseasonData.freeAgency.rejected, [action.payload.playerId]: true },
          },
        },
      };
    case "FA_WITHDRAW":
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          freeAgency: {
            ...state.offseasonData.freeAgency,
            withdrawn: { ...state.offseasonData.freeAgency.withdrawn, [action.payload.offerId]: true },
          },
        },
      };
    case "FA_SIGN": {
      const fa = state.offseasonData.freeAgency;
      const offer = fa.offers.find((o) => o.id === action.payload.offerId);
      if (!offer) return state;
      if (fa.signings.includes(offer.playerId)) return state;
      if (fa.rejected[offer.playerId]) return state;
      if (fa.withdrawn[offer.id]) return state;
      const remaining = fa.capTotal - fa.capUsed;
      if (remaining < offer.apy) return state;
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          freeAgency: {
            ...fa,
            signings: [...fa.signings, offer.playerId],
            capUsed: fa.capUsed + offer.apy,
            capHitsByPlayerId: { ...fa.capHitsByPlayerId, [offer.playerId]: offer.apy },
            withdrawn: { ...fa.withdrawn, [offer.id]: true },
          },
        },
      };
    }
    case "FA_OPEN_PLAYER":
      return { ...state, freeAgency: { ...state.freeAgency, ui: { mode: "PLAYER", playerId: action.payload.playerId } } };

    case "FA_OPEN_MY_OFFERS":
      return { ...state, freeAgency: { ...state.freeAgency, ui: { mode: "MY_OFFERS" } } };

    case "FA_CLOSE_MODAL":
      return { ...state, freeAgency: { ...state.freeAgency, ui: { mode: "NONE" } } };

    case "FA_SUBMIT_OFFER": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;

      const week = state.hub.regularSeasonWeek ?? 1;
      const playerId = action.payload.playerId;
      const offers = state.freeAgency.offersByPlayerId[playerId] ?? [];
      const cleaned = offers.map((o) => (o.isUser && o.status === "PENDING" ? { ...o, status: "WITHDRAWN" as const } : o));

      const offerId = makeOfferId(state);
      const userOffer: FreeAgencyOffer = {
        offerId,
        playerId,
        teamId,
        isUser: true,
        years: Math.max(1, Math.min(5, Math.round(action.payload.years))),
        aav: Math.max(750_000, Math.round(action.payload.aav / 50_000) * 50_000),
        createdWeek: week,
        status: "PENDING",
      };

      const r = detRand(state.saveSeed, `FA_AI_COUNT|S${state.season}|W${week}|P${playerId}|${userOffer.aav}`);
      const aiCount = r < 0.35 ? 0 : r < 0.75 ? 1 : 2;

      const aiOffers: FreeAgencyOffer[] = [];
      for (let i = 0; i < aiCount; i++) {
        const rr = detRand(state.saveSeed, `FA_AI_OFFER|S${state.season}|W${week}|P${playerId}|I${i}`);
        const bump = 0.92 + rr * 0.18;
        aiOffers.push({
          offerId: `FA_AI_${state.season}_${week}_${playerId}_${i}`,
          playerId,
          teamId: `AI_TEAM_${(Math.floor(rr * 30) + 1).toString().padStart(2, "0")}`,
          isUser: false,
          years: userOffer.years,
          aav: Math.round((userOffer.aav * bump) / 50_000) * 50_000,
          createdWeek: week,
          status: "PENDING",
        });
      }

      const nextOffers = [...cleaned, userOffer, ...aiOffers];

      return {
        ...state,
        freeAgency: upsertOffers(
          { ...state, freeAgency: { ...state.freeAgency, nextOfferSeq: state.freeAgency.nextOfferSeq + 1 } },
          playerId,
          nextOffers,
        ),
      };
    }

    case "FA_WITHDRAW_OFFER": {
      const offers = state.freeAgency.offersByPlayerId[action.payload.playerId] ?? [];
      const nextOffers = offers.map((o) => (o.offerId === action.payload.offerId ? { ...o, status: "WITHDRAWN" as const } : o));
      return { ...state, freeAgency: upsertOffers(state, action.payload.playerId, nextOffers) };
    }

    case "FA_ACCEPT_OFFER": {
      const offers = state.freeAgency.offersByPlayerId[action.payload.playerId] ?? [];
      const winner = offers.find((o) => o.offerId === action.payload.offerId);
      if (!winner) return state;

      const nextOffers = offers.map((o) =>
        o.offerId === winner.offerId
          ? { ...o, status: "ACCEPTED" as const }
          : o.status === "PENDING"
            ? { ...o, status: "REJECTED" as const }
            : o,
      );

      const signingsByPlayerId = {
        ...state.freeAgency.signingsByPlayerId,
        [winner.playerId]: { teamId: winner.teamId, years: winner.years, aav: winner.aav },
      };

      const playerTeamOverrides = {
        ...state.playerTeamOverrides,
        [winner.playerId]: winner.teamId,
      };

      const playerContractOverrides = {
        ...state.playerContractOverrides,
        [winner.playerId]: {
          startSeason: state.season,
          endSeason: state.season + Math.max(1, winner.years) - 1,
          aav: winner.aav,
          signingBonus: Math.round(winner.aav * 0.2),
        },
      };

      return {
        ...state,
        playerTeamOverrides,
        playerContractOverrides,
        freeAgency: { ...upsertOffers(state, action.payload.playerId, nextOffers), signingsByPlayerId },
      };
    }

    case "FA_REJECT_OFFER": {
      const offers = state.freeAgency.offersByPlayerId[action.payload.playerId] ?? [];
      const nextOffers = offers.map((o) => (o.offerId === action.payload.offerId ? { ...o, status: "REJECTED" as const } : o));
      return { ...state, freeAgency: upsertOffers(state, action.payload.playerId, nextOffers) };
    }

    case "FA_RESOLVE_WEEK": {
      const nextOffersByPlayerId: Record<string, FreeAgencyOffer[]> = { ...state.freeAgency.offersByPlayerId };
      const nextSignings: Record<string, { teamId: string; years: number; aav: number }> = { ...state.freeAgency.signingsByPlayerId };
      const playerTeamOverrides = { ...state.playerTeamOverrides };
      const playerContractOverrides = { ...state.playerContractOverrides };

      for (const [playerId, offers] of Object.entries(nextOffersByPlayerId)) {
        if (nextSignings[playerId]) continue;
        const pending = offers.filter((o) => o.status === "PENDING");
        if (!pending.length) continue;

        const best = pending.reduce((a, b) => (b.aav > a.aav ? b : a));
        nextOffersByPlayerId[playerId] = offers.map((o) =>
          o.offerId === best.offerId
            ? { ...o, status: "ACCEPTED" as const }
            : o.status === "PENDING"
              ? { ...o, status: "REJECTED" as const }
              : o,
        );

        nextSignings[playerId] = { teamId: best.teamId, years: best.years, aav: best.aav };
        playerTeamOverrides[playerId] = best.teamId;
        playerContractOverrides[playerId] = {
          startSeason: state.season,
          endSeason: state.season + Math.max(1, best.years) - 1,
          aav: best.aav,
          signingBonus: Math.round(best.aav * 0.2),
        };
      }

      return {
        ...state,
        playerTeamOverrides,
        playerContractOverrides,
        freeAgency: { ...state.freeAgency, offersByPlayerId: nextOffersByPlayerId, signingsByPlayerId: nextSignings },
      };
    }

    case "PREDRAFT_TOGGLE_VISIT": {
      const cur = !!state.offseasonData.preDraft.visits[action.payload.prospectId];
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          preDraft: { ...state.offseasonData.preDraft, visits: { ...state.offseasonData.preDraft.visits, [action.payload.prospectId]: !cur } },
        },
      };
    }
    case "PREDRAFT_TOGGLE_WORKOUT": {
      const cur = !!state.offseasonData.preDraft.workouts[action.payload.prospectId];
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          preDraft: {
            ...state.offseasonData.preDraft,
            workouts: { ...state.offseasonData.preDraft.workouts, [action.payload.prospectId]: !cur },
          },
        },
      };
    }
    case "DRAFT_PICK": {
      if (state.draft.picks.length >= 7) return state;
      if (state.draft.withdrawnBoardIds[action.payload.prospectId]) return state;
      const row = getProspectRow(action.payload.prospectId);
      const rank = row ? Number(row["Rank"] ?? 200) : 200;
      const idx = state.rookies.length + 1;
      const playerId = `ROOK_${String(idx).padStart(4, "0")}`;
      const rookie: RookiePlayer = {
        playerId,
        prospectId: action.payload.prospectId,
        name: row ? String(row["Name"] ?? "Rookie") : "Rookie",
        pos: row ? String(row["POS"] ?? "UNK").toUpperCase() : "UNK",
        age: row ? Number(row["Age"] ?? 22) : 22,
        ovr: rookieOvrFromRank(rank),
        dev: rookieDevFromTier(row ?? {}),
        apy: rookieApyFromRank(rank),
      };
      const contract = rookieContractFromApy(state.season + 1, rookie.apy);

      return {
        ...state,
        rookies: [...state.rookies, rookie],
        rookieContracts: { ...state.rookieContracts, [rookie.playerId]: contract },
        draft: {
          ...state.draft,
          picks: [...state.draft.picks, action.payload.prospectId],
          withdrawnBoardIds: { ...state.draft.withdrawnBoardIds, [action.payload.prospectId]: true },
        },
      };
    }
    case "CAMP_SET":
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          camp: { settings: { ...state.offseasonData.camp.settings, ...action.payload.settings } },
        },
      };
    case "CUT_TOGGLE": {
      const cur = state.offseasonData.cutDowns.decisions[action.payload.playerId];
      const next = cur?.keep === false ? { keep: true } : { keep: false };
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          cutDowns: { decisions: { ...state.offseasonData.cutDowns.decisions, [action.payload.playerId]: next } },
        },
      };
    }
    case "INIT_TRAINING_CAMP_ROSTER": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;
      const m = top53Active(teamId);
      return { ...state, rosterMgmt: { ...m, finalized: false } };
    }
    case "AUTO_CUT_TO_53": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;
      const m = top53Active(teamId);
      return { ...state, rosterMgmt: { ...m, finalized: false } };
    }
    case "TOGGLE_ACTIVE": {
      if (state.rosterMgmt.finalized) return state;

      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;

      const allIds = new Set(getUserTeamRosterIds(teamId));
      const pid = action.payload.playerId;
      if (!allIds.has(pid)) return state;

      const active = { ...state.rosterMgmt.active };
      const cuts = { ...state.rosterMgmt.cuts };
      const activeCount = Object.keys(active).length;

      if (active[pid]) {
        delete active[pid];
        cuts[pid] = true;
        return { ...state, rosterMgmt: { active, cuts, finalized: false } };
      }

      if (activeCount >= 53) return state;

      delete cuts[pid];
      active[pid] = true;
      return { ...state, rosterMgmt: { active, cuts, finalized: false } };
    }
    case "FINALIZE_CUTS": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;

      const activeCount = Object.keys(state.rosterMgmt.active).length;
      if (activeCount !== 53) return state;

      const cuts = Object.keys(state.rosterMgmt.cuts);
      for (const pid of cuts) cutPlayerToFreeAgent(pid);

      return {
        ...state,
        rosterMgmt: { ...state.rosterMgmt, finalized: true },
        memoryLog: addMemoryEvent(state, "FINAL_CUTS", { cutCount: cuts.length }),
      };
    }
    case "FIRE_STAFF": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;

      const salary = state.staffBudget.byPersonId[action.payload.personId] ?? 0;
      const c = getPersonnelContract(action.payload.personId);
      const endSeason = state.season;
      const remainingYears = c?.endSeason != null ? Math.max(0, Number(c.endSeason) - endSeason) + 1 : 1;

      const total = buyoutTotal(salary, remainingYears, 0.6);
      const chunks = splitBuyout(total, action.payload.spreadSeasons);
      const seasons = [state.season, state.season + 1];

      expireContract(String(c?.contractId ?? ""), endSeason);
      clearPersonnelTeam(action.payload.personId);

      let next: GameState = refundStaffBudget(state, action.payload.personId);
      next = {
        ...next,
        owner: { ...next.owner, approval: clamp100(next.owner.approval - 8) },
        memoryLog: addMemoryEvent(state, "STAFF_FIRED", {
          ...action.payload,
          salary,
          remainingYears,
          buyoutTotal: total,
          spread: chunks,
        }),
      };

      for (let i = 0; i < chunks.length; i++) {
        const season = seasons[i] ?? state.season;
        next = addBuyoutToSeason(next, season, chunks[i] ?? 0);
        next = addDeadMoney(next, season, chunks[i] ?? 0);
      }

      next = chargeBuyouts(next, state.season);
      return next;
    }
    case "CHARGE_BUYOUTS_FOR_SEASON": {
      return chargeBuyouts(state, action.payload.season);
    }
    case "SET_STARTER": {
      return {
        ...state,
        depthChart: { startersByPos: { ...state.depthChart.startersByPos, [action.payload.slot]: action.payload.playerId } },
      };
    }
    case "RESET_DEPTH_CHART_BEST": {
      return fillDepthChart(state, "RESET");
    }
    case "AUTOFILL_DEPTH_CHART": {
      return fillDepthChart(state, "AUTOFILL");
    }
    case "RECALC_FIRING_METER": {
      return computeAndStoreFiringMeter(state, action.payload.week, action.payload.winPct, action.payload.goalsDelta);
    }
    case "CHECK_FIRING": {
      if (state.firing.fired) return state;
      const week = action.payload.week ?? state.firing.lastWeekComputed ?? 1;
      const next = computeAndStoreFiringMeter(state, week, action.payload.winPct, action.payload.goalsDelta);
      if (next.coach.tenureYear === 1 && action.payload.checkpoint === "WEEKLY") return next;

      const p = action.payload.checkpoint === "WEEKLY" ? next.firing.pWeekly : next.firing.pSeasonEnd;
      const key = `FIRE|S${next.season}|Y${next.coach.tenureYear}|W${week}|${action.payload.checkpoint}`;
      const fire = shouldFireDeterministic({ saveSeed: next.saveSeed, key, p });
      if (!fire) return next;

      return {
        ...next,
        firing: {
          ...next.firing,
          fired: true,
          firedAt: { season: next.season, week, checkpoint: action.payload.checkpoint },
        },
        memoryLog: addMemoryEvent(next, "FIRED", { season: next.season, week, checkpoint: action.payload.checkpoint, p }),
      };
    }
    case "RECALC_OWNER_FINANCIAL": {
      const season = action.payload?.season ?? state.season;
      const financialRating = computeFinancialRating(state, season);
      return {
        ...state,
        owner: { ...state.owner, financialRating, jobSecurity: computeJobSecurity(state.owner.approval, financialRating) },
      };
    }
    case "INIT_PRESEASON_ROTATION": {
      if (!isActive53(state)) return state;
      if (Object.keys(state.preseason.rotation.byPlayerId).length) return state;
      return initRotationFromDepthChart(state);
    }
    case "SET_PLAYER_SNAP": {
      if (!isActive53(state)) return state;
      const pid = action.payload.playerId;
      if (!state.rosterMgmt.active[pid]) return state;
      return {
        ...state,
        preseason: {
          ...state.preseason,
          rotation: { byPlayerId: { ...state.preseason.rotation.byPlayerId, [pid]: clamp100(action.payload.pct) } },
        },
      };
    }
    case "APPLY_PRESEASON_DEV": {
      if (state.preseason.appliedWeeks[action.payload.week]) return state;
      if (!isActive53(state)) return state;

      const { devById, riskById } = preseasonDevFromRotation(state);
      let next = applyPreseasonDevToRookies(state, devById);

      const highRisk = Object.values(riskById).filter((r) => r >= 10).length;
      if (highRisk) next = { ...next, owner: { ...next.owner, approval: clamp100(next.owner.approval - 1) } };

      return {
        ...next,
        preseason: { ...next.preseason, appliedWeeks: { ...next.preseason.appliedWeeks, [action.payload.week]: true } },
        memoryLog: addMemoryEvent(next, "PRESEASON_DEV", { week: action.payload.week, devCount: Object.keys(devById).length, highRisk }),
      };
    }
    case "OWNER_PENALTY": {
      return applyOwnerPenalty(state, action.payload.amount, action.payload.reason);
    }
    case "AUTO_ADVANCE_STAGE_IF_READY": {
      const step = state.offseason.stepId;
      if (step === "TRAINING_CAMP") return { ...state, careerStage: "TRAINING_CAMP" };
      if (step === "PRESEASON") return { ...state, careerStage: "PRESEASON" };
      if (step === "CUT_DOWNS") return state.careerStage === "REGULAR_SEASON" ? state : { ...state, careerStage: "REGULAR_SEASON" };
      return state;
    }
    case "START_GAME": {
      const gameType = action.payload.gameType ?? action.payload.weekType;
      let base = state;
      if (gameType === "PRESEASON") {
        if (!isActive53(state)) return applyOwnerPenalty(state, 1, "Attempted to start preseason without finalizing cutdowns");
        const seeded = gameReducer(state, { type: "INIT_PRESEASON_ROTATION" });
        base = gameReducer(seeded, { type: "APPLY_PRESEASON_DEV", payload: { week: action.payload.week ?? state.hub.preseasonWeek } });
      }
      const teamId = base.acceptedOffer?.teamId;
      if (!teamId) return base;
      return {
        ...base,
        game: initGameSim({
          homeTeamId: teamId,
          awayTeamId: action.payload.opponentTeamId,
          seed: base.saveSeed + (base.hub.preseasonWeek + base.hub.regularSeasonWeek) * 1009,
          weekType: gameType,
          weekNumber: action.payload.weekNumber ?? action.payload.week,
        }),
      };
    }
    case "RESOLVE_PLAY": {
      if (!state.acceptedOffer?.teamId || !state.game.awayTeamId || state.game.homeTeamId === "HOME") return state;
      const stepped = stepPlay(state.game, action.payload.playType);
      const next = { ...state, game: stepped.sim };
      if (!stepped.ended) return next;

      const schedule = state.hub.schedule;
      if (!schedule || !state.game.weekType || !state.game.weekNumber) return next;

      const league = simulateLeagueWeek({
        schedule,
        gameType: state.game.weekType,
        week: state.game.weekNumber,
        userHomeTeamId: state.game.homeTeamId,
        userAwayTeamId: state.game.awayTeamId,
        userScore: { homeScore: state.game.homeScore, awayScore: state.game.awayScore },
        seed: state.saveSeed,
        league: state.league,
      });

      const hub =
        state.game.weekType === "PRESEASON"
          ? { ...state.hub, preseasonWeek: Math.min(PRESEASON_WEEKS, state.hub.preseasonWeek + 1) }
          : { ...state.hub, regularSeasonWeek: Math.min(REGULAR_SEASON_WEEKS, state.hub.regularSeasonWeek + 1) };

      if (state.game.weekType === "PRESEASON") {
        const nextPre = Math.min(PRESEASON_WEEKS, hub.preseasonWeek);
        const finishedPreseason = nextPre >= PRESEASON_WEEKS;
        if (finishedPreseason) {
          return {
            ...next,
            league,
            hub: { ...hub, preseasonWeek: PRESEASON_WEEKS, regularSeasonWeek: 1 },
            offseason: {
              ...next.offseason,
              stepId: "CUT_DOWNS",
              stepsComplete: { ...next.offseason.stepsComplete, PRESEASON: true, CUT_DOWNS: true },
            },
            careerStage: "REGULAR_SEASON",
            game: initGameSim({ homeTeamId: state.game.homeTeamId, awayTeamId: state.game.awayTeamId, seed: state.saveSeed + 777 }),
          };
        }
      }

      let nextState = {
        ...next,
        league,
        hub,
        game: initGameSim({ homeTeamId: state.game.homeTeamId, awayTeamId: state.game.awayTeamId, seed: state.saveSeed + 777 }),
      };
      if (state.game.weekType === "REGULAR_SEASON") {
        nextState = gameReducer(nextState, { type: "CHECK_FIRING", payload: { checkpoint: "WEEKLY", week: state.game.weekNumber } });
        if ((state.game.weekNumber ?? 0) >= REGULAR_SEASON_WEEKS) {
          nextState = gameReducer(nextState, { type: "CHECK_FIRING", payload: { checkpoint: "SEASON_END", week: state.game.weekNumber } });
        }
      }
      return nextState;
    }
    case "EXIT_GAME":
      return {
        ...state,
        game: initGameSim({ homeTeamId: state.acceptedOffer?.teamId ?? "HOME", awayTeamId: "AWAY", seed: state.saveSeed + 555 }),
      };
    case "ADVANCE_WEEK": {
      const schedule = state.hub.schedule;
      const teamId = state.acceptedOffer?.teamId;
      if (!schedule || !teamId) return state;

      const gameType: GameType = state.careerStage === "PRESEASON" ? "PRESEASON" : "REGULAR_SEASON";
      const week = gameType === "PRESEASON" ? state.hub.preseasonWeek : state.hub.regularSeasonWeek;
      const weeks = gameType === "PRESEASON" ? schedule.preseasonWeeks : schedule.regularSeasonWeeks;
      const weekSchedule = weeks.find((w) => w.week === week);
      if (!weekSchedule) return state;

      const matchup = getTeamMatchup(weekSchedule, teamId);
      if (!matchup) return state;

      const league = simulateLeagueWeek({
        schedule,
        gameType,
        week,
        userHomeTeamId: matchup.homeTeamId,
        userAwayTeamId: matchup.awayTeamId,
        userScore: { homeScore: 0, awayScore: 0 },
        seed: state.saveSeed + week * 1013 + (gameType === "PRESEASON" ? 17 : 31),
        league: state.league,
      });

      const hub =
        gameType === "PRESEASON"
          ? { ...state.hub, preseasonWeek: Math.min(PRESEASON_WEEKS, state.hub.preseasonWeek + 1) }
          : { ...state.hub, regularSeasonWeek: Math.min(REGULAR_SEASON_WEEKS, state.hub.regularSeasonWeek + 1) };

      let nextState = { ...state, league, hub };
      if (gameType === "REGULAR_SEASON") {
        nextState = gameReducer(nextState, { type: "CHECK_FIRING", payload: { checkpoint: "WEEKLY", week } });
        if (week >= REGULAR_SEASON_WEEKS) {
          nextState = gameReducer(nextState, { type: "CHECK_FIRING", payload: { checkpoint: "SEASON_END", week } });
        }
      }
      return nextState;
    }
    case "RESET":
      return createInitialState();
    default:
      return state;
  }
}

const STORAGE_KEY = "hc_career_save";

function migrateSave(oldState: Partial<GameState>): Partial<GameState> {
  const teams = getTeams().filter((t) => t.isActive).map((t) => t.teamId);
  const saveSeed = oldState.saveSeed ?? Date.now();
  const league = oldState.league ?? initLeagueState(teams);
  const schedule = oldState.hub?.schedule ?? createSchedule(saveSeed);

  const game =
    oldState.game && (oldState.game as any).clock
      ? ({
          ...oldState.game,
          driveNumber: (oldState.game as any).driveNumber ?? 1,
          playNumberInDrive: (oldState.game as any).playNumberInDrive ?? 0,
          driveLog: (oldState.game as any).driveLog ?? [],
        } as GameSim)
      : initGameSim({
          homeTeamId: oldState.acceptedOffer?.teamId ?? "HOME",
          awayTeamId: (oldState.game as any)?.opponentTeamId ?? "AWAY",
          seed: saveSeed,
        });

  return {
    ...oldState,
    saveSeed,
    careerStage: (oldState.careerStage as CareerStage) ?? "OFFSEASON_HUB",
    orgRoles: oldState.orgRoles ?? {},
    offseason:
      oldState.offseason ??
      ({
        stepId: OFFSEASON_STEPS[0].id,
        completed: { SCOUTING: false, INSTALL: false, MEDIA: false, STAFF: false },
        stepsComplete: {},
      } as OffseasonState),
    offseasonData:
      oldState.offseasonData ??
      ({
        resigning: { decisions: {} },
        combine: { results: [], generated: false },
        tampering: { offers: [] },
        freeAgency: {
          offers: [],
          signings: [],
          rejected: {},
          withdrawn: {},
          capTotal: 82_000_000,
          capUsed: 54_000_000,
          capHitsByPlayerId: {},
        },
        preDraft: { board: [], visits: {}, workouts: {} },
        draft: { board: [], picks: [], completed: false },
        camp: { settings: { intensity: "NORMAL", installFocus: "BALANCED", positionFocus: "NONE" } },
        cutDowns: { decisions: {} },
      } as OffseasonData),
    scheme: oldState.scheme ?? { offense: { style: "BALANCED", tempo: "NORMAL" }, defense: { style: "MIXED", aggression: "NORMAL" } },
    scouting: oldState.scouting ?? { boardSeed: saveSeed ^ 0x9e3779b9 },
    hub: {
      ...(oldState.hub ?? { news: [] }),
      schedule,
      preseasonWeek: oldState.hub?.preseasonWeek ?? 1,
      regularSeasonWeek: oldState.hub?.regularSeasonWeek ?? 1,
    },
    league,
    game,
    draft: oldState.draft ?? { picks: [], withdrawnBoardIds: {} },
    rookies: oldState.rookies ?? [],
    rookieContracts: oldState.rookieContracts ?? {},
    firing: oldState.firing ?? { pWeekly: 0, pSeasonEnd: 0, drivers: [], lastWeekComputed: 0, lastSeasonComputed: 0, fired: false },
  };
}

function loadState(): GameState {
  const initial = createInitialState();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initial;

    const parsed = JSON.parse(saved) as Partial<GameState>;
    const migrated = (parsed.saveVersion ?? 0) < CURRENT_SAVE_VERSION ? migrateSave(parsed) : parsed;

    return {
      ...initial,
      ...migrated,
      coach: { ...initial.coach, ...migrated.coach },
      interviews: { ...initial.interviews, ...migrated.interviews },
      hub: { ...initial.hub, ...migrated.hub },
      staff: { ...initial.staff, ...migrated.staff },
      orgRoles: { ...initial.orgRoles, ...migrated.orgRoles },
      assistantStaff: { ...initial.assistantStaff, ...migrated.assistantStaff },
      firing: { ...initial.firing, ...migrated.firing },
      owner: { ...initial.owner, ...migrated.owner },
      teamFinances: {
        ...initial.teamFinances,
        ...migrated.teamFinances,
        deadMoneyBySeason: { ...initial.teamFinances.deadMoneyBySeason, ...(migrated.teamFinances?.deadMoneyBySeason ?? {}) },
      },
      buyouts: { ...initial.buyouts, ...migrated.buyouts, bySeason: { ...initial.buyouts.bySeason, ...(migrated.buyouts?.bySeason ?? {}) } },
      depthChart: { ...initial.depthChart, ...migrated.depthChart, startersByPos: { ...initial.depthChart.startersByPos, ...(migrated.depthChart?.startersByPos ?? {}) } },
      preseason: {
        ...initial.preseason,
        ...migrated.preseason,
        rotation: { ...initial.preseason.rotation, ...(migrated.preseason?.rotation ?? {}), byPlayerId: { ...initial.preseason.rotation.byPlayerId, ...(migrated.preseason?.rotation?.byPlayerId ?? {}) } },
        appliedWeeks: { ...initial.preseason.appliedWeeks, ...(migrated.preseason?.appliedWeeks ?? {}) },
      },
      offseason: {
        ...initial.offseason,
        ...migrated.offseason,
        completed: { ...initial.offseason.completed, ...migrated.offseason?.completed },
        stepsComplete: { ...initial.offseason.stepsComplete, ...migrated.offseason?.stepsComplete },
      },
      offseasonData: {
        ...initial.offseasonData,
        ...migrated.offseasonData,
        resigning: { ...initial.offseasonData.resigning, ...migrated.offseasonData?.resigning },
        combine: { ...initial.offseasonData.combine, ...migrated.offseasonData?.combine },
        tampering: { ...initial.offseasonData.tampering, ...migrated.offseasonData?.tampering },
        freeAgency: { ...initial.offseasonData.freeAgency, ...migrated.offseasonData?.freeAgency },
        preDraft: { ...initial.offseasonData.preDraft, ...migrated.offseasonData?.preDraft },
        draft: { ...initial.offseasonData.draft, ...migrated.offseasonData?.draft },
        camp: { ...initial.offseasonData.camp, ...migrated.offseasonData?.camp },
        cutDowns: { ...initial.offseasonData.cutDowns, ...migrated.offseasonData?.cutDowns },
      },
      freeAgency: {
        ...initial.freeAgency,
        ...migrated.freeAgency,
        offersByPlayerId: { ...initial.freeAgency.offersByPlayerId, ...(migrated.freeAgency?.offersByPlayerId ?? {}) },
        signingsByPlayerId: { ...initial.freeAgency.signingsByPlayerId, ...(migrated.freeAgency?.signingsByPlayerId ?? {}) },
      },
      league: migrated.league ?? initial.league,
      game: { ...initial.game, ...migrated.game },
      draft: { ...initial.draft, ...migrated.draft },
      rookies: migrated.rookies ?? initial.rookies,
      rookieContracts: { ...initial.rookieContracts, ...migrated.rookieContracts },
      playerTeamOverrides: { ...initial.playerTeamOverrides, ...migrated.playerTeamOverrides },
      playerContractOverrides: { ...initial.playerContractOverrides, ...migrated.playerContractOverrides },
      saveVersion: CURRENT_SAVE_VERSION,
      memoryLog: migrated.memoryLog ?? initial.memoryLog,
    };
  } catch {
    return initial;
  }
}

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  getCurrentTeamMatchup: (gameType: GameType) => { week: number; matchup: ReturnType<typeof getTeamMatchup> } | null;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getCurrentTeamMatchup: GameContextType["getCurrentTeamMatchup"] = (gameType) => {
    const teamId = state.acceptedOffer?.teamId;
    const schedule = state.hub.schedule;
    if (!teamId || !schedule) return null;

    const week = gameType === "PRESEASON" ? state.hub.preseasonWeek : state.hub.regularSeasonWeek;
    const weeks = gameType === "PRESEASON" ? schedule.preseasonWeeks : schedule.regularSeasonWeeks;
    const weekSchedule = weeks.find((item) => item.week === week);
    if (!weekSchedule) return null;

    return { week, matchup: getTeamMatchup(weekSchedule, teamId) };
  };

  return <GameContext.Provider value={{ state, dispatch, getCurrentTeamMatchup }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

export const getDraftClass = () => draftClassJson as Record<string, unknown>[];

export { PRESEASON_WEEKS, REGULAR_SEASON_WEEKS };
