import React, { createContext, useContext, useEffect, useReducer } from "react";
import type { Injury } from "@/engine/injuryTypes";
import draftClassJson from "@/data/draftClass.json";
import {
  clearPersonnelTeam,
  cutPlayerToFreeAgent,
  expireContract,
  getPersonnelById,
  getPersonnelContract,
  getPlayers,
  getPlayersByTeam,
  getTeamFinancesRow,
  getTeamRosterPlayers,
  getTeams,
  getTeamById,
  setPersonnelTeamAndContract,
} from "@/data/leagueDb";
import type { CoachReputation } from "@/engine/reputation";
import { clamp01, clamp100, defenseInterestBoost, offenseInterestBoost, enforceArchetypeReputationCaps } from "@/engine/reputation";
import { applyStaffRejection, computeStaffAcceptance, type RoleFocus } from "@/engine/assistantHiring";
import { expectedSalary, offerQualityScore, offerSalary } from "@/engine/staffSalary";
import { isOfferAccepted } from "@/engine/coachAcceptance";
import { initGameSim, stepPlay, type GameSim, type PlayType, type AggressionLevel, type TempoMode, type Possession } from "@/engine/gameSim";
import { computeTeamGameRatings } from "@/engine/game/teamRatings";
import { initLeagueState, simulateLeagueWeek, type LeagueState } from "@/engine/leagueSim";
import { checkMilestones } from "@/engine/milestones";
import { resolveInjuries as resolveInjuriesEngine } from "@/engine/injuries";
import { generateOffers } from "@/engine/offers";
import { genFreeAgents } from "@/engine/offseasonGen";
import { OFFSEASON_STEPS, nextOffseasonStepId, type OffseasonStepId } from "@/engine/offseason";
import { simulatePlayoffs } from "@/engine/playoffsSim";
import { buyoutTotal, splitBuyout } from "@/engine/buyout";
import { getRestructureEligibility } from "@/engine/contractMath";
import { autoFillDepthChartGaps } from "@/engine/depthChart";
import { getContractSummaryForPlayer, getEffectiveFreeAgents, getEffectivePlayersByTeam, normalizePos } from "@/engine/rosterOverlay";
import { projectedMarketApy } from "@/engine/marketModel";
import { computeCapLedger } from "@/engine/capLedger";
import { computeTerminationRisk, shouldFireDeterministic } from "@/engine/termination";
import { getGmTraits } from "@/engine/gmScouting";
import { evalProspectForGm } from "@/engine/prospectEval";
import { computeWindowBudget, freshIntel, applyScoutAction, updateRevealedTiers, type PlayerIntel, type ScoutAction, type ScoutingWindowId } from "@/engine/scoutingCapacity";
import { FATIGUE_DEFAULT, clampFatigue, getRecoveryRate, pushLast3SnapLoad, recoverFatigue } from "@/engine/fatigue";
import type { PersonnelPackage } from "@/engine/personnel";
import { TRADE_DEADLINE_DEFAULT_WEEK, cancelPendingTradesAtDeadline, isTradeAllowed, type TradeDeadlineError } from "@/engine/tradeDeadline";
import { DEFAULT_PRACTICE_PLAN, applyPracticeFatigue, getEffectPreview, getPracticeEffect, resolveInstallFamiliarity, type PracticePlan } from "@/engine/practiceFocus";
import type { ScoutingState, GMScoutingTraits, ProspectTrueProfile } from "@/engine/scouting/types";
import { detRand as detRand2 } from "@/engine/scouting/rng";
import { computeBudget, initScoutProfile, addClarity, tightenBand, revealMedicalIfUnlocked, revealCharacterIfUnlocked } from "@/engine/scouting/core";
import { generateCombineResult } from "@/engine/prospectIntel";
import { PREDRAFT_MAX_SLOTS } from "@/engine/offseasonConstants";
import { getArchetypeTraits } from "@/data/archetypeTraits";
import {
  COMBINE_DEFAULT_HOURS,
  COMBINE_DEFAULT_INTERVIEW_SLOTS,
  COMBINE_FEED_MAX_PER_DAY,
  COMBINE_FEED_TEMPLATES,
  COMBINE_FOCUS_HOURS_COST,
  COMBINE_INTERVIEW_ATTRIBUTE_BY_CATEGORY,
} from "@/engine/scouting/combineConstants";
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
import {
  applySelection,
  applyTrade,
  buildUserTradeUpOffer,
  cpuAdvanceUntilUser,
  generateTradeOffers,
  getDraftClass as getDraftClassFromSim,
  initDraftSim,
  submitUserTradeUpOffer,
  type DraftSimState,
} from "@/engine/draftSim";
import type { SeasonSummary } from "@/types/season";

export type GamePhase = "CREATE" | "BACKGROUND" | "INTERVIEWS" | "OFFERS" | "COORD_HIRING" | "HUB";
export type CareerStage =
  | "OFFSEASON_HUB"
  | "SEASON_AWARDS"
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

export type GmMode = "REBUILD" | "RELOAD" | "CONTEND";

export type PriorityPos = "QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "EDGE" | "LB" | "CB" | "S" | "K" | "P";

export type StrategyState = {
  draftFaPriorities: PriorityPos[];
  gmMode: GmMode;
};

const DEFAULT_STRATEGY: StrategyState = { draftFaPriorities: ["QB", "OL", "EDGE"], gmMode: "CONTEND" };

function normalizePriorityPos(pos: string): PriorityPos | null {
  const p = String(pos || "").toUpperCase().trim();
  const ok: PriorityPos[] = ["QB", "RB", "WR", "TE", "OL", "DL", "EDGE", "LB", "CB", "S", "K", "P"];
  return (ok as string[]).includes(p) ? (p as PriorityPos) : null;
}

function normalizePriorityList(list: unknown): PriorityPos[] {
  if (!Array.isArray(list)) return DEFAULT_STRATEGY.draftFaPriorities.slice();
  const out: PriorityPos[] = [];
  for (const item of list) {
    const p = normalizePriorityPos(String(item));
    if (!p || out.includes(p)) continue;
    out.push(p);
  }
  return out.length ? out : DEFAULT_STRATEGY.draftFaPriorities.slice();
}

function priorityWeight(priorities: PriorityPos[], pos: string): number {
  const p = normalizePriorityPos(pos);
  if (!p) return 0;
  const idx = priorities.indexOf(p);
  if (idx < 0) return 0;
  return Math.max(0, 1 - idx * 0.25);
}

export type OffseasonState = {
  stepId: OffseasonStepId;
  completed: Record<OffseasonTaskId, boolean>;
  stepsComplete: Partial<Record<OffseasonStepId, boolean>>;
};

export type OffseasonData = {
  resigning: { decisions: Record<string, ResignDecision> };
  tagCenter: { applied?: TagApplied };
  rosterAudit: { cutDesignations: Record<string, "NONE" | "POST_JUNE_1"> };
  combine: { results: Record<string, any>; generated: boolean };
  scouting: {
    windowId: ScoutingWindowId;
    budget: { total: number; spent: number; remaining: number; carryIn: number };
    carryover: number;
    intelByProspectId: Record<string, PlayerIntel>;
    intelByFAId: Record<string, PlayerIntel>;
  };
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
  preDraft: { board: Prospect[]; visits: Record<string, boolean>; workouts: Record<string, boolean>; reveals: Record<string, PreDraftReveal>; viewMode?: "CONSENSUS" | "GM" | "TEAM" };
  draft: { board: Prospect[]; picks: Prospect[]; completed: boolean };
  camp: { settings: CampSettings };
  cutDowns: { decisions: Record<string, CutDecision> };
};

export type MedicalFlagLevel = "GREEN" | "YELLOW" | "ORANGE" | "RED" | "BLACK";
export type CharacterFlagLevel = "BLUE" | "GREEN" | "YELLOW" | "ORANGE" | "RED" | "BLACK";

type PreDraftReveal = {
  flags: string[];
  hasMedicalRedFlag?: boolean;
  medicalLevel?: MedicalFlagLevel;
  characterLevel?: CharacterFlagLevel;
  footballTags?: string[];
  symbols?: string[];
};

export type TagType = "FRANCHISE_NON_EX" | "FRANCHISE_EX" | "TRANSITION";
export type TagApplied = { playerId: string; type: TagType; cost: number; teamId?: string; appliedWeek?: number };

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
export type OfferNegotiationStatus = "NONE" | "PENDING" | "ACCEPTED" | "DECLINED" | "COUNTERED";
export type OfferItem = {
  teamId: string;
  years: number;
  salary: number;
  autonomy: number;
  patience: number;
  mediaNarrativeKey: string;
  score?: number;
  base: { years: number; salary: number; autonomy: number };
  negotiation?: {
    status: OfferNegotiationStatus;
    attempts?: number;
    lastRequest?: { years: number; salary: number; autonomy: number };
    lastChance?: number;
    message?: string;
    counter?: { years: number; salary: number; autonomy: number } | null;
  };
};
export type MemoryEvent = { type: string; season: number; week?: number; payload: unknown };
export type NewsItem = { id: string; title: string; body?: string; createdAt: number; category?: string };

const CURRENT_SAVE_VERSION = 3;
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

// GM mode draft scoring constants
const REBUILD_PRIME_AGE = 24;    // Age at which REBUILD mode gives zero age bonus (younger = higher bonus)
const REBUILD_AGE_WEIGHT = 1.5;  // Points per year younger than prime age
const CONTEND_BASELINE_GRADE = 60; // Neutral grade for CONTEND mode bonus (higher = bigger bonus)
const CONTEND_GRADE_WEIGHT = 0.5;  // Points per grade point above baseline
const FA_AUTO_OFFERS_MAX = 5;      // Hard cap on auto-seeded FA offers

function applyDraftPriorities(state: GameState, board: Prospect[]): Prospect[] {
  const priorities = state.strategy?.draftFaPriorities ?? DEFAULT_STRATEGY.draftFaPriorities;
  const gmMode = state.strategy?.gmMode ?? DEFAULT_STRATEGY.gmMode;
  return board
    .slice()
    .map((p: any) => {
      const rank = Number(p.rank ?? p.Rank ?? 9999);
      const grade = Number(p.grade ?? 0);
      const age = Number(p.age ?? 22);
      // gmMode adjustments: REBUILD boosts young/high-ceiling prospects, CONTEND boosts immediate OVR
      const gmBonus =
        gmMode === "REBUILD" ? (REBUILD_PRIME_AGE - age) * REBUILD_AGE_WEIGHT :
        gmMode === "CONTEND" ? (grade - CONTEND_BASELINE_GRADE) * CONTEND_GRADE_WEIGHT :
        0;
      const score = -rank + priorityWeight(priorities, String(p.pos ?? "")) * 25 + grade * 0.01 + gmBonus;
      return { ...p, __score: score };
    })
    .sort((a: any, b: any) => (b.__score ?? 0) - (a.__score ?? 0));
}

function seedUserAutoFaOffersFromPriorities(state: GameState, maxOffers = 3): GameState {
  if (state.careerStage !== "FREE_AGENCY") return state;
  if ((state.coach.autonomy ?? 60) >= 50) return state;
  const teamId = String(state.acceptedOffer?.teamId ?? "");
  if (!teamId) return state;

  const priorities = state.strategy?.draftFaPriorities ?? DEFAULT_STRATEGY.draftFaPriorities;
  const gmMode = state.strategy?.gmMode ?? DEFAULT_STRATEGY.gmMode;
  // REBUILD mode limits auto-seeded offers to save cap space; CONTEND mode allows one more
  const effectiveMax = Math.min(
    gmMode === "REBUILD" ? Math.min(maxOffers, 1) : gmMode === "CONTEND" ? maxOffers + 1 : maxOffers,
    FA_AUTO_OFFERS_MAX,
  );

  const candidates = getEffectiveFreeAgents(state)
    .map((p: any) => ({ p, id: String(p.playerId), pos: normalizePos(String(p.pos ?? "UNK")), ovr: Number(p.overall ?? 0) }))
    .filter((x) => !state.freeAgency.signingsByPlayerId[x.id]);

  const ranked = candidates
    .map((x) => {
      const need = teamNeedsScore(state, teamId, x.pos);
      const w = priorityWeight(priorities, x.pos);
      return { ...x, score: need * 0.55 + w * 0.35 + (x.ovr / 100) * 0.1 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 24);

  let next = state;
  let created = 0;
  for (const pick of ranked) {
    if (created >= effectiveMax) break;
    const existing = next.freeAgency.offersByPlayerId[pick.id] ?? [];
    if (existing.some((o) => o.isUser && o.status === "PENDING")) continue;
    const { years, aav } = cpuOfferParams(next, teamId, pick.p);
    next = gameReducer(next, { type: "FA_SET_DRAFT", payload: { playerId: pick.id, years, aav } });
    next = gameReducer(next, { type: "FA_SUBMIT_OFFER", payload: { playerId: pick.id } });
    created += 1;
  }

  return next;
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
  guaranteedAtSigning?: number;
  prorationBySeason?: Record<number, number>;
};

export type TransactionType = "CUT" | "TRADE" | "VOID";
export type AccelerationType = "PRE_JUNE_1" | "POST_JUNE_1" | "NONE";
export type Transaction = {
  id: string;
  type: TransactionType;
  playerId: string;
  playerName: string;
  playerPos: string;
  fromTeamId: string;
  toTeamId?: string;
  season: number;
  week?: number;
  june1Designation: AccelerationType;
  notes?: string;
  deadCapThisYear: number;
  deadCapNextYear: number;
  remainingProration: number;
  contractSnapshot?: {
    startSeason: number;
    endSeason: number;
    signingBonus: number;
    salaries: number[];
  };
};

export type BuyoutLedger = { bySeason: Record<number, number> };
export type DepthChart = {
  startersByPos: Record<string, string | undefined>;
  lockedBySlot: Record<string, true | undefined>;
};
export type PreseasonRotation = { byPlayerId: Record<string, number> };
type TamperingSoftOffer = { years: number; aav: number };
export type FreeAgencyOfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED" | "WITHDRAWN";

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
  isCounter?: boolean;
  counterCreatedAtResolve?: number;
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
  resolveRoundByPlayerId: Record<string, number>;
  pendingCounterTeamByPlayerId: Record<string, string | null>;
  cpuTickedOnOpen: boolean;
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

export type PersistedFatigue = { fatigue: number; last3SnapLoads: number[] };

export type PendingTradeOffer = {
  id: string;
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
  createdWeek: number;
  status: "PENDING" | "CANCELLED" | "ACCEPTED";
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
    perkPoints?: number;
    unlockedPerkIds?: string[];
    perkPointLog?: { source: string; amount: number; season: number }[];
  };
  lastSeasonSummary?: SeasonSummary;
  seasonHistory: SeasonSummary[];
  earnedMilestoneIds: string[];
  seasonAwards?: {
    season: number;
    awarded: { source: string; amount: number }[];
    totalPoints: number;
    shown: boolean;
  };
  phase: GamePhase;
  careerStage: CareerStage;
  offseason: OffseasonState;
  offseasonData: OffseasonData;
  franchise: {
    yR1QBByTeamId: Record<string, number | null>;
  };
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
  strategy: StrategyState;
  scouting?: { boardSeed: number; combineRun?: boolean };
  scoutingState?: ScoutingState;
  hub: {
    news: NewsItem[];
    newsReadIds: Record<string, true>;
    newsFilter: string;
    preseasonWeek: number;
    regularSeasonWeek: number;
    schedule: LeagueSchedule | null;
  };
  finances: TeamFinances;
  league: LeagueState;
  saveSeed: number;
  game: GameSim;
  draft: DraftState;
  rookies: RookiePlayer[];
  rookieContracts: Record<string, RookieContract>;
  playerTeamOverrides: Record<string, string>;
  playerContractOverrides: Record<string, PlayerContractOverride>;
  playerFatigueById: Record<string, PersistedFatigue>;
  practicePlan: PracticePlan;
  practicePlanConfirmed: boolean;
  weeklyFamiliarityBonus: number;
  nextGameInjuryRiskMod: number;
  playerDevXpById: Record<string, number>;
  pendingTradeOffers: PendingTradeOffer[];
  tradeError?: TradeDeadlineError;
  tradeBlockByPlayerId: Record<string, boolean>;
  firing: FiringMeter;
  transactions: Transaction[];
  userTeamId?: string;
  teamId?: string;
  playerMorale?: Record<string, number>;
  injuries?: Injury[];
  uiToast?: string;
  trainingFocus?: {
    posGroupFocus: Partial<Record<"QB" | "OL" | "WR" | "RB" | "TE" | "DL" | "EDGE" | "LB" | "CB" | "S", "LOW" | "NORMAL" | "HIGH">>;
  };
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
  teamId: string;
  scoutOvr: number;
  scoutDev: number;
  scoutConf: number;
};

export type DraftPick = {
  overall: number;
  round: number;
  pickInRound: number;
  teamId: string;
  prospectId: string;
  rookiePlayerId: string;
};

export type DraftState = {
  started: boolean;
  completed: boolean;
  totalRounds: number;
  currentOverall: number;
  orderTeamIds: string[];
  leaguePicks: DraftPick[];
  onClockTeamId?: string;
  withdrawnBoardIds: Record<string, true>;
} &
  DraftSimState & {
    rosterCountsByTeamBucket: Record<string, Record<string, number>>;
    draftedCountsByTeamBucket: Record<string, Record<string, number>>;
  };

export type GameAction =
  | { type: "SET_COACH"; payload: Partial<GameState["coach"]> }
  | { type: "SET_PHASE"; payload: GamePhase }
  | { type: "COMPLETE_INTERVIEW"; payload: { teamId: string; answers: Record<string, number>; result: InterviewResult } }
  | { type: "GENERATE_OFFERS" }
  | { type: "ACCEPT_OFFER"; payload: OfferItem }
  | { type: "NEGOTIATE_OFFER"; payload: { teamId: string; years: number; salary: number; autonomy: number } }
  | { type: "HIRE_STAFF"; payload: { role: "OC" | "DC" | "STC"; personId: string; salary: number } }
  | { type: "HIRE_ASSISTANT"; payload: { role: keyof AssistantStaff; personId: string; salary: number } }
  | { type: "SET_SCHEME"; payload: NonNullable<GameState["scheme"]> }
  | { type: "SET_STRATEGY_PRIORITIES"; payload: { positions: PriorityPos[] } }
  | { type: "SET_GM_MODE"; payload: { gmMode: GmMode } }
  | { type: "COORD_ATTEMPT_HIRE"; payload: { role: "OC" | "DC" | "STC"; personId: string } }
  | { type: "ASSISTANT_ATTEMPT_HIRE"; payload: { role: keyof AssistantStaff; personId: string } }
  | { type: "SET_ORG_ROLE"; payload: { role: keyof OrgRoles; coachId: string | undefined } }
  | { type: "ADVANCE_CAREER_STAGE" }
  | { type: "SET_CAREER_STAGE"; payload: CareerStage }
  | { type: "START_GAME"; payload: { opponentTeamId: string; weekType?: GameType; weekNumber?: number; gameType?: GameType; week?: number } }
  | { type: "RESOLVE_PLAY"; payload: { playType: PlayType; personnelPackage?: PersonnelPackage; aggression?: AggressionLevel; tempo?: TempoMode } }
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
  | { type: "SCOUTING_WINDOW_INIT"; payload: { windowId: ScoutingWindowId } }
  | { type: "SCOUTING_SPEND"; payload: { targetType: "PROSPECT" | "FA"; targetId: string; actionType: ScoutAction; prospect?: Prospect } }
  | { type: "SCOUT_INIT" }
  | { type: "SCOUT_BOARD_MOVE"; payload: { prospectId: string; dir: "UP" | "DOWN" } }
  | { type: "SCOUT_BOARD_MOVE_TIER"; payload: { prospectId: string; tierId: "T1" | "T2" | "T3" | "T4" | "T5" } }
  | { type: "SCOUT_PIN"; payload: { prospectId: string } }
  | { type: "SCOUT_SPEND"; payload: { prospectId: string; action: "FILM_QUICK" | "FILM_DEEP" | "REQUEST_MED" | "BACKGROUND" } }
  | { type: "SCOUT_COMBINE_GENERATE" }
  | { type: "SCOUT_COMBINE_SET_DAY"; payload: { day: 1 | 2 | 3 | 4 | 5 } }
  | { type: "SCOUT_COMBINE_FOCUS"; payload: { prospectId: string } }
  | { type: "SCOUT_COMBINE_INTERVIEW"; payload: { prospectId: string; category: "IQ" | "LEADERSHIP" | "STRESS" | "CULTURAL" } }
  | { type: "SCOUT_PRIVATE_WORKOUT"; payload: { prospectId: string; focus: "TALENT" | "FIT" | "CHAR" | "MED" } }
  | { type: "SCOUT_INTERVIEW"; payload: { prospectId: string; category: "IQ" | "LEADERSHIP" | "STRESS" | "CULTURAL" } }
  | { type: "SCOUT_ALLOC_ADJ"; payload: { group: string; delta: number } }
  | { type: "SCOUT_DEV_SIM_WEEK" }
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
  | { type: "FA_UPDATE_USER_OFFER"; payload: { playerId: string; years: number; aav: number } }
  | { type: "FA_CLEAR_USER_OFFER"; payload: { playerId: string } }
  | { type: "FA_RESPOND_COUNTER"; payload: { playerId: string; accept: boolean } }
  | { type: "FA_CPU_TICK" }
  | { type: "FA_RESOLVE" }
  | { type: "FA_RESOLVE_BATCH" }
  | { type: "FA_WITHDRAW_OFFER"; payload: { offerId: string; playerId: string } }
  | { type: "FA_RESOLVE_WEEK"; payload: { week: number } }
  | { type: "FA_ACCEPT_OFFER"; payload: { playerId: string; offerId: string } }
  | { type: "FA_REJECT_OFFER"; payload: { playerId: string; offerId: string } }
  | { type: "CUT_APPLY"; payload: { playerId: string } }
  | { type: "CUT_PLAYER"; payload: { playerId: string } }
  | { type: "TRADE_PLAYER"; payload: { playerId: string } }
  | { type: "TRADE_ACCEPT"; payload: { playerId: string; toTeamId: string; valueTier: string } }
  | { type: "ADD_NEWS_ITEM"; payload: { title: string; body?: string; category?: string } }
  | { type: "SET_PLAYER_TRADE_BLOCK"; payload: { playerId: string; isOnBlock: boolean } }
  | { type: "EXECUTE_TRADE"; payload: { teamA: string; teamB: string; outgoingPlayerIds: string[]; incomingPlayerIds: string[] } }
  | { type: "EXTEND_PLAYER"; payload: { playerId: string; years: number; apy: number; signingBonus: number; guaranteedAtSigning: number } }
  | { type: "ADVANCE_SEASON" }
  | { type: "DISMISS_SEASON_AWARDS" }
  | { type: "PREDRAFT_TOGGLE_VISIT"; payload: { prospectId: string } }
  | { type: "PREDRAFT_TOGGLE_WORKOUT"; payload: { prospectId: string } }
  | { type: "PREDRAFT_SET_VIEWMODE"; payload: { mode: "CONSENSUS" | "GM" | "TEAM" } }
  | { type: "DRAFT_INIT" }
  | { type: "DRAFT_CPU_ADVANCE" }
  | { type: "DRAFT_USER_PICK"; payload: { prospectId: string } }
  | { type: "DRAFT_SHOP" }
  | { type: "DRAFT_ACCEPT_TRADE"; payload: { offerId: string } }
  | { type: "DRAFT_SEND_TRADE_UP_OFFER"; payload: { giveOveralls: number[]; askBackOverall?: number | null } }
  | { type: "DRAFT_DECLINE_OFFER"; payload: { offerId: string } }
  | { type: "DRAFT_CLEAR_TRADE_OFFERS" }
  | { type: "DRAFT_SIM_NEXT" }
  | { type: "DRAFT_SIM_TO_USER" }
  | { type: "DRAFT_SIM_ALL" }
  | { type: "NAV_TO_DRAFT_RESULTS" }
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
  | { type: "DEPTH_BULK_SET"; payload: { startersByPos: Record<string, string | undefined> } }
  | { type: "TOGGLE_DEPTH_SLOT_LOCK"; payload: { slot: string } }
  | { type: "RECALC_OWNER_FINANCIAL"; payload?: { season?: number } }
  | { type: "INIT_PRESEASON_ROTATION" }
  | { type: "SET_PLAYER_SNAP"; payload: { playerId: string; pct: number } }
  | { type: "APPLY_PRESEASON_DEV"; payload: { week: number } }
  | { type: "RESET_DEPTH_CHART_BEST" }
  | { type: "DEPTHCHART_RESET_TO_BEST" }
  | { type: "DEPTH_RESET_TO_BEST" }
  | { type: "AUTOFILL_DEPTH_CHART" }
  | { type: "RECALC_FIRING_METER"; payload: { week: number; winPct?: number; goalsDelta?: number } }
  | { type: "CHECK_FIRING"; payload: { checkpoint: "WEEKLY" | "SEASON_END"; week?: number; winPct?: number; goalsDelta?: number } }
  | { type: "FINANCES_PATCH"; payload: Partial<TeamFinances> }
  | { type: "AUTO_ADVANCE_STAGE_IF_READY" }
  | { type: "SET_TRAINING_FOCUS"; payload: { posGroupFocus: Partial<Record<"QB" | "OL" | "WR" | "RB" | "TE" | "DL" | "EDGE" | "LB" | "CB" | "S", "LOW" | "NORMAL" | "HIGH">> } }
  | { type: "HUB_MARK_NEWS_READ" }
  | { type: "HUB_MARK_NEWS_ITEM_READ"; payload: { id: string } }
  | { type: "HUB_SET_NEWS_FILTER"; payload: { filter: string } }
  | { type: "SET_PRACTICE_PLAN"; payload: PracticePlan }
  | { type: "INJURY_UPSERT"; payload: Injury }
  | { type: "INJURY_MOVE_TO_IR"; payload: { injuryId: string } }
  | { type: "INJURY_ACTIVATE_FROM_IR"; payload: { injuryId: string } }
  | { type: "INJURY_START_PRACTICE_WINDOW"; payload: { injuryId: string } }
  | { type: "RESET" };


function pickTopPlayerIdByPos(teamId: string, pos: string): string | undefined {
  const players = getPlayersByTeam(teamId)
    .filter((p) => String(p.pos ?? "").toUpperCase() === pos)
    .sort((a, b) => Number(b.overall ?? 0) - Number(a.overall ?? 0));
  return players[0]?.playerId;
}

function buildTrackedPlayers(teamId: string): Partial<Record<import("@/engine/fatigue").FatigueTrackedPosition, string>> {
  const qb = pickTopPlayerIdByPos(teamId, "QB");
  const rb = pickTopPlayerIdByPos(teamId, "RB");
  const wr = pickTopPlayerIdByPos(teamId, "WR");
  const te = pickTopPlayerIdByPos(teamId, "TE");
  const ol = pickTopPlayerIdByPos(teamId, "OL");
  const dl = pickTopPlayerIdByPos(teamId, "DL") ?? pickTopPlayerIdByPos(teamId, "EDGE");
  const lb = pickTopPlayerIdByPos(teamId, "LB");
  const db = pickTopPlayerIdByPos(teamId, "CB") ?? pickTopPlayerIdByPos(teamId, "S");
  return { QB: qb, RB: rb, WR: wr, TE: te, OL: ol, DL: dl, LB: lb, DB: db };
}

function hydrateGameFatigue(state: GameState, trackedPlayers: Record<Possession, Partial<Record<import("@/engine/fatigue").FatigueTrackedPosition, string>>>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const side of ["HOME", "AWAY"] as const) {
    for (const playerId of Object.values(trackedPlayers[side])) {
      if (!playerId) continue;
      out[playerId] = clampFatigue(state.playerFatigueById[playerId]?.fatigue ?? FATIGUE_DEFAULT);
    }
  }
  return out;
}

