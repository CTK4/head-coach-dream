import type { CoachReputation } from "@/engine/reputation";
import type { AggressionLevel, GameSim, PlayType } from "@/engine/gameSim";

export const ARCHETYPE_IDS = [
  "oc_promoted",
  "dc_promoted",
  "stc_promoted",
  "college_hc",
  "assistant_grinder",
  "young_guru",
] as const;

export type ArchetypeId = (typeof ARCHETYPE_IDS)[number];

export type PassiveResolutionInput = {
  sim: GameSim;
  playType: PlayType;
  aggression: AggressionLevel;
};

export type PassiveResolution = {
  offensiveExecutionBonus?: number;
  defensiveExecutionBonus?: number;
  penaltyRateMultiplier?: number;
  closeGameExecutionBonus?: number;
  notes?: string[];
};

export type ArchetypePassiveTrait = {
  id: string;
  triggerCondition: (input: PassiveResolutionInput) => boolean;
  effectFn: (input: PassiveResolutionInput) => PassiveResolution;
};

export type ArchetypeTraits = {
  startingDeltas: Partial<Record<keyof CoachReputation, number>>;
  passiveTraits: ArchetypePassiveTrait[];
  uniqueEdge: string;
  persistentWeakness: string;
  hiringAcceptanceModifiers?: Partial<Record<"OC" | "DC" | "STC" | "QB", number>>;
  faInterestModifiers?: Partial<Record<"QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "EDGE" | "LB" | "CB" | "S", number>>;
};

const PASS_HEAVY_PLAYS = new Set<PlayType>(["QUICK_GAME", "DROPBACK", "SCREEN", "SHORT_PASS", "DEEP_PASS", "PLAY_ACTION"]);
const ZONE_PRESSURE_PLAYS = new Set<PlayType>(["RUN", "INSIDE_ZONE", "OUTSIDE_ZONE", "POWER"]);

export const ARCHETYPE_TRAITS: Record<ArchetypeId, ArchetypeTraits> = {
  oc_promoted: {
    startingDeltas: { offCred: 15, defCred: -12, leadershipTrust: 5, mediaRep: 5 },
    passiveTraits: [
      {
        id: "OFFENSIVE_MIND",
        triggerCondition: ({ playType }) => PASS_HEAVY_PLAYS.has(playType),
        effectFn: () => ({ offensiveExecutionBonus: 8, notes: ["OFFENSIVE_MIND"] }),
      },
    ],
    uniqueEdge: "Offensive Gravitational Pull",
    persistentWeakness: "Defensive Credibility Gap",
    hiringAcceptanceModifiers: { OC: 20, QB: 20 },
    faInterestModifiers: { QB: 10, RB: 10, WR: 10, TE: 10 },
  },
  dc_promoted: {
    startingDeltas: { defCred: 15, offCred: -12, leadershipTrust: 5, playerRespect: 8 },
    passiveTraits: [
      {
        id: "DEFENSIVE_MIND",
        triggerCondition: ({ playType }) => ZONE_PRESSURE_PLAYS.has(playType),
        effectFn: () => ({ defensiveExecutionBonus: 8, notes: ["DEFENSIVE_MIND"] }),
      },
    ],
    uniqueEdge: "Defensive Culture",
    persistentWeakness: "Offensive Recruiting Drag",
    faInterestModifiers: { WR: -12, RB: -12, TE: -12 },
  },
  stc_promoted: {
    startingDeltas: { leaguePrestige: -8 },
    passiveTraits: [
      {
        id: "DISCIPLINE_CULTURE",
        triggerCondition: () => true,
        effectFn: ({ sim }) => ({
          penaltyRateMultiplier: 0.9,
          closeGameExecutionBonus: Math.abs(sim.homeScore - sim.awayScore) <= 7 && sim.clock.quarter >= 4 ? 5 : 0,
          notes: ["DISCIPLINE_CULTURE"],
        }),
      },
    ],
    uniqueEdge: "Elite Special Teams",
    persistentWeakness: "Legitimacy Tax",
  },
  college_hc: {
    startingDeltas: { leaguePrestige: 12, mediaRep: 10 },
    passiveTraits: [
      {
        id: "SCHEME_TRANSLATION_PENALTY",
        triggerCondition: ({ sim, playType }) => sim.coachTenureYear <= 2 && (playType === "RUN" || playType === "PLAY_ACTION"),
        effectFn: () => ({ offensiveExecutionBonus: -5, notes: ["SCHEME_TRANSLATION_PENALTY"] }),
      },
    ],
    uniqueEdge: "Recruiting Pipeline",
    persistentWeakness: "Veteran Friction",
  },
  assistant_grinder: {
    startingDeltas: { leaguePrestige: -5, mediaRep: -8, playerRespect: 12 },
    passiveTraits: [
      {
        id: "NO_SCHEME_IDENTITY",
        triggerCondition: ({ sim }) => sim.coachTenureYear <= 1,
        effectFn: () => ({ offensiveExecutionBonus: 0, defensiveExecutionBonus: 0, notes: ["NO_SCHEME_IDENTITY"] }),
      },
    ],
    uniqueEdge: "Deep Network",
    persistentWeakness: "Blank Slate Ceiling",
    faInterestModifiers: { QB: 15, RB: 15, WR: 15, TE: 15, OL: 15, DL: 15, EDGE: 15, LB: 15, CB: 15, S: 15 },
  },
  young_guru: {
    startingDeltas: { innovationPerception: 20, offCred: 10, defCred: -18, leaguePrestige: -5, mediaRep: 12 },
    passiveTraits: [
      {
        id: "SCHEME_INNOVATOR",
        triggerCondition: ({ playType, aggression }) => PASS_HEAVY_PLAYS.has(playType) && aggression !== "CONSERVATIVE",
        effectFn: ({ aggression }) => ({
          offensiveExecutionBonus: aggression === "AGGRESSIVE" ? 10 : 6,
          notes: ["SCHEME_INNOVATOR"],
        }),
      },
    ],
    uniqueEdge: "Culture Magnet",
    persistentWeakness: "Staff Friction",
    faInterestModifiers: { QB: 20, RB: 20, WR: 20, TE: 20 },
    hiringAcceptanceModifiers: { DC: -20 },
  },
};

export function getArchetypeTraits(archetypeId: string | undefined): ArchetypeTraits | undefined {
  if (!archetypeId) return undefined;
  return ARCHETYPE_TRAITS[archetypeId as ArchetypeId];
}
