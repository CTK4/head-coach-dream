import React, { createContext, useContext, useEffect, useReducer } from "react";
import { generateOffers } from "@/engine/offers";
import {
  PRESEASON_WEEKS,
  REGULAR_SEASON_WEEKS,
  generateLeagueSchedule,
  getTeamMatchup,
  type GameType,
  type LeagueSchedule,
} from "@/engine/schedule";
import { getTeams } from "@/data/leagueDb";

export type GamePhase = "CREATE" | "BACKGROUND" | "INTERVIEWS" | "OFFERS" | "COORD_HIRING" | "HUB";

export type CareerStage =
  | "OFFSEASON_HUB"
  | "ASSISTANT_HIRING"
  | "ROSTER_REVIEW"
  | "RESIGN"
  | "COMBINE"
  | "FREE_AGENCY"
  | "DRAFT"
  | "PRESEASON"
  | "REGULAR_SEASON";

export type OfferTier = "PREMIUM" | "STANDARD" | "CONDITIONAL" | "REJECT";

const CAREER_STAGE_ORDER: CareerStage[] = [
  "OFFSEASON_HUB",
  "ASSISTANT_HIRING",
  "ROSTER_REVIEW",
  "RESIGN",
  "COMBINE",
  "FREE_AGENCY",
  "DRAFT",
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

export type InterviewItem = {
  teamId: string;
  completed: boolean;
  answers: Record<string, number>;
  result?: InterviewResult;
};

export type OfferItem = {
  teamId: string;
  years: number;
  salary: number;
  autonomy: number;
  patience: number;
  mediaNarrativeKey: string;
};

export type MemoryEvent = {
  type: string;
  season: number;
  week?: number;
  payload: unknown;
};

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
  assistantStaff: AssistantStaff;
  hub: {
    news: string[];
    preseasonWeek: number;
    regularSeasonWeek: number;
    schedule: LeagueSchedule | null;
  };
  saveSeed: number;
  game: {
    opponentTeamId?: string;
    homeScore: number;
    awayScore: number;
    quarter: number;
    down: number;
    distance: number;
    ballOn: number;
    lastResult?: string;
    seed: number;
    weekType?: GameType;
    weekNumber?: number;
  };
};

function createInitialState(): GameState {
  return {
    coach: {
      name: "",
      ageTier: "32-35",
      hometown: "",
      archetypeId: "",
    },
    phase: "CREATE",
    careerStage: "OFFSEASON_HUB",
    interviews: {
      items: INTERVIEW_TEAMS.map((teamId) => ({ teamId, completed: false, answers: {} })),
      completedCount: 0,
    },
    offers: [],
    season: 2026,
    week: 1,
    saveVersion: CURRENT_SAVE_VERSION,
    memoryLog: [],
    staff: {},
    assistantStaff: {},
    hub: {
      news: [
        "League announces 2026 salary cap at $250M",
        "Free agency period opens next week",
        "Draft combine results expected soon",
        "Coaching carousel in full swing",
      ],
      preseasonWeek: 1,
      regularSeasonWeek: 1,
      schedule: null,
    },
    saveSeed: Date.now(),
    game: { homeScore: 0, awayScore: 0, quarter: 1, down: 1, distance: 10, ballOn: 25, seed: Date.now() },
  };
}

