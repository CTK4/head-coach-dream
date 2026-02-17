import React, { createContext, useContext, useEffect, useReducer } from "react";
import { getTeams } from "@/data/leagueDb";
import { initGameSim, stepPlay, type GameSim, type PlayType } from "@/engine/gameSim";
import { initLeagueState, simulateLeagueWeek, type LeagueState } from "@/engine/leagueSim";
import { generateOffers } from "@/engine/offers";
import { OFFSEASON_STEPS, nextOffseasonStepId, type OffseasonStepId } from "@/engine/offseason";
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

export type OrgRoles = {
  hcCoachId?: string;
  ocCoachId?: string;
  dcCoachId?: string;
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
  };
  phase: GamePhase;
  careerStage: CareerStage;
  offseason: OffseasonState;
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
};

export type GameAction =
  | { type: "SET_COACH"; payload: Partial<GameState["coach"]> }
  | { type: "SET_PHASE"; payload: GamePhase }
  | { type: "COMPLETE_INTERVIEW"; payload: { teamId: string; answers: Record<string, number>; result: InterviewResult } }
  | { type: "GENERATE_OFFERS" }
  | { type: "ACCEPT_OFFER"; payload: OfferItem }
  | { type: "HIRE_STAFF"; payload: { role: "OC" | "DC" | "STC"; personId: string } }
  | { type: "HIRE_ASSISTANT"; payload: { role: keyof AssistantStaff; personId: string } }
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
  };
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
    case "HIRE_STAFF": {
      const key = action.payload.role === "OC" ? "ocId" : action.payload.role === "DC" ? "dcId" : "stcId";
      const staff = { ...state.staff, [key]: action.payload.personId };
      if (!(staff.ocId && staff.dcId && staff.stcId)) return { ...state, staff };
      return { ...state, staff, phase: "HUB", careerStage: "OFFSEASON_HUB" };
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
        const ok = !!state.orgRoles.ocCoachId && !!state.orgRoles.dcCoachId;
        if (!ok) return state;
        return state;
      }

      return state;
    }
    case "OFFSEASON_COMPLETE_STEP": {
      const stepsComplete = { ...state.offseason.stepsComplete, [action.payload.stepId]: true };
      return { ...state, offseason: { ...state.offseason, stepsComplete } };
    }
    case "OFFSEASON_SET_STEP":
      return { ...state, offseason: { ...state.offseason, stepId: action.payload.stepId } };
    case "OFFSEASON_ADVANCE_STEP": {
      const cur = state.offseason.stepId;
      if (!state.offseason.stepsComplete[cur]) return state;
      const next = nextOffseasonStepId(cur);
      if (!next) return state;
      return { ...state, offseason: { ...state.offseason, stepId: next } };
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
      league: migrated.league ?? initial.league,
      game: { ...initial.game, ...migrated.game },
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

export { PRESEASON_WEEKS, REGULAR_SEASON_WEEKS };
