import React, { createContext, useContext, useEffect, useReducer } from "react";
import draftClassJson from "@/data/draftClass.json";
import { getPersonnelById, getPlayersByTeam, getTeams } from "@/data/leagueDb";
import type { CoachReputation } from "@/engine/reputation";
import { clamp01, clamp100, defenseInterestBoost, offenseInterestBoost } from "@/engine/reputation";
import { applyStaffRejection, computeStaffAcceptance, type RoleFocus } from "@/engine/assistantHiring";
import { initGameSim, stepPlay, type GameSim, type PlayType } from "@/engine/gameSim";
import { initLeagueState, simulateLeagueWeek, type LeagueState } from "@/engine/leagueSim";
import { generateOffers } from "@/engine/offers";
import { genFreeAgents } from "@/engine/offseasonGen";
import { OFFSEASON_STEPS, nextOffseasonStepId, type OffseasonStepId } from "@/engine/offseason";
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
export type OfferItem = { teamId: string; years: number; salary: number; autonomy: number; patience: number; mediaNarrativeKey: string };
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
    reputation?: CoachReputation;
  };
  phase: GamePhase;
  careerStage: CareerStage;
  offseason: OffseasonState;
  offseasonData: OffseasonData;
  interviews: { items: InterviewItem[]; completedCount: number };
  offers: OfferItem[];
  acceptedOffer?: OfferItem;
  autonomyRating?: number;
  ownerPatience?: number;
  season: number;
  week?: number;
  saveVersion: number;
  memoryLog: MemoryEvent[];
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
  | { type: "HIRE_STAFF"; payload: { role: "OC" | "DC" | "STC"; personId: string } }
  | { type: "HIRE_ASSISTANT"; payload: { role: keyof AssistantStaff; personId: string } }
  | { type: "COORD_ATTEMPT_HIRE"; payload: { role: "OC" | "DC" | "STC"; personId: string } }
  | { type: "ASSISTANT_ATTEMPT_HIRE"; payload: { role: keyof AssistantStaff; personId: string } }
  | { type: "SET_ORG_ROLE"; payload: { role: keyof OrgRoles; coachId: string | undefined } }
  | { type: "ADVANCE_CAREER_STAGE" }
  | { type: "SET_CAREER_STAGE"; payload: CareerStage }
  | { type: "START_GAME"; payload: { opponentTeamId: string; weekType: GameType; weekNumber: number } }
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
  | { type: "PREDRAFT_TOGGLE_VISIT"; payload: { prospectId: string } }
  | { type: "PREDRAFT_TOGGLE_WORKOUT"; payload: { prospectId: string } }
  | { type: "DRAFT_PICK"; payload: { prospectId: string } }
  | { type: "CAMP_SET"; payload: { settings: Partial<CampSettings> } }
  | { type: "CUT_TOGGLE"; payload: { playerId: string } }
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
    coach: { name: "", ageTier: "32-35", hometown: "", archetypeId: "" },
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
    offers: [],
    season: 2026,
    week: 1,
    saveVersion: CURRENT_SAVE_VERSION,
    memoryLog: [],
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
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
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

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_COACH":
      return { ...state, coach: { ...state.coach, ...action.payload } };
    case "SET_PHASE":
      return { ...state, phase: action.payload };
    case "SET_CAREER_STAGE":
      return { ...state, careerStage: action.payload };
    case "ADVANCE_CAREER_STAGE":
      return { ...state, careerStage: nextCareerStage(state.careerStage) };
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
      const res = computeStaffAcceptance({
        saveSeed: state.saveSeed,
        rep,
        staffRep: Number(person.reputation ?? 0),
        personId: person.personId,
        schemeCompat: schemeCompatForPerson(state, action.payload.personId),
        offerQuality: 70,
        teamOutlook: clamp100(45 + (state.acceptedOffer ? 30 : 0)),
        roleFocus: deriveCoordFocus(action.payload.role),
        kind: "COORDINATOR",
      });
      if (!res.accept) {
        return {
          ...state,
          coach: { ...state.coach, reputation: rep ? applyStaffRejection(rep) : rep },
          memoryLog: addMemoryEvent(state, "COORD_REJECTED", { ...action.payload, score: res.score, tier: res.tier, threshold: res.threshold }),
        };
      }
      const key = action.payload.role === "OC" ? "ocId" : action.payload.role === "DC" ? "dcId" : "stcId";
      const staff = { ...state.staff, [key]: action.payload.personId };
      if (!(staff.ocId && staff.dcId && staff.stcId)) return { ...state, staff };
      return { ...state, staff, phase: "HUB", careerStage: "OFFSEASON_HUB" };
    }
    case "HIRE_STAFF": {
      const key = action.payload.role === "OC" ? "ocId" : action.payload.role === "DC" ? "dcId" : "stcId";
      const staff = { ...state.staff, [key]: action.payload.personId };
      if (!(staff.ocId && staff.dcId && staff.stcId)) return { ...state, staff };
      return { ...state, staff, phase: "HUB", careerStage: "OFFSEASON_HUB" };
    }
    case "ASSISTANT_ATTEMPT_HIRE": {
      const person = getPersonnelById(action.payload.personId);
      if (!person) return state;
      const rep = state.coach.reputation;
      const res = computeStaffAcceptance({
        saveSeed: state.saveSeed,
        rep,
        staffRep: Number(person.reputation ?? 0),
        personId: person.personId,
        schemeCompat: schemeCompatForPerson(state, action.payload.personId),
        offerQuality: 70,
        teamOutlook: clamp100(45 + (state.acceptedOffer ? 30 : 0)),
        roleFocus: deriveAssistantFocus(action.payload.role),
        kind: "ASSISTANT",
      });
      if (!res.accept) {
        return {
          ...state,
          coach: { ...state.coach, reputation: rep ? applyStaffRejection(rep) : rep },
          memoryLog: addMemoryEvent(state, "ASSISTANT_REJECTED", { ...action.payload, score: res.score, tier: res.tier, threshold: res.threshold }),
        };
      }
      const assistantStaff = { ...state.assistantStaff, [action.payload.role]: action.payload.personId };
      return { ...state, assistantStaff, careerStage: areAllAssistantsHired(assistantStaff) ? "ROSTER_REVIEW" : state.careerStage };
    }
    case "HIRE_ASSISTANT": {
      const assistantStaff = { ...state.assistantStaff, [action.payload.role]: action.payload.personId };
      return { ...state, assistantStaff, careerStage: areAllAssistantsHired(assistantStaff) ? "ROSTER_REVIEW" : state.careerStage };
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
    case "AUTO_ADVANCE_STAGE_IF_READY": {
      const step = state.offseason.stepId;
      if (step === "TRAINING_CAMP") return { ...state, careerStage: "TRAINING_CAMP" };
      if (step === "PRESEASON") return { ...state, careerStage: "PRESEASON" };
      if (step === "CUT_DOWNS") return state.careerStage === "REGULAR_SEASON" ? state : { ...state, careerStage: "REGULAR_SEASON" };
      return state;
    }
    case "START_GAME": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;
      return {
        ...state,
        game: initGameSim({
          homeTeamId: teamId,
          awayTeamId: action.payload.opponentTeamId,
          seed: state.saveSeed + (state.hub.preseasonWeek + state.hub.regularSeasonWeek) * 1009,
          weekType: action.payload.weekType,
          weekNumber: action.payload.weekNumber,
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

      return {
        ...next,
        league,
        hub,
        game: initGameSim({ homeTeamId: state.game.homeTeamId, awayTeamId: state.game.awayTeamId, seed: state.saveSeed + 777 }),
      };
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

      return { ...state, league, hub };
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
      league: migrated.league ?? initial.league,
      game: { ...initial.game, ...migrated.game },
      draft: { ...initial.draft, ...migrated.draft },
      rookies: migrated.rookies ?? initial.rookies,
      rookieContracts: { ...initial.rookieContracts, ...migrated.rookieContracts },
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