function applyWeeklyFatigueRecovery(state: GameState, snapLoadThisGame: Record<string, number>): Record<string, PersistedFatigue> {
  const next = { ...state.playerFatigueById };
  for (const [playerId, load] of Object.entries(snapLoadThisGame)) {
    const base = next[playerId] ?? { fatigue: FATIGUE_DEFAULT, last3SnapLoads: [] };
    const p = getPlayers().find((pl) => String(pl.playerId) === String(playerId));
    const recovery = getRecoveryRate(String(p?.pos ?? "WR"));
    const recovered = recoverFatigue(base.fatigue, recovery);
    const last3SnapLoads = pushLast3SnapLoad(base.last3SnapLoads, load);
    next[playerId] = { fatigue: recovered, last3SnapLoads };
  }
  return next;
}

function upsertGameFatigueState(state: GameState, sim: GameSim): GameState {
  const next = { ...state.playerFatigueById };
  for (const [playerId, fatigue] of Object.entries(sim.playerFatigue ?? {})) {
    const prev = next[playerId] ?? { fatigue: FATIGUE_DEFAULT, last3SnapLoads: [] };
    next[playerId] = { ...prev, fatigue: clampFatigue(fatigue) };
  }
  return { ...state, playerFatigueById: next };
}

type PracticeApplicationSummary = { avgFatigueDelta: number; devXpPlayers: number; avgFamiliarityGain: number; injuryRiskMod: number };

export function applyPracticePlanForWeek(state: GameState, teamId: string, week: number, failAfterPlayerId?: string): { nextState: GameState; summary: PracticeApplicationSummary } {
  const plan = state.practicePlan ?? DEFAULT_PRACTICE_PLAN;
  const effect = getPracticeEffect(plan);
  const roster = getEffectivePlayersByTeam(state, teamId);
  const fatigue = { ...state.playerFatigueById };
  const dev = { ...state.playerDevXpById };
  const injuries = state.injuries ?? [];

  let totalFatigueDelta = 0;
  let devXpPlayers = 0;
  let totalFamiliarity = 0;

  for (const p of roster) {
    const playerId = String((p as { playerId?: string }).playerId ?? "");
    if (!playerId) continue;
    if (failAfterPlayerId && playerId === failAfterPlayerId) throw new Error("practice-atomic-test");

    const base = fatigue[playerId] ?? { fatigue: FATIGUE_DEFAULT, last3SnapLoads: [] };
    const nextFatigue = applyPracticeFatigue(base.fatigue, effect.fatigueBase);
    fatigue[playerId] = { ...base, fatigue: nextFatigue };
    totalFatigueDelta += nextFatigue - base.fatigue;

    const isInjured = injuries.some((inj) => inj.playerId === playerId && inj.status !== "QUESTIONABLE");
    if (!isInjured && effect.devXP > 0) {
      dev[playerId] = (dev[playerId] ?? 0) + effect.devXP;
      devXpPlayers += 1;
    }

    const famGain = resolveInstallFamiliarity(state.saveSeed, week, playerId, effect.familiarityGain);
    totalFamiliarity += famGain;
  }

  const size = Math.max(1, roster.length);
  const summary: PracticeApplicationSummary = {
    avgFatigueDelta: totalFatigueDelta / size,
    devXpPlayers,
    avgFamiliarityGain: totalFamiliarity / size,
    injuryRiskMod: effect.injuryRiskMod,
  };

  return {
    nextState: {
      ...state,
      playerFatigueById: fatigue,
      playerDevXpById: dev,
      weeklyFamiliarityBonus: summary.avgFamiliarityGain,
      nextGameInjuryRiskMod: effect.injuryRiskMod,
      practicePlan: DEFAULT_PRACTICE_PLAN,
      practicePlanConfirmed: false,
      uiToast: `Practice complete — avg fatigue ${summary.avgFatigueDelta >= 0 ? "+" : ""}${summary.avgFatigueDelta.toFixed(1)} | ${summary.devXpPlayers} players gained Dev XP`,
    },
    summary,
  };
}


export function applyPracticePlanForWeekAtomic(state: GameState, teamId: string, week: number, failAfterPlayerId?: string): { state: GameState; applied: boolean } {
  try {
    return { state: applyPracticePlanForWeek(state, teamId, week, failAfterPlayerId).nextState, applied: true };
  } catch {
    return { state, applied: false };
  }
}

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
    coach: { name: "", ageTier: "32-35", hometown: "", archetypeId: "", tenureYear: 1, perkPoints: 0, unlockedPerkIds: [], perkPointLog: [] },
    seasonHistory: [],
    earnedMilestoneIds: [],
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
      combine: { results: {}, generated: false },
      scouting: {
        windowId: "COMBINE",
        budget: { total: 0, spent: 0, remaining: 0, carryIn: 0 },
        carryover: 0,
        intelByProspectId: {},
        intelByFAId: {},
      },
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
      preDraft: { board: [], visits: {}, workouts: {}, reveals: {}, viewMode: "CONSENSUS" },
      draft: { board: [], picks: [], completed: false },
      camp: { settings: { intensity: "NORMAL", installFocus: "BALANCED", positionFocus: "NONE" } },
      cutDowns: { decisions: {} },
    },
    interviews: { items: INTERVIEW_TEAMS.map((teamId) => ({ teamId, completed: false, answers: {} })), completedCount: 0 },
    tampering: { interestByPlayerId: {}, nameByPlayerId: {}, shortlistPlayerIds: [], softOffersByPlayerId: {}, ui: { mode: "NONE" } },
    franchise: { yR1QBByTeamId: {} },
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
      resolveRoundByPlayerId: {},
      pendingCounterTeamByPlayerId: {},
      cpuTickedOnOpen: false,
    },
    offers: [],
    season: 2026,
    week: 1,
    saveVersion: CURRENT_SAVE_VERSION,
    memoryLog: [],
    teamFinances: { cash: 60_000_000, deadMoneyBySeason: {} },
    owner: { approval: 65, budgetBreaches: 0, financialRating: 70, jobSecurity: 68 },
    staffBudget: { total: 23_000_000, used: 0, byPersonId: {} },
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
    strategy: DEFAULT_STRATEGY,
    scouting: { boardSeed: saveSeed ^ 0x9e3779b9 },
    hub: { news: defaultNews(2026), newsReadIds: {}, newsFilter: "ALL", preseasonWeek: 1, regularSeasonWeek: 1, schedule: createSchedule(saveSeed) },
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
    league: initLeagueState(teams, saveSeed),
    saveSeed,
    game: initGameSim({ homeTeamId: "HOME", awayTeamId: "AWAY", seed: saveSeed }),
    draft: {
      started: false,
      completed: false,
      totalRounds: 7,
      currentOverall: 1,
      orderTeamIds: [],
      leaguePicks: [],
      onClockTeamId: undefined,
      withdrawnBoardIds: {},
      ...initDraftSim({ saveSeed, season: 2026, userTeamId: "MILWAUKEE_NORTHSHORE" }),
      rosterCountsByTeamBucket: {},
      draftedCountsByTeamBucket: {},
    },
    rookies: [],
    rookieContracts: {},
    playerTeamOverrides: {},
    playerContractOverrides: {},
    playerFatigueById: {},
    practicePlan: DEFAULT_PRACTICE_PLAN,
    practicePlanConfirmed: false,
    weeklyFamiliarityBonus: 0,
    nextGameInjuryRiskMod: 0,
    playerDevXpById: {},
    pendingTradeOffers: [],
    tradeError: undefined,
    tradeBlockByPlayerId: {},
    firing: { pWeekly: 0, pSeasonEnd: 0, drivers: [], lastWeekComputed: 0, lastSeasonComputed: 0, fired: false },
    transactions: [],
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

function normalPosGroup(pos: string) {
  const p = pos.toUpperCase();
  if (["QB", "RB", "WR", "TE", "K", "P"].includes(p)) return p;
  if (["C", "G", "T", "OL"].includes(p)) return "OL";
  if (["DT", "NT", "DE", "DL"].includes(p)) return "DL";
  if (["EDGE", "OLB"].includes(p)) return "EDGE";
  if (["ILB", "MLB", "LB"].includes(p)) return "LB";
  if (["CB"].includes(p)) return "CB";
  if (["FS", "SS", "S"].includes(p)) return "S";
  return p;
}

function teamNeedAtPos01(state: GameState, teamId: string, pos: string) {
  const group = normalPosGroup(pos);
  const roster = getPlayersByTeam(teamId);
  const ovs = roster
    .filter((r) => normalPosGroup(String(r.pos ?? "")) === group)
    .map((r) => Number((r as any).ovr ?? (r as any).overall ?? 60));
  const best = ovs.length ? Math.max(...ovs) : 55;
  return clamp01((80 - best) / 20);
}

function prospectSpentProxyForUser(state: GameState, prospectId: string) {
  const v = !!state.offseasonData.preDraft.visits[prospectId];
  const w = !!state.offseasonData.preDraft.workouts[prospectId];
  return (v ? 26 : 0) + (w ? 14 : 0);
}

function prospectSpentProxyForCpu(gmPersonId: string) {
  const gm = getGmTraits(gmPersonId);
  return Math.round(12 + gm.eval_bandwidth * 0.25);
}

function prospectEvalDetRand(saveSeed: number, key: string) {
  return mulberry32(saveSeed ^ hashStr(key));
}

export function getUserProspectEval(state: GameState, prospect: Prospect) {
  const userTeamId = state.acceptedOffer?.teamId ?? state.coach.hometownTeamId ?? "";
  const gmPersonId = state.league.gmByTeamId[userTeamId];
  const gm = getGmTraits(gmPersonId);
  const r = prospectEvalDetRand(state.saveSeed, `gm_eval:${gmPersonId}:${prospect.id}`);
  const spent = prospectSpentProxyForUser(state, prospect.id);
  const need = userTeamId ? teamNeedAtPos01(state, userTeamId, prospect.pos) : 0;
  return evalProspectForGm({ prospect, gm, seedRand: r, spentPoints: spent, teamNeedAtPos01: need });
}

