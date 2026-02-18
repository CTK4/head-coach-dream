import React, { createContext, useContext, useEffect, useReducer } from "react";
import draftClassJson from "@/data/draftClass.json";
import {
  clearPersonnelTeam,
  cutPlayerToFreeAgent,
  expireContract,
  getPersonnelById,
  getPersonnelContract,
  getPlayers,
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
import { getRestructureEligibility } from "@/engine/contractMath";
import { autoFillDepthChartGaps } from "@/engine/depthChart";
import { getContractSummaryForPlayer, getEffectiveFreeAgents, getEffectivePlayersByTeam, normalizePos } from "@/engine/rosterOverlay";
import { projectedMarketApy } from "@/engine/marketModel";
import { computeCapLedger } from "@/engine/capLedger";
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
  | "STAFF_CONSTRUCTION"
  | "ROSTER_REVIEW"
  | "RESIGN"
  | "COMBINE"
  | "TAMPERING"
  | "FREE_AGENCY"
  | "PRE_DRAFT"
  | "DRAFT"
  | "TRAINING_CAMP"
  | "PRESEASON"
  | "CUTDOWNS"
  | "REGULAR_SEASON";

export type OffseasonTaskId = "SCOUTING" | "INSTALL" | "MEDIA" | "STAFF";

export type OffseasonState = {
  stepId: OffseasonStepId;
  completed: Record<OffseasonTaskId, boolean>;
  stepsComplete: Partial<Record<OffseasonStepId, boolean>>;
};

export type OffseasonData = {
  resigning: { decisions: Record<string, ResignDecision> };
  tagCenter: { applied?: TagApplied };
  rosterAudit: { cutDesignations: Record<string, "NONE" | "POST_JUNE_1"> };
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

export type TagType = "FRANCHISE_NON_EX" | "FRANCHISE_EX" | "TRANSITION";
export type TagApplied = { playerId: string; type: TagType; cost: number };

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
  "STAFF_CONSTRUCTION",
  "ROSTER_REVIEW",
  "RESIGN",
  "COMBINE",
  "TAMPERING",
  "FREE_AGENCY",
  "PRE_DRAFT",
  "DRAFT",
  "TRAINING_CAMP",
  "PRESEASON",
  "CUTDOWNS",
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

export type TeamFinances = {
  cap: number;
  carryover?: number;
  incentiveTrueUps?: number;
  deadCapThisYear?: number;
  deadCapNextYear?: number;
  baseCommitted: number;
  capCommitted: number;
  capSpace: number;
  cash: number;
  postJune1Sim?: boolean;
};

export type PlayerContractOverride = {
  startSeason: number;
  endSeason: number;
  salaries: number[];
  signingBonus: number;
  prorationBySeason?: Record<number, number>;
};

export type BuyoutLedger = { bySeason: Record<number, number> };
export type DepthChart = {
  startersByPos: Record<string, string | undefined>;
  lockedBySlot: Record<string, true | undefined>;
};
export type PreseasonRotation = { byPlayerId: Record<string, number> };
type TamperingSoftOffer = { years: number; aav: number };
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
  fromTampering?: boolean;
};

export type FreeAgencyUI =
  | { mode: "NONE" }
  | { mode: "PLAYER"; playerId: string }
  | { mode: "MY_OFFERS" };

export type FreeAgencyState = {
  ui: FreeAgencyUI;
  offersByPlayerId: Record<string, FreeAgencyOffer[]>;
  signingsByPlayerId: Record<string, { teamId: string; years: number; aav: number; signingBonus: number }>;
  nextOfferSeq: number;
  bootstrappedFromTampering: boolean;
  resolvesUsedThisPhase: number;
  maxResolvesPerPhase: number;
  activity: Array<{ ts: number; text: string; playerId?: string }>;
  draftByPlayerId: Record<string, { years: number; aav: number }>;
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

export type PlayerAccolades = {
  formerMvp?: boolean;
  formerAllPro?: boolean;
  formerOPOY?: boolean;
  formerDPOY?: boolean;
  proBowls?: number;
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
  tampering: {
    interestByPlayerId: Record<string, number>;
    nameByPlayerId: Record<string, string>;
    shortlistPlayerIds: string[];
    softOffersByPlayerId: Record<string, TamperingSoftOffer>;
    ui: { mode: "NONE" | "PLAYER" | "SHORTLIST"; playerId?: string };
  };
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
  leagueDepthCharts: Record<string, DepthChart>;
  playerAccolades: Record<string, PlayerAccolades>;
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
  finances: TeamFinances;
  league: LeagueState;
  saveSeed: number;
  game: GameSim;
  draft: { picks: string[]; withdrawnBoardIds: Record<string, true> };
  rookies: RookiePlayer[];
  rookieContracts: Record<string, RookieContract>;
  playerTeamOverrides: Record<string, string>;
  playerContractOverrides: Record<string, PlayerContractOverride>;
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
  | { type: "RESIGN_MAKE_OFFER"; payload: { playerId: string; createdFrom: "AUDIT" | "RESIGN_SCREEN" } }
  | { type: "RESIGN_DRAFT_FROM_AUDIT"; payload: { playerId: string } }
  | { type: "RESIGN_REJECT_OFFER"; payload: { playerId: string } }
  | { type: "RESIGN_ACCEPT_OFFER"; payload: { playerId: string } }
  | { type: "RESIGN_CLEAR_DECISION"; payload: { playerId: string } }
  | { type: "TAG_APPLY"; payload: TagApplied }
  | { type: "TAG_REMOVE" }
  | { type: "ROSTERAUDIT_SET_CUT_DESIGNATION"; payload: { playerId: string; designation: "NONE" | "POST_JUNE_1" } }
  | { type: "CONTRACT_RESTRUCTURE_APPLY"; payload: { playerId: string; amount: number } }
  | { type: "COMBINE_GENERATE" }
  | { type: "TAMPERING_ADD_OFFER"; payload: { offer: FreeAgentOffer } }
  | { type: "TAMPERING_INIT" }
  | { type: "TAMPERING_OPEN_PLAYER"; payload: { playerId: string } }
  | { type: "TAMPERING_OPEN_SHORTLIST" }
  | { type: "TAMPERING_CLOSE_MODAL" }
  | { type: "TAMPERING_ADD_SHORTLIST"; payload: { playerId: string } }
  | { type: "TAMPERING_REMOVE_SHORTLIST"; payload: { playerId: string } }
  | { type: "TAMPERING_AUTO_SHORTLIST"; payload: { tab: string } }
  | { type: "TAMPERING_SET_SOFT_OFFER"; payload: { playerId: string; years: number; aav: number } }
  | { type: "TAMPERING_CLEAR_SOFT_OFFER"; payload: { playerId: string } }
  | { type: "FA_INIT_OFFERS" }
  | { type: "FA_REJECT"; payload: { playerId: string } }
  | { type: "FA_WITHDRAW"; payload: { offerId: string } }
  | { type: "FA_SIGN"; payload: { offerId: string } }
  | { type: "FA_OPEN_PLAYER"; payload: { playerId: string } }
  | { type: "FA_OPEN_MY_OFFERS" }
  | { type: "FA_CLOSE_MODAL" }
  | { type: "FA_BOOTSTRAP_FROM_TAMPERING" }
  | { type: "FA_SET_DRAFT"; payload: { playerId: string; years: number; aav: number } }
  | { type: "FA_SUBMIT_OFFER"; payload: { playerId: string } }
  | { type: "FA_CLEAR_USER_OFFER"; payload: { playerId: string } }
  | { type: "FA_RESOLVE_BATCH" }
  | { type: "FA_WITHDRAW_OFFER"; payload: { offerId: string; playerId: string } }
  | { type: "FA_RESOLVE_WEEK"; payload: { week: number } }
  | { type: "FA_ACCEPT_OFFER"; payload: { playerId: string; offerId: string } }
  | { type: "FA_REJECT_OFFER"; payload: { playerId: string; offerId: string } }
  | { type: "CUT_APPLY"; payload: { playerId: string } }
  | { type: "CUT_PLAYER"; payload: { playerId: string } }
  | { type: "TRADE_PLAYER"; payload: { playerId: string } }
  | { type: "TRADE_ACCEPT"; payload: { playerId: string; toTeamId: string; valueTier: string } }
  | { type: "ADVANCE_SEASON" }
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
  | { type: "SET_STARTER"; payload: { slot: string; playerId: string | "AUTO" } }
  | { type: "TOGGLE_DEPTH_SLOT_LOCK"; payload: { slot: string } }
  | { type: "RECALC_OWNER_FINANCIAL"; payload?: { season?: number } }
  | { type: "INIT_PRESEASON_ROTATION" }
  | { type: "SET_PLAYER_SNAP"; payload: { playerId: string; pct: number } }
  | { type: "APPLY_PRESEASON_DEV"; payload: { week: number } }
  | { type: "RESET_DEPTH_CHART_BEST" }
  | { type: "DEPTHCHART_RESET_TO_BEST" }
  | { type: "AUTOFILL_DEPTH_CHART" }
  | { type: "RECALC_FIRING_METER"; payload: { week: number; winPct?: number; goalsDelta?: number } }
  | { type: "CHECK_FIRING"; payload: { checkpoint: "WEEKLY" | "SEASON_END"; week?: number; winPct?: number; goalsDelta?: number } }
  | { type: "FINANCES_PATCH"; payload: Partial<TeamFinances> }
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

  const base: GameState = {
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
      tagCenter: { applied: undefined },
      rosterAudit: { cutDesignations: {} },
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
    tampering: { interestByPlayerId: {}, nameByPlayerId: {}, shortlistPlayerIds: [], softOffersByPlayerId: {}, ui: { mode: "NONE" } },
    freeAgency: {
      ui: { mode: "NONE" },
      offersByPlayerId: {},
      signingsByPlayerId: {},
      nextOfferSeq: 1,
      bootstrappedFromTampering: false,
      resolvesUsedThisPhase: 0,
      maxResolvesPerPhase: 5,
      activity: [],
      draftByPlayerId: {},
    },
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
    depthChart: { startersByPos: {}, lockedBySlot: {} },
    leagueDepthCharts: {},
    playerAccolades: {},
    preseason: { rotation: { byPlayerId: {} }, appliedWeeks: {} },
    staff: {},
    orgRoles: {},
    assistantStaff: createInitialAssistantStaff(),
    scheme: { offense: { style: "BALANCED", tempo: "NORMAL" }, defense: { style: "MIXED", aggression: "NORMAL" } },
    scouting: { boardSeed: saveSeed ^ 0x9e3779b9 },
    hub: { news: [], preseasonWeek: 1, regularSeasonWeek: 1, schedule: createSchedule(saveSeed) },
    finances: {
      cap: 250_000_000,
      carryover: 0,
      incentiveTrueUps: 0,
      deadCapThisYear: 0,
      deadCapNextYear: 0,
      baseCommitted: 0,
      capCommitted: 0,
      capSpace: 250_000_000,
      cash: 150_000_000,
      postJune1Sim: false,
    },
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

  return ensureAccolades(bootstrapAccolades(base));
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

type ResignOffer = {
  years: number;
  apy: number;
  guaranteesPct: number;
  discountPct: number;
  createdFrom?: "AUDIT" | "RESIGN_SCREEN";
  rejectedCount?: number;
};

function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seededFloat01(seed: number) {
  let x = seed >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return ((x >>> 0) % 1_000_000) / 1_000_000;
}

function discountPctForOffer(state: GameState, playerId: string) {
  const s = hashSeed(`${state.saveSeed}|DISC|${playerId}`);
  const r = seededFloat01(s);
  const pct = 0.05 + r * 0.07;
  return Math.round(pct * 1000) / 1000;
}

function buildResignOffer(state: GameState, playerId: string, createdFrom: ResignOffer["createdFrom"]) {
  const p: any = getPlayers().find((x: any) => String(x.playerId) === String(playerId));
  if (!p) return null;

  const pos = normalizePos(String(p.pos ?? "UNK"));
  const ovr = Number(p.overall ?? 0);
  const age = Number(p.age ?? 26);

  const market = projectedMarketApy(pos, ovr, age);

  const existing = state.offseasonData.resigning.decisions?.[playerId] as any;
  const rejectedCount = Number(existing?.offer?.rejectedCount ?? 0);

  const baseDisc = discountPctForOffer(state, String(playerId));
  const disc = Math.max(0, baseDisc - rejectedCount * 0.02);
  const bump = 1 + rejectedCount * 0.03;

  const apy = Math.round((market * bump * (1 - disc)) / 50_000) * 50_000;
  const years = pos === "QB" ? 4 : pos === "WR" || pos === "EDGE" || pos === "CB" ? 3 : 2;
  const guaranteesPct = pos === "QB" ? 0.62 : pos === "WR" || pos === "EDGE" || pos === "CB" ? 0.55 : 0.48;

  return {
    years,
    apy,
    guaranteesPct,
    discountPct: disc,
    createdFrom,
    rejectedCount,
  } satisfies ResignOffer;
}

function contractOverrideFromOffer(state: GameState, offer: ResignOffer): PlayerContractOverride {
  const years = Math.max(2, Math.min(5, offer.years));
  const totalCash = offer.apy * years;

  const signingBonus = Math.round((totalCash * offer.guaranteesPct * 0.40) / 50_000) * 50_000;
  const remaining = Math.max(0, totalCash - signingBonus);

  const salaries: number[] = [];
  for (let i = 0; i < years; i++) {
    const step = 1 + i * 0.03;
    salaries.push(Math.round(((remaining / years) * step) / 50_000) * 50_000);
  }
  const sum = salaries.reduce((a, b) => a + b, 0);
  const drift = remaining - sum;
  salaries[salaries.length - 1] = Math.round((salaries[salaries.length - 1] + drift) / 50_000) * 50_000;

  return {
    startSeason: state.season + 1,
    endSeason: state.season + years,
    salaries,
    signingBonus,
  };
}

function isNewsworthyRecommit(p: any) {
  return Number(p?.overall ?? 0) >= 90;
}

function clearResignOffers(state: GameState): GameState {
  const decisions = { ...(state.offseasonData?.resigning?.decisions ?? {}) };
  const hadAny = Object.keys(decisions).length > 0;
  if (!hadAny) return state;
  return {
    ...state,
    offseasonData: {
      ...state.offseasonData,
      resigning: { ...state.offseasonData.resigning, decisions: {} },
    },
  };
}

function faPush(state: GameState, text: string, playerId?: string): GameState {
  const ts = Date.now();
  const activity = [{ ts, text, playerId }, ...state.freeAgency.activity].slice(0, 80);
  return { ...state, freeAgency: { ...state.freeAgency, activity } };
}

function countPendingUserOffers(state: GameState) {
  let n = 0;
  for (const offers of Object.values(state.freeAgency.offersByPlayerId)) {
    for (const o of offers) if (o.isUser && o.status === "PENDING") n++;
  }
  return n;
}

function getAllTeamIds(): string[] {
  try {
    const t: any[] = getTeams() as any[];
    return t.map((x) => String(x.teamId));
  } catch {
    return [];
  }
}

function teamNeedsScore(state: GameState, teamId: string, posRaw: string) {
  const pos = normalizePos(posRaw);
  const roster = getEffectivePlayersByTeam(state, teamId);
  const count = roster.filter((p: any) => normalizePos(String(p.pos ?? "")) === pos).length;

  const target: Record<string, number> = { QB: 3, RB: 3, WR: 5, TE: 3, OL: 7, DL: 4, EDGE: 3, LB: 3, CB: 4, S: 3, K: 1, P: 1 };
  const t = target[pos] ?? 3;
  const short = Math.max(0, t - count);
  return clamp01(short / t);
}

function cpuOfferParams(state: GameState, teamId: string, p: any) {
  const pid = String(p.playerId);
  const pos = normalizePos(String(p.pos ?? "UNK"));
  const ovr = Number(p.overall ?? 0);
  const age = Number(p.age ?? 26);
  const market = projectedMarketApy(pos, ovr, age);

  const need = teamNeedsScore(state, teamId, pos);
  const noise = detRand(state.saveSeed, `CPU_FA|S${state.season}|T${teamId}|P${pid}`);

  const mult = 0.88 + need * 0.2 + noise * 0.14;
  const yearsBase = pos === "QB" ? 3 : pos === "WR" || pos === "EDGE" || pos === "CB" ? 3 : 2;
  const years = Math.max(1, Math.min(5, yearsBase + (noise > 0.75 ? 1 : 0)));

  const aav = Math.max(750_000, Math.round((market * mult) / 50_000) * 50_000);
  return { years, aav };
}

function cpuGenerateOffers(state: GameState, offerLimitPerResolve = 40): GameState {
  if (state.careerStage !== "FREE_AGENCY") return state;

  const teamIds = getAllTeamIds();
  const userTeamId = String(state.acceptedOffer?.teamId ?? "");
  const cpuTeams = teamIds.filter((t) => t && t !== userTeamId);

  const fa = getEffectiveFreeAgents(state)
    .map((p: any) => ({ p, id: String(p.playerId), pos: normalizePos(String(p.pos ?? "UNK")), ovr: Number(p.overall ?? 0), age: Number(p.age ?? 26) }))
    .filter((x) => !state.freeAgency.signingsByPlayerId[x.id])
    .sort((a, b) => b.ovr - a.ovr);

  let next = state;
  let created = 0;

  const offerCounts: Record<string, number> = {};
  for (const [pid, offers] of Object.entries(state.freeAgency.offersByPlayerId)) offerCounts[pid] = offers.filter((o) => o.status === "PENDING").length;

  const orderedFa = fa
    .slice(0, 140)
    .sort((a, b) => (offerCounts[b.id] ?? 0) - (offerCounts[a.id] ?? 0) || b.ovr - a.ovr);

  for (const teamId of cpuTeams) {
    if (created >= offerLimitPerResolve) break;

    const needs = ["QB", "RB", "WR", "TE", "DL", "EDGE", "LB", "CB", "S", "K", "P"]
      .map((pos) => ({ pos, s: teamNeedsScore(state, teamId, pos) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);

    const targets = orderedFa.filter((x) => needs.some((n) => n.s > 0.15 && n.pos === x.pos)).slice(0, 4);
    const pick = targets.length
      ? targets[Math.floor(detRand(state.saveSeed, `CPU_PICK|${teamId}|${state.freeAgency.resolvesUsedThisPhase}`) * targets.length)]
      : orderedFa[0];
    if (!pick) continue;

    const pid = pick.id;
    const existing = next.freeAgency.offersByPlayerId[pid] ?? [];
    const alreadyHasPendingFromTeam = existing.some((o) => !o.isUser && o.teamId === teamId && o.status === "PENDING");
    if (alreadyHasPendingFromTeam) continue;

    const { years, aav } = cpuOfferParams(next, teamId, pick.p);

    const offerId = makeOfferId(next);
    const cpuOffer: FreeAgencyOffer = {
      offerId,
      playerId: pid,
      teamId,
      isUser: false,
      years,
      aav,
      createdWeek: next.hub.regularSeasonWeek ?? 1,
      status: "PENDING",
    };

    next = {
      ...next,
      freeAgency: upsertOffers({ ...next, freeAgency: { ...next.freeAgency, nextOfferSeq: next.freeAgency.nextOfferSeq + 1 } }, pid, [...existing, cpuOffer]),
    };
    created++;
  }

  const extraTeams = cpuTeams.slice(0, 10);
  for (const teamId of extraTeams) {
    if (created >= offerLimitPerResolve) break;
    const candidates = orderedFa.slice(0, 30);
    const idx = Math.floor(detRand(state.saveSeed, `CPU_SPRINKLE|${teamId}|R${state.freeAgency.resolvesUsedThisPhase}`) * candidates.length);
    const pick = candidates[idx];
    if (!pick) continue;

    const pid = pick.id;
    const existing = next.freeAgency.offersByPlayerId[pid] ?? [];
    if (existing.some((o) => !o.isUser && o.teamId === teamId && o.status === "PENDING")) continue;

    const { years, aav } = cpuOfferParams(next, teamId, pick.p);
    const offerId = makeOfferId(next);
    const cpuOffer: FreeAgencyOffer = { offerId, playerId: pid, teamId, isUser: false, years, aav, createdWeek: next.hub.regularSeasonWeek ?? 1, status: "PENDING" };

    next = {
      ...next,
      freeAgency: upsertOffers({ ...next, freeAgency: { ...next.freeAgency, nextOfferSeq: next.freeAgency.nextOfferSeq + 1 } }, pid, [...existing, cpuOffer]),
    };
    created++;
  }

  return next;
}

function capSpaceForTeam(state: GameState, teamId: string) {
  try {
    return computeCapLedger(state, teamId).capSpace;
  } catch {
    return state.finances.capSpace;
  }
}

export function tradeCapDelta(state: GameState, fromTeamId: string, playerId: string, toTeamId: string) {
  const before = capSpaceForTeam(state, fromTeamId);
  const sim = { ...state, playerTeamOverrides: { ...state.playerTeamOverrides, [String(playerId)]: String(toTeamId) } };
  const after = capSpaceForTeam(sim, fromTeamId);
  return after - before;
}

function cpuWithdrawOffers(state: GameState): GameState {
  if (state.careerStage !== "FREE_AGENCY") return state;

  const userTeamId = String(state.acceptedOffer?.teamId ?? "");
  const teamIds = getAllTeamIds().filter((t) => t && t !== userTeamId);
  const playerIndex: Record<string, any> = {};
  for (const p of getPlayers() as any[]) playerIndex[String(p.playerId)] = p;

  const offersByPlayerId: Record<string, FreeAgencyOffer[]> = { ...state.freeAgency.offersByPlayerId };
  let changed = false;

  for (const [playerId, offers] of Object.entries(offersByPlayerId)) {
    const pos = normalizePos(String(playerIndex[String(playerId)]?.pos ?? "UNK"));
    let nextOffers = offers;

    for (const teamId of teamIds) {
      const need = teamNeedsScore(state, teamId, pos);
      const cap = capSpaceForTeam(state, teamId);
      const shouldWithdraw = need <= 0.1 || cap < 0;
      if (!shouldWithdraw) continue;

      const had = nextOffers.some((o) => !o.isUser && o.teamId === teamId && o.status === "PENDING");
      if (!had) continue;

      nextOffers = nextOffers.map((o) => (!o.isUser && o.teamId === teamId && o.status === "PENDING" ? { ...o, status: "REJECTED" as const } : o));
      changed = true;
    }

    if (nextOffers !== offers) offersByPlayerId[playerId] = nextOffers;
  }

  return changed ? { ...state, freeAgency: { ...state.freeAgency, offersByPlayerId } } : state;
}

function needsBoostForPos(state: GameState, posRaw: string) {
  const pos = normalizePos(posRaw);
  const roster = getEffectivePlayersByTeam(state, state.acceptedOffer?.teamId ?? "");
  const count = roster.filter((p: any) => normalizePos(String(p.pos ?? "")) === pos).length;
  const target: Record<string, number> = { QB: 3, RB: 3, WR: 5, TE: 3, OL: 7, DL: 4, EDGE: 3, LB: 3, CB: 4, S: 3, K: 1, P: 1 };
  const t = target[pos] ?? 3;
  const short = Math.max(0, t - count);
  return clamp01(short / t) * 0.18;
}

function computeFaInterest(state: GameState, p: any) {
  const rep = state.coach.reputation;
  const pos = normalizePos(String(p.pos ?? "UNK"));
  const ovr = Number(p.overall ?? 0);
  const age = Number(p.age ?? 26);

  let base = 0.35 + clamp01((ovr - 70) / 35) * 0.35 + clamp01((30 - age) / 10) * 0.10;
  if (rep) {
    const off = ["QB", "RB", "WR", "TE", "OL"].includes(pos) ? clamp01((rep.offCred - 50) / 700) : 0;
    const def = ["DL", "EDGE", "LB", "CB", "S"].includes(pos) ? clamp01((rep.defCred - 50) / 650) : 0;
    base += off + def;
    base += clamp01((rep.playerRespect - 55) / 400) * 0.08;
    base += clamp01((rep.mediaRep - 55) / 450) * 0.05;
  }
  base += needsBoostForPos(state, pos);
  base += detRand(state.saveSeed, `FA_INT|S${state.season}|P${p.playerId}`) * 0.10;
  return clamp01(base);
}

function resetFaPhase(state: GameState): GameState {
  return {
    ...state,
    freeAgency: { ...state.freeAgency, resolvesUsedThisPhase: 0, activity: [], ui: { mode: "NONE" } },
  };
}

function makeEscalatingSalaries(totalCash: number, years: number, annualGrowth = 0.06): number[] {
  const y = Math.max(1, years);
  const g = Math.max(0, annualGrowth);
  const weights = Array.from({ length: y }, (_, i) => Math.pow(1 + g, i));
  const sum = weights.reduce((a, b) => a + b, 0);
  const base = totalCash / sum;
  return weights.map((w) => Math.round((base * w) / 50_000) * 50_000);
}

function proration(o: PlayerContractOverride, season: number): number {
  if (o.prorationBySeason?.[season] != null) return moneyRound(o.prorationBySeason[season] ?? 0);
  const years = Math.max(1, o.endSeason - o.startSeason + 1);
  return moneyRound(o.signingBonus / years);
}

function capHitForOverride(o: PlayerContractOverride, season: number): number {
  const idx = season - o.startSeason;
  const salary = o.salaries[Math.max(0, Math.min(o.salaries.length - 1, idx))] ?? 0;
  return moneyRound(salary + proration(o, season));
}

function computeUserCapCommitted(state: GameState): number {
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return state.finances.baseCommitted;
  let sum = state.finances.baseCommitted;
  for (const [pid, o] of Object.entries(state.playerContractOverrides)) {
    const t = state.playerTeamOverrides[pid];
    if (String(t) !== String(teamId)) continue;
    if (state.season > o.endSeason) continue;
    sum += capHitForOverride(o, state.season);
  }
  return sum;
}

function applyFinances(state: GameState, patch: Partial<TeamFinances> = {}): GameState {
  const next = { ...state, finances: { ...state.finances, ...patch } };
  const capCommitted = computeUserCapCommitted(next);
  const capSpace = Math.round((next.finances.cap - capCommitted) / 50_000) * 50_000;
  return { ...next, finances: { ...next.finances, capCommitted, capSpace } };
}

function defaultNews(season: number): string[] {
  return [
    `League announces ${season} salary cap at $250M`,
    "Coaching staffs begin offseason installs",
    "Front offices prepare for free agency",
    "Draft prospects begin pro day circuit",
  ];
}

function pushNews(state: GameState, line: string): GameState {
  const news = [line, ...(state.hub.news ?? [])].slice(0, 50);
  return { ...state, hub: { ...state.hub, news } };
}

function ensureAccolades(state: GameState): GameState {
  return { ...state, playerAccolades: state.playerAccolades ?? {} };
}

function bootstrapAccolades(state: GameState): GameState {
  if (state.playerAccolades && Object.keys(state.playerAccolades).length) return state;

  const ps: any[] = getPlayers();
  const byOvr = [...ps].sort((a, b) => Number(b.overall ?? 0) - Number(a.overall ?? 0));
  const qbs = byOvr.filter((p) => normalizePos(String(p.pos ?? "UNK")) === "QB");
  const topQB = qbs[0];

  const map: Record<string, PlayerAccolades> = {};
  if (topQB) map[String(topQB.playerId)] = { ...(map[String(topQB.playerId)] ?? {}), formerMvp: true };

  for (const p of byOvr.slice(0, 12)) {
    const id = String(p.playerId);
    map[id] = { ...(map[id] ?? {}), formerAllPro: true, proBowls: 1 };
  }

  const topO = byOvr.find((p) => normalizePos(String(p.pos ?? "UNK")) !== "QB");
  if (topO) map[String(topO.playerId)] = { ...(map[String(topO.playerId)] ?? {}), formerOPOY: true };

  const def = byOvr.find((p) => ["CB", "S", "LB", "EDGE", "DL"].includes(normalizePos(String(p.pos ?? "UNK"))));
  if (def) map[String(def.playerId)] = { ...(map[String(def.playerId)] ?? {}), formerDPOY: true };

  return { ...state, playerAccolades: map };
}

function accoladesFor(playerId: string): PlayerAccolades {
  const p: any = getPlayers().find((x: any) => String(x.playerId) === String(playerId));
  const fromData: PlayerAccolades =
    (p?.accolades as PlayerAccolades) ??
    ({
      formerMvp: p?.formerMvp,
      formerAllPro: p?.formerAllPro,
      formerOPOY: p?.formerOPOY,
      formerDPOY: p?.formerDPOY,
      proBowls: p?.proBowls,
    } as any);
  return fromData ?? {};
}

const STARTER_SLOTS = new Set(["QB1", "RB1", "WR1", "TE1", "DL1", "EDGE1", "LB1", "CB1", "S1"]);
const ALLOWED_NEWS_POS = new Set(["QB", "RB", "WR", "TE", "EDGE", "DL", "LB", "CB", "S"]);

function accoladesMerged(state: GameState, playerId: string): PlayerAccolades {
  return { ...(state.playerAccolades?.[String(playerId)] ?? {}), ...accoladesFor(playerId) };
}

function isLegendForNews(state: GameState, playerId: string): boolean {
  const p: any = getPlayers().find((x: any) => String(x.playerId) === String(playerId));
  if (!p) return false;
  const pos = normalizePos(String(p.pos ?? "UNK"));
  if (!ALLOWED_NEWS_POS.has(pos)) return false;

  const a = accoladesMerged(state, playerId);
  const pb = Number(a.proBowls ?? 0);
  if (a.formerMvp) return true;
  if (a.formerOPOY || a.formerDPOY) return true;
  if (a.formerAllPro && pb >= 2) return true;
  if (pb >= 5) return true;
  return false;
}

function playerNamePos(playerId: string) {
  const p: any = getPlayers().find((x: any) => String(x.playerId) === String(playerId));
  return { name: String(p?.fullName ?? "Unknown"), pos: normalizePos(String(p?.pos ?? "UNK")) };
}

function teamLabel(teamId: string) {
  const t: any = getTeams()?.find((x: any) => String(x.teamId) === String(teamId));
  return String(t?.name ?? t?.city ?? t?.abbr ?? teamId);
}

function slotIndex(slot: string) {
  const m = slot.match(/(\d+)$/);
  return m ? Number(m[1]) : 1;
}

function isQBChangeNewsworthy(state: GameState, prevQB1: string | null, nextQB1: string | null): boolean {
  if (!prevQB1 || !nextQB1 || prevQB1 === nextQB1) return false;
  return isLegendForNews(state, prevQB1) || isLegendForNews(state, nextQB1);
}

function pushMajorDepthNews(
  state: GameState,
  teamId: string,
  prevSlots: Record<string, string | undefined>,
  nextSlots: Record<string, string | undefined>,
): GameState {
  const prevByPlayer = new Map<string, string>();
  const nextByPlayer = new Map<string, string>();
  for (const [s, pid] of Object.entries(prevSlots)) if (pid) prevByPlayer.set(String(pid), s);
  for (const [s, pid] of Object.entries(nextSlots)) if (pid) nextByPlayer.set(String(pid), s);

  const lines: string[] = [];
  const prevQB1 = prevSlots["QB1"] ? String(prevSlots["QB1"]) : null;
  const nextQB1 = nextSlots["QB1"] ? String(nextSlots["QB1"]) : null;

  if (isQBChangeNewsworthy(state, prevQB1, nextQB1)) {
    const a = playerNamePos(prevQB1!);
    const b = playerNamePos(nextQB1!);
    lines.push(`${teamLabel(teamId)}: QB change — ${a.name} → ${b.name}`);
  }

  for (const [pid, prevSlot] of prevByPlayer.entries()) {
    if (!STARTER_SLOTS.has(prevSlot)) continue;
    if (!isLegendForNews(state, pid)) continue;

    const nextSlot = nextByPlayer.get(pid) ?? null;
    const benched =
      !nextSlot ||
      (!STARTER_SLOTS.has(nextSlot) && slotIndex(nextSlot) > 1) ||
      (STARTER_SLOTS.has(prevSlot) && STARTER_SLOTS.has(nextSlot) && prevSlot !== nextSlot && slotIndex(nextSlot) > slotIndex(prevSlot));

    if (!benched) continue;
    if (prevSlot === "QB1" && prevQB1 && nextQB1 && prevQB1 !== nextQB1) continue;

    const p = playerNamePos(pid);
    lines.push(`${teamLabel(teamId)}: ${p.pos} ${p.name} benched (${prevSlot} → ${nextSlot ?? "BENCH"})`);
  }

  if (!lines.length) return state;
  return pushNews(state, `Lineup shocker: ${lines[0]}`);
}

function bestDepthForTeam(state: GameState, teamId: string, prev?: DepthChart): DepthChart {
  const roster = getEffectivePlayersByTeam(state, teamId) as any[];
  const sorted = [...roster].sort((a, b) => Number(b.overall ?? 0) - Number(a.overall ?? 0));
  const used = new Set<string>();
  const slots: Record<string, string | undefined> = {};

  const pick = (slot: string, posList: string[]) => {
    const p = sorted.find((r) => posList.includes(normalizePos(String(r.pos ?? "UNK"))) && !used.has(String(r.playerId)));
    if (!p) return;
    slots[slot] = String(p.playerId);
    used.add(String(p.playerId));
  };

  pick("QB1", ["QB"]);
  pick("RB1", ["RB"]);
  pick("WR1", ["WR"]);
  pick("TE1", ["TE"]);
  pick("DL1", ["DL"]);
  pick("EDGE1", ["EDGE"]);
  pick("LB1", ["LB"]);
  pick("CB1", ["CB"]);
  pick("S1", ["S"]);

  return { startersByPos: { ...(prev?.startersByPos ?? {}), ...slots }, lockedBySlot: {} };
}

function recomputeLeagueDepthAndNews(state: GameState): GameState {
  const teams = getTeams() ?? [];
  const userTeamId = state.acceptedOffer?.teamId ? String(state.acceptedOffer.teamId) : null;

  let next = state;
  const leagueDepthCharts = { ...(state.leagueDepthCharts ?? {}) };

  for (const t of teams) {
    const teamId = String((t as any).teamId);
    if (userTeamId && teamId === userTeamId) continue;

    const prev = leagueDepthCharts[teamId] ?? { startersByPos: {}, lockedBySlot: {} };
    const computed = bestDepthForTeam(state, teamId, prev);

    leagueDepthCharts[teamId] = computed;
    next = pushMajorDepthNews(next, teamId, prev.startersByPos, computed.startersByPos);
  }

  return { ...next, leagueDepthCharts };
}

function seedDepthForTeam(state: GameState): GameState {
  const teamId = state.acceptedOffer?.teamId ? String(state.acceptedOffer.teamId) : null;
  if (!teamId) return state;

  const prevSlots = state.depthChart.startersByPos;
  const cleared = { ...state.depthChart, lockedBySlot: {} };
  const filled = { ...cleared, startersByPos: autoFillDepthChartGaps({ ...state, depthChart: cleared }, teamId) };

  let next = { ...state, depthChart: filled };
  next = pushMajorDepthNews(next, teamId, prevSlots, filled.startersByPos);
  next = recomputeLeagueDepthAndNews(next);
  return next;
}

function shouldRecomputeDepthOnTransition(prev: CareerStage, next: CareerStage) {
  if (prev === "FREE_AGENCY" && next === "PRE_DRAFT") return true;
  if (prev === "DRAFT" && next === "TRAINING_CAMP") return true;
  if (prev !== "PRESEASON" && next === "PRESEASON") return true;
  return false;
}

function shouldRecomputeDepthOnWeekly(_state: GameState) {
  return false;
}

function seasonRollover(state: GameState): GameState {
  const teamId = state.acceptedOffer?.teamId;
  const nextSeason = state.season + 1;

  const playerTeamOverrides = { ...state.playerTeamOverrides };
  const playerContractOverrides = { ...state.playerContractOverrides };

  for (const [pid, o] of Object.entries(playerContractOverrides)) {
    if (nextSeason > o.endSeason) {
      playerTeamOverrides[pid] = "FREE_AGENT";
      delete playerContractOverrides[pid];
    }
  }

  let cash = state.finances.cash;
  if (teamId) {
    for (const [pid, o] of Object.entries(playerContractOverrides)) {
      if (String(playerTeamOverrides[pid]) !== String(teamId)) continue;
      const idx = nextSeason - o.startSeason;
      const salary = o.salaries[Math.max(0, Math.min(o.salaries.length - 1, idx))] ?? 0;
      cash -= salary;
    }
  }

  const schedule = createSchedule(state.saveSeed ^ nextSeason);

  return applyFinances({
    ...state,
    season: nextSeason,
    week: 1,
    careerStage: "OFFSEASON_HUB",
    hub: {
      ...state.hub,
      news: defaultNews(nextSeason),
      preseasonWeek: 1,
      regularSeasonWeek: 1,
      schedule,
    },
    tampering: { interestByPlayerId: {}, nameByPlayerId: {}, shortlistPlayerIds: [], softOffersByPlayerId: {}, ui: { mode: "NONE" } },
    freeAgency: {
      ui: { mode: "NONE" },
      offersByPlayerId: {},
      signingsByPlayerId: {},
      nextOfferSeq: 1,
      bootstrappedFromTampering: false,
      resolvesUsedThisPhase: 0,
      maxResolvesPerPhase: 5,
      activity: [],
      draftByPlayerId: {},
    },
    playerTeamOverrides,
    playerContractOverrides,
    finances: { ...state.finances, cash },
  });
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

  const locked = state.depthChart.lockedBySlot ?? {};
  const starters: Record<string, string | undefined> = {};
  const used = new Set<string>();

  for (const rule of SLOT_RULES) {
    const cur = state.depthChart.startersByPos[rule.slot];
    if (cur && activeSet.has(String(cur)) && locked[rule.slot]) {
      starters[rule.slot] = cur;
      used.add(String(cur));
    } else if (mode !== "RESET") {
      if (cur && activeSet.has(String(cur)) && !locked[rule.slot]) {
        starters[rule.slot] = cur;
        used.add(String(cur));
      }
    }
  }

  for (const rule of SLOT_RULES) {
    if (locked[rule.slot]) continue;
    if (mode === "AUTOFILL" && starters[rule.slot]) continue;

    const eligible = roster.filter((p) => rule.pos.includes(p.pos));
    const pick = eligible.find((p) => !used.has(p.id)) ?? eligible[0];
    if (!pick) continue;
    starters[rule.slot] = pick.id;
    used.add(pick.id);
  }

  return { ...state, depthChart: { ...state.depthChart, startersByPos: starters } };
}

function isPreseasonStage(stage: CareerStage | undefined) {
  return stage === "PRESEASON";
}

function clearDepthLocksIfEnteringPreseason(prevStage: CareerStage | undefined, nextStage: CareerStage | undefined, state: GameState) {
  if (!isPreseasonStage(prevStage) && isPreseasonStage(nextStage)) {
    return { ...state, depthChart: { ...state.depthChart, lockedBySlot: {} } };
  }
  return state;
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
    case "SET_CAREER_STAGE": {
      const prevStage = state.careerStage;
      const nextStage = action.payload;
      const next = { ...state, careerStage: nextStage };
      return clearDepthLocksIfEnteringPreseason(prevStage, nextStage, next);
    }
    case "ADVANCE_CAREER_STAGE": {
      const prevStage = state.careerStage;
      const nextStage = nextCareerStage(state.careerStage);
      let next: GameState = { ...state, careerStage: nextStage };
      next = clearDepthLocksIfEnteringPreseason(prevStage, nextStage, next);
      if (prevStage !== "PRESEASON" && nextStage === "PRESEASON") next = seedDepthForTeam(next);
      if (shouldRecomputeDepthOnTransition(prevStage, nextStage)) next = recomputeLeagueDepthAndNews(next);
      if (nextStage === "FREE_AGENCY") next = resetFaPhase(clearResignOffers(next));
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
      const nextStep = nextOffseasonStepId(cur);
      if (!nextStep) return state;

      const prevStage = state.careerStage;
      const stage: CareerStage =
        nextStep === "FREE_AGENCY"
          ? "FREE_AGENCY"
          : nextStep === "TRAINING_CAMP"
          ? "TRAINING_CAMP"
          : nextStep === "PRESEASON"
            ? "PRESEASON"
            : nextStep === "CUT_DOWNS"
              ? "OFFSEASON_HUB"
              : state.careerStage;

      let next = { ...state, careerStage: stage, offseason: { ...state.offseason, stepId: nextStep } };
      next = clearDepthLocksIfEnteringPreseason(prevStage, stage, next);
      if (prevStage !== "PRESEASON" && stage === "PRESEASON") next = seedDepthForTeam(next);
      if (shouldRecomputeDepthOnTransition(prevStage, stage)) next = recomputeLeagueDepthAndNews(next);
      if (stage === "FREE_AGENCY") next = resetFaPhase(clearResignOffers(next));
      return next;
    }
    case "RESIGN_SET_DECISION":
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          resigning: { decisions: { ...state.offseasonData.resigning.decisions, [action.payload.playerId]: action.payload.decision } },
        },
      };
    case "RESIGN_DRAFT_FROM_AUDIT": {
      const { playerId } = action.payload;
      const offer = buildResignOffer(state, String(playerId), "AUDIT");
      if (!offer) return state;
      const decisions = { ...state.offseasonData.resigning.decisions } as any;
      decisions[String(playerId)] = { action: "RESIGN", offer };
      return { ...state, offseasonData: { ...state.offseasonData, resigning: { decisions } } };
    }
    case "RESIGN_MAKE_OFFER": {
      const { playerId, createdFrom } = action.payload;
      const offer = buildResignOffer(state, String(playerId), createdFrom);
      if (!offer) return state;

      const decisions = { ...state.offseasonData.resigning.decisions } as any;
      decisions[String(playerId)] = { action: "RESIGN", offer };

      return { ...state, offseasonData: { ...state.offseasonData, resigning: { decisions } } };
    }
    case "RESIGN_REJECT_OFFER": {
      const { playerId } = action.payload;
      const cur: any = state.offseasonData.resigning.decisions?.[String(playerId)];
      if (!cur?.offer) return state;

      const offer = { ...(cur.offer as ResignOffer), rejectedCount: Number(cur.offer.rejectedCount ?? 0) + 1 };
      const decisions = { ...state.offseasonData.resigning.decisions } as any;
      decisions[String(playerId)] = { action: "RESIGN", offer };

      return pushNews({ ...state, offseasonData: { ...state.offseasonData, resigning: { decisions } } }, `Offer rejected. Agent requests improved terms.`);
    }
    case "RESIGN_ACCEPT_OFFER": {
      const { playerId } = action.payload;
      const cur: any = state.offseasonData.resigning.decisions?.[String(playerId)];
      if (!cur?.offer) return state;

      const offer = cur.offer as ResignOffer;

      const ovr = contractOverrideFromOffer(state, offer);
      const playerContractOverrides = { ...state.playerContractOverrides, [String(playerId)]: ovr };

      const decisions = { ...state.offseasonData.resigning.decisions } as any;
      delete decisions[String(playerId)];

      const morale = { ...(state.playerMorale ?? {}) };
      const curMorale = Number(morale[String(playerId)] ?? 60);
      morale[String(playerId)] = Math.max(0, Math.min(100, curMorale + 5));

      let next = applyFinances({
        ...state,
        playerContractOverrides,
        playerMorale: morale,
        offseasonData: { ...state.offseasonData, resigning: { decisions } },
      });

      const p: any = getPlayers().find((x: any) => String(x.playerId) === String(playerId));
      if (isNewsworthyRecommit(p)) {
        next = pushNews(next, `Star re-commits early: ${String(p?.fullName ?? "Player")} agrees to an extension.`);
      }

      return next;
    }
    case "RESIGN_CLEAR_DECISION": {
      const next = { ...state.offseasonData.resigning.decisions };
      delete next[action.payload.playerId];
      return { ...state, offseasonData: { ...state.offseasonData, resigning: { decisions: next } } };
    }
    case "ROSTERAUDIT_SET_CUT_DESIGNATION": {
      const { playerId, designation } = action.payload;
      const cutDesignations = { ...state.offseasonData.rosterAudit.cutDesignations };
      if (designation === "NONE") delete cutDesignations[playerId];
      else cutDesignations[playerId] = designation;
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          rosterAudit: { cutDesignations },
        },
      };
    }
    case "TAG_REMOVE": {
      const applied = state.offseasonData.tagCenter.applied;
      if (!applied) return state;

      const pco = { ...state.playerContractOverrides };
      const o = pco[applied.playerId];
      if (o?.startSeason === state.season && o?.endSeason === state.season && o?.signingBonus === 0 && o?.salaries?.length === 1) {
        delete pco[applied.playerId];
      }

      return applyFinances({
        ...state,
        offseasonData: { ...state.offseasonData, tagCenter: { applied: undefined } },
        playerContractOverrides: pco,
      });
    }
    case "TAG_APPLY": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;

      const current = state.offseasonData.tagCenter.applied;
      if (current && current.playerId !== action.payload.playerId) return state;

      const cost = Math.max(0, Math.round(action.payload.cost / 50_000) * 50_000);

      const pco = { ...state.playerContractOverrides };
      pco[action.payload.playerId] = { startSeason: state.season, endSeason: state.season, salaries: [cost], signingBonus: 0 };

      return applyFinances({
        ...state,
        offseasonData: { ...state.offseasonData, tagCenter: { applied: { ...action.payload, cost } } },
        playerContractOverrides: pco,
      });
    }
    case "CONTRACT_RESTRUCTURE_APPLY": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;

      const { playerId } = action.payload;
      const gate = getRestructureEligibility(state, playerId);
      if (!gate.eligible) return pushNews(state, `Restructure blocked: ${gate.reasons[0]}`);

      const amount = moneyRound(Math.max(0, action.payload.amount));
      const o = state.playerContractOverrides[playerId];
      if (!o) return state;

      const idx = Math.max(0, Math.min(o.salaries.length - 1, state.season - o.startSeason));
      const curSalary = Number(o.salaries[idx] ?? 0);
      const x = moneyRound(Math.min(amount, curSalary));
      if (x <= 0) return state;

      const yearsRemaining = Math.max(1, o.endSeason - state.season + 1);
      const addedProration = moneyRound(x / yearsRemaining);

      const nextO: PlayerContractOverride = {
        ...o,
        salaries: o.salaries.map((s, i) => (i === idx ? moneyRound(Number(s ?? 0) - x) : moneyRound(Number(s ?? 0)))),
        signingBonus: moneyRound(Number(o.signingBonus ?? 0) + x),
        prorationBySeason: { ...(o.prorationBySeason ?? {}) },
      };

      for (let y = state.season; y <= o.endSeason; y++) {
        nextO.prorationBySeason![y] = moneyRound((nextO.prorationBySeason![y] ?? 0) + addedProration);
      }

      const next = applyFinances({
        ...state,
        playerContractOverrides: { ...state.playerContractOverrides, [playerId]: nextO },
      });

      return pushNews(next, `Restructure applied: ${Math.round(x / 1_000_000)}M converted to bonus.`);
    }
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

    case "TAMPERING_INIT": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;
      if (Object.keys(state.tampering.interestByPlayerId).length) return state;

      const fas = getEffectiveFreeAgents(state)
        .map((p: any) => ({ p, interest: computeFaInterest(state, p) }))
        .sort((a, b) => b.interest - a.interest)
        .slice(0, 220);

      const interestByPlayerId: Record<string, number> = {};
      const nameByPlayerId: Record<string, string> = {};
      for (const x of fas) {
        const id = String(x.p.playerId);
        interestByPlayerId[id] = x.interest;
        nameByPlayerId[id] = String(x.p.fullName ?? `Player ${id}`);
      }

      return { ...state, tampering: { ...state.tampering, interestByPlayerId, nameByPlayerId } };
    }

    case "TAMPERING_OPEN_PLAYER":
      return { ...state, tampering: { ...state.tampering, ui: { mode: "PLAYER", playerId: action.payload.playerId } } };

    case "TAMPERING_OPEN_SHORTLIST":
      return { ...state, tampering: { ...state.tampering, ui: { mode: "SHORTLIST" } } };

    case "TAMPERING_CLOSE_MODAL":
      return { ...state, tampering: { ...state.tampering, ui: { mode: "NONE" } } };

    case "TAMPERING_ADD_SHORTLIST": {
      const id = String(action.payload.playerId);
      if (state.tampering.shortlistPlayerIds.includes(id)) return state;
      return { ...state, tampering: { ...state.tampering, shortlistPlayerIds: [id, ...state.tampering.shortlistPlayerIds].slice(0, 25) } };
    }

    case "TAMPERING_REMOVE_SHORTLIST": {
      const id = String(action.payload.playerId);
      return { ...state, tampering: { ...state.tampering, shortlistPlayerIds: state.tampering.shortlistPlayerIds.filter((x) => x !== id) } };
    }

    case "TAMPERING_AUTO_SHORTLIST": {
      const tab = String(action.payload.tab ?? "ALL");
      const ids = Object.entries(state.tampering.interestByPlayerId)
        .map(([id, v]) => ({ id, v }))
        .filter((x) => x.v >= 0.6)
        .sort((a, b) => b.v - a.v)
        .slice(0, 10)
        .map((x) => x.id);

      return { ...state, tampering: { ...state.tampering, shortlistPlayerIds: tab === "ALL" ? ids : state.tampering.shortlistPlayerIds } };
    }

    case "TAMPERING_SET_SOFT_OFFER": {
      const playerId = String(action.payload.playerId);
      const softOffersByPlayerId = { ...state.tampering.softOffersByPlayerId, [playerId]: { years: action.payload.years, aav: action.payload.aav } };
      return { ...state, tampering: { ...state.tampering, softOffersByPlayerId } };
    }

    case "TAMPERING_CLEAR_SOFT_OFFER": {
      const playerId = String(action.payload.playerId);
      const softOffersByPlayerId = { ...state.tampering.softOffersByPlayerId };
      delete softOffersByPlayerId[playerId];
      return { ...state, tampering: { ...state.tampering, softOffersByPlayerId } };
    }

    case "FA_OPEN_PLAYER":
      return { ...state, freeAgency: { ...state.freeAgency, ui: { mode: "PLAYER", playerId: action.payload.playerId } } };

    case "FA_OPEN_MY_OFFERS":
      return { ...state, freeAgency: { ...state.freeAgency, ui: { mode: "MY_OFFERS" } } };

    case "FA_CLOSE_MODAL":
      return { ...state, freeAgency: { ...state.freeAgency, ui: { mode: "NONE" } } };

    case "FA_SET_DRAFT": {
      const { playerId, years, aav } = action.payload;
      return {
        ...state,
        freeAgency: {
          ...state.freeAgency,
          draftByPlayerId: {
            ...state.freeAgency.draftByPlayerId,
            [String(playerId)]: { years: Math.max(1, Math.min(5, Math.round(years))), aav: Math.max(750_000, Math.round(aav / 50_000) * 50_000) },
          },
        },
      };
    }

    case "FA_BOOTSTRAP_FROM_TAMPERING": {
      if (state.careerStage !== "FREE_AGENCY") return state;
      if (state.freeAgency.bootstrappedFromTampering) return state;
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;

      let next: GameState = { ...state, freeAgency: { ...state.freeAgency, bootstrappedFromTampering: true } };

      for (const [playerId, o] of Object.entries(state.tampering.softOffersByPlayerId)) {
        const offers = next.freeAgency.offersByPlayerId[playerId] ?? [];
        if (offers.some((x) => x.isUser && x.status === "PENDING")) continue;

        const offerId = makeOfferId(next);
        const userOffer: FreeAgencyOffer = {
          offerId,
          playerId,
          teamId,
          isUser: true,
          years: Math.max(1, Math.min(5, Math.round(o.years))),
          aav: Math.max(750_000, Math.round(o.aav / 50_000) * 50_000),
          createdWeek: next.hub.regularSeasonWeek ?? 1,
          status: "PENDING",
          fromTampering: true,
        };

        next = {
          ...next,
          freeAgency: {
            ...upsertOffers({ ...next, freeAgency: { ...next.freeAgency, nextOfferSeq: next.freeAgency.nextOfferSeq + 1 } }, playerId, [...offers, userOffer]),
          },
        };
      }
      return next;
    }

    case "FA_SUBMIT_OFFER": {
      if (state.careerStage !== "FREE_AGENCY") return state;
      const { playerId } = action.payload as { playerId: string };
      const pid = String(playerId);
      if (state.freeAgency.signingsByPlayerId[pid]) return state;
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;
      const draft = state.freeAgency.draftByPlayerId[pid];
      if (!draft) return state;

      const existing = state.freeAgency.offersByPlayerId[pid] ?? [];
      const hasPendingUser = existing.some((o) => o.isUser && o.status === "PENDING");
      if (hasPendingUser) return state;

      const isLastResolve = state.freeAgency.resolvesUsedThisPhase >= state.freeAgency.maxResolvesPerPhase - 1;
      if (!isLastResolve) {
        const pendingUser = countPendingUserOffers(state);
        if (pendingUser >= 5) return faPush(state, "Pending-offer limit reached (5). Resolve a batch to free slots.");
      }

      const offerId = makeOfferId(state);
      const userOffer: FreeAgencyOffer = {
        offerId,
        playerId: pid,
        teamId: String(teamId),
        isUser: true,
        years: draft.years,
        aav: draft.aav,
        createdWeek: state.hub.regularSeasonWeek ?? 1,
        status: "PENDING",
      };

      const next = { ...state, freeAgency: upsertOffers({ ...state, freeAgency: { ...state.freeAgency, nextOfferSeq: state.freeAgency.nextOfferSeq + 1 } }, pid, [...existing, userOffer]) };
      return faPush(next, `Offer submitted: ${draft.years} yrs @ $${Math.round(draft.aav / 1_000_000)}M/yr.`, pid);
    }

    case "FA_CLEAR_USER_OFFER": {
      const pid = String(action.payload.playerId);
      const offers = state.freeAgency.offersByPlayerId[pid] ?? [];
      const nextOffers = offers.filter((o) => !(o.isUser && o.status === "PENDING"));
      return { ...state, freeAgency: upsertOffers(state, pid, nextOffers) };
    }

    case "FA_RESOLVE_BATCH": {
      if (state.careerStage !== "FREE_AGENCY") return state;
      if (state.freeAgency.resolvesUsedThisPhase >= state.freeAgency.maxResolvesPerPhase) return state;
      let seeded = cpuGenerateOffers(state, 40);
      const teamId = seeded.acceptedOffer?.teamId;
      if (!teamId) return seeded;

      const offersByPlayerId = { ...seeded.freeAgency.offersByPlayerId };
      const signingsByPlayerId = { ...seeded.freeAgency.signingsByPlayerId };
      const playerIndex: Record<string, any> = {};
      for (const p of getPlayers() as any[]) playerIndex[String(p.playerId)] = p;

      const candidates = Object.entries(offersByPlayerId)
        .filter(([pid]) => !signingsByPlayerId[pid])
        .map(([pid, offers]) => {
          const pending = offers.filter((o) => o.status === "PENDING");
          if (!pending.length) return null;
          const p = playerIndex[pid];
          const ovr = Number(p?.overall ?? 0);
          const pendingCount = pending.length;
          const maxAav = pending.reduce((m, o) => Math.max(m, Number(o.aav ?? 0)), 0);
          return { pid, ovr, pendingCount, maxAav };
        })
        .filter(Boolean) as Array<{ pid: string; ovr: number; pendingCount: number; maxAav: number }>;

      candidates.sort((a, b) => b.ovr - a.ovr || b.pendingCount - a.pendingCount || b.maxAav - a.maxAav || a.pid.localeCompare(b.pid));
      const toResolve = candidates.slice(0, 5).map((c) => c.pid);
      let next: GameState = {
        ...seeded,
        freeAgency: {
          ...seeded.freeAgency,
          offersByPlayerId,
          signingsByPlayerId,
          resolvesUsedThisPhase: seeded.freeAgency.resolvesUsedThisPhase + 1,
        },
      };

      for (const playerId of toResolve) {
        if (next.freeAgency.signingsByPlayerId[playerId]) continue;
        const offers = next.freeAgency.offersByPlayerId[playerId] ?? [];
        const pending = offers.filter((o) => o.status === "PENDING");
        if (!pending.length) continue;

        const interest = next.tampering.interestByPlayerId[playerId] ?? 0;
        const p: any = getPlayers().find((x: any) => String(x.playerId) === String(playerId));
        const market = projectedMarketApy(String(p?.pos ?? "UNK"), Number(p?.overall ?? 0), Number(p?.age ?? 26));
        const score = (o: FreeAgencyOffer) => {
          const moneyScore = clamp01((o.aav - market * 0.85) / (market * 0.5)) * 0.55;
          const termScore = clamp01((o.years - 1) / 4) * 0.10;
          const intScore = clamp01(interest) * 0.25;
          const userBoost = o.isUser ? 0.06 : 0;
          const noise = detRand(next.saveSeed, `FA_RES|S${next.season}|P${playerId}|O${o.offerId}`) * 0.04;
          return moneyScore + termScore + intScore + userBoost + noise;
        };

        const best = pending.reduce((a, b) => (score(b) > score(a) ? b : a));
        const acceptProb = clamp01(score(best));
        const roll = detRand(next.saveSeed, `FA_ROLL|S${next.season}|P${playerId}|R${next.freeAgency.resolvesUsedThisPhase}`);
        const accepted = roll < acceptProb;

        if (!accepted) {
          next.freeAgency.offersByPlayerId[playerId] = offers.map((o) => (o.offerId === best.offerId ? { ...o, status: "REJECTED" } : o));
          next = faPush(next, `Offer rejected by ${String(p?.fullName ?? "player")}.`, playerId);
          continue;
        }

        next.freeAgency.offersByPlayerId[playerId] = offers.map((o) => (o.offerId === best.offerId ? { ...o, status: "ACCEPTED" } : o.status === "PENDING" ? { ...o, status: "REJECTED" } : o));
        const years = Math.max(1, best.years);
        const totalCash = best.aav * years;
        const signingBonus = Math.round((totalCash * 0.22) / 50_000) * 50_000;
        next.freeAgency.signingsByPlayerId[playerId] = { teamId: best.teamId, years, aav: best.aav, signingBonus };

        if (best.teamId === String(teamId)) {
          const salaries = makeEscalatingSalaries(totalCash - signingBonus, years, 0.06);
          const ovr: PlayerContractOverride = { startSeason: next.season, endSeason: next.season + years - 1, salaries, signingBonus };
          const cashY1 = (salaries[0] ?? 0) + signingBonus;
          next = applyFinances({ ...next, playerTeamOverrides: { ...next.playerTeamOverrides, [playerId]: String(teamId) }, playerContractOverrides: { ...next.playerContractOverrides, [playerId]: ovr }, finances: { ...next.finances, cash: next.finances.cash - cashY1 } });
          next = pushNews(next, `Signed: ${String(p?.fullName ?? "Player")} (${String(p?.pos ?? "")}) agrees to terms.`);
          next = faPush(next, `Signed: ${String(p?.fullName ?? "Player")} — ${years} yrs @ $${Math.round(best.aav / 1_000_000)}M/yr.`, playerId);
        } else {
          next = faPush(next, `${String(p?.fullName ?? "Player")} signed elsewhere.`, playerId);
        }
      }
      next = cpuWithdrawOffers(next);
      return next;
    }

    case "FA_RESOLVE_WEEK": {
      const offersByPlayerId = { ...state.freeAgency.offersByPlayerId };
      const signingsByPlayerId = { ...state.freeAgency.signingsByPlayerId };

      for (const [playerId, offers] of Object.entries(offersByPlayerId)) {
        if (signingsByPlayerId[playerId]) continue;
        const pending = offers.filter((o) => o.status === "PENDING");
        if (!pending.length) continue;

        const interest = state.tampering.interestByPlayerId[playerId] ?? 0;
        const userSoft = state.tampering.softOffersByPlayerId[playerId];
        const score = (o: FreeAgencyOffer) => {
          let sc = Number(o.aav ?? 0);
          if (o.isUser) sc *= userSoft ? 1.05 + clamp01(interest) * 0.03 : 1 + clamp01(interest) * 0.02;
          return sc;
        };

        const best = pending.reduce((a, b) => (score(b) > score(a) ? b : a));
        offersByPlayerId[playerId] = offers.map((o) => (o.offerId === best.offerId ? { ...o, status: "ACCEPTED" as const } : o.status === "PENDING" ? { ...o, status: "REJECTED" as const } : o));

        const years = Math.max(1, best.years);
        const totalCash = best.aav * years;
        const signingBonus = Math.round((totalCash * 0.22) / 50_000) * 50_000;
        signingsByPlayerId[playerId] = { teamId: best.teamId, years, aav: best.aav, signingBonus };

        if (best.isUser) {
          const salaries = makeEscalatingSalaries(totalCash - signingBonus, years, 0.06);
          const ovr: PlayerContractOverride = { startSeason: state.season, endSeason: state.season + years - 1, salaries, signingBonus };
          const cashY1 = (salaries[0] ?? 0) + signingBonus;
          const nextState = { ...state, playerTeamOverrides: { ...state.playerTeamOverrides, [playerId]: best.teamId }, playerContractOverrides: { ...state.playerContractOverrides, [playerId]: ovr }, finances: { ...state.finances, cash: state.finances.cash - cashY1 }, freeAgency: { ...state.freeAgency, offersByPlayerId, signingsByPlayerId } };
          return applyFinances(nextState);
        }
      }
      return { ...state, freeAgency: { ...state.freeAgency, offersByPlayerId, signingsByPlayerId } };
    }

    case "TRADE_ACCEPT": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;
      const playerId = String(action.payload.playerId);
      const toTeamId = String(action.payload.toTeamId);

      if (state.offseasonData.tagCenter.applied?.playerId === playerId) return pushNews(state, "Trade blocked: tagged player. Remove tag first.");
      if (state.offseasonData.resigning.decisions[playerId]?.action === "RESIGN") return pushNews(state, "Trade blocked: extension offer pending. Clear offer first.");

      const delta = tradeCapDelta(state, String(teamId), playerId, toTeamId);
      if (state.finances.capSpace + delta < 0) return pushNews(state, "Trade blocked: cap would be illegal.");

      const nextState = { ...state, playerTeamOverrides: { ...state.playerTeamOverrides, [playerId]: toTeamId } };
      const next = applyFinances(nextState);
      const name = getPlayers().find((p: any) => String(p.playerId) === playerId)?.fullName ?? "Player";
      return pushNews(next, `Trade completed: ${name} sent to ${toTeamId} for ${String(action.payload.valueTier)} value.`);
    }

    case "CUT_APPLY": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;

      const playerId = action.payload.playerId;

      if (state.offseasonData.tagCenter.applied?.playerId === playerId) {
        return pushNews(state, "Cut blocked: tagged player. Remove tag first.");
      }
      if (state.offseasonData.resigning.decisions[playerId]?.action === "RESIGN") {
        return pushNews(state, "Cut blocked: extension offer pending. Clear offer first.");
      }

      const designation = state.offseasonData.rosterAudit.cutDesignations[playerId] ?? "NONE";
      const summary = getContractSummaryForPlayer(state, playerId);
      const deadTotal = Math.round((summary?.deadCapIfCutNow ?? 0) / 50_000) * 50_000;

      const deadThisYear = designation === "POST_JUNE_1" ? Math.round((deadTotal * 0.5) / 50_000) * 50_000 : deadTotal;
      const deadNextYear = designation === "POST_JUNE_1" ? Math.max(0, deadTotal - deadThisYear) : 0;

      const playerTeamOverrides = { ...state.playerTeamOverrides, [playerId]: "FREE_AGENT" };
      const playerContractOverrides = { ...state.playerContractOverrides };
      delete playerContractOverrides[playerId];

      const cutDesignations = { ...state.offseasonData.rosterAudit.cutDesignations };
      delete cutDesignations[playerId];

      const patched = applyFinances({
        ...state,
        playerTeamOverrides,
        playerContractOverrides,
        offseasonData: {
          ...state.offseasonData,
          rosterAudit: { cutDesignations },
        },
        finances: {
          ...state.finances,
          deadCapThisYear: (state.finances.deadCapThisYear ?? 0) + deadThisYear,
          deadCapNextYear: (state.finances.deadCapNextYear ?? 0) + deadNextYear,
        },
      });

      const nextLockedBySlot = { ...(patched.depthChart.lockedBySlot ?? {}) };
      const nextStarters = autoFillDepthChartGaps(patched, teamId);
      for (const [slot, starterId] of Object.entries(nextStarters)) {
        if (String(starterId) !== playerId) continue;
        delete nextLockedBySlot[slot];
      }

      const filled = {
        ...patched,
        depthChart: { ...patched.depthChart, startersByPos: nextStarters, lockedBySlot: nextLockedBySlot },
      };
      const next = applyFinances(filled);

      return pushNews(
        next,
        designation === "POST_JUNE_1"
          ? `Cut applied (Post–June 1): Dead ${Math.round(deadThisYear / 1_000_000)}M now, ${Math.round(deadNextYear / 1_000_000)}M next year. Depth chart auto-filled.`
          : `Cut applied: Dead ${Math.round(deadThisYear / 1_000_000)}M. Depth chart auto-filled.`,
      );
    }

    case "CUT_PLAYER": {
      const pid = action.payload.playerId;
      const o = state.playerContractOverrides[pid];

      const playerTeamOverrides = { ...state.playerTeamOverrides, [pid]: "FREE_AGENT" };
      const playerContractOverrides = { ...state.playerContractOverrides };

      if (o) {
        const years = Math.max(1, o.salaries.length);
        const pro = Math.round((o.signingBonus / years) / 50_000) * 50_000;
        const yearsElapsed = Math.max(0, Math.min(years, state.season - o.startSeason + 1));
        const paid = pro * yearsElapsed;
        const unamort = Math.max(0, o.signingBonus - paid);
        delete playerContractOverrides[pid];
        return applyFinances({
          ...state,
          playerTeamOverrides,
          playerContractOverrides,
          finances: { ...state.finances, baseCommitted: state.finances.baseCommitted + unamort },
        });
      }

      return { ...state, playerTeamOverrides };
    }

    case "TRADE_PLAYER":
      return gameReducer(state, { type: "CUT_PLAYER", payload: action.payload });

    case "ADVANCE_SEASON":
      return seasonRollover(state);

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
      const { slot, playerId } = action.payload;
      const starters = { ...state.depthChart.startersByPos };
      const lockedBySlot = { ...(state.depthChart.lockedBySlot ?? {}) };

      if (playerId === "AUTO") {
        const prevSlots = state.depthChart.startersByPos;
        delete starters[slot];
        delete lockedBySlot[slot];
        const next0 = { ...state, depthChart: { ...state.depthChart, startersByPos: starters, lockedBySlot } };
        const teamId = state.acceptedOffer?.teamId ? String(state.acceptedOffer.teamId) : null;
        return teamId ? pushMajorDepthNews(next0, teamId, prevSlots, starters) : next0;
      }

      if (lockedBySlot[slot]) return state;

      const currentHere = starters[slot];
      const otherSlot = Object.entries(starters).find(([s, pid]) => s !== slot && String(pid) === String(playerId))?.[0];
      if (otherSlot) {
        if (lockedBySlot[otherSlot]) return state;

        if (currentHere) starters[otherSlot] = String(currentHere);
        else delete starters[otherSlot];

        starters[slot] = String(playerId);

        const a = !!lockedBySlot[slot];
        const b = !!lockedBySlot[otherSlot];
        if (a) lockedBySlot[otherSlot] = true;
        else delete lockedBySlot[otherSlot];
        if (b) lockedBySlot[slot] = true;
        else delete lockedBySlot[slot];

        const next0 = { ...state, depthChart: { ...state.depthChart, startersByPos: starters, lockedBySlot } };
        const teamId = state.acceptedOffer?.teamId ? String(state.acceptedOffer.teamId) : null;
        return teamId ? pushMajorDepthNews(next0, teamId, state.depthChart.startersByPos, starters) : next0;
      }

      const prevSlots = state.depthChart.startersByPos;
      starters[slot] = String(playerId);
      const next0 = { ...state, depthChart: { ...state.depthChart, startersByPos: starters } };
      const teamId = state.acceptedOffer?.teamId ? String(state.acceptedOffer.teamId) : null;
      return teamId ? pushMajorDepthNews(next0, teamId, prevSlots, starters) : next0;
    }
    case "TOGGLE_DEPTH_SLOT_LOCK": {
      const slot = action.payload.slot;
      const starters = state.depthChart.startersByPos;
      if (!starters[slot]) return state;

      const lockedBySlot = { ...(state.depthChart.lockedBySlot ?? {}) };
      if (lockedBySlot[slot]) delete lockedBySlot[slot];
      else lockedBySlot[slot] = true;

      return { ...state, depthChart: { ...state.depthChart, lockedBySlot } };
    }
    case "RESET_DEPTH_CHART_BEST": {
      return fillDepthChart(state, "RESET");
    }
    case "DEPTHCHART_RESET_TO_BEST": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;
      const prevSlots = state.depthChart.startersByPos;
      const startersByPos = autoFillDepthChartGaps(state, teamId);
      const next0 = { ...state, depthChart: { ...state.depthChart, startersByPos } };
      const next = pushMajorDepthNews(next0, String(teamId), prevSlots, startersByPos);
      return applyFinances(next);
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
    case "FINANCES_PATCH": {
      return applyFinances({ ...state, finances: { ...state.finances, ...action.payload } });
    }
    case "AUTO_ADVANCE_STAGE_IF_READY": {
      const step = state.offseason.stepId;
      if (step === "TRAINING_CAMP") return { ...state, careerStage: "TRAINING_CAMP" };
      if (step === "PRESEASON") {
        const next = { ...state, careerStage: "PRESEASON" as CareerStage };
        return clearDepthLocksIfEnteringPreseason(state.careerStage, "PRESEASON", next);
      }
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

      let out = { ...state, league, hub };
      if (gameType === "REGULAR_SEASON") {
        out = gameReducer(out, { type: "CHECK_FIRING", payload: { checkpoint: "WEEKLY", week } });
        if (week >= REGULAR_SEASON_WEEKS) {
          out = gameReducer(out, { type: "CHECK_FIRING", payload: { checkpoint: "SEASON_END", week } });
        }
      }
      if (gameType === "REGULAR_SEASON" && shouldRecomputeDepthOnWeekly(out)) out = recomputeLeagueDepthAndNews(out);
      return out;
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

  const nextDepthChart = {
    startersByPos: { ...((oldState as any).depthChart?.startersByPos ?? {}) },
    lockedBySlot: { ...((oldState as any).depthChart?.lockedBySlot ?? {}) },
  };

  let s: Partial<GameState> = {
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
        tagCenter: { applied: undefined },
        rosterAudit: { cutDesignations: {} },
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
    finances:
      (oldState as any).finances ??
      {
        cap: 250_000_000,
        carryover: 0,
        incentiveTrueUps: 0,
        deadCapThisYear: 0,
        deadCapNextYear: 0,
        baseCommitted: 0,
        capCommitted: 0,
        capSpace: 250_000_000,
        cash: 150_000_000,
        postJune1Sim: false,
      },
    league,
    game,
    draft: oldState.draft ?? { picks: [], withdrawnBoardIds: {} },
    rookies: oldState.rookies ?? [],
    rookieContracts: oldState.rookieContracts ?? {},
    firing: oldState.firing ?? { pWeekly: 0, pSeasonEnd: 0, drivers: [], lastWeekComputed: 0, lastSeasonComputed: 0, fired: false },
    depthChart: nextDepthChart,
    leagueDepthCharts: (oldState as any).leagueDepthCharts ?? {},
    playerAccolades: (oldState as any).playerAccolades ?? {},
  };
  s = ensureAccolades(bootstrapAccolades(s as GameState));
  return s;
}