export type GameAction =
  | { type: "SET_COACH"; payload: Partial<GameState["coach"]> }
  | { type: "SET_PHASE"; payload: GamePhase }
  | {
      type: "COMPLETE_INTERVIEW";
      payload: { teamId: string; answers: Record<string, number>; result: InterviewResult };
    }
  | { type: "GENERATE_OFFERS" }
  | { type: "ACCEPT_OFFER"; payload: OfferItem }
  | { type: "HIRE_STAFF"; payload: { role: "OC" | "DC" | "STC"; personId: string } }
  | { type: "HIRE_ASSISTANT"; payload: { role: keyof AssistantStaff; personId: string } }
  | { type: "ADVANCE_CAREER_STAGE" }
  | { type: "SET_CAREER_STAGE"; payload: CareerStage }
  | { type: "START_GAME"; payload: { opponentTeamId: string; weekType: GameType; weekNumber: number } }
  | { type: "RESOLVE_PLAY"; payload: { playType: string } }
  | { type: "RESET" };

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function createSchedule(seed: number): LeagueSchedule {
  const teamIds = getTeams()
    .filter((team) => team.isActive !== false)
    .map((team) => team.teamId);
  return generateLeagueSchedule(teamIds, seed);
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
  return [
    ...state.memoryLog,
    {
      type,
      season: state.season,
      week: state.week,
      payload,
    },
  ];
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

    case "COMPLETE_INTERVIEW": {
      const items = state.interviews.items.map((item) =>
        item.teamId === action.payload.teamId
          ? { ...item, completed: true, answers: action.payload.answers, result: action.payload.result }
          : item
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
        memoryLog: addMemoryEvent(state, "HIRED_COACH", {
          teamId: action.payload.teamId,
          years: action.payload.years,
          salary: action.payload.salary,
          autonomy: action.payload.autonomy,
          patience: action.payload.patience,
        }),
        phase: "COORD_HIRING",
      };

    case "HIRE_STAFF": {
      const key = action.payload.role === "OC" ? "ocId" : action.payload.role === "DC" ? "dcId" : "stcId";
      const staff = { ...state.staff, [key]: action.payload.personId };
      const allHired = staff.ocId && staff.dcId && staff.stcId;
      if (!allHired) return { ...state, staff };

      const schedule = createSchedule(state.saveSeed);
      return {
        ...state,
        staff,
        phase: "HUB",
        careerStage: "OFFSEASON_HUB",
        hub: {
          ...state.hub,
          schedule,
          preseasonWeek: 1,
          regularSeasonWeek: 1,
        },
      };
    }

    case "HIRE_ASSISTANT": {
      const assistantStaff = { ...state.assistantStaff, [action.payload.role]: action.payload.personId };
      return {
        ...state,
        assistantStaff,
        careerStage: areAllAssistantsHired(assistantStaff) ? "ROSTER_REVIEW" : state.careerStage,
      };
    }

    case "START_GAME":
      return {
        ...state,
        game: {
          opponentTeamId: action.payload.opponentTeamId,
          homeScore: 0,
          awayScore: 0,
          quarter: 1,
          down: 1,
          distance: 10,
          ballOn: 25,
          seed: Date.now(),
          weekType: action.payload.weekType,
          weekNumber: action.payload.weekNumber,
        },
      };

    case "RESOLVE_PLAY": {
      const g = state.game;
      const rng = mulberry32(g.seed + g.down * 7 + g.ballOn * 13);
      const rand = rng();

      const baseMean: Record<string, number> = { RUN: 3.8, SHORT_PASS: 6, DEEP_PASS: 10.5, PLAY_ACTION: 7.2 };
      const baseVol: Record<string, number> = { RUN: 3, SHORT_PASS: 5, DEEP_PASS: 12, PLAY_ACTION: 7 };

      const mean = baseMean[action.payload.playType] ?? 5;
      const vol = baseVol[action.payload.playType] ?? 5;
      const yards = Math.round(mean + (rand - 0.5) * 2 * vol);
      const clampedYards = Math.max(-12, Math.min(60, yards));

      let ballOn = Math.max(1, Math.min(99, g.ballOn + clampedYards));
      let down = g.down;
      let distance = g.distance;
      let homeScore = g.homeScore;
      let lastResult = `${action.payload.playType.replace("_", " ")} for ${clampedYards} yards`;

      if (ballOn >= 99) {
        homeScore += 7;
        lastResult = `TOUCHDOWN! ${action.payload.playType.replace("_", " ")} for ${clampedYards} yards!`;
        ballOn = 25;
        down = 1;
        distance = 10;
      } else if (clampedYards >= distance) {
        down = 1;
        distance = 10;
        lastResult += " — First down!";
      } else {
        distance = Math.max(1, distance - clampedYards);
        down += 1;
        if (down > 4) {
          lastResult += " — Turnover on downs!";
          down = 1;
          distance = 10;
          ballOn = 25;
        }
      }

      return {
        ...state,
        game: { ...g, ballOn, down, distance, homeScore, lastResult, seed: g.seed + 1 },
      };
    }

    case "RESET":
      return createInitialState();

    default:
      return state;
  }
}

const STORAGE_KEY = "hc_career_save";

function migrateSave(oldState: Partial<GameState>): Partial<GameState> {
  if (!oldState.hub?.schedule) {
    return {
      ...oldState,
      hub: {
        ...(oldState.hub ?? { news: [] }),
        schedule: createSchedule(oldState.saveSeed ?? Date.now()),
        preseasonWeek: oldState.hub?.preseasonWeek ?? 1,
        regularSeasonWeek: oldState.hub?.regularSeasonWeek ?? 1,
      },
      careerStage: oldState.careerStage ?? "OFFSEASON_HUB",
      assistantStaff: oldState.assistantStaff ?? {},
    };
  }
  return oldState;
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
      assistantStaff: { ...initial.assistantStaff, ...migrated.assistantStaff },
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
    const currentWeek = weeks.find((item) => item.week === week);
    if (!currentWeek) return null;

    return {
      week,
      matchup: getTeamMatchup(currentWeek, teamId),
    };
  };

  return <GameContext.Provider value={{ state, dispatch, getCurrentTeamMatchup }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

export { PRESEASON_WEEKS, REGULAR_SEASON_WEEKS };