export function getCpuProspectEval(state: GameState, teamId: string, prospect: Prospect) {
  const gmPersonId = state.league.gmByTeamId[teamId];
  const gm = getGmTraits(gmPersonId);
  const r = prospectEvalDetRand(state.saveSeed, `gm_eval:${gmPersonId}:${prospect.id}`);
  const spent = prospectSpentProxyForCpu(gmPersonId);
  const need = teamNeedAtPos01(state, teamId, prospect.pos);
  return evalProspectForGm({ prospect, gm, seedRand: r, spentPoints: spent, teamNeedAtPos01: need });
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

function asMoney(n: number) {
  return Math.round(n / 50_000) * 50_000;
}

function offerScore(state: GameState, playerId: string, offer: FreeAgencyOffer, market: number) {
  const interest = state.tampering.interestByPlayerId[playerId] ?? 0;
  const moneyScore = clamp01((offer.aav - market * 0.85) / (market * 0.6)) * 0.62;
  const termScore = clamp01((offer.years - 1) / 4) * 0.1;
  const intScore = clamp01(interest) * 0.18;
  const userBoost = offer.isUser ? 0.06 : 0;
  const noise = detRand(state.saveSeed, `FA_SC|S${state.season}|P${playerId}|O${offer.offerId}`) * 0.04;
  return moneyScore + termScore + intScore + userBoost + noise;
}

function cpuWillAcceptCounter(state: GameState, teamId: string, p: any, years: number, aav: number) {
  const pos = normalizePos(String(p?.pos ?? "UNK"));
  const market = projectedMarketApy(pos, Number(p?.overall ?? 0), Number(p?.age ?? 26));
  const need = teamNeedsScore(state, teamId, pos);
  const noise = detRand(state.saveSeed, `CPU_CNT|S${state.season}|T${teamId}|P${String(p?.playerId ?? "")}`);
  const max = market * (0.95 + need * 0.28 + noise * 0.12);
  return aav <= max;
}

function closeAllOffers(offers: FreeAgencyOffer[], acceptedOfferId?: string) {
  return offers.map((o) => {
    if (acceptedOfferId && o.offerId === acceptedOfferId) return o;
    if (o.status === "PENDING" || o.status === "COUNTERED") return { ...o, status: "REJECTED" as const };
    return o;
  });
}

function signFromOffer(state: GameState, playerId: string, offer: FreeAgencyOffer, signingTeamId: string) {
  const years = Math.max(1, offer.years);
  const totalCash = offer.aav * years;
  const signingBonus = asMoney(totalCash * 0.22);
  const salaries = makeEscalatingSalaries(totalCash - signingBonus, years, 0.06);
  const ovr: PlayerContractOverride = { startSeason: state.season, endSeason: state.season + years - 1, salaries, signingBonus };
  const cashY1 = (salaries[0] ?? 0) + signingBonus;

  let next = applyFinances({
    ...state,
    playerTeamOverrides: { ...state.playerTeamOverrides, [playerId]: signingTeamId },
    playerContractOverrides: { ...state.playerContractOverrides, [playerId]: ovr },
    finances: { ...state.finances, cash: state.finances.cash - cashY1 },
  });

  const p: any = (getPlayers() as any[]).find((x: any) => String(x.playerId) === String(playerId));
  next = pushNews(next, `Signed: ${String(p?.fullName ?? "Player")} (${String(p?.pos ?? "")}) agrees to terms.`);
  return faPush(next, `Signed: ${String(p?.fullName ?? "Player")} — ${years} yrs @ $${Math.round(offer.aav / 1_000_000)}M/yr.`, playerId);
}

function expireUserCounters(state: GameState): GameState {
  const userTeamId = String(state.acceptedOffer?.teamId ?? "");
  if (!userTeamId) return state;
  const offersByPlayerId: Record<string, FreeAgencyOffer[]> = { ...state.freeAgency.offersByPlayerId };
  let changed = false;

  for (const [pid, offers] of Object.entries(offersByPlayerId)) {
    const myCounters = offers.filter((o) => o.status === "COUNTERED" && o.teamId === userTeamId);
    if (!myCounters.length) continue;

    for (const c of myCounters) {
      const createdAt = Number(c.counterCreatedAtResolve ?? -1);
      if (createdAt < 0) continue;
      if (state.freeAgency.resolvesUsedThisPhase >= createdAt) {
        offersByPlayerId[pid] = offersByPlayerId[pid].map((o) => (o.offerId === c.offerId ? { ...o, status: "REJECTED" as const } : o));
        changed = true;
      }
    }
  }

  return changed ? { ...state, freeAgency: { ...state.freeAgency, offersByPlayerId } } : state;
}

function collectFaInvariantViolations(state: GameState): string[] {
  const violations: string[] = [];
  const userTeamId = String(state.acceptedOffer?.teamId ?? "");
  const resolveCount = Number(state.freeAgency.resolvesUsedThisPhase ?? 0);

  for (const [pid, offers] of Object.entries(state.freeAgency.offersByPlayerId)) {
    const signed = !!state.freeAgency.signingsByPlayerId[pid];
    const accepted = offers.filter((o) => o.status === "ACCEPTED");
    const active = offers.filter((o) => o.status === "PENDING" || o.status === "COUNTERED");

    if (signed) {
      if (accepted.length !== 1) violations.push(`[${pid}] signed player must have exactly one ACCEPTED offer (found ${accepted.length}).`);
      const openOthers = offers.filter((o) => o.status !== "ACCEPTED" && o.status !== "REJECTED" && o.status !== "WITHDRAWN");
      if (openOthers.length) violations.push(`[${pid}] signed player has non-closed non-winner offers: ${openOthers.map((o) => `${o.offerId}:${o.status}`).join(", ")}.`);
    } else if (accepted.length) {
      violations.push(`[${pid}] unsigned player has ACCEPTED offers (${accepted.length}).`);
    }

    for (const o of offers) {
      if (o.status !== "COUNTERED") continue;
      if (typeof o.counterCreatedAtResolve !== "number") {
        violations.push(`[${pid}] counter ${o.offerId} missing counterCreatedAtResolve.`);
        continue;
      }
      if (o.isUser && userTeamId && String(o.teamId) === userTeamId) {
        const age = resolveCount - Number(o.counterCreatedAtResolve);
        if (age > 1) violations.push(`[${pid}] user counter ${o.offerId} is stale (age=${age} resolves).`);
      }
    }

    if (signed && active.length) {
      violations.push(`[${pid}] player is signed but still has active offers (${active.length}).`);
    }
  }

  return violations;
}

function reportFaInvariantViolations(state: GameState, source: "FA_CPU_TICK" | "FA_RESOLVE") {
  if (!import.meta.env.DEV) return;
  const violations = collectFaInvariantViolations(state);
  if (!violations.length) return;
  console.error(`[FA_INVARIANTS][${source}] ${violations.length} violation(s)`, {
    resolve: state.freeAgency.resolvesUsedThisPhase,
    violations,
  });
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


function qb1OvrByTeam(state: GameState, teamId: string) {
  const qbs = getEffectivePlayersByTeam(state, teamId)
    .filter((p: any) => normalizePos(String(p.pos ?? "")) === "QB")
    .map((p: any) => Number(p.overall ?? 0))
    .sort((a, b) => b - a);
  return qbs[0] ?? 0;
}

function computeBadQbTeams(state: GameState) {
  const teamIds = getAllTeamIds();
  const starters = teamIds.map((t) => ({ t, ovr: qb1OvrByTeam(state, t) }));
  const byTeam: Record<string, { ovr: number; pct: number; bad: boolean }> = {};

  for (const a of starters) {
    let le = 0;
    for (const b of starters) {
      if (b.t === a.t) continue;
      if (b.ovr <= a.ovr) le++;
    }
    const pct = starters.length <= 1 ? 1 : le / (starters.length - 1);
    byTeam[a.t] = { ovr: a.ovr, pct, bad: pct <= 0.1 };
  }
  return byTeam;
}

function qbLockActive(state: GameState, teamId: string) {
  const y = state.franchise.yR1QBByTeamId[teamId];
  if (y == null) return false;
  return state.season - y < 3;
}

function qbGateAllowsAcquisition(state: GameState, teamId: string, role: "STARTER" | "BACKUP", apy: number) {
  if (!qbLockActive(state, teamId)) return true;

  const bad = computeBadQbTeams(state)[teamId]?.bad ?? false;
  if (bad) return true;

  if (role === "BACKUP") {
    const cap = Math.max(1, capSpaceForTeam(state, teamId) + (computeCapLedger(state, teamId, { useTop51: !!state.finances.postJune1Sim })?.capSpace ?? 0));
    return apy <= cap * 0.06;
  }
  return false;
}

function noteR1QBDraft(state: GameState, teamId: string, round: number, posRaw: string): GameState {
  if (round !== 1) return state;
  if (normalizePos(posRaw) !== "QB") return state;
  return {
    ...state,
    franchise: {
      ...state.franchise,
      yR1QBByTeamId: { ...state.franchise.yR1QBByTeamId, [String(teamId)]: state.season },
    },
  };
}

export function qbTradeOfferAllowed(state: GameState, acquiringTeamId: string, playerPosRaw: string) {
  if (normalizePos(playerPosRaw) !== "QB") return true;
  const role = teamNeedsScore(state, acquiringTeamId, "QB") >= 0.5 ? "STARTER" : "BACKUP";
  if (role === "BACKUP") return true;
  return qbGateAllowsAcquisition(state, acquiringTeamId, "STARTER", Number.POSITIVE_INFINITY);
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

function cpuOfferTick(state: GameState, offerLimit = 70): GameState {
  if (state.careerStage !== "FREE_AGENCY") return state;

  const userTeamId = String(state.acceptedOffer?.teamId ?? "");
  const teamIds = getAllTeamIds().filter((t) => t && t !== userTeamId);

  const fa = getEffectiveFreeAgents(state)
    .map((p: any) => ({ p, id: String(p.playerId), pos: normalizePos(String(p.pos ?? "UNK")), ovr: Number(p.overall ?? 0), age: Number(p.age ?? 26) }))
    .filter((x) => !state.freeAgency.signingsByPlayerId[x.id])
    .sort((a, b) => b.ovr - a.ovr);

  let next = state;
  let created = 0;

  const offerCounts: Record<string, number> = {};
  for (const [pid, offers] of Object.entries(state.freeAgency.offersByPlayerId)) {
    offerCounts[pid] = offers.filter((o) => o.status === "PENDING" || o.status === "COUNTERED").length;
  }

  const orderedFa = fa
    .slice(0, 160)
    .sort((a, b) => (offerCounts[b.id] ?? 0) - (offerCounts[a.id] ?? 0) || b.ovr - a.ovr);

  for (const teamId of teamIds) {
    if (created >= offerLimit) break;

    const needs = ["QB", "RB", "WR", "TE", "DL", "EDGE", "LB", "CB", "S", "K", "P"]
      .map((pos) => ({ pos, s: teamNeedsScore(state, teamId, pos) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);

    let targets = orderedFa.filter((x) => needs.some((n) => n.s > 0.15 && n.pos === x.pos)).slice(0, 10);
    targets = targets.filter((x) => {
      if (x.pos !== "QB") return true;
      const { aav } = cpuOfferParams(next, teamId, x.p);
      const role = teamNeedsScore(next, teamId, "QB") >= 0.5 ? "STARTER" : "BACKUP";
      return qbGateAllowsAcquisition(next, teamId, role, aav);
    });

    const pick = targets.length
      ? targets[Math.floor(detRand(state.saveSeed, `CPU_PICK|${teamId}|R${state.freeAgency.resolvesUsedThisPhase}`) * targets.length)]
      : orderedFa.find((x) => x.pos !== "QB") ?? orderedFa[0];

    if (!pick) continue;

    const pid = pick.id;
    const existing = next.freeAgency.offersByPlayerId[pid] ?? [];
    const alreadyPending = existing.some((o) => !o.isUser && o.teamId === teamId && (o.status === "PENDING" || o.status === "COUNTERED"));
    if (alreadyPending) continue;

    const { years, aav } = cpuOfferParams(next, teamId, pick.p);
    if (pick.pos === "QB") {
      const role = teamNeedsScore(next, teamId, "QB") >= 0.5 ? "STARTER" : "BACKUP";
      if (!qbGateAllowsAcquisition(next, teamId, role, aav)) continue;
    }

    const offerId = makeOfferId(next);
    const cpuOffer: FreeAgencyOffer = { offerId, playerId: pid, teamId, isUser: false, years, aav, createdWeek: next.hub.regularSeasonWeek ?? 1, status: "PENDING" };

    next = upsertStateOffers(next, pid, [...existing, cpuOffer]);
    created++;
  }

  return cpuWithdrawOffers(next);
}

function upsertStateOffers(state: GameState, playerId: string, nextOffers: FreeAgencyOffer[]) {
  return { ...state, freeAgency: upsertOffers({ ...state, freeAgency: { ...state.freeAgency, nextOfferSeq: state.freeAgency.nextOfferSeq + 1 } }, playerId, nextOffers) };
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
  const traits = getArchetypeTraits(state.coach.archetypeId);
  if (traits?.faInterestModifiers?.[pos as keyof typeof traits.faInterestModifiers] != null) {
    base += Number(traits.faInterestModifiers[pos as keyof typeof traits.faInterestModifiers]) / 100;
  }
  base += detRand(state.saveSeed, `FA_INT|S${state.season}|P${p.playerId}`) * 0.10;
  return clamp01(base);
}

function resetFaPhase(state: GameState): GameState {
  return {
    ...state,
    freeAgency: { ...state.freeAgency, resolvesUsedThisPhase: 0, activity: [], ui: { mode: "NONE" }, resolveRoundByPlayerId: {}, pendingCounterTeamByPlayerId: {}, cpuTickedOnOpen: false },
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

  let sum = 0;
  try {
    const roster = getPlayersByTeam(String(teamId));
    for (const player of roster) {
      const playerId = String((player as any).playerId ?? "");
      if (!playerId) continue;
      const contract = getPersonnelContract(playerId);
      if (contract && String(contract.teamId) === String(teamId) && String(contract.entityType) === "PLAYER") {
        sum += Number((contract as any).salaryY1 ?? 0);
      }
    }
  } catch {
    // Keep defensive fallback to overrides/base only.
  }

  sum += state.finances.baseCommitted;

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

function stableHashId(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `n_${(h >>> 0).toString(16)}`;
}

function makeNewsItem(title: string, opts?: { body?: string; category?: string; createdAt?: number }): NewsItem {
  const createdAt = opts?.createdAt ?? Date.now();
  const id = stableHashId(`${createdAt}:${opts?.category ?? ""}:${title}:${opts?.body ?? ""}`);
  return { id, title, body: opts?.body, category: opts?.category, createdAt };
}

function defaultNews(season: number): NewsItem[] {
  const now = Date.now();
  return [
    makeNewsItem(`League announces ${season} salary cap at $250M`, { category: "LEAGUE", createdAt: now - 10 * 60_000 }),
    makeNewsItem("Coaching staffs begin offseason installs", { category: "COACHING", createdAt: now - 9 * 60_000 }),
    makeNewsItem("Front offices prepare for free agency", { category: "LEAGUE", createdAt: now - 8 * 60_000 }),
    makeNewsItem("Draft prospects begin pro day circuit", { category: "DRAFT", createdAt: now - 7 * 60_000 }),
  ];
}

function ensureNewsItems(raw: unknown, now: number): NewsItem[] {
  if (!Array.isArray(raw)) return [];
  if (!raw.length) return [];
  if (typeof raw[0] === "object" && raw[0] && "id" in (raw[0] as any)) {
    return (raw as any[]).map((x) => ({
      id: String((x as any).id),
      title: String((x as any).title ?? ""),
      body: (x as any).body ? String((x as any).body) : undefined,
      category: (x as any).category ? String((x as any).category) : undefined,
      createdAt: Number((x as any).createdAt ?? now),
    }));
  }
  return (raw as any[]).map((line, idx) => ({
    id: stableHashId(`${String(line ?? "")}:${idx}`),
    title: String(line ?? ""),
    createdAt: now - idx * 60_000,
  }));
}

function pushNews(state: GameState, line: string): GameState {
  const news = [makeNewsItem(line), ...(state.hub.news ?? [])].slice(0, 200);
  return { ...state, hub: { ...state.hub, news } };
}

function addNews(state: GameState, item: { title: string; body?: string; category?: string }): GameState {
  const news = [makeNewsItem(item.title, { body: item.body, category: item.category }), ...(state.hub.news ?? [])].slice(0, 200);
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

function fillDepthForTrainingCamp(state: GameState): GameState {
  const teamId = state.acceptedOffer?.teamId ? String(state.acceptedOffer.teamId) : null;
  if (!teamId) return state;

  const prevSlots = state.depthChart.startersByPos;
  const startersByPos = autoFillDepthChartGaps(state, teamId);
  const nextDepth = { ...state.depthChart, startersByPos };

  let next = { ...state, depthChart: nextDepth };
  next = pushMajorDepthNews(next, teamId, prevSlots, startersByPos);
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
      newsReadIds: {},
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
      resolveRoundByPlayerId: {},
      pendingCounterTeamByPlayerId: {},
      cpuTickedOnOpen: false,
    },
    playerTeamOverrides,
    playerContractOverrides,
    finances: { ...state.finances, cash },
  });
}

function computeSeasonSummary(state: GameState): SeasonSummary {
  const teamId = state.acceptedOffer?.teamId ?? "";
  const standingRows = Object.entries(state.league.standings ?? {}).map(([id, row]) => ({
    teamId: id,
    w: Number(row?.w ?? 0),
    l: Number(row?.l ?? 0),
    pf: Number(row?.pf ?? 0),
    pa: Number(row?.pa ?? 0),
  }));
  const byRecord = standingRows.slice().sort((a, b) => b.w - a.w || (b.pf - b.pa) - (a.pf - a.pa) || b.pf - a.pf);
  const byOffense = standingRows.slice().sort((a, b) => b.pf - a.pf);
  const byDefense = standingRows.slice().sort((a, b) => a.pa - b.pa);

  const rep = state.coach.reputation;
  const team = getTeams().find((t) => t.teamId === teamId);
  const divisionTeams = team ? getTeams().filter((t) => t.divisionId === team.divisionId).map((t) => t.teamId) : [];
  const divisionRows = byRecord.filter((row) => divisionTeams.includes(row.teamId));
  const divisionWinner = divisionRows[0]?.teamId === teamId;
  const teamStanding = byRecord.find((row) => row.teamId === teamId);

  const postseasonResult = state.league.postseason?.resultsByTeamId?.[teamId];
  const playoffResult: SeasonSummary["playoffResult"] = postseasonResult?.isChampion
    ? "champion"
    : postseasonResult?.eliminatedIn === "SUPER_BOWL"
      ? "superbowlLoss"
      : postseasonResult?.madePlayoffs
        ? "divisional"
        : "missed";

  const volatilityEvents = (state.memoryLog ?? []).filter((event) => String(event.type ?? "").toLowerCase().includes("volatility") && Number(event.season) === Number(state.season)).length;

  return {
    tenureYear: Number(state.coach.tenureYear ?? 1),
    wins: Number(teamStanding?.w ?? 0),
    losses: Number(teamStanding?.l ?? 0),
    playoffResult,
    finalStanding: Math.max(1, byRecord.findIndex((row) => row.teamId === teamId) + 1 || 32),
    divisionWinner,
    offenseRank: Math.max(1, byOffense.findIndex((row) => row.teamId === teamId) + 1 || 32),
    defenseRank: Math.max(1, byDefense.findIndex((row) => row.teamId === teamId) + 1 || 32),
    specialTeamsRank: Math.max(1, Math.round(((byOffense.findIndex((row) => row.teamId === teamId) + 1 || 32) + (byDefense.findIndex((row) => row.teamId === teamId) + 1 || 32)) / 2)),
    reputationSnapshot: {
      leaguePrestige: Number(rep?.leaguePrestige ?? state.coach.repBaseline ?? 50),
      offCred: Number(rep?.offCred ?? 50),
      defCred: Number(rep?.defCred ?? 50),
      leadershipTrust: Number(rep?.leadershipTrust ?? 50),
      mediaRep: Number(rep?.mediaRep ?? 50),
      playerRespect: Number(rep?.playerRespect ?? 50),
    },
    reputationDeltas: {
      leaguePrestige: Number(rep?.leaguePrestige ?? 50) - Number(state.coach.repBaseline ?? 50),
      offCred: Number(rep?.offCred ?? 50) - 50,
      defCred: Number(rep?.defCred ?? 50) - 50,
      leadershipTrust: Number(rep?.leadershipTrust ?? 50) - 50,
      mediaRep: Number(rep?.mediaRep ?? 50) - 50,
      playerRespect: Number(rep?.playerRespect ?? 50) - 50,
    },
    ownerConfidence: Number(state.owner.approval ?? 50),
    gmRelationship: Number(state.coach.gmRelationship ?? 50),
    lockerRoomCred: Number(state.coach.lockerRoomCred ?? 50),
    volatilityEvents,
    archetypeId: state.coach.archetypeId,
  };
}

function applySeasonMilestoneAwards(state: GameState): GameState {
  const summary = computeSeasonSummary(state);
  const milestoneResult = checkMilestones(summary, new Set(state.earnedMilestoneIds ?? []));
  const awardedWithSeason = milestoneResult.awarded.map((entry) => ({ ...entry, season: Number(state.coach.tenureYear ?? 1) }));

  return {
    ...state,
    coach: {
      ...state.coach,
      perkPoints: (state.coach.perkPoints ?? 0) + milestoneResult.totalPoints,
      perkPointLog: [...(state.coach.perkPointLog ?? []), ...awardedWithSeason],
    },
    earnedMilestoneIds: Array.from(milestoneResult.newEarnedIds),
    lastSeasonSummary: summary,
    seasonHistory: [...(state.seasonHistory ?? []), summary],
    seasonAwards: {
      season: state.season,
      awarded: milestoneResult.awarded,
      totalPoints: milestoneResult.totalPoints,
      shown: false,
    },
  };
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

export function getProspectRow(prospectId: string): Record<string, unknown> | null {
  return DRAFT_ROWS.find((r) => String(r["Player ID"]) === prospectId) ?? null;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}



function hasMedicalRedFlag(state: GameState, prospectId: string) {
  const row = getProspectRow(prospectId);
  const injury = Number(row?.["Injury"] ?? row?.["Durability"] ?? 65);
  const stamina = Number(row?.["Stamina"] ?? 65);
  const d = (injury + stamina) / 2;
  const p = clamp(0.03 + clamp((58 - d) / 28, 0, 1) * 0.22, 0.03, 0.35);
  return detRand(state.saveSeed, `MED_RED|${state.season}|${prospectId}`) < p;
}

function medicalLevelFromDurability(stamina: number, injury: number, redFlag: boolean, blackFlag: boolean): MedicalFlagLevel {
  if (blackFlag) return "BLACK";
  if (redFlag) return "RED";
  const d = (stamina + injury) / 2;
  if (d >= 78) return "GREEN";
  if (d >= 68) return "YELLOW";
  if (d >= 58) return "ORANGE";
  return "RED";
}

function characterLevelFromRow(maturity: number, leadership: number, incidents: number, cultureDq: boolean): CharacterFlagLevel {
  if (cultureDq) return "BLACK";
  if (incidents >= 2) return "RED";
  if (incidents === 1) return "ORANGE";
  const x = maturity * 0.65 + leadership * 0.35;
  if (leadership >= 85 && maturity >= 78) return "BLUE";
  if (x >= 72) return "GREEN";
  if (x >= 62) return "YELLOW";
  if (x >= 54) return "ORANGE";
  return "RED";
}

function footballTagsFromRow(row: Record<string, unknown> | null) {
  const out: string[] = [];
  const rank = Number(row?.["Rank"] ?? 9999);
  const ras = Number(row?.["RAS"] ?? row?.["RAS_Score"] ?? 0);
  const arm = Number(row?.["Arm_Strength"] ?? 0);
  const speed = Number(row?.["Speed"] ?? 0);
  const tier = Number(row?.["DraftTier"] ?? 60);

  if (rank <= 32 || tier >= 80) out.push("Gold: 1st");
  if (ras >= 90 || arm >= 90 || speed >= 92) out.push("Purple: Elite Trait");
  return out;
}

function hasMedicalBlackFlag(state: GameState, prospectId: string) {
  const row = getProspectRow(prospectId);
  const stamina = Number(row?.["Stamina"] ?? 65);
  const injury = Number(row?.["Injury"] ?? row?.["Durability"] ?? 65);
  const d = (stamina + injury) / 2;
  const p = clamp(0.002 + clamp((52 - d) / 25, 0, 1) * 0.03, 0, 0.05);
  return detRand(state.saveSeed, `MED_BLACK|${state.season}|${prospectId}`) < p;
}

function incidentCountFromRow(row: Record<string, unknown> | null) {
  const explicit = Number(row?.["Incidents"] ?? row?.["OffField_Incidents"] ?? NaN);
  if (Number.isFinite(explicit)) return clamp(explicit, 0, 3);

  const discipline = Number(row?.["Discipline"] ?? 60);
  const maturity = Number(row?.["Maturity"] ?? 65);
  const volatility = Number(row?.["Volatility"] ?? 60);

  let n = 0;
  if (discipline <= 55) n++;
  if (maturity <= 55) n++;
  if (volatility >= 82) n++;
  return clamp(n, 0, 3);
}

function cultureDqFromRow(state: GameState, prospectId: string, row: Record<string, unknown> | null) {
  const incidents = incidentCountFromRow(row);
  if (incidents < 2) return false;
  const p = incidents === 3 ? 0.35 : 0.18;
  return detRand(state.saveSeed, `CULTURE_DQ|${state.season}|${prospectId}`) < p;
}

function genVisitReveal(state: GameState, prospectId: string): PreDraftReveal {
  const row = getProspectRow(prospectId);

  const stamina = Number(row?.["Stamina"] ?? 65);
  const injury = Number(row?.["Injury"] ?? row?.["Durability"] ?? 65);
  const maturity = Number(row?.["Maturity"] ?? 65);
  const leadership = Number(row?.["Leadership"] ?? 60);

  const red = hasMedicalRedFlag(state, prospectId);
  const black = hasMedicalBlackFlag(state, prospectId);
  const incidents = incidentCountFromRow(row);
  const cultureDq = cultureDqFromRow(state, prospectId, row);

  const medicalLevel = medicalLevelFromDurability(stamina, injury, red, black);
  const characterLevel = characterLevelFromRow(maturity, leadership, incidents, cultureDq);
  const footballTags = footballTagsFromRow(row);

  const symbols: string[] = [];
  if (leadership >= 85) symbols.push("★");
  if (characterLevel === "BLUE") symbols.push("C");
  if (incidents >= 1) symbols.push("X");
  if (maturity <= 58) symbols.push("△");

  const flags: string[] = [];
  flags.push(`Medical: ${medicalLevel}`);
  flags.push(`Character: ${characterLevel}`);
  if (footballTags.length) flags.push(...footballTags);
  if (cultureDq) flags.unshift("Character: Remove From Board");

  return { flags, hasMedicalRedFlag: medicalLevel === "RED" || medicalLevel === "BLACK", medicalLevel, characterLevel, footballTags, symbols };
}

export function predictVisitReveal(state: GameState, prospectId: string): PreDraftReveal {
  return genVisitReveal(state, prospectId);
}
function posNormDraft(pos: string) {
  const p = String(pos ?? "").toUpperCase();
  if (p === "HB") return "RB";
  if (["OLB", "ILB", "MLB"].includes(p)) return "LB";
  if (["FS", "SS"].includes(p)) return "S";
  if (p === "DT") return "DL";
  if (p === "DE") return "EDGE";
  if (["OT", "OG", "C", "OL"].includes(p)) return "OL";
  if (p === "DB") return "CB";
  return p || "UNK";
}

function computeDraftOrder(state: GameState): string[] {
  return getTeams()
    .filter((t) => t.isActive)
    .map((t) => String(t.teamId))
    .sort((a, b) => a.localeCompare(b));
}

function draftRoundPick(overall: number, teamsCount: number) {
  const round = Math.floor((overall - 1) / teamsCount) + 1;
  const pickInRound = ((overall - 1) % teamsCount) + 1;
  return { round, pickInRound };
}

function coachScoutRep(state: GameState) {
  return clamp(Number(state.coach.reputation?.leaguePrestige ?? state.coach.repBaseline ?? 60), 0, 100);
}

function scoutConfidenceForProspect(state: GameState, prospectId: string) {
  const rep = coachScoutRep(state);
  const visited = !!state.offseasonData.preDraft.visits[prospectId];
  const worked = !!state.offseasonData.preDraft.workouts[prospectId];
  const combine = !!state.offseasonData.combine.generated;
  const base = clamp(40 + rep * 0.45, 40, 85);
  return clamp(base + (visited ? 10 : 0) + (worked ? 6 : 0) + (combine ? 5 : 0), 0, 99);
}

function applyScoutNoise(state: GameState, seedKey: string, conf: number, trueVal: number, rangeAtZeroConf: number, minV: number, maxV: number) {
  const t = 1 - conf / 100;
  const range = t * rangeAtZeroConf;
  const r = detRand(state.saveSeed, seedKey) * 2 - 1;
  return clamp(Math.round(trueVal + r * range), minV, maxV);
}

function teamNeedScoreDraft(state: GameState, teamId: string, posRaw: string): number {
  const pos = posNormDraft(posRaw);
  const roster = getEffectivePlayersByTeam(state, teamId);
  const atPos = roster.filter((pl: any) => posNormDraft(String(pl.pos ?? "")) === pos);
  const best = atPos.sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0))[0];
  const bestOvr = Number(best?.overall ?? 0);
  const minStarter = ["QB", "OL", "WR", "CB", "EDGE"].includes(pos) ? 72 : 68;
  const starterGap = clamp((minStarter - bestOvr) / 22, 0, 1);
  const depthGap = clamp((2 - atPos.length) / 2, 0, 1);
  const weight =
    pos === "QB"
      ? 1.25
      : pos === "OL"
        ? 1.1
        : ["WR", "CB", "EDGE"].includes(pos)
          ? 1.0
          : ["RB", "TE", "LB", "S", "DL"].includes(pos)
            ? 0.85
            : 0.55;
  return clamp((starterGap * 0.7 + depthGap * 0.3) * weight, 0, 1);
}


function medicalLevelEstimateFromRow(row: any): "GREEN" | "YELLOW" | "ORANGE" | "RED" | "BLACK" {
  const stamina = Number(row?.["Stamina"] ?? 65);
  const injury = Number(row?.["Injury"] ?? row?.["Durability"] ?? 65);
  const d = (stamina + injury) / 2;

  if (d <= 45) return "BLACK";
  if (d >= 78) return "GREEN";
  if (d >= 68) return "YELLOW";
  if (d >= 58) return "ORANGE";
  return "RED";
}

function medicalDraftPenalty(level: string) {
  if (level === "GREEN") return 0.0;
  if (level === "YELLOW") return 0.01;
  if (level === "ORANGE") return 0.03;
  if (level === "RED") return 0.06;
  return 0.12;
}

function cpuDraftPickProspectId(
  state: GameState,
  teamId: string,
  opts?: { avoidRevealedBlack?: boolean; userTeamId?: string }
): string | null {
  const used = state.draft.withdrawnBoardIds;
  const avoid = !!opts?.avoidRevealedBlack && String(opts?.userTeamId ?? "") === String(teamId);
  const reveals = state.offseasonData.preDraft.reveals;
  const rows = (draftClassJson as Record<string, unknown>[])
    .slice()
    .sort((a, b) => Number((a as any)["Rank"] ?? 9999) - Number((b as any)["Rank"] ?? 9999))
    .filter((r) => !used[String((r as any)["Player ID"])])
    .filter((r) => {
      if (!avoid) return true;
      const pid = String((r as any)["Player ID"]);
      const rev = reveals[pid];
      if (!rev) return true;
      return rev.characterLevel !== "BLACK" && rev.medicalLevel !== "BLACK";
    })
    .slice(0, 110);

  if (!rows.length) return null;

  let bestId = String((rows[0] as any)["Player ID"]);
  let bestScore = -1e9;

  for (const r of rows) {
    const pid = String((r as any)["Player ID"]);
    const rank = Number((r as any)["Rank"] ?? 9999);
    const pos = posNormDraft(String((r as any)["POS"] ?? "UNK"));
    const need = teamNeedScoreDraft(state, teamId, pos);
    const base = (450 - rank) / 450;
    const jitter = detRand(state.saveSeed, `CPU_DRAFT|${state.season}|${teamId}|${pid}|${state.draft.currentOverall}`) * 0.03;
    const medLevel = medicalLevelEstimateFromRow(r);
    const medPenalty = medicalDraftPenalty(medLevel);
    const score = base + need * 0.42 + jitter - medPenalty;
    if (score > bestScore) {
      bestScore = score;
      bestId = pid;
    }
  }

  return bestId;
}

function ensureDraftInitialized(state: GameState): GameState {
  if (state.draft.started && state.draft.orderTeamIds.length) return state;

  const orderTeamIds = computeDraftOrder(state);
  const onClockTeamId = orderTeamIds[0];

  return {
    ...state,
    draft: {
      ...state.draft,
      started: true,
      completed: false,
      totalRounds: state.draft.totalRounds || 7,
      currentOverall: 1,
      orderTeamIds,
      leaguePicks: [],
      onClockTeamId,
      withdrawnBoardIds: {},
    },
  };
}

function applyLeagueDraftPick(state: GameState, teamId: string, prospectId: string): GameState {
  if (state.draft.withdrawnBoardIds[prospectId]) return state;

  const row = getProspectRow(prospectId);
  const rank = row ? Number(row["Rank"] ?? 200) : 200;

  const teamsCount = state.draft.orderTeamIds.length || 32;
  const { round, pickInRound } = draftRoundPick(state.draft.currentOverall, teamsCount);

  const idx = state.rookies.length + 1;
  const playerId = `ROOK_${String(idx).padStart(4, "0")}`;

  const trueOvr = rookieOvrFromRank(rank);
  const trueDev = rookieDevFromTier(row ?? {});
  const apy = rookieApyFromRank(rank);

  const conf = scoutConfidenceForProspect(state, prospectId);
  const scoutOvr = applyScoutNoise(state, `SCOUT_OVR|${state.season}|${prospectId}`, conf, trueOvr, 12, 40, 92);
  const scoutDev = applyScoutNoise(state, `SCOUT_DEV|${state.season}|${prospectId}`, conf, trueDev, 20, 35, 95);

  const rookie: RookiePlayer = {
    playerId,
    prospectId,
    name: row ? String(row["Name"] ?? "Rookie") : "Rookie",
    pos: row ? posNormDraft(String(row["POS"] ?? "UNK")) : "UNK",
    age: row ? Number(row["Age"] ?? 22) : 22,
    ovr: trueOvr,
    dev: trueDev,
    apy,
    teamId,
    scoutOvr,
    scoutDev,
    scoutConf: conf,
  };

  const contract = rookieContractFromApy(state.season + 1, rookie.apy);

  const pick: DraftPick = {
    overall: state.draft.currentOverall,
    round,
    pickInRound,
    teamId,
    prospectId,
    rookiePlayerId: rookie.playerId,
  };

  const drafted0: GameState = {
    ...state,
    rookies: [...state.rookies, rookie],
    rookieContracts: { ...state.rookieContracts, [rookie.playerId]: contract },
    playerTeamOverrides: { ...state.playerTeamOverrides, [rookie.playerId]: teamId },
    draft: {
      ...state.draft,
      leaguePicks: [...state.draft.leaguePicks, pick],
      withdrawnBoardIds: { ...state.draft.withdrawnBoardIds, [prospectId]: true },
    },
  };

  const drafted = noteR1QBDraft(drafted0, teamId, round, rookie.pos);

  const nextOverall = drafted.draft.currentOverall + 1;
  const totalPicks = drafted.draft.totalRounds * (drafted.draft.orderTeamIds.length || 32);
  const completed = nextOverall > totalPicks;
  const nextOnClock = completed ? undefined : drafted.draft.orderTeamIds[(nextOverall - 1) % drafted.draft.orderTeamIds.length];

  return {
    ...drafted,
    draft: {
      ...drafted.draft,
      currentOverall: nextOverall,
      completed,
      onClockTeamId: nextOnClock,
    },
  };
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


function posToGroup(pos: string) {
  const p = String(pos || "").toUpperCase();
  if (p === "QB") return "QB";
  if (p === "WR") return "WR";
  if (p === "RB") return "RB";
  if (p === "TE") return "TE";
  if (p === "OL") return "OL";
  if (p === "DL") return "DL";
  if (p === "EDGE") return "EDGE";
  if (p === "LB") return "LB";
  if (p === "CB" || p === "S") return "DB";
  return "DB";
}


type CombineFeedCategory = keyof typeof COMBINE_FEED_TEMPLATES;

function defaultCombineRecap() {
  return {
    risers: [] as string[],
    fallers: [] as string[],
    flags: [] as string[],
    focusedProspectIds: [] as string[],
    interviewedProspectIds: [] as string[],
    focusHoursSpent: 0,
    interviewsUsed: 0,
  };
}

function buildCombineFeedEntry(args: {
  saveSeed: number;
  day: number;
  prospectId: string;
  name: string;
  pos: string;
  ras: number;
  forty: number;
  medicalTier?: string;
}): { id: string; day: number; text: string; prospectId: string; category: CombineFeedCategory } {
  const { saveSeed, day, prospectId, name, pos, ras, forty, medicalTier } = args;
  let category: CombineFeedCategory;

  if (medicalTier === "RED" || medicalTier === "BLACK") category = "INJURY";
  else if (ras >= 9.2 || forty <= 4.42) category = "STANDOUT";
  else if (ras >= 8.2) category = "SOLID";
  else if (ras >= 6.2) category = "AVERAGE";
  else category = "POOR";

  const correctionRoll = detRand2(saveSeed, `combine-feed-correction:${day}:${prospectId}`);
  if (category === "AVERAGE" && correctionRoll < 0.18) category = "BUZZ_CORRECTION";

  const templates = COMBINE_FEED_TEMPLATES[category];
  const pick = Math.floor(detRand2(saveSeed, `combine-feed-template:${day}:${prospectId}`) * templates.length) % templates.length;
  const raw = templates[pick] ?? templates[0];
  const text = raw
    .replace("{name}", name)
    .replace("{pos}", pos);

  return { id: `combine-feed:${day}:${prospectId}`, day, text, prospectId, category };
}


function initDraftRosterCounts(state: GameState): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  const teams = getTeams().map((t) => String((t as any).teamId));
  for (const teamId of teams) {
    const players = getPlayers().filter((pl) => String((pl as any).teamId ?? "") === teamId);
    const counts: Record<string, number> = {};
    for (const pl of players) {
      const pos = String((pl as any).pos ?? "").toUpperCase();
      const bucket =
        ["OT", "OG", "C"].includes(pos) ? "OL" :
        ["DT", "NT"].includes(pos) ? "DL" :
        ["DE"].includes(pos) ? "EDGE" :
        ["MLB", "ILB", "OLB"].includes(pos) ? "LB" :
        ["FS", "SS"].includes(pos) ? "S" :
        pos;
      counts[bucket] = (counts[bucket] ?? 0) + 1;
    }
    out[teamId] = counts;
  }
  return out;
}


function offerChance(args: {
  base: { years: number; salary: number; autonomy: number };
  req: { years: number; salary: number; autonomy: number };
  patience: number;
}): number {
  const { base, req, patience } = args;
  const yearsDelta = req.years - base.years;
  const salaryDeltaPct = (req.salary - base.salary) / Math.max(1, base.salary);
  const autonomyDelta = req.autonomy - base.autonomy;

  let p = 0.62 + clamp(patience, 0, 100) * 0.0018;
  p -= Math.max(0, yearsDelta) * 0.08;
  p += Math.max(0, -yearsDelta) * 0.03;
  p -= Math.max(0, salaryDeltaPct) * 0.65;
  p += Math.max(0, -salaryDeltaPct) * 0.25;
  p -= Math.max(0, autonomyDelta) * 0.004;
  p += Math.max(0, -autonomyDelta) * 0.0015;
  return clamp(p, 0.05, 0.92);
}

function buildCounter(args: {
  base: { years: number; salary: number; autonomy: number };
  req: { years: number; salary: number; autonomy: number };
  rng: () => number;
}): { years: number; salary: number; autonomy: number } {
  const { base, req, rng } = args;
  const years = clamp(Math.round(base.years + (req.years - base.years) * 0.35 + (rng() < 0.25 ? 1 : 0)), 1, 6);
  const salary = Math.round(base.salary + (req.salary - base.salary) * 0.25 + (rng() < 0.25 ? base.salary * 0.03 : 0));
  const autonomy = clamp(Math.round(base.autonomy + (req.autonomy - base.autonomy) * 0.2), 0, 100);
  return { years, salary, autonomy };
}

function patiencePenalty(args: {
  base: { years: number; salary: number; autonomy: number };
  req: { years: number; salary: number; autonomy: number };
  attempts: number;
}): number {
  const { base, req, attempts } = args;
  const yearsDelta = req.years - base.years;
  const salaryDeltaPct = (req.salary - base.salary) / Math.max(1, base.salary);
  const autonomyDelta = req.autonomy - base.autonomy;

  const yearsCost = Math.max(0, yearsDelta) * 6;
  const salaryCost = Math.max(0, salaryDeltaPct) * 40;
  const autoCost = Math.max(0, autonomyDelta) * 0.25;
  const attemptCost = Math.max(0, attempts - 1) * 4;
  const baseCost = 3;
  return clamp(Math.round(baseCost + yearsCost + salaryCost + autoCost + attemptCost), 0, 35);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_COACH": {
      const nextCoach = { ...state.coach, ...action.payload };
      const lockedCoord = nextCoach.archetypeId === "oc_promoted" && Number(nextCoach.tenureYear ?? 1) <= 2
        ? Math.max(60, Number(nextCoach.coordDeferenceLevel ?? 60))
        : nextCoach.archetypeId === "dc_promoted" && Number(nextCoach.tenureYear ?? 1) <= 2
          ? Math.max(65, Number(nextCoach.coordDeferenceLevel ?? 65))
          : nextCoach.coordDeferenceLevel;
      const rep = nextCoach.reputation
        ? enforceArchetypeReputationCaps(nextCoach.reputation, { archetypeId: nextCoach.archetypeId, tenureYear: nextCoach.tenureYear })
        : nextCoach.reputation;

      return {
        ...state,
        coach: {
          ...nextCoach,
          coordDeferenceLevel: lockedCoord,
          mediaExpectation:
            nextCoach.archetypeId === "stc_promoted"
              ? Math.max(35, Math.min(Number(nextCoach.mediaExpectation ?? 50), 55))
              : nextCoach.mediaExpectation,
          reputation: rep,
        },
      };
    }
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
      if (nextStage === "TRAINING_CAMP") next = fillDepthForTrainingCamp(next);
      if (shouldRecomputeDepthOnTransition(prevStage, nextStage)) next = recomputeLeagueDepthAndNews(next);
      if (nextStage === "PRE_DRAFT") next = next.offseasonData.preDraft.board.length ? next : {
        ...next,
        offseasonData: {
          ...next.offseasonData,
          preDraft: {
            ...next.offseasonData.preDraft,
            board: applyDraftPriorities(next, draftBoard()),
          },
        },
      };
      if (nextStage === "DRAFT") next = ensureDraftInitialized(next);
      if (nextStage === "FREE_AGENCY") next = seedUserAutoFaOffersFromPriorities(resetFaPhase(clearResignOffers(next)));
      if (next.season !== state.season) {
        next = gameReducer(next, { type: "CHARGE_BUYOUTS_FOR_SEASON", payload: { season: next.season } });
        next = gameReducer(next, { type: "RECALC_OWNER_FINANCIAL", payload: { season: next.season } });
      }
      return next;
    }
    case "ADD_NEWS_ITEM":
      return addNews(state, action.payload);
    case "HUB_MARK_NEWS_READ": {
      const ids: Record<string, true> = { ...(state.hub.newsReadIds ?? {}) };
      for (const item of state.hub.news ?? []) ids[item.id] = true;
      return { ...state, hub: { ...state.hub, newsReadIds: ids } };
    }
    case "HUB_MARK_NEWS_ITEM_READ": {
      const id = String(action.payload.id);
      if (state.hub.newsReadIds?.[id]) return state;
      return { ...state, hub: { ...state.hub, newsReadIds: { ...(state.hub.newsReadIds ?? {}), [id]: true } } };
    }
    case "HUB_SET_NEWS_FILTER": {
      const filter = String(action.payload.filter || "ALL").toUpperCase();
      return { ...state, hub: { ...state.hub, newsFilter: filter } };
    }
    case "SET_PLAYER_TRADE_BLOCK": {
      const { playerId, isOnBlock } = action.payload;
      return {
        ...state,
        tradeBlockByPlayerId: { ...state.tradeBlockByPlayerId, [String(playerId)]: Boolean(isOnBlock) },
      };
    }
    case "EXECUTE_TRADE": {
      const { teamA, teamB, outgoingPlayerIds, incomingPlayerIds } = action.payload;
      const currentWeek = Number(state.league.week ?? state.week ?? 1);
      const deadlineWeek = Number(state.league.tradeDeadlineWeek ?? TRADE_DEADLINE_DEFAULT_WEEK);
      if (!isTradeAllowed(currentWeek, deadlineWeek)) {
        return { ...state, tradeError: { code: "TRADE_DEADLINE_PASSED", deadlineWeek, currentWeek } };
      }
      const overrides = { ...(state.playerTeamOverrides ?? {}) };
      for (const pid of outgoingPlayerIds) overrides[String(pid)] = String(teamB);
      for (const pid of incomingPlayerIds) overrides[String(pid)] = String(teamA);

      const teamAName = getTeamById(String(teamA))?.name ?? "Your Team";
      const teamBName = getTeamById(String(teamB))?.name ?? "Partner Team";
      const next = { ...state, playerTeamOverrides: overrides } as GameState;
      return addNews(next, {
        title: "Trade Completed",
        body: `${teamAName} traded ${outgoingPlayerIds.length} player(s) with ${teamBName} and received ${incomingPlayerIds.length} player(s).`,
        category: "TRADES",
      });
    }
    case "EXTEND_PLAYER": {
      const { playerId, years, apy, signingBonus, guaranteedAtSigning } = action.payload;
      const term = Math.max(1, Math.min(4, Number(years)));
      const startSeason = Number(state.season) + 1;
      const endSeason = startSeason + term - 1;
      const salaries = Array.from({ length: term }, () => Math.round(apy));
      const nextOverrides = {
        ...(state.playerContractOverrides ?? {}),
        [String(playerId)]: {
          startSeason,
          endSeason,
          salaries,
          signingBonus: Math.round(signingBonus),
          guaranteedAtSigning: Math.round(guaranteedAtSigning),
          prorationBySeason: undefined,
        },
      };
      const next = { ...state, playerContractOverrides: nextOverrides } as GameState;
      const name = getPersonnelById(String(playerId))?.fullName ?? "Player";
      return addNews(next, {
        title: "Extension Signed",
        body: `${name} agreed to a ${term}-year extension.`,
        category: "CONTRACTS",
      });
    }
    case "SET_ORG_ROLE":
      return { ...state, orgRoles: { ...state.orgRoles, [action.payload.role]: action.payload.coachId } };
    case "SET_SCHEME":
      return { ...state, scheme: { ...state.scheme, ...action.payload } };
    case "SET_STRATEGY_PRIORITIES": {
      const positions = normalizePriorityList(action.payload.positions);
      return { ...state, strategy: { ...state.strategy, draftFaPriorities: positions } };
    }
    case "SET_GM_MODE":
      return { ...state, strategy: { ...state.strategy, gmMode: action.payload.gmMode } };
    case "COMPLETE_INTERVIEW": {
      const items = state.interviews.items.map((item) =>
        item.teamId === action.payload.teamId ? { ...item, completed: true, answers: action.payload.answers, result: action.payload.result } : item
      );
      return { ...state, interviews: { items, completedCount: items.filter((i) => i.completed).length } };
    }
    case "GENERATE_OFFERS":
      return { ...state, offers: generateOffers(state), phase: "OFFERS" };
    case "ACCEPT_OFFER": {
      const teamId = action.payload.teamId;
      const financeRow = getTeamFinancesRow(String(teamId), Number(state.season));
      const next = {
        ...state,
        acceptedOffer: action.payload,
        autonomyRating: action.payload.autonomy,
        ownerPatience: action.payload.patience,
        memoryLog: addMemoryEvent(state, "HIRED_COACH", action.payload),
        phase: "COORD_HIRING",
        teamFinances: {
          ...state.teamFinances,
          cash: financeRow?.cash ?? state.teamFinances.cash,
        },
      };
      return applyFinances(next as GameState);
    }
    case "NEGOTIATE_OFFER": {
      const { teamId } = action.payload;
      const offer = state.offers.find((o) => o.teamId === teamId);
      if (!offer) return state;

      const base = offer.base ?? { years: offer.years, salary: offer.salary, autonomy: offer.autonomy };
      const req = {
        years: clamp(Math.floor(action.payload.years), 1, 6),
        salary: Math.max(100_000, Math.floor(action.payload.salary)),
        autonomy: clamp(Math.floor(action.payload.autonomy), 0, 100),
      };

      const chance = offerChance({ base, req, patience: offer.patience });
      const seed = hashStr(`${state.saveSeed}|offer|${teamId}|${req.years}|${req.salary}|${req.autonomy}`);
      const rng = mulberry32(seed);
      const roll = rng();

      let status: OfferNegotiationStatus = "DECLINED";
      let message = "They declined your counter.";
      let counter: { years: number; salary: number; autonomy: number } | null = null;

      if (roll < chance) {
        status = "ACCEPTED";
        message = "They accepted your counter.";
      } else {
        const margin = roll - chance;
        const counterProb = clamp(0.55 - margin * 1.5, 0, 0.55);
        if (rng() < counterProb) {
          status = "COUNTERED";
          counter = buildCounter({ base, req, rng });
          message = "They countered your proposal.";
        }
      }

      const prevAttempts = offer.negotiation?.attempts ?? 0;
      const attempts = prevAttempts + 1;
      const penalty = patiencePenalty({ base, req, attempts });
      const nextPatience = clamp(offer.patience - penalty, 0, 100);

      const nextOffers = state.offers.map((o) => {
        if (o.teamId !== teamId) return o;
        if (status === "ACCEPTED") {
          return {
            ...o,
            years: req.years,
            salary: req.salary,
            autonomy: req.autonomy,
            base,
            patience: nextPatience,
            negotiation: {
              status,
              attempts,
              lastRequest: req,
              lastChance: chance,
              message,
              counter: null,
            },
          };
        }
        return {
          ...o,
          base,
          patience: nextPatience,
          negotiation: {
            status,
            attempts,
            lastRequest: req,
            lastChance: chance,
            message,
            counter,
          },
        };
      });

      return { ...state, offers: nextOffers };
    }
    case "COORD_ATTEMPT_HIRE": {
      const person = getPersonnelById(action.payload.personId);
      if (!person) return state;

      const teamId = state.acceptedOffer?.teamId ?? (state as any).userTeamId ?? (state as any).teamId;
      if (!teamId) return state;

      const expected = expectedSalary(action.payload.role, Number((person as any).reputation ?? 55));
      const offered = offerSalary(expected, "FAIR");
      const traits = getArchetypeTraits(state.coach.archetypeId);
      const hireMod = Number(traits?.hiringAcceptanceModifiers?.[action.payload.role as "OC" | "DC" | "STC"] ?? 0);
      const offeredWithArchetype = Math.round(offered * (1 + hireMod / 100));
      const accepted = isOfferAccepted({
        season: state.season,
        teamId: String(teamId),
        personId: String(action.payload.personId),
        roleKey: String(action.payload.role),
        reputation: Number((person as any).reputation ?? 55),
        expectedSalary: expected,
        offeredSalary: offeredWithArchetype,
        isCoordinator: true,
      });

      if (!accepted) {
        return {
          ...state,
          memoryLog: addMemoryEvent(state, "COORD_REJECTED", {
            ...action.payload,
            score: 0,
            tier: "REJECT",
            threshold: 1,
          }),
        };
      }

      return gameReducer(state, {
        type: "HIRE_STAFF",
        payload: { role: action.payload.role, personId: action.payload.personId, salary: offeredWithArchetype },
      });
    }
    case "HIRE_STAFF": {
      const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId;
      if (!teamId) return state;

      if (action.payload.role === "OC" && state.staff.ocId) return state;
      if (action.payload.role === "DC" && state.staff.dcId) return state;
      if (action.payload.role === "STC" && state.staff.stcId) return state;

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

      const staffComplete = !!(staff.ocId && staff.dcId && staff.stcId);

      if (staffComplete) {
        const hasActive = Object.keys(nextState.rosterMgmt.active ?? {}).length > 0;
        if (!hasActive) {
          const rosterPlayers = getTeamRosterPlayers(teamId);
          const active = Object.fromEntries(rosterPlayers.map((p: any) => [String(p.playerId), true as const]));

          const withActive: GameState = {
            ...(nextState as GameState),
            rosterMgmt: { ...nextState.rosterMgmt, active, cuts: {}, finalized: false },
          };

          nextState = {
            ...withActive,
            depthChart: {
              ...withActive.depthChart,
              startersByPos: autoFillDepthChartGaps(withActive, teamId),
            },
          };
        }
      }

      return {
        ...nextState,
        phase: staffComplete ? "HUB" : nextState.phase,
        careerStage: staffComplete ? "OFFSEASON_HUB" : nextState.careerStage,
        memoryLog: addMemoryEvent(nextState, "COORD_HIRED", { ...action.payload, contractId: res?.contractId }),
      };
    }
    case "ASSISTANT_ATTEMPT_HIRE": {
      const person = getPersonnelById(action.payload.personId);
      if (!person) return state;

      const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId;
      if (!teamId) return state;

      const expected = expectedSalary(action.payload.role as any, Number((person as any).reputation ?? 55));
      const offered = offerSalary(expected, "FAIR");
      const traits = getArchetypeTraits(state.coach.archetypeId);
      const roleKey = String(action.payload.role).includes("QB") ? "QB" : undefined;
      const hireMod = Number((roleKey ? traits?.hiringAcceptanceModifiers?.[roleKey] : 0) ?? 0);
      const offeredWithArchetype = Math.round(offered * (1 + hireMod / 100));
      const accepted = isOfferAccepted({
        season: state.season,
        teamId: String(teamId),
        personId: String(action.payload.personId),
        roleKey: String(action.payload.role),
        reputation: Number((person as any).reputation ?? 55),
        expectedSalary: expected,
        offeredSalary: offeredWithArchetype,
        isCoordinator: false,
      });

      if (!accepted) {
        return {
          ...state,
          memoryLog: addMemoryEvent(state, "ASSISTANT_REJECTED", {
            ...action.payload,
            score: 0,
            tier: "REJECT",
            threshold: 1,
          }),
        };
      }

      return gameReducer(state, {
        type: "HIRE_ASSISTANT",
        payload: { role: action.payload.role, personId: action.payload.personId, salary: offeredWithArchetype },
      });
    }
    case "HIRE_ASSISTANT": {
      const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId;
      if (!teamId) return state;

      if (state.assistantStaff[action.payload.role]) return state;

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
      const cur = state.offseasonData.resigning.decisions?.[String(playerId)];
      if (!cur?.offer) return state;

      const decisions = { ...state.offseasonData.resigning.decisions };
      delete decisions[String(playerId)];

      return pushNews({ ...state, offseasonData: { ...state.offseasonData, resigning: { decisions } } }, `Offer declined. Active proposal cleared.`);
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
      const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId;
      if (!teamId) return state;

      const current = state.offseasonData.tagCenter.applied;
      if (current && current.playerId !== action.payload.playerId) return state;

      const cost = Math.max(0, Math.round(action.payload.cost / 50_000) * 50_000);

      const pco = { ...state.playerContractOverrides };
      pco[action.payload.playerId] = { startSeason: state.season, endSeason: state.season, salaries: [cost], signingBonus: 0 };

      return applyFinances({
        ...state,
        offseasonData: {
          ...state.offseasonData,
          tagCenter: { applied: { ...action.payload, cost, teamId: String(teamId), appliedWeek: state.week ?? 0 } },
        },
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
    case "SCOUT_INIT": {
      const saveSeed = state.saveSeed;
      const windowId =
        state.careerStage === "COMBINE" ? "COMBINE" :
        state.careerStage === "PRE_DRAFT" ? "PRE_DRAFT" :
        state.careerStage === "FREE_AGENCY" ? "FREE_AGENCY" :
        "IN_SEASON";
      const windowKey = `${state.season}:${state.careerStage}:${windowId}`;
      const gm = getGmTraits(state.userTeamId) as unknown as GMScoutingTraits;
      const draftClass = (draftClassJson as any[]).map((row, i) => ({
        id: row.id ?? row.prospectId ?? row["Player ID"] ?? `DC_${i + 1}`,
        name: row.name ?? row["Name"] ?? "Unknown",
        pos: row.pos ?? row["POS"] ?? "UNK",
        school: row.school ?? row.college ?? "—",
        age: row.age ?? 21,
        grade: row.grade ?? row.ovr ?? row["Grade"] ?? row["Overall"] ?? 75,
      }));
      const seed = (k: string) => detRand2(saveSeed, `scout:${k}`);

      const trueProfiles: Record<string, ProspectTrueProfile> = {};
      const scoutProfiles: Record<string, any> = {};

      for (const p of draftClass) {
        const medR = seed(`true:med:${p.id}`);
        const charR = seed(`true:char:${p.id}`);
        const medTier = medR < 0.62 ? "GREEN" : medR < 0.82 ? "YELLOW" : medR < 0.93 ? "ORANGE" : medR < 0.985 ? "RED" : "BLACK";
        const charTier = charR < 0.08 ? "BLUE" : charR < 0.72 ? "GREEN" : charR < 0.86 ? "YELLOW" : charR < 0.94 ? "ORANGE" : charR < 0.985 ? "RED" : "BLACK";

        trueProfiles[p.id] = {
          trueOVR: Math.round(p.grade),
          trueMedical: { tier: medTier as any, recurrence01: Math.round(seed(`true:rec:${p.id}`) * 100) / 100, degenerative: seed(`true:deg:${p.id}`) < 0.06 },
          trueCharacter: {
            tier: charTier as any,
            volatility01: Math.round(seed(`true:vol:${p.id}`) * 100) / 100,
            leadershipTag: seed(`true:lead:${p.id}`) < 0.2 ? "HIGH" : seed(`true:lead2:${p.id}`) < 0.55 ? "MED" : "LOW",
          },
        };

        scoutProfiles[p.id] = initScoutProfile({
          prospectId: p.id,
          trueOVR: trueProfiles[p.id].trueOVR,
          pos: p.pos,
          seed: (kk: string) => seed(kk),
          gm,
          windowKey,
        });
      }

      const tiers = { T1: [] as string[], T2: [] as string[], T3: [] as string[], T4: [] as string[], T5: [] as string[] };
      const tierBy: Record<string, "T1" | "T2" | "T3" | "T4" | "T5"> = {};
      const sorted = [...draftClass].sort((a, b) => trueProfiles[b.id].trueOVR - trueProfiles[a.id].trueOVR);
      sorted.forEach((p, i) => {
        const t = i < 25 ? "T1" : i < 60 ? "T2" : i < 110 ? "T3" : i < 170 ? "T4" : "T5";
        tiers[t].push(p.id);
        tierBy[p.id] = t;
      });

      const budget = computeBudget({ gm, windowId: windowId as any, carryIn: 0 });

      return {
        ...state,
        scoutingState: {
          windowId: windowId as any,
          windowKey,
          budget,
          carryover: budget.remaining,
          trueProfiles,
          scoutProfiles,
          bigBoard: { tiers, tierByProspectId: tierBy },
          combine: { generated: false, day: 1, hoursRemaining: COMBINE_DEFAULT_HOURS, resultsByProspectId: {}, feed: [], recapByDay: {} },
          visits: { privateWorkoutsRemaining: 15, top30Remaining: 30, applied: {} },
          interviews: { interviewsRemaining: COMBINE_DEFAULT_INTERVIEW_SLOTS, history: {} },
          medical: { requests: {} },
          allocation: { poolHours: windowId === "COMBINE" ? COMBINE_DEFAULT_HOURS : 20, byGroup: {} },
          inSeason: { locked: state.careerStage !== "REGULAR_SEASON", regionFocus: [] },
        },
      };
    }

    case "SCOUT_BOARD_MOVE": {
      const s = state.scoutingState;
      if (!s) return state;
      const { prospectId, dir } = action.payload;
      const tier = s.bigBoard.tierByProspectId[prospectId];
      const list = [...(s.bigBoard.tiers[tier] ?? [])];
      const idx = list.indexOf(prospectId);
      if (idx < 0) return state;
      const j = dir === "UP" ? idx - 1 : idx + 1;
      if (j < 0 || j >= list.length) return state;
      [list[idx], list[j]] = [list[j], list[idx]];
      return { ...state, scoutingState: { ...s, bigBoard: { ...s.bigBoard, tiers: { ...s.bigBoard.tiers, [tier]: list } } } };
    }

    case "SCOUT_BOARD_MOVE_TIER": {
      const s = state.scoutingState;
      if (!s) return state;
      const { prospectId, tierId } = action.payload;
      const from = s.bigBoard.tierByProspectId[prospectId];
      if (!from || from === tierId) return state;
      const fromList = (s.bigBoard.tiers[from] ?? []).filter((id) => id !== prospectId);
      const toList = [...(s.bigBoard.tiers[tierId] ?? []), prospectId];
      return {
        ...state,
        scoutingState: {
          ...s,
          bigBoard: {
            tiers: { ...s.bigBoard.tiers, [from]: fromList, [tierId]: toList },
            tierByProspectId: { ...s.bigBoard.tierByProspectId, [prospectId]: tierId },
          },
        },
      };
    }

    case "SCOUT_PIN": {
      const s = state.scoutingState;
      if (!s) return state;
      const { prospectId } = action.payload;
      const p = s.scoutProfiles[prospectId];
      if (!p) return state;
      return { ...state, scoutingState: { ...s, scoutProfiles: { ...s.scoutProfiles, [prospectId]: { ...p, pinned: !p.pinned } } } };
    }

    case "SCOUT_SPEND": {
      const s = state.scoutingState;
      if (!s) return state;
      const { prospectId, action: a } = action.payload;
      const gm = getGmTraits(state.userTeamId) as unknown as GMScoutingTraits;
      const seed = (k: string) => detRand2(state.saveSeed, `scout:${k}`);
      const cost = a === "FILM_QUICK" ? 2 : a === "FILM_DEEP" ? 5 : 4;
      if (s.budget.remaining < cost) return state;
      const profile = { ...s.scoutProfiles[prospectId] };
      const truth = s.trueProfiles[prospectId];
      const budget = { ...s.budget, remaining: s.budget.remaining - cost, spent: s.budget.spent + cost };

      if (a === "FILM_QUICK") {
        addClarity({ profile, track: "TALENT", points: 8, gm });
        tightenBand({ profile, gm, seed, windowKey: s.windowKey, actionKey: a, hoursOrPoints: 2, minWidth: 6 });
      } else if (a === "FILM_DEEP") {
        addClarity({ profile, track: "TALENT", points: 22, gm });
        addClarity({ profile, track: "FIT", points: 6, gm });
        tightenBand({ profile, gm, seed, windowKey: s.windowKey, actionKey: a, hoursOrPoints: 5, minWidth: 5 });
      } else if (a === "BACKGROUND") {
        addClarity({ profile, track: "CHAR", points: 20, gm });
        revealCharacterIfUnlocked({ profile, truth, gm, seed, windowKey: s.windowKey });
      } else {
        addClarity({ profile, track: "MED", points: 20, gm });
        revealMedicalIfUnlocked({ profile, truth, gm, seed, windowKey: s.windowKey });
      }

      return { ...state, scoutingState: { ...s, budget, carryover: budget.remaining, scoutProfiles: { ...s.scoutProfiles, [prospectId]: profile } } };
    }

    case "SCOUT_COMBINE_GENERATE": {
      const s = state.scoutingState;
      if (!s) return state;
      const seed = (k: string) => detRand2(state.saveSeed, `combine:${k}`);
      const results: Record<string, any> = {};
      const feed: { id: string; day: number; text: string; prospectId?: string }[] = [];
      const recapByDay = { ...s.combine.recapByDay };

      for (let day = 1; day <= 5; day++) {
        recapByDay[day] = recapByDay[day] ?? defaultCombineRecap();
      }

      for (const id of Object.keys(s.scoutProfiles)) {
        const draftProspect = (draftClassJson as any[])
          .map((row, idx) => ({
            id: row.id ?? row.prospectId ?? row["Player ID"] ?? `DC_${idx + 1}`,
            name: row.name ?? row["Name"] ?? "Unknown",
            pos: String(row.pos ?? row["POS"] ?? "UNK").toUpperCase(),
          }))
          .find((x) => x.id === id);
        if (!draftProspect) continue;

        const r1 = seed(`${id}:r1`);
        const r2 = seed(`${id}:r2`);
        const r3 = seed(`${id}:r3`);
        const r4 = seed(`${id}:r4`);
        const forty = Math.round((4.3 + r1 * 1.0) * 100) / 100;
        const shuttle = Math.round((3.9 + r2 * 1.2) * 100) / 100;
        const vert = Math.round((26 + r3 * 14) * 10) / 10;
        const bench = Math.round(8 + r4 * 32);
        const ras = Math.round(clamp01(1 - (forty - 4.3) / 1.0) * 100) / 10;
        results[id] = { forty, shuttle, vert, bench, ras };

        for (let day = 1; day <= 5; day++) {
          const entry = buildCombineFeedEntry({
            saveSeed: state.saveSeed,
            day,
            prospectId: id,
            name: draftProspect.name,
            pos: draftProspect.pos,
            ras,
            forty,
            medicalTier: s.trueProfiles[id]?.trueMedical?.tier,
          });
          feed.push({ id: entry.id, day: entry.day, text: entry.text, prospectId: id });

          const recap = recapByDay[day] ?? defaultCombineRecap();
          if (entry.category === "STANDOUT" || entry.category === "SOLID") recap.risers = [...recap.risers, draftProspect.name].slice(0, COMBINE_FEED_MAX_PER_DAY);
          if (entry.category === "POOR") recap.fallers = [...recap.fallers, draftProspect.name].slice(0, COMBINE_FEED_MAX_PER_DAY);
          if (entry.category === "INJURY" || entry.category === "BUZZ_CORRECTION") recap.flags = [...recap.flags, draftProspect.name].slice(0, COMBINE_FEED_MAX_PER_DAY);
          recapByDay[day] = recap;
        }
      }

      return {
        ...state,
        scoutingState: {
          ...s,
          combine: {
            ...s.combine,
            generated: true,
            resultsByProspectId: results,
            feed,
            recapByDay,
            hoursRemaining: Number.isFinite(s.combine.hoursRemaining) ? Math.max(0, s.combine.hoursRemaining) : COMBINE_DEFAULT_HOURS,
          },
        },
      };
    }

    case "SCOUT_COMBINE_SET_DAY": {
      const s = state.scoutingState;
      if (!s) return state;
      return { ...state, scoutingState: { ...s, combine: { ...s.combine, day: action.payload.day } } };
    }

    case "SCOUT_COMBINE_FOCUS": {
      const s = state.scoutingState;
      if (!s || s.windowId !== "COMBINE") return state;

      const day = s.combine?.day ?? 1;
      if (day !== 2 && day !== 3) {
        return { ...state, uiToast: "Focus Drill is only available on Combine Day 2 and Day 3." };
      }

      if ((s.combine.hoursRemaining ?? 0) <= 0) {
        return { ...state, uiToast: "No hours remaining." };
      }

      const { prospectId } = action.payload;
      const p = (draftClassJson as any[])
        .map((row, idx) => ({
          id: row.id ?? row.prospectId ?? row["Player ID"] ?? `DC_${idx + 1}`,
          pos: row.pos ?? row["POS"] ?? "UNK",
        }))
        .find((x) => x.id === prospectId);
      if (!p) return state;

      const recap = s.combine.recapByDay[day] ?? defaultCombineRecap();
      if (recap.focusedProspectIds.includes(String(prospectId))) {
        return { ...state, uiToast: "Focus already completed for this prospect today." };
      }

      const group = posToGroup(p.pos);
      const costHours = COMBINE_FOCUS_HOURS_COST;
      const availableHours = Math.max(0, s.combine.hoursRemaining ?? 0);
      const spend = Math.min(costHours, availableHours);
      if (spend <= 0) return { ...state, uiToast: "No hours remaining." };

      const cur = s.allocation.byGroup[group] ?? 0;
      const usedTotal = Object.values(s.allocation.byGroup).reduce((a: number, b: number) => a + b, 0);
      if (usedTotal + spend > s.allocation.poolHours) {
        return { ...state, uiToast: "Not enough Combine Hours. Allocate more in Allocation screen." };
      }

      const gm = getGmTraits(state.userTeamId) as unknown as GMScoutingTraits;
      const seed = (k: string) => detRand2(state.saveSeed, `combinefocus:${k}`);

      const profile = { ...s.scoutProfiles[prospectId] };
      const truth = s.trueProfiles[prospectId];
      if (!profile || !truth) return state;

      const allocation = {
        ...s.allocation,
        byGroup: { ...s.allocation.byGroup, [group]: cur + spend },
      };

      addClarity({ profile, track: "TALENT", points: 10, gm });
      addClarity({ profile, track: "FIT", points: 8, gm });
      profile.confidence = clamp100(profile.confidence + 4);

      tightenBand({
        profile,
        gm,
        seed,
        windowKey: s.windowKey,
        actionKey: `COMBINE_FOCUS:${group}:D${day}`,
        hoursOrPoints: spend,
        minWidth: 4,
      });

      revealMedicalIfUnlocked({ profile, truth, gm, seed, windowKey: s.windowKey });
      revealCharacterIfUnlocked({ profile, truth, gm, seed, windowKey: s.windowKey });

      const dayRecap = {
        ...recap,
        focusedProspectIds: [...recap.focusedProspectIds, String(prospectId)],
        focusHoursSpent: recap.focusHoursSpent + spend,
      };

      return {
        ...state,
        scoutingState: {
          ...s,
          allocation,
          scoutProfiles: { ...s.scoutProfiles, [prospectId]: profile },
          combine: {
            ...s.combine,
            hoursRemaining: Math.max(0, availableHours - spend),
            recapByDay: { ...s.combine.recapByDay, [day]: dayRecap },
          },
        },
      };
    }

    case "SCOUT_COMBINE_INTERVIEW": {
      const s = state.scoutingState;
      if (!s || s.windowId !== "COMBINE") return state;

      const day = s.combine?.day ?? 1;
      if (day !== 4) return { ...state, uiToast: "Interviews are only available on Combine Day 4." };
      if (s.interviews.interviewsRemaining <= 0) return { ...state, uiToast: "0 interviews left." };

      const { prospectId, category } = action.payload;
      const recap = s.combine.recapByDay[day] ?? defaultCombineRecap();
      if (recap.interviewedProspectIds.includes(String(prospectId))) {
        return { ...state, uiToast: "Interview already completed for this prospect today." };
      }

      const gm = getGmTraits(state.userTeamId) as unknown as GMScoutingTraits;
      const seed = (k: string) => detRand2(state.saveSeed, `combine:int:${k}`);

      const profile = { ...s.scoutProfiles[prospectId] };
      const truth = s.trueProfiles[prospectId];
      if (!profile || !truth) return state;

      if (category === "IQ") {
        addClarity({ profile, track: "FIT", points: 16, gm });
        addClarity({ profile, track: "CHAR", points: 8, gm });
      } else if (category === "LEADERSHIP") {
        addClarity({ profile, track: "CHAR", points: 18, gm });
        addClarity({ profile, track: "FIT", points: 6, gm });
      } else if (category === "STRESS") {
        addClarity({ profile, track: "CHAR", points: 14, gm });
        addClarity({ profile, track: "FIT", points: 10, gm });
      } else {
        addClarity({ profile, track: "FIT", points: 18, gm });
        addClarity({ profile, track: "CHAR", points: 8, gm });
      }

      if (!profile.revealed.leadershipTag && profile.clarity.CHAR >= 60) {
        let p = 0.2 + (gm.intel_network - 50) * 0.003;
        if (category === "LEADERSHIP") p += 0.12;
        if (category === "STRESS") p += 0.04;
        p = Math.max(0.05, Math.min(0.55, p));
        if (seed(`lead:${s.windowKey}:${prospectId}:${category}`) < p) {
          profile.revealed.leadershipTag = truth.trueCharacter.leadershipTag;
        }
      }

      revealCharacterIfUnlocked({ profile, truth, gm, seed, windowKey: s.windowKey });

      const hist = s.interviews.history[prospectId] ?? [];
      const outcomeRoll = seed(`out:${s.windowKey}:${prospectId}:${category}`);
      const outcome = outcomeRoll < 0.15 ? "Concerning" : outcomeRoll < 0.6 ? "Mixed" : "Positive";
      const revealedAttr = COMBINE_INTERVIEW_ATTRIBUTE_BY_CATEGORY[category];
      profile.notes.character = `${revealedAttr}: ${outcome}`;

      const history = { ...s.interviews.history, [prospectId]: [...hist, { category, outcome: `${revealedAttr} - ${outcome}`, windowKey: s.windowKey }] };

      const p = (draftClassJson as any[])
        .map((row, idx) => ({
          id: row.id ?? row.prospectId ?? row["Player ID"] ?? `DC_${idx + 1}`,
          name: row.name ?? row["Name"] ?? "Unknown",
        }))
        .find((x) => x.id === prospectId);

      const feed = [
        ...s.combine.feed,
        {
          id: `int:${day}:${prospectId}:${category}`,
          day,
          prospectId,
          text: `${p?.name ?? prospectId} interview (${category}) revealed ${revealedAttr}: ${outcome}.`,
        },
      ];

      const dayRecap = {
        ...recap,
        interviewedProspectIds: [...recap.interviewedProspectIds, String(prospectId)],
        interviewsUsed: recap.interviewsUsed + 1,
      };

      return {
        ...state,
        scoutingState: {
          ...s,
          interviews: { ...s.interviews, interviewsRemaining: Math.max(0, s.interviews.interviewsRemaining - 1), history },
          scoutProfiles: { ...s.scoutProfiles, [prospectId]: profile },
          combine: {
            ...s.combine,
            feed,
            recapByDay: { ...s.combine.recapByDay, [day]: dayRecap },
          },
        },
      };
    }

    case "SCOUT_PRIVATE_WORKOUT": {
      const s = state.scoutingState;
      if (!s || s.visits.privateWorkoutsRemaining <= 0) return state;
      const { prospectId, focus } = action.payload;
      const gm = getGmTraits(state.userTeamId) as unknown as GMScoutingTraits;
      const seed = (k: string) => detRand2(state.saveSeed, `pw:${k}`);
      const profile = { ...s.scoutProfiles[prospectId] };
      const truth = s.trueProfiles[prospectId];
      addClarity({ profile, track: focus, points: 18, gm });
      tightenBand({ profile, gm, seed, windowKey: s.windowKey, actionKey: `PW:${focus}`, hoursOrPoints: 5, minWidth: 5 });
      if (focus === "MED") revealMedicalIfUnlocked({ profile, truth, gm, seed, windowKey: s.windowKey });
      if (focus === "CHAR") revealCharacterIfUnlocked({ profile, truth, gm, seed, windowKey: s.windowKey });
      return {
        ...state,
        scoutingState: {
          ...s,
          visits: { ...s.visits, privateWorkoutsRemaining: s.visits.privateWorkoutsRemaining - 1 },
          scoutProfiles: { ...s.scoutProfiles, [prospectId]: profile },
        },
      };
    }

    case "SCOUT_INTERVIEW": {
      const s = state.scoutingState;
      if (!s || s.interviews.interviewsRemaining <= 0) return state;
      const { prospectId, category } = action.payload;
      const gm = getGmTraits(state.userTeamId) as unknown as GMScoutingTraits;
      const seed = (k: string) => detRand2(state.saveSeed, `int:${k}`);
      const profile = { ...s.scoutProfiles[prospectId] };
      const truth = s.trueProfiles[prospectId];
      addClarity({ profile, track: "CHAR", points: 16, gm });
      addClarity({ profile, track: "FIT", points: category === "IQ" ? 10 : 4, gm });
      revealCharacterIfUnlocked({ profile, truth, gm, seed, windowKey: s.windowKey });
      const outcome = seed(`${prospectId}:${category}`) < 0.15 ? "Concerning answers" : seed(`${prospectId}:${category}:2`) < 0.45 ? "Mixed" : "Positive";
      const hist = s.interviews.history[prospectId] ?? [];
      const history = { ...s.interviews.history, [prospectId]: [...hist, { category, outcome, windowKey: s.windowKey }] };
      return {
        ...state,
        scoutingState: {
          ...s,
          interviews: { ...s.interviews, interviewsRemaining: s.interviews.interviewsRemaining - 1, history },
          scoutProfiles: { ...s.scoutProfiles, [prospectId]: profile },
        },
      };
    }

    case "SCOUT_ALLOC_ADJ": {
      const s = state.scoutingState;
      if (!s) return state;
      const { group, delta } = action.payload;
      const cur = s.allocation.byGroup[group] ?? 0;
      const next = Math.max(0, cur + delta);
      const used = Object.values({ ...s.allocation.byGroup, [group]: next }).reduce((a, b) => a + b, 0);
      if (used > s.allocation.poolHours) return state;
      return { ...state, scoutingState: { ...s, allocation: { ...s.allocation, byGroup: { ...s.allocation.byGroup, [group]: next } } } };
    }

    case "SCOUT_DEV_SIM_WEEK": {
      const schedule = state.hub.schedule ?? createSchedule(state.saveSeed);
      return {
        ...state,
        hub: { ...state.hub, schedule, regularSeasonWeek: 1 },
        careerStage: "REGULAR_SEASON",
        week: 1,
        uiToast: "Advanced to Week 1 (dev). In-season scouting unlocked.",
      };
    }

    case "SCOUTING_WINDOW_INIT": {
      const teamId = state.acceptedOffer?.teamId ?? state.coach.hometownTeamId ?? "";
      const gm = getGmTraits(state.league.gmByTeamId[teamId]);
      const budget = computeWindowBudget(gm, action.payload.windowId, state.offseasonData.scouting.carryover);
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          scouting: {
            ...state.offseasonData.scouting,
            windowId: action.payload.windowId,
            budget: { total: budget.total, spent: 0, remaining: budget.total, carryIn: budget.carryIn },
          },
        },
      };
    }

    case "SCOUTING_SPEND": {
      const scouting = state.offseasonData.scouting;
      const budget = { ...scouting.budget };
      const teamId = state.acceptedOffer?.teamId ?? state.coach.hometownTeamId ?? "";
      const gm = getGmTraits(state.league.gmByTeamId[teamId]);
      const windowKey = `${state.season}:${state.offseason.stepId}:${scouting.windowId}`;
      if (action.payload.targetType === "PROSPECT") {
        const intel = scouting.intelByProspectId[action.payload.targetId] ? { ...scouting.intelByProspectId[action.payload.targetId] } : freshIntel();
        const res = applyScoutAction((k) => detRand(state.saveSeed, k), budget as any, intel, action.payload.actionType, gm, windowKey);
        if (!res.ok) return state;
        if (action.payload.prospect) updateRevealedTiers((k) => detRand(state.saveSeed, k), intel, action.payload.prospect);
        return {
          ...state,
          offseasonData: {
            ...state.offseasonData,
            scouting: {
              ...scouting,
              budget,
              carryover: budget.remaining,
              intelByProspectId: { ...scouting.intelByProspectId, [action.payload.targetId]: intel },
            },
          },
        };
      }
      const intel = scouting.intelByFAId[action.payload.targetId] ? { ...scouting.intelByFAId[action.payload.targetId] } : freshIntel();
      const res = applyScoutAction((k) => detRand(state.saveSeed, k), budget as any, intel, action.payload.actionType, gm, windowKey);
      if (!res.ok) return state;
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          scouting: {
            ...scouting,
            budget,
            carryover: budget.remaining,
            intelByFAId: { ...scouting.intelByFAId, [action.payload.targetId]: intel },
          },
        },
      };
    }

    case "COMBINE_GENERATE": {
      const results = Object.fromEntries(draftBoard().slice(0, 220).map((p) => [p.id, generateCombineResult((k) => detRand(state.saveSeed, k), p)]));
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
      const teamId = String(state.acceptedOffer?.teamId ?? "");
      if (!teamId) return state;
      const draft = state.freeAgency.draftByPlayerId[pid];
      if (!draft) return state;

      const existing = state.freeAgency.offersByPlayerId[pid] ?? [];
      if (existing.some((o) => o.isUser && o.status === "PENDING")) return state;

      const isLastResolve = state.freeAgency.resolvesUsedThisPhase >= state.freeAgency.maxResolvesPerPhase - 1;
      if (!isLastResolve && countPendingUserOffers(state) >= 5) {
        return faPush(state, "Pending-offer limit reached (5). Resolve a batch to free slots.");
      }

      const userOffer: FreeAgencyOffer = {
        offerId: makeOfferId(state),
        playerId: pid,
        teamId,
        isUser: true,
        years: draft.years,
        aav: draft.aav,
        createdWeek: state.hub.regularSeasonWeek ?? 1,
        status: "PENDING",
      };

      const next = upsertStateOffers(state, pid, [...existing, userOffer]);
      return faPush(next, `Offer submitted: ${draft.years} yrs @ $${Math.round(draft.aav / 1_000_000)}M/yr.`, pid);
    }

    case "FA_UPDATE_USER_OFFER": {
      if (state.careerStage !== "FREE_AGENCY") return state;
      const { playerId, years, aav } = action.payload as { playerId: string; years: number; aav: number };
      const pid = String(playerId);
      const offers = state.freeAgency.offersByPlayerId[pid] ?? [];
      const idx = offers.findIndex((o) => o.isUser && o.status === "PENDING");
      if (idx < 0) return state;

      const isLastResolve = state.freeAgency.resolvesUsedThisPhase >= state.freeAgency.maxResolvesPerPhase - 1;
      if (!isLastResolve && countPendingUserOffers(state) >= 5) {
        return faPush(state, "Pending-offer limit reached (5). Resolve a batch to free slots.");
      }

      const nextOffers = [...offers];
      nextOffers[idx] = { ...nextOffers[idx], years: Math.max(1, Math.min(5, Math.round(years))), aav: Math.max(750_000, Math.round(aav / 50_000) * 50_000) };
      const next = upsertStateOffers(state, pid, nextOffers);
      return faPush(next, `Offer updated: ${nextOffers[idx].years} yrs @ $${Math.round(nextOffers[idx].aav / 1_000_000)}M/yr.`, pid);
    }

    case "FA_CLEAR_USER_OFFER": {
      const pid = String(action.payload.playerId);
      const offers = state.freeAgency.offersByPlayerId[pid] ?? [];
      return { ...state, freeAgency: upsertOffers(state, pid, offers.filter((o) => !(o.isUser && o.status === "PENDING"))) };
    }

    case "FA_RESPOND_COUNTER": {
      if (state.careerStage !== "FREE_AGENCY") return state;
      const { playerId, accept } = action.payload as { playerId: string; accept: boolean };
      const pid = String(playerId);
      const teamId = String(state.acceptedOffer?.teamId ?? "");
      if (!teamId) return state;

      const offers = state.freeAgency.offersByPlayerId[pid] ?? [];
      const counter = offers.find((o) => o.status === "COUNTERED" && o.teamId === teamId);
      if (!counter) return state;

      if (!accept) {
        const next = { ...state, freeAgency: upsertOffers(state, pid, offers.map((o) => (o.offerId === counter.offerId ? { ...o, status: "REJECTED" as const } : o))) };
        return faPush(next, "Counter declined.", pid);
      }

      let next = { ...state, freeAgency: upsertOffers(state, pid, closeAllOffers(offers.map((o) => (o.offerId === counter.offerId ? { ...o, status: "ACCEPTED" as const } : o)), counter.offerId)) };
      next = {
        ...next,
        freeAgency: {
          ...next.freeAgency,
          signingsByPlayerId: { ...next.freeAgency.signingsByPlayerId, [pid]: { teamId, years: counter.years, aav: counter.aav, signingBonus: 0 } },
          pendingCounterTeamByPlayerId: { ...next.freeAgency.pendingCounterTeamByPlayerId, [pid]: null },
        },
      };
      return signFromOffer(next, pid, counter, teamId);
    }

    case "FA_CPU_TICK": {
      if (state.careerStage !== "FREE_AGENCY") return state;
      const next = cpuOfferTick(state, 70);
      const out = { ...next, freeAgency: { ...next.freeAgency, cpuTickedOnOpen: true } };
      reportFaInvariantViolations(out, "FA_CPU_TICK");
      return out;
    }

    case "FA_RESOLVE_BATCH":
    case "FA_RESOLVE": {
      if (state.careerStage !== "FREE_AGENCY") return state;
      if (state.freeAgency.resolvesUsedThisPhase >= state.freeAgency.maxResolvesPerPhase) return state;

      let next0 = expireUserCounters(state);
      const offersByPlayerId = { ...next0.freeAgency.offersByPlayerId };
      const signingsByPlayerId = { ...next0.freeAgency.signingsByPlayerId };
      const resolveRoundByPlayerId = { ...next0.freeAgency.resolveRoundByPlayerId };
      const pendingCounterTeamByPlayerId = { ...next0.freeAgency.pendingCounterTeamByPlayerId };

      const playerIndex: Record<string, any> = {};
      for (const p of getPlayers() as any[]) playerIndex[String(p.playerId)] = p;

      const eligible = Object.entries(offersByPlayerId)
        .filter(([pid]) => !signingsByPlayerId[pid])
        .map(([pid, offers]) => {
          const active = offers.filter((o) => o.status === "PENDING" || o.status === "COUNTERED");
          if (!active.length) return null;
          const p = playerIndex[pid];
          return {
            pid,
            ovr: Number(p?.overall ?? 0),
            pendingCount: active.filter((o) => o.status === "PENDING").length,
            maxAav: active.reduce((m, o) => Math.max(m, Number(o.aav ?? 0)), 0),
          };
        })
        .filter(Boolean) as Array<{ pid: string; ovr: number; pendingCount: number; maxAav: number }>;

      eligible.sort((a, b) => b.ovr - a.ovr || b.pendingCount - a.pendingCount || b.maxAav - a.maxAav || a.pid.localeCompare(b.pid));

      let next: GameState = {
        ...next0,
        freeAgency: {
          ...next0.freeAgency,
          offersByPlayerId,
          signingsByPlayerId,
          resolvesUsedThisPhase: next0.freeAgency.resolvesUsedThisPhase + 1,
          resolveRoundByPlayerId,
          pendingCounterTeamByPlayerId,
        },
      };

      for (const e of eligible) {
        const pid = e.pid;
        if (next.freeAgency.signingsByPlayerId[pid]) continue;
        const p = playerIndex[pid];
        const market = projectedMarketApy(String(p?.pos ?? "UNK"), Number(p?.overall ?? 0), Number(p?.age ?? 26));
        const round = Number(next.freeAgency.resolveRoundByPlayerId[pid] ?? 0);

        const allOffers0 = next.freeAgency.offersByPlayerId[pid] ?? [];
        const counters = allOffers0.filter((o) => o.status === "COUNTERED");
        if (counters.length) {
          const acceptedCounters: FreeAgencyOffer[] = [];
          const decidedOffers = [...allOffers0];
          for (const c of counters) {
            if (c.isUser) continue;
            if (cpuWillAcceptCounter(next, c.teamId, p, c.years, c.aav)) acceptedCounters.push(c);
            else {
              const idx = decidedOffers.findIndex((o) => o.offerId === c.offerId);
              if (idx >= 0) decidedOffers[idx] = { ...decidedOffers[idx], status: "REJECTED" as const };
            }
          }
          if (acceptedCounters.length) {
            acceptedCounters.sort((a, b) => b.aav - a.aav || b.years - a.years || a.teamId.localeCompare(b.teamId));
            const winner = acceptedCounters[0];
            next.freeAgency.offersByPlayerId[pid] = decidedOffers.map((o) => {
              if (o.offerId === winner.offerId) return { ...o, status: "ACCEPTED" as const };
              if (o.status === "PENDING" || o.status === "COUNTERED") return { ...o, status: "REJECTED" as const };
              return o;
            });
            next.freeAgency.signingsByPlayerId[pid] = { teamId: winner.teamId, years: winner.years, aav: winner.aav, signingBonus: 0 };
            next.freeAgency.pendingCounterTeamByPlayerId[pid] = null;
            next = winner.isUser ? signFromOffer(next, pid, winner, winner.teamId) : faPush(next, `${String(p?.fullName ?? "Player")} counter accepted by ${winner.teamId}.`, pid);
            next.freeAgency.resolveRoundByPlayerId[pid] = round + 1;
            continue;
          }
          next.freeAgency.offersByPlayerId[pid] = decidedOffers;
          next.freeAgency.pendingCounterTeamByPlayerId[pid] = null;
        }

        const allOffers = next.freeAgency.offersByPlayerId[pid] ?? [];
        const pending = allOffers.filter((o) => o.status === "PENDING");
        if (!pending.length) {
          const stillCountered = allOffers.some((o) => o.status === "COUNTERED");
          if (stillCountered) {
            next.freeAgency.offersByPlayerId[pid] = allOffers.map((o) => (o.status === "COUNTERED" ? { ...o, status: "REJECTED" as const } : o));
            next = faPush(next, `${String(p?.fullName ?? "Player")} rejected all offers.`, pid);
          }
          next.freeAgency.resolveRoundByPlayerId[pid] = round + 1;
          continue;
        }

        const scored = pending.map((o) => ({ o, s: offerScore(next, pid, o, market) })).sort((a, b) => b.s - a.s || b.o.aav - a.o.aav || b.o.years - a.o.years);
        const best = scored[0].o;
        const bestS = scored[0].s;
        const roll = detRand(next.saveSeed, `FA_RES|S${next.season}|P${pid}|R${round}|U${next.freeAgency.resolvesUsedThisPhase}`);

        if (round >= 1) {
          if (roll < clamp01(0.55 + bestS * 0.35)) {
            next.freeAgency.offersByPlayerId[pid] = allOffers.map((o) => (o.offerId === best.offerId ? { ...o, status: "ACCEPTED" as const } : o.status === "PENDING" || o.status === "COUNTERED" ? { ...o, status: "REJECTED" as const } : o));
            next.freeAgency.signingsByPlayerId[pid] = { teamId: best.teamId, years: best.years, aav: best.aav, signingBonus: 0 };
            next = best.isUser ? signFromOffer(next, pid, best, best.teamId) : faPush(next, `${String(p?.fullName ?? "Player")} signed with ${best.teamId}.`, pid);
          } else {
            next.freeAgency.offersByPlayerId[pid] = allOffers.map((o) => (o.status === "PENDING" || o.status === "COUNTERED" ? { ...o, status: "REJECTED" as const } : o));
            next = faPush(next, `${String(p?.fullName ?? "Player")} rejected all offers.`, pid);
          }
          next.freeAgency.resolveRoundByPlayerId[pid] = round + 1;
          continue;
        }

        const acceptProb = clamp01(0.28 + bestS * 0.55);
        const counterProb = clamp01(0.2 + (1 - acceptProb) * 0.35);

        if (roll < acceptProb) {
          next.freeAgency.offersByPlayerId[pid] = allOffers.map((o) => (o.offerId === best.offerId ? { ...o, status: "ACCEPTED" as const } : o.status === "PENDING" || o.status === "COUNTERED" ? { ...o, status: "REJECTED" as const } : o));
          next.freeAgency.signingsByPlayerId[pid] = { teamId: best.teamId, years: best.years, aav: best.aav, signingBonus: 0 };
          next = best.isUser ? signFromOffer(next, pid, best, best.teamId) : faPush(next, `${String(p?.fullName ?? "Player")} signed with ${best.teamId}.`, pid);
        } else if (roll < acceptProb + counterProb) {
          const finalistTeams = Array.from(new Set(pending.filter((o) => Number(o.aav) >= Number(best.aav) * 0.9).sort((a, b) => b.aav - a.aav || b.years - a.years).slice(0, 3).map((o) => o.teamId)));
          const updatedBase = allOffers.map((o) => (o.status !== "PENDING" ? o : finalistTeams.includes(o.teamId) ? o : { ...o, status: "REJECTED" as const }));
          const counterOffers: FreeAgencyOffer[] = finalistTeams.map((teamId, i) => {
            const ref = pending.find((o) => o.teamId === teamId) ?? best;
            const counterAav = asMoney(Math.max(ref.aav * 1.05, market * 1.02));
            const counterYears = Math.min(5, Math.max(ref.years, detRand(next.saveSeed, `FA_CNTY|S${next.season}|P${pid}|T${teamId}`) > 0.82 ? ref.years + 1 : ref.years));
            return {
              offerId: `FA_OFFER_${next.season}_${next.freeAgency.nextOfferSeq + i + 1}`,
              playerId: pid,
              teamId,
              isUser: ref.isUser,
              years: counterYears,
              aav: counterAav,
              createdWeek: next.hub.regularSeasonWeek ?? 1,
              status: "COUNTERED",
              isCounter: true,
              counterCreatedAtResolve: next.freeAgency.resolvesUsedThisPhase,
            };
          });
          const cleaned = updatedBase.filter((o) => !(o.status === "PENDING" && finalistTeams.includes(o.teamId)));
          next = { ...next, freeAgency: { ...next.freeAgency, nextOfferSeq: next.freeAgency.nextOfferSeq + counterOffers.length } };
          next.freeAgency.offersByPlayerId[pid] = [...cleaned, ...counterOffers];
          next.freeAgency.pendingCounterTeamByPlayerId[pid] = finalistTeams[0] ?? best.teamId;
          next = faPush(next, `${String(p?.fullName ?? "Player")} issued counters to finalists.`, pid);
        } else {
          next.freeAgency.offersByPlayerId[pid] = allOffers.map((o) => (o.status === "PENDING" || o.status === "COUNTERED" ? { ...o, status: "REJECTED" as const } : o));
          next = faPush(next, `${String(p?.fullName ?? "Player")} rejected all offers.`, pid);
        }
        next.freeAgency.resolveRoundByPlayerId[pid] = round + 1;
      }

      const out = cpuOfferTick(next, 70);
      reportFaInvariantViolations(out, "FA_RESOLVE");
      return out;
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
      const currentWeek = Number(state.league.week ?? state.week ?? 1);
      const deadlineWeek = Number(state.league.tradeDeadlineWeek ?? TRADE_DEADLINE_DEFAULT_WEEK);
      if (!isTradeAllowed(currentWeek, deadlineWeek)) {
        return { ...state, tradeError: { code: "TRADE_DEADLINE_PASSED", deadlineWeek, currentWeek } };
      }
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;
      const playerId = String(action.payload.playerId);
      const toTeamId = String(action.payload.toTeamId);

      if (state.offseasonData.tagCenter.applied?.playerId === playerId) return pushNews(state, "Trade blocked: tagged player. Remove tag first.");
      if (state.offseasonData.resigning.decisions[playerId]?.action === "RESIGN") return pushNews(state, "Trade blocked: extension offer pending. Clear offer first.");

      const delta = tradeCapDelta(state, String(teamId), playerId, toTeamId);
      if (state.finances.capSpace + delta < 0) return pushNews(state, "Trade blocked: cap would be illegal.");

      const nextState = { ...state, playerTeamOverrides: { ...state.playerTeamOverrides, [playerId]: toTeamId }, tradeError: undefined };
      const next = applyFinances(nextState);
      const name = getPlayers().find((p: any) => String(p.playerId) === playerId)?.fullName ?? "Player";
      const tag = currentWeek <= deadlineWeek ? "(Pre-deadline)" : "(Post-deadline)";
      const tx = {
        id: `TRADE_${state.season}_${currentWeek}_${playerId}`,
        type: "TRADE" as const,
        playerId,
        playerName: name,
        playerPos: String(getPlayers().find((p: any) => String(p.playerId) === playerId)?.pos ?? "UNK"),
        fromTeamId: String(teamId),
        toTeamId,
        season: state.season,
        week: currentWeek,
        june1Designation: "NONE" as const,
        notes: `${tag} Deadline W${deadlineWeek}`,
        deadCapThisYear: 0,
        deadCapNextYear: 0,
        remainingProration: 0,
      };
      return pushNews({ ...next, transactions: [...(next.transactions ?? []), tx] }, `Trade completed: ${name} sent to ${toTeamId} for ${String(action.payload.valueTier)} value. ${tag}`);
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

      const cutPlayer = getEffectivePlayersByTeam(state, teamId).find((p: any) => String(p.playerId) === String(playerId));
      const cutOverride = state.playerContractOverrides[playerId];
      const cutTransaction: Transaction = {
        id: `${state.season}_${playerId}_CUT`,
        type: "CUT",
        playerId,
        playerName: String(cutPlayer?.fullName ?? cutPlayer?.name ?? "Unknown"),
        playerPos: String(cutPlayer?.pos ?? "UNK"),
        fromTeamId: teamId,
        season: state.season,
        week: state.week,
        june1Designation: designation === "POST_JUNE_1" ? "POST_JUNE_1" : "PRE_JUNE_1",
        notes: designation === "POST_JUNE_1"
          ? `Post–June 1 cut. $${Math.round(deadThisYear / 1_000_000)}M accelerated this year, $${Math.round(deadNextYear / 1_000_000)}M next year.`
          : deadThisYear > 0 ? `Pre–June 1 cut. $${Math.round(deadThisYear / 1_000_000)}M dead cap.` : "Cut with no dead cap.",
        deadCapThisYear: deadThisYear,
        deadCapNextYear: deadNextYear,
        remainingProration: summary?.deadCapIfCutNow ?? 0,
        contractSnapshot: cutOverride ? {
          startSeason: cutOverride.startSeason,
          endSeason: cutOverride.endSeason,
          signingBonus: cutOverride.signingBonus,
          salaries: [...cutOverride.salaries],
        } : undefined,
      };

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
        transactions: [...(state.transactions ?? []), cutTransaction],
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

    case "DISMISS_SEASON_AWARDS":
      return state.seasonAwards
        ? { ...state, careerStage: "OFFSEASON_HUB", seasonAwards: { ...state.seasonAwards, shown: true } }
        : { ...state, careerStage: "OFFSEASON_HUB" };

    case "PREDRAFT_TOGGLE_VISIT": {
      const id = String(action.payload.prospectId);
      const cur = !!state.offseasonData.preDraft.visits[id];
      const nextOn = !cur;
      const workouts = state.offseasonData.preDraft.workouts;
      const visits = state.offseasonData.preDraft.visits;
      const slotsUsed = Object.values(visits).filter(Boolean).length + Object.values(workouts).filter(Boolean).length;

      if (nextOn && workouts[id]) return { ...state, uiToast: "Prospect already scheduled for workout." };
      if (nextOn && slotsUsed >= PREDRAFT_MAX_SLOTS) return { ...state, uiToast: `All ${PREDRAFT_MAX_SLOTS} slots used.` };

      const nextReveals = { ...state.offseasonData.preDraft.reveals };
      if (nextOn) nextReveals[id] = genVisitReveal(state, id);
      else delete nextReveals[id];

      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          preDraft: {
            ...state.offseasonData.preDraft,
            visits: { ...state.offseasonData.preDraft.visits, [id]: nextOn },
            reveals: nextReveals,
          },
        },
      };
    }
    case "PREDRAFT_TOGGLE_WORKOUT": {
      const id = String(action.payload.prospectId);
      const cur = !!state.offseasonData.preDraft.workouts[id];
      const nextOn = !cur;
      const workouts = state.offseasonData.preDraft.workouts;
      const visits = state.offseasonData.preDraft.visits;
      const slotsUsed = Object.values(visits).filter(Boolean).length + Object.values(workouts).filter(Boolean).length;

      if (nextOn && visits[id]) return { ...state, uiToast: "Prospect already scheduled for visit." };
      if (nextOn && slotsUsed >= PREDRAFT_MAX_SLOTS) return { ...state, uiToast: `All ${PREDRAFT_MAX_SLOTS} slots used.` };

      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          preDraft: {
            ...state.offseasonData.preDraft,
            workouts: { ...state.offseasonData.preDraft.workouts, [id]: nextOn },
          },
        },
      };
    }
    case "PREDRAFT_SET_VIEWMODE": {
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          preDraft: { ...state.offseasonData.preDraft, viewMode: action.payload.mode },
        },
      };
    }

    case "DRAFT_INIT": {
      const userTeamId = String(state.acceptedOffer?.teamId ?? "MILWAUKEE_NORTHSHORE");
      const season = state.season;
      const sim = initDraftSim({ saveSeed: state.saveSeed, season, userTeamId });
      return {
        ...state,
        draft: {
          ...state.draft,
          ...sim,
          rosterCountsByTeamBucket: initDraftRosterCounts(state),
          draftedCountsByTeamBucket: {},
        },
      };
    }

    case "DRAFT_CPU_ADVANCE": {
      if (!state.draft || state.draft.complete) return state;
      const res = cpuAdvanceUntilUser({
        saveSeed: state.saveSeed,
        state: state.draft,
        prospects: getDraftClassFromSim(),
        rosterCountsByTeamBucket: state.draft.rosterCountsByTeamBucket ?? {},
        draftedCountsByTeamBucket: state.draft.draftedCountsByTeamBucket ?? {},
      });
      return {
        ...state,
        draft: {
          ...state.draft,
          ...res.sim,
          rosterCountsByTeamBucket: state.draft.rosterCountsByTeamBucket,
          draftedCountsByTeamBucket: res.draftedCountsByTeamBucket,
        },
      };
    }

    case "DRAFT_SHOP": {
      const offers = generateTradeOffers({ saveSeed: state.saveSeed, sim: state.draft, count: 3 });
      return { ...state, draft: { ...state.draft, tradeOffers: offers, tradeOffersForOverall: state.draft.slots[state.draft.cursor]?.overall ?? null } };
    }

    case "DRAFT_ACCEPT_TRADE": {
      const offer = state.draft.tradeOffers.find((o) => o.offerId === action.payload.offerId);
      if (!offer) return state;
      const sim = applyTrade(state.draft, offer);
      const adv = cpuAdvanceUntilUser({
        saveSeed: state.saveSeed,
        state: sim,
        prospects: getDraftClassFromSim(),
        rosterCountsByTeamBucket: state.draft.rosterCountsByTeamBucket,
        draftedCountsByTeamBucket: state.draft.draftedCountsByTeamBucket,
      });
      return {
        ...state,
        draft: {
          ...state.draft,
          ...adv.sim,
          rosterCountsByTeamBucket: state.draft.rosterCountsByTeamBucket,
          draftedCountsByTeamBucket: adv.draftedCountsByTeamBucket,
        },
      };
    }

    case "DRAFT_DECLINE_OFFER": {
      return {
        ...state,
        draft: {
          ...state.draft,
          tradeOffers: state.draft.tradeOffers.filter((o) => o.offerId !== action.payload.offerId),
        },
      };
    }

    case "DRAFT_SEND_TRADE_UP_OFFER": {
      const slot = state.draft.slots[state.draft.cursor];
      if (!slot || slot.teamId === state.draft.userTeamId) return state;

      const offer = buildUserTradeUpOffer({
        saveSeed: state.saveSeed,
        sim: state.draft,
        giveOveralls: action.payload.giveOveralls,
        askBackOverall: action.payload.askBackOverall ?? null,
      });
      if (!offer) return { ...state, uiToast: "Invalid offer." };

      const outcome = submitUserTradeUpOffer({ saveSeed: state.saveSeed, sim: state.draft, offer });
      if (outcome.status === "DECLINED") {
        return {
          ...state,
          draft: { ...state.draft, tradeOffers: [offer, ...state.draft.tradeOffers], tradeOffersForOverall: slot.overall },
          uiToast: outcome.message,
        };
      }
      if (outcome.status === "COUNTERED") {
        return {
          ...state,
          draft: { ...state.draft, tradeOffers: [outcome.counter, offer, ...state.draft.tradeOffers], tradeOffersForOverall: slot.overall },
          uiToast: outcome.message,
        };
      }

      const adv = cpuAdvanceUntilUser({
        saveSeed: state.saveSeed,
        state: outcome.appliedSim,
        prospects: getDraftClassFromSim(),
        rosterCountsByTeamBucket: state.draft.rosterCountsByTeamBucket,
        draftedCountsByTeamBucket: state.draft.draftedCountsByTeamBucket,
      });
      return {
        ...state,
        draft: {
          ...state.draft,
          ...adv.sim,
          rosterCountsByTeamBucket: state.draft.rosterCountsByTeamBucket,
          draftedCountsByTeamBucket: adv.draftedCountsByTeamBucket,
          tradeOffers: [offer, ...state.draft.tradeOffers],
        },
        uiToast: outcome.message,
      };
    }

    case "DRAFT_CLEAR_TRADE_OFFERS": {
      return { ...state, draft: { ...state.draft, tradeOffers: [] } };
    }

    case "DRAFT_USER_PICK": {
      if (state.draft.complete) return state;
      const slot = state.draft.slots[state.draft.cursor];
      if (!slot || slot.teamId !== state.draft.userTeamId) return state;

      const p = getDraftClassFromSim().find((x) => x.prospectId === String(action.payload.prospectId));
      if (!p || state.draft.takenProspectIds[p.prospectId]) return state;

      const idx = state.rookies.length + 1;
      const playerId = `ROOK_${String(idx).padStart(4, "0")}`;
      const rookie: RookiePlayer = {
        playerId,
        prospectId: p.prospectId,
        name: p.name,
        pos: p.pos,
        age: p.age,
        ovr: rookieOvrFromRank(p.rank),
        dev: rookieDevFromTier({ DraftTier: p.tier }),
        apy: rookieApyFromRank(p.rank),
        teamId: state.draft.userTeamId,
        scoutOvr: rookieOvrFromRank(p.rank),
        scoutDev: rookieDevFromTier({ DraftTier: p.tier }),
        scoutConf: 80,
      };

      const sim = applySelection(state.draft, slot, p);
      const withRookie: GameState = {
        ...state,
        rookies: [...state.rookies, rookie],
        rookieContracts: { ...state.rookieContracts, [rookie.playerId]: rookieContractFromApy(state.season + 1, rookie.apy) },
        draft: {
          ...state.draft,
          ...sim,
          rosterCountsByTeamBucket: state.draft.rosterCountsByTeamBucket,
          draftedCountsByTeamBucket: state.draft.draftedCountsByTeamBucket,
        },
      };

      const adv = cpuAdvanceUntilUser({
        saveSeed: withRookie.saveSeed,
        state: withRookie.draft,
        prospects: getDraftClassFromSim(),
        rosterCountsByTeamBucket: withRookie.draft.rosterCountsByTeamBucket,
        draftedCountsByTeamBucket: withRookie.draft.draftedCountsByTeamBucket,
      });
      return {
        ...withRookie,
        draft: {
          ...withRookie.draft,
          ...adv.sim,
          rosterCountsByTeamBucket: withRookie.draft.rosterCountsByTeamBucket,
          draftedCountsByTeamBucket: adv.draftedCountsByTeamBucket,
        },
      };
    }

    case "DRAFT_PICK": {
      if (state.offseasonData.draft.picks.length >= 7) return state;
      const already = state.offseasonData.draft.picks.some((p) => p.id === action.payload.prospectId);
      if (already) return state;

      const p = (state.offseasonData.draft.board.length ? state.offseasonData.draft.board : draftBoard()).find(
        (x) => x.id === action.payload.prospectId,
      );
      if (!p) return state;

      const nextState = {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          draft: {
            ...state.offseasonData.draft,
            board: state.offseasonData.draft.board.length ? state.offseasonData.draft.board : draftBoard(),
            picks: [...state.offseasonData.draft.picks, p],
          },
        },
      };

      const row = getProspectRow(p.id);
      const rank = row ? Number(row["Rank"] ?? 200) : 200;
      const idx = nextState.rookies.length + 1;
      const playerId = `ROOK_${String(idx).padStart(4, "0")}`;
      const rookie: RookiePlayer = {
        playerId,
        prospectId: p.id,
        name: row ? String(row["Name"] ?? "Rookie") : "Rookie",
        pos: row ? String(row["POS"] ?? "UNK").toUpperCase() : String(p.pos ?? "UNK").toUpperCase(),
        age: row ? Number(row["Age"] ?? 22) : 22,
        ovr: rookieOvrFromRank(rank),
        dev: rookieDevFromTier(row ?? {}),
        apy: rookieApyFromRank(rank),
        teamId: String(state.acceptedOffer?.teamId ?? ""),
        scoutOvr: rookieOvrFromRank(rank),
        scoutDev: rookieDevFromTier(row ?? {}),
        scoutConf: 50,
      };
      const contract = rookieContractFromApy(nextState.season + 1, rookie.apy);

      return {
        ...nextState,
        rookies: [...nextState.rookies, rookie],
        rookieContracts: { ...nextState.rookieContracts, [rookie.playerId]: contract },
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
    case "SET_TRAINING_FOCUS":
      return { ...state, trainingFocus: { posGroupFocus: action.payload.posGroupFocus } };
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
    case "DEPTH_BULK_SET": {
      return {
        ...state,
        depthChart: {
          ...state.depthChart,
          startersByPos: { ...state.depthChart.startersByPos, ...action.payload.startersByPos },
        },
      };
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
    case "DEPTHCHART_RESET_TO_BEST":
    case "DEPTH_RESET_TO_BEST": {
      const teamId = state.acceptedOffer?.teamId ? String(state.acceptedOffer.teamId) : "";
      if (!teamId) return state;
      const prev = state.depthChart.startersByPos;

      let next: GameState = state;
      const startersByPos = autoFillDepthChartGaps(next, teamId);
      next = { ...next, depthChart: { ...next.depthChart, startersByPos } };

      next = pushMajorDepthNews(next, teamId, prev, startersByPos);
      next = recomputeLeagueDepthAndNews(next);
      return next;
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
    case "SET_PRACTICE_PLAN": {
      const preview = getEffectPreview(action.payload);
      return { ...state, practicePlan: action.payload, practicePlanConfirmed: true, uiToast: `Practice plan set — Fatigue ${preview.fatigueRange[0]} to ${preview.fatigueRange[1]} | Dev XP ${preview.devXP}` };
    }
    case "INJURY_UPSERT": {
      const existing = state.injuries ?? [];
      const idx = existing.findIndex((i) => i.id === action.payload.id);
      const updated = idx >= 0 ? existing.map((i) => (i.id === action.payload.id ? action.payload : i)) : [...existing, action.payload];
      return { ...state, injuries: updated };
    }
    case "INJURY_MOVE_TO_IR": {
      const injuries = (state.injuries ?? []).map((i) =>
        i.id === action.payload.injuryId ? { ...i, status: "IR" as const } : i
      );
      return { ...state, injuries };
    }
    case "INJURY_ACTIVATE_FROM_IR": {
      const injuries = (state.injuries ?? []).map((i) =>
        i.id === action.payload.injuryId ? { ...i, status: "QUESTIONABLE" as const } : i
      );
      return { ...state, injuries };
    }
    case "INJURY_START_PRACTICE_WINDOW": {
      const injuries = (state.injuries ?? []).map((i) =>
        i.id === action.payload.injuryId ? { ...i, practiceStatus: "LIMITED" as const, rehabStage: "RETURN_TO_PLAY" as const } : i
      );
      return { ...state, injuries };
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
      const trackedPlayers = { HOME: buildTrackedPlayers(teamId), AWAY: buildTrackedPlayers(action.payload.opponentTeamId) };
      return {
        ...base,
        game: initGameSim({
          homeTeamId: teamId,
          awayTeamId: action.payload.opponentTeamId,
          seed: base.saveSeed + (base.hub.preseasonWeek + base.hub.regularSeasonWeek) * 1009,
          weekType: gameType,
          weekNumber: action.payload.weekNumber ?? action.payload.week,
          homeRatings: computeTeamGameRatings(teamId),
          awayRatings: computeTeamGameRatings(action.payload.opponentTeamId),
          trackedPlayers,
          playerFatigue: hydrateGameFatigue(base, trackedPlayers),
          practiceExecutionBonus: base.weeklyFamiliarityBonus,
          coachArchetypeId: base.coach.archetypeId,
          coachTenureYear: base.coach.tenureYear,
        }),
      };
    }
    case "RESOLVE_PLAY": {
      if (!state.acceptedOffer?.teamId || !state.game.awayTeamId || state.game.homeTeamId === "HOME") return state;
      const gameWithToggles = {
        ...state.game,
        aggression: action.payload.aggression ?? state.game.aggression,
        tempo: action.payload.tempo ?? state.game.tempo,
      };
      const personnelPackage = action.payload.personnelPackage ?? "11";
      if (!action.payload.personnelPackage) console.warn(JSON.stringify({ level: "warn", event: "personnel.default_applied", default: "11" }));
      const stepped = stepPlay(gameWithToggles, action.payload.playType, personnelPackage);
      const next = upsertGameFatigueState({ ...state, game: stepped.sim }, stepped.sim);
      if (!stepped.ended) return next;
      const nextWithRecovery = { ...next, playerFatigueById: applyWeeklyFatigueRecovery(next, stepped.sim.snapLoadThisGame ?? {}) };
      let nextWithPractice = nextWithRecovery;
      const appliedPlayWeek = applyPracticePlanForWeekAtomic(nextWithRecovery, state.acceptedOffer.teamId, state.game.weekNumber ?? state.hub.regularSeasonWeek);
      if (!appliedPlayWeek.applied) return state;
      nextWithPractice = appliedPlayWeek.state;

      const schedule = state.hub.schedule;
      if (!schedule || !state.game.weekType || !state.game.weekNumber) return nextWithPractice;

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
            ...nextWithPractice,
            league,
            hub: { ...hub, preseasonWeek: PRESEASON_WEEKS, regularSeasonWeek: 1 },
            offseason: {
              ...nextWithPractice.offseason,
              stepId: "CUT_DOWNS",
              stepsComplete: { ...nextWithPractice.offseason.stepsComplete, PRESEASON: true, CUT_DOWNS: true },
            },
            careerStage: "REGULAR_SEASON",
            game: initGameSim({ homeTeamId: state.game.homeTeamId, awayTeamId: state.game.awayTeamId, seed: state.saveSeed + 777, coachArchetypeId: state.coach.archetypeId, coachTenureYear: state.coach.tenureYear }),
          };
        }
      }

      let nextState = {
        ...nextWithPractice,
        league,
        hub,
        game: initGameSim({ homeTeamId: state.game.homeTeamId, awayTeamId: state.game.awayTeamId, seed: state.saveSeed + 777, coachArchetypeId: state.coach.archetypeId, coachTenureYear: state.coach.tenureYear }),
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
        game: initGameSim({ homeTeamId: state.acceptedOffer?.teamId ?? "HOME", awayTeamId: "AWAY", seed: state.saveSeed + 555, coachArchetypeId: state.coach.archetypeId, coachTenureYear: state.coach.tenureYear }),
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

      let out = { ...state, league, hub, playerFatigueById: applyWeeklyFatigueRecovery(state, state.game.snapLoadThisGame ?? {}) };
      const appliedAdvance = applyPracticePlanForWeekAtomic(out, teamId, week);
      if (!appliedAdvance.applied) return state;
      out = appliedAdvance.state;
      out = resolveInjuriesEngine(out);
      if (Number(out.league.week ?? week + 1) > Number(out.league.tradeDeadlineWeek ?? TRADE_DEADLINE_DEFAULT_WEEK)) {
        // Policy: cancel all pending trade offers once deadline is passed to avoid stale post-deadline acceptances.
        const cancelled = cancelPendingTradesAtDeadline(out.pendingTradeOffers ?? []);
        if (cancelled.cancelledOffers > 0) {
          console.warn(JSON.stringify({ event: "trade.deadline_passed", cancelledOffers: cancelled.cancelledOffers, week: Number(out.league.week ?? week + 1) }));
        }
        out = {
          ...out,
          pendingTradeOffers: cancelled.offers,
        };
      }
      if (gameType === "REGULAR_SEASON") {
        out = gameReducer(out, { type: "CHECK_FIRING", payload: { checkpoint: "WEEKLY", week } });
        if (week >= REGULAR_SEASON_WEEKS) {
          out = gameReducer(out, { type: "CHECK_FIRING", payload: { checkpoint: "SEASON_END", week } });
          const { postseason, championTeamId } = simulatePlayoffs({
            league: out.league,
            season: Number(out.season ?? 2026),
            seed: Number(out.saveSeed ?? 1) + 99991,
          });
          out = { ...out, league: { ...out.league, postseason } };
          out = applySeasonMilestoneAwards(out);
          const nextSeason = Number(out.season ?? 2026) + 1;
          const teams = getTeams()
            .filter((t) => t.isActive)
            .map((t) => t.teamId);
          const nextSchedule = generateLeagueSchedule(teams, Number(out.saveSeed ?? 1) + nextSeason * 1337);

          out = {
            ...out,
            season: nextSeason,
            week: 0,
            league: out.league,
            hub: {
              ...out.hub,
              schedule: nextSchedule,
              preseasonWeek: 1,
              regularSeasonWeek: 1,
              news: [
                {
                  id: `NEWS_${Date.now()}`,
                  title: `${championTeamId} crowned champion`,
                  body: "The season is complete. Offseason begins now.",
                  createdAt: Date.now(),
                  category: "LEAGUE",
                },
                ...(out.hub.news ?? []),
              ],
            },
            careerStage: "SEASON_AWARDS",
          };
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

function ensureLeagueGmMap(state: GameState): GameState {
  const ids = Object.keys(state.league?.standings ?? {});
  const gmByTeamId = state.league?.gmByTeamId ?? {};
  if (ids.length && Object.keys(gmByTeamId).length === ids.length) return state;
  const seeded = initLeagueState(ids.length ? ids : getTeams().map((t) => t.teamId), state.saveSeed);
  return { ...state, league: { ...state.league, gmByTeamId: { ...seeded.gmByTeamId, ...gmByTeamId } } };
}

export function migrateSave(oldState: Partial<GameState>): Partial<GameState> {
  const teams = getTeams().filter((t) => t.isActive).map((t) => t.teamId);
  const saveSeed = oldState.saveSeed ?? Date.now();
  const league = oldState.league ?? initLeagueState(teams, Number(oldState.season ?? 2026));
  const schedule = oldState.hub?.schedule ?? createSchedule(saveSeed);
  const now = Date.now();
  const migratedNews = ensureNewsItems((oldState as any).hub?.news, now);
  const legacyReadCount = Number((oldState as any).hub?.newsReadCount ?? 0);
  const newsReadIds: Record<string, true> = { ...((oldState as any).hub?.newsReadIds ?? {}) };
  if (legacyReadCount > 0 && migratedNews.length > 0) {
    for (const item of migratedNews.slice(0, legacyReadCount)) newsReadIds[item.id] = true;
  }

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
          coachArchetypeId: oldState.coach?.archetypeId,
          coachTenureYear: oldState.coach?.tenureYear,
        });

  const nextDepthChart = {
    startersByPos: { ...((oldState as any).depthChart?.startersByPos ?? {}) },
    lockedBySlot: { ...((oldState as any).depthChart?.lockedBySlot ?? {}) },
  };

  const normalizedLeague: LeagueState = league.postseason
    ? (league as LeagueState)
    : ({ ...league, postseason: { season: Number(oldState.season ?? 2026), resultsByTeamId: {} } } as LeagueState);
  if (!normalizedLeague.gmByTeamId) {
    normalizedLeague.gmByTeamId = initLeagueState(Object.keys(normalizedLeague.standings), saveSeed).gmByTeamId;
  }
  if (!("tradeDeadlineWeek" in normalizedLeague)) {
    console.warn(JSON.stringify({ level: "warn", event: "trade.deadline_missing_in_save", appliedWeek: TRADE_DEADLINE_DEFAULT_WEEK }));
    normalizedLeague.tradeDeadlineWeek = TRADE_DEADLINE_DEFAULT_WEEK;
  }
  normalizedLeague.week = Number((normalizedLeague as any).week ?? Number(oldState.week ?? 1));

  let s: Partial<GameState> = {
    ...oldState,
    saveSeed,
    careerStage: (oldState.careerStage as CareerStage) ?? "OFFSEASON_HUB",
    seasonHistory: Array.isArray(oldState.seasonHistory) ? oldState.seasonHistory : [],
    earnedMilestoneIds: Array.isArray(oldState.earnedMilestoneIds) ? oldState.earnedMilestoneIds.map(String) : [],
    seasonAwards: oldState.seasonAwards,
    lastSeasonSummary: oldState.lastSeasonSummary,
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
        combine: { results: {}, generated: false },
      scouting: {
        windowId: "COMBINE",
        budget: { total: 0, spent: 0, remaining: 0, carryIn: 0 },
        carryover: 0,
        intelByProspectId: {},
        intelByFAId: {},
      },
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
        preDraft: { board: [], visits: {}, workouts: {}, reveals: {}, viewMode: "CONSENSUS" },
        draft: { board: [], picks: [], completed: false },
        camp: { settings: { intensity: "NORMAL", installFocus: "BALANCED", positionFocus: "NONE" } },
        cutDowns: { decisions: {} },
      } as OffseasonData),
    scheme: oldState.scheme ?? { offense: { style: "BALANCED", tempo: "NORMAL" }, defense: { style: "MIXED", aggression: "NORMAL" } },
    strategy: { ...DEFAULT_STRATEGY, ...((oldState as any).strategy ?? {}), draftFaPriorities: normalizePriorityList((oldState as any).strategy?.draftFaPriorities) },
    scouting: oldState.scouting ?? { boardSeed: saveSeed ^ 0x9e3779b9 },
    hub: {
      ...(oldState.hub ?? ({} as any)),
      news: migratedNews,
      newsReadIds,
      newsFilter: String((oldState as any).hub?.newsFilter ?? "ALL"),
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
    league: normalizedLeague,
    game,
    playerFatigueById: Object.fromEntries(getPlayers().map((pl) => {
      const v = (oldState as any).playerFatigueById?.[String(pl.playerId)];
      return [String(pl.playerId), { fatigue: clampFatigue(Number(v?.fatigue ?? FATIGUE_DEFAULT)), last3SnapLoads: Array.isArray(v?.last3SnapLoads) ? v.last3SnapLoads.map((n: unknown) => Math.max(0, Number(n) || 0)).slice(-3) : [] }];
    })),
    practicePlan: (oldState as any).practicePlan ?? DEFAULT_PRACTICE_PLAN,
    practicePlanConfirmed: Boolean((oldState as any).practicePlanConfirmed ?? false),
    weeklyFamiliarityBonus: Number((oldState as any).weeklyFamiliarityBonus ?? 0),
    nextGameInjuryRiskMod: Number((oldState as any).nextGameInjuryRiskMod ?? 0),
    playerDevXpById: { ...((oldState as any).playerDevXpById ?? {}) },
    pendingTradeOffers: Array.isArray((oldState as any).pendingTradeOffers) ? (oldState as any).pendingTradeOffers : [],
    tradeError: undefined,
    draft: (oldState.draft ?? {
      started: false,
      completed: false,
      totalRounds: 7,
      currentOverall: 1,
      orderTeamIds: [],
      leaguePicks: [],
      onClockTeamId: undefined,
      withdrawnBoardIds: {},
    }) as DraftState,
    rookies: oldState.rookies ?? [],
    rookieContracts: oldState.rookieContracts ?? {},
    firing: oldState.firing ?? { pWeekly: 0, pSeasonEnd: 0, drivers: [], lastWeekComputed: 0, lastSeasonComputed: 0, fired: false },
    depthChart: nextDepthChart,
    leagueDepthCharts: (oldState as any).leagueDepthCharts ?? {},
    playerAccolades: (oldState as any).playerAccolades ?? {},
  };
  s = ensureAccolades(bootstrapAccolades(s as GameState));
  return ensureLeagueGmMap(s as GameState);
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
        scouting: { ...initial.offseasonData.scouting, ...migrated.offseasonData?.scouting },
        tampering: { ...initial.offseasonData.tampering, ...migrated.offseasonData?.tampering },
        freeAgency: { ...initial.offseasonData.freeAgency, ...migrated.offseasonData?.freeAgency },
        preDraft: { ...initial.offseasonData.preDraft, ...migrated.offseasonData?.preDraft },
        draft: { ...initial.offseasonData.draft, ...migrated.offseasonData?.draft },
        camp: { ...initial.offseasonData.camp, ...migrated.offseasonData?.camp },
        cutDowns: { ...initial.offseasonData.cutDowns, ...migrated.offseasonData?.cutDowns },
      },
      strategy: { ...initial.strategy, ...((migrated as any).strategy ?? {}), draftFaPriorities: normalizePriorityList((migrated as any).strategy?.draftFaPriorities) },
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
      playerFatigueById: Object.fromEntries(
        Object.entries((migrated as any).playerFatigueById ?? {}).map(([k, v]: [string, any]) => [k, { fatigue: clampFatigue(Number(v?.fatigue ?? FATIGUE_DEFAULT)), last3SnapLoads: Array.isArray(v?.last3SnapLoads) ? v.last3SnapLoads.map((n: unknown) => Math.max(0, Number(n) || 0)).slice(-3) : [] }]),
      ) as Record<string, PersistedFatigue>,
      practicePlan: (migrated as any).practicePlan ?? DEFAULT_PRACTICE_PLAN,
      practicePlanConfirmed: Boolean((migrated as any).practicePlanConfirmed ?? false),
      weeklyFamiliarityBonus: Number((migrated as any).weeklyFamiliarityBonus ?? 0),
      nextGameInjuryRiskMod: Number((migrated as any).nextGameInjuryRiskMod ?? 0),
      playerDevXpById: { ...(initial.playerDevXpById ?? {}), ...((migrated as any).playerDevXpById ?? {}) },
      pendingTradeOffers: Array.isArray((migrated as any).pendingTradeOffers) ? (migrated as any).pendingTradeOffers : [],
      tradeError: undefined,
      saveVersion: CURRENT_SAVE_VERSION,
      memoryLog: migrated.memoryLog ?? initial.memoryLog,
      leagueDepthCharts: { ...initial.leagueDepthCharts, ...((migrated as any).leagueDepthCharts ?? {}) },
      playerAccolades: { ...initial.playerAccolades, ...((migrated as any).playerAccolades ?? {}) },
      transactions: (migrated as any).transactions ?? [],
    };
    out = ensureAccolades(bootstrapAccolades(out));
    out = ensureLeagueGmMap(out);
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

  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === "undefined") return;
    const w = window as typeof window & { simulateNResolves?: (n: number) => void };
    w.simulateNResolves = (n: number) => {
      const count = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
      let sim = state;
      let total = 0;
      for (let i = 0; i < count; i++) {
        sim = gameReducer(sim, { type: "FA_RESOLVE" });
        const v = collectFaInvariantViolations(sim);
        total += v.length;
        if (v.length) console.error(`[simulateNResolves] resolve ${i + 1}:`, v);
      }
      console.log(`[simulateNResolves] completed ${count} resolves with ${total} invariant violation(s).`);
    };
    return () => {
      if (w.simulateNResolves) delete w.simulateNResolves;
    };
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