function readCapModeFromUrl(): boolean | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("capMode");
  if (!v) return null;
  if (v.toLowerCase() === "postjune1") return true;
  if (v.toLowerCase() === "standard") return false;
  return null;
}

function applyCapModeQuery(state: GameState): GameState {
  const fromUrl = readCapModeFromUrl();
  if (fromUrl == null) return state;
  if (state.finances.postJune1Sim === fromUrl) return state;
  return { ...state, finances: { ...state.finances, postJune1Sim: fromUrl } };
}

function loadState(): GameState {
  const initial = applyCapModeQuery(createInitialState());
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initial;

    const parsed = JSON.parse(saved) as Partial<GameState>;
    const migrated = (parsed.saveVersion ?? 0) < CURRENT_SAVE_VERSION ? migrateSave(parsed) : parsed;

    let out: GameState = {
      ...initial,
      ...migrated,
      coach: { ...initial.coach, ...migrated.coach },
      interviews: { ...initial.interviews, ...migrated.interviews },
      hub: { ...initial.hub, ...migrated.hub },
      finances: { ...initial.finances, ...(migrated as any).finances },
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
      depthChart: {
        ...initial.depthChart,
        ...migrated.depthChart,
        startersByPos: { ...initial.depthChart.startersByPos, ...(migrated.depthChart?.startersByPos ?? {}) },
        lockedBySlot: { ...initial.depthChart.lockedBySlot, ...(migrated.depthChart?.lockedBySlot ?? {}) },
      },
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
      tampering: {
        ...initial.tampering,
        ...migrated.tampering,
        interestByPlayerId: { ...initial.tampering.interestByPlayerId, ...(migrated.tampering?.interestByPlayerId ?? {}) },
        nameByPlayerId: { ...initial.tampering.nameByPlayerId, ...(migrated.tampering?.nameByPlayerId ?? {}) },
        softOffersByPlayerId: { ...initial.tampering.softOffersByPlayerId, ...(migrated.tampering?.softOffersByPlayerId ?? {}) },
        shortlistPlayerIds: migrated.tampering?.shortlistPlayerIds ?? initial.tampering.shortlistPlayerIds,
      },
      offseasonData: {
        ...initial.offseasonData,
        ...migrated.offseasonData,
        resigning: { ...initial.offseasonData.resigning, ...migrated.offseasonData?.resigning },
        tagCenter: { ...initial.offseasonData.tagCenter, ...migrated.offseasonData?.tagCenter },
        rosterAudit: { ...initial.offseasonData.rosterAudit, ...migrated.offseasonData?.rosterAudit, cutDesignations: { ...initial.offseasonData.rosterAudit.cutDesignations, ...(migrated.offseasonData?.rosterAudit?.cutDesignations ?? {}) } },
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
      playerContractOverrides: Object.fromEntries(
        Object.entries({ ...initial.playerContractOverrides, ...migrated.playerContractOverrides }).map(([k, v]: any) => {
          if (Array.isArray(v?.salaries)) return [k, v];
          const years = Math.max(1, Number(v?.endSeason ?? initial.season) - Number(v?.startSeason ?? initial.season) + 1);
          const aav = Number(v?.aav ?? 0);
          return [k, { startSeason: Number(v?.startSeason ?? initial.season), endSeason: Number(v?.endSeason ?? initial.season), salaries: Array.from({ length: years }, () => aav), signingBonus: Number(v?.signingBonus ?? 0) }];
        }),
      ) as Record<string, PlayerContractOverride>,
      saveVersion: CURRENT_SAVE_VERSION,
      memoryLog: migrated.memoryLog ?? initial.memoryLog,
      leagueDepthCharts: { ...initial.leagueDepthCharts, ...((migrated as any).leagueDepthCharts ?? {}) },
      playerAccolades: { ...initial.playerAccolades, ...((migrated as any).playerAccolades ?? {}) },
    };
    out = ensureAccolades(bootstrapAccolades(out));
    out = applyCapModeQuery(out);
    return out;
  } catch (error) {
    console.error("[state-load] Failed to restore saved state, falling back to defaults", error);
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("[state-save] Failed to persist save data", error);
    }
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
