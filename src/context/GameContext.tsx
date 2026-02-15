import React, { createContext, useContext, useReducer, useEffect } from "react";

export type GamePhase = "CREATE" | "BACKGROUND" | "INTERVIEWS" | "OFFERS" | "COORD_HIRING" | "HUB";

export type InterviewResult = {
  ownerAlignScore: number;
  gmTrustScore: number;
  schemeFitScore: number;
  mediaScore: number;
  autonomyDelta: number;
  leashDelta: number;
  axisTotals: Record<string, number>;
};

export type InterviewItem = {
  teamId: string;
  completed: boolean;
  answers: Record<string, number>;
  result?: InterviewResult;
};

export type OfferItem = { teamId: string; years: number; salary: number };

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
  interviews: { items: InterviewItem[]; completedCount: number };
  offers: OfferItem[];
  acceptedOffer?: OfferItem;
  staff: { ocId?: string; dcId?: string; stcId?: string };
  hub: { news: string[] };
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
  };
};

const INTERVIEW_TEAMS = ["MILWAUKEE_NORTHSHORE", "ATLANTA_APEX", "BIRMINGHAM_VULCANS"];

function createInitialState(): GameState {
  return {
    coach: {
      name: "",
      ageTier: "32-35",
      hometown: "",
      archetypeId: "",
      hometownTeamId: undefined,
      repBaseline: undefined,
      autonomy: undefined,
      ownerTrustBaseline: undefined,
      gmRelationship: undefined,
      coordDeferenceLevel: undefined,
      mediaExpectation: undefined,
      lockerRoomCred: undefined,
      volatility: undefined,
    },
    phase: "CREATE",
    interviews: {
      items: INTERVIEW_TEAMS.map((t) => ({ teamId: t, completed: false, answers: {} })),
      completedCount: 0,
    },
    offers: [],
    staff: {},
    hub: {
      news: [
        "League announces 2026 salary cap at $250M",
        "Free agency period opens next week",
        "Draft combine results expected soon",
        "Coaching carousel in full swing",
      ],
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
  | { type: "START_GAME"; payload: { opponentTeamId: string } }
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

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_COACH":
      return { ...state, coach: { ...state.coach, ...action.payload } };

    case "SET_PHASE":
      return { ...state, phase: action.payload };

    case "COMPLETE_INTERVIEW": {
      const items = state.interviews.items.map((item) =>
        item.teamId === action.payload.teamId
          ? { ...item, completed: true, answers: action.payload.answers, result: action.payload.result }
          : item
      );
      const completedCount = items.filter((i) => i.completed).length;
      return { ...state, interviews: { items, completedCount } };
    }

    case "GENERATE_OFFERS": {
      // Generate 1-3 offers from interview teams
      const completedTeams = state.interviews.items
        .filter((i) => i.completed)
        .map((i) => i.teamId);
      const offerCount = Math.max(1, Math.min(completedTeams.length, 1 + Math.floor(Math.random() * 2)));
      const shuffled = [...completedTeams].sort(() => Math.random() - 0.5);
      const offers = shuffled.slice(0, offerCount).map((teamId) => ({
        teamId,
        years: 3 + Math.floor(Math.random() * 3),
        salary: 4_000_000 + Math.floor(Math.random() * 6_000_000),
      }));
      // Guarantee at least one
      if (offers.length === 0 && completedTeams.length > 0) {
        offers.push({ teamId: completedTeams[0], years: 4, salary: 5_000_000 });
      }
      return { ...state, offers, phase: "OFFERS" };
    }

    case "ACCEPT_OFFER":
      return { ...state, acceptedOffer: action.payload, phase: "COORD_HIRING" };

    case "HIRE_STAFF": {
      const key = action.payload.role === "OC" ? "ocId" : action.payload.role === "DC" ? "dcId" : "stcId";
      const newStaff = { ...state.staff, [key]: action.payload.personId };
      const allHired = newStaff.ocId && newStaff.dcId && newStaff.stcId;
      return { ...state, staff: newStaff, phase: allHired ? "HUB" : state.phase };
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
        },
      };

    case "RESOLVE_PLAY": {
      const g = state.game;
      const rng = mulberry32(g.seed + g.down * 7 + g.ballOn * 13);
      const rand = rng();

      const baseMean: Record<string, number> = {
        RUN: 3.8, SHORT_PASS: 6, DEEP_PASS: 10.5, PLAY_ACTION: 7.2,
      };
      const baseVol: Record<string, number> = {
        RUN: 3, SHORT_PASS: 5, DEEP_PASS: 12, PLAY_ACTION: 7,
      };

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

function loadState(): GameState {
  const initial = createInitialState();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initial;

    const parsed = JSON.parse(saved) as Partial<GameState>;
    return {
      ...initial,
      ...parsed,
      coach: { ...initial.coach, ...parsed.coach },
      interviews: { ...initial.interviews, ...parsed.interviews },
      hub: { ...initial.hub, ...parsed.hub },
      staff: { ...initial.staff, ...parsed.staff },
      game: { ...initial.game, ...parsed.game },
    };
  } catch {
    return initial;
  }
}

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
