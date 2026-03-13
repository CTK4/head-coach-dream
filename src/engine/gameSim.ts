import { applyTime, applyTwoMinuteGate, betweenPlaysRunoff, chooseSnapWithLeft, initClock, nextQuarter, type ClockState } from "@/engine/clock";
import { clamp, mulberry32, tri } from "@/engine/rand";
import { BASE_SNAP_COSTS, FATIGUE_VARIANCE_BAND, clampFatigue, computeFatigueEffects, type FatigueTrackedPosition } from "@/engine/fatigue";
import { getDefensiveReaction, getMatchupModifier, selectDefensivePackageFromRoll, isRunPlay, type DefensivePackage, type MatchupModifier, type PersonnelPackage } from "@/engine/personnel";
import { hashSeed, rng as contextualRng } from "@/engine/rng";
import { resolveContact, type ContactInput } from "@/engine/physics/contactResolver";
import { resolveCatchPoint, type CatchInput } from "@/engine/physics/catchPointResolver";
import { resolvePassRush } from "@/engine/physics/passRushResolver";
import { resolveQbBallistics } from "@/engine/physics/qbBallistics";
import { QB_TUNING } from "@/config/qbTuning";
import { resolveQbArchetypeTag } from "@/engine/qb/qbArchetype";
import { getQbSchemeFitMultiplier } from "@/engine/qb/qbSchemeFit";
import { getPlayerById } from "@/data/leagueDb";
import { resolvePile } from "@/engine/physics/pileResolver";
import { resolveFumble } from "@/engine/physics/fumbleResolver";
import { resolveFieldGoal, resolvePunt } from "@/engine/physics/kickResolver";
import { ratingZ } from "@/engine/physics/ratingsToKinematics";
import { aiSelectDefensiveCall } from "@/engine/defense/aiSelectDefensiveCall";
import { applyDefensiveCallMultipliers, type DefensiveCall } from "@/engine/defense/defensiveCalls";
import { isKeyDefenseSituation } from "@/engine/defense/isKeyDefenseSituation";
import type { TeamGameRatings } from "@/engine/game/teamRatings";
import type { PassResolverDiagV1, PlayEventV1Expanded } from "@/engine/telemetry/types";
import { getArchetypeTraits, type PassiveResolution } from "@/data/archetypeTraits";
import { resolvePerkModifiers } from "@/engine/perkWiring";
import type { WeeklyGameplan } from "@/engine/gameplan";
import type { GameWeather } from "@/engine/weather/generateGameWeather";
import type { PlayerUnicorn, UnicornArchetypeId } from "@/engine/unicorns/types";
import { describeUnicornBoost, resolveUnicornModifiers } from "@/engine/unicorns/effects";
import { resolveBadgeSimModifiers } from "@/engine/badges/effects";
import type { PlayerBadge } from "@/engine/badges/types";
import type { OffenseSchemeId } from "@/lib/schemeLabels";
import { buildAssignments } from "@/engine/assignments/buildAssignments";
import { chooseTargetRole } from "@/engine/passing/targetSelection";
import { getCanonicalRating } from "@/engine/ratings/ratingAdapter";
import type { OffenseEligibleRole, PlayAssignmentLog } from "@/engine/assignments/types";
import type { TrackedPlayers } from "@/engine/types/trackedPlayers";

// ─── Play types ────────────────────────────────────────────────────────────
/** Legacy play types kept for backward-compat; new granular types added below */
export type PlayType =
  // Run concepts
  | "INSIDE_ZONE"
  | "OUTSIDE_ZONE"
  | "POWER"
  // Pass concepts
  | "QUICK_GAME"
  | "DROPBACK"
  | "SCREEN"
  // Kept for backward-compat & 4th-down recommendations
  | "RUN"
  | "SHORT_PASS"
  | "DEEP_PASS"
  // Multi-purpose
  | "PLAY_ACTION"
  | "RPO_READ"
  | "QB_KEEP"
  // Specials
  | "SPIKE"
  | "KNEEL"
  | "PUNT"
  | "FG";

export type Possession = "HOME" | "AWAY";

// ─── Defensive look (generated each snap by CPU defense) ──────────────────
export type DefShell = "TWO_HIGH" | "SINGLE_HIGH";
export type DefBox = "LIGHT" | "NORMAL" | "HEAVY";
export type DefBlitz = "NONE" | "POSSIBLE" | "LIKELY";

export type DefensiveLook = {
  shell: DefShell;
  box: DefBox;
  blitz: DefBlitz;
};

export type SituationBucket = "EARLY_DOWN" | "3RD_SHORT" | "3RD_MEDIUM" | "3RD_8_PLUS" | "4TH_DOWN" | "RED_ZONE";

export type DefensiveCallSignature = `${DefensivePackage}:${DefShell}:${DefBox}:${DefBlitz}`;

export type DefensiveCallRecord = {
  snap: number;
  down: 1 | 2 | 3 | 4;
  distance: number;
  ballOn: number;
  defensivePackage: DefensivePackage;
  look: DefensiveLook;
  callSignature: DefensiveCallSignature;
  situationBucket: SituationBucket;
  pressureLook: boolean;
};

export type SituationWindowCount = {
  total: number;
  pressureLooks: number;
  blitzLikely: number;
  callsBySignature: Record<DefensiveCallSignature, number>;
};

// ─── Result ribbons ────────────────────────────────────────────────────────
export type ResultTagKind = "PRESSURE" | "COVERAGE" | "BOX" | "MISMATCH" | "EXECUTION" | "MISTAKE" | "SITUATION";
export type ResultTag = { kind: ResultTagKind; text: string };

// ─── In-game stats tracking ────────────────────────────────────────────────
export type SideStats = {
  passAttempts: number;
  completions: number;
  passYards: number;
  rushAttempts: number;
  rushYards: number;
  turnovers: number;
  tds: number;
  sacks: number;
  /** Yards per player for box-score leaders: rushYards by playerId placeholder */
  topRusherYards: number;
  topReceiverYards: number;
};

export type GameStats = { home: SideStats; away: SideStats };

export type TeamBoxScore = {
  teamId: string;
  score: number;
  passAttempts: number;
  completions: number;
  passYards: number;
  rushAttempts: number;
  rushYards: number;
  turnovers: number;
  sacks: number;
  tds: number;
};

export type PlayerBoxScore = {
  playerId: string;
  side: Possession;
  snaps: number;
  passing: { attempts: number; completions: number; yards: number; tds: number; ints: number; sacksTaken: number };
  rushing: { attempts: number; yards: number; tds: number };
  receiving: { targets: number; receptions: number; yards: number; tds: number };
  defense: { tackles: number; sacks: number; tfl: number; hurries: number; interceptionsDef: number; passDeflections: number; coverageGrade: number };
  specialTeams: {
    fieldGoalsMade: number;
    fieldGoalAttempts: number;
    fgMadeShort: number;
    fgMadeMid: number;
    fgMadeLong: number;
    extraPointsMade: number;
    punts: number;
    puntYards: number;
    puntsInside20: number;
  };
};

export type GameBoxScore = {
  season: number;
  week: number;
  home: TeamBoxScore;
  away: TeamBoxScore;
  players: PlayerBoxScore[];
  finalized: boolean;
};

// ─── Aggression / tempo ────────────────────────────────────────────────────
export type AggressionLevel = "CONSERVATIVE" | "STANDARD" | "NORMAL" | "AGGRESSIVE";
export type TempoMode = "NORMAL" | "HURRY_UP" | "MILK";

export type OffensiveFocus = "BALANCED" | "RUN_HEAVY" | "PASS_HEAVY";
export type DefensiveFocus = "BALANCED" | "STOP_RUN" | "STOP_PASS";
export type PressureRate = "LOW" | "MEDIUM" | "NORMAL" | "HIGH";

export type TeamGameplan = {
  offenseSchemeId?: OffenseSchemeId;
  offensiveFocus?: OffensiveFocus;
  defensiveFocus?: DefensiveFocus;
  pressureRate?: PressureRate;
  tempo?: "NORMAL" | "FAST" | "SLOW";
  aggression?: AggressionLevel;
  scriptedOpening?: PlayType[];
};

export type PlayEvaluation = {
  playType: PlayType;
  expectedSuccessProbability: number;
  yards: { low: number; median: number; high: number };
  pressureRisk: number;
  turnoverVariance: number;
  clockImpactSec: number;
  explosiveChance: number;
  boxAdvantage: number;
  confidence: number;
  risk: number;
  score: number;
};

/** Baseline overall rating used when no real team data is available */
const DEFAULT_RATING = 68;
export const SITUATION_WINDOW_SIZE = 12;

export type DriveLogEntry = {
  personnelPackage?: PersonnelPackage;
  defensivePackage?: DefensivePackage;
  drive: number;
  play: number;
  quarter: 1 | 2 | 3 | 4 | "OT";
  clockSec: number;
  possession: Possession;
  down: 1 | 2 | 3 | 4;
  distance: number;
  ballOn: number;
  playType: PlayType;
  result: string;
  resultTags: ResultTag[];
  explanation?: PlayExplanation;
  assignmentLog?: PlayAssignmentLog;
  homeScore: number;
  awayScore: number;
};

export type DriveResult = "TD" | "FG" | "PUNT" | "TURNOVER" | "TURNOVER_ON_DOWNS";

export type CurrentDrive = {
  driveNumber: number;
  possession: Possession;
  startBallOn: number;
  plays: DriveLogEntry[];
  result?: DriveResult;
};

export type PlayExplanation = {
  primaryFactor: string;
  secondaryFactor?: string;
  coachingNote?: string;
};

export type PlayResult = {
  playId: string;
  down: number;
  distance: number;
  yardsGained: number;
  outcome: "SUCCESS" | "FAILURE" | "EXPLOSIVE" | "NEGATIVE";
  explanation: PlayExplanation;
};

export type PendingOffensiveCall = {
  playType?: PlayType;
  personnelPackage?: PersonnelPackage;
  aggression?: AggressionLevel;
  tempo?: TempoMode;
};

export type PassPlayDiag = PassResolverDiagV1;

export type GameSim = {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  possession: Possession;
  ballOn: number;
  down: 1 | 2 | 3 | 4;
  distance: number;
  clock: ClockState;
  lastResult?: string;
  lastResultTags?: ResultTag[];
  seed: number;
  weekType?: "PRESEASON" | "REGULAR_SEASON" | "PLAYOFFS";
  playoffGameId?: string;
  weekNumber?: number;
  driveNumber: number;
  playNumberInDrive: number;
  driveLog: DriveLogEntry[];
  playLog: PlayEventV1Expanded[];
  currentDrive: CurrentDrive;
  /** Current defensive look shown to the user pre-snap */
  defLook?: DefensiveLook;
  /** Aggression level applied to next play */
  aggression: AggressionLevel;
  /** Tempo for snap pacing */
  tempo: TempoMode;
  /** Accumulated in-game stats */
  stats: GameStats;
  boxScore?: GameBoxScore;
  /** Team ratings snapshot (set at game start) */
  homeRatings?: TeamGameRatings;
  awayRatings?: TeamGameRatings;
  /** User control mode */
  controlMode: "PLAY_BY_PLAY" | "HYBRID" | "COACH";
  /** Runtime fatigue state for tracked players */
  playerFatigue: Record<string, number>;
  /** Runtime snap load for current game */
  snapLoadThisGame: Record<string, number>;
  /** Tracked participant mapping by side */
  trackedPlayers: TrackedPlayers;
  specialistsBySide: Record<Possession, Partial<Record<"K" | "P", string>>>;
  currentPersonnelPackage: PersonnelPackage;
  likelyDefensiveReactions: Array<{ defensivePackage: DefensivePackage; probability: number }>;
  selectedDefensivePackage?: DefensivePackage;
  defensiveCallRecords: DefensiveCallRecord[];
  recentDefensiveCalls: DefensiveCallRecord[];
  situationWindowCounts: Partial<Record<SituationBucket, SituationWindowCount>>;
  observedSnaps: number;
  practiceExecutionBonus: number;
  qbRunContactsByPlayerId: Record<string, number>;
  lateGamePracticeRetentionBonus: number;
  coachArchetypeId?: string;
  coachTenureYear: number;
  coachUnlockedPerkIds?: string[];
  homeGameplan?: WeeklyGameplan;
  awayGameplan?: WeeklyGameplan;
  weather?: GameWeather;
  playerUnicorns: Record<string, PlayerUnicorn>;
  playerBadges: Record<string, PlayerBadge[]>;
  unicornImpactLog: Array<{ playId: string; side: Possession; playerId: string; archetypeId: UnicornArchetypeId; description: string }>;
  lastPlayResult?: PlayResult;
  /** Deterministic pass resolver diagnostics for last snap (transient state) */
  lastPlayDiag?: PassPlayDiag;
  lastAssignmentLog?: PlayAssignmentLog;
  offenseUserMode?: "FULL_AUTO" | "KEY_SITUATIONS" | "FULL_PLAYCALLING";
  pendingOffensiveCall?: PendingOffensiveCall;
  defenseUserMode?: "OFF" | "KEY_DOWNS" | "ALWAYS";
  pendingDefensiveCall?: DefensiveCall;
  lastDefensiveCall?: DefensiveCall;
  needsDefensiveCall?: boolean;
  defensiveCallSituation?: { down: number; distance: number; yardLine: number; quarter: number; clockSec: number };
  forceAutoDefenseCall?: boolean;
};

const MAX_PLAY_LOG_EVENTS = 384;

const EXPLANATION_BANK: Record<"NEGATIVE" | "FAILURE" | "SUCCESS" | "EXPLOSIVE", string[]> = {
  NEGATIVE: ["Coverage closed quickly and the window vanished", "Pressure won early and disrupted rhythm", "Backside pursuit erased the cutback lane"],
  FAILURE: ["Timing route arrived a beat late", "Front fit held and gains were limited", "3rd down leverage forced a checkdown"],
  SUCCESS: ["Personnel mismatch exploited in space", "Pocket stayed clean and progression stayed on schedule", "Second-level block sealed the lane"],
  EXPLOSIVE: ["Coverage bust on the backside created open grass", "Tackle broken at the second level turned it into a chunk play", "Vertical stress forced a late safety rotation"],
};

function buildPlayExplanation(sim: GameSim, playType: PlayType, outcome: "SUCCESS" | "FAILURE" | "EXPLOSIVE" | "NEGATIVE", yards: number): PlayExplanation {
  const bank = EXPLANATION_BANK[outcome];
  const primaryFactor = bank[Math.floor(contextualRng(sim.seed, `explain-${sim.driveNumber}-${sim.playNumberInDrive + 1}`)() * bank.length)] ?? bank[0];
  const lateGame = (sim.clock.quarter === 2 || sim.clock.quarter === 4) && sim.clock.timeRemainingSec <= 120;
  const secondaryFactor = lateGame
    ? "2-minute context increased defensive volatility"
    : sim.down === 3
      ? `3rd & ${sim.distance} leverage shaped the call`
      : yards < 0
        ? "Execution dipped at the point of attack"
        : undefined;
  const fatigueHit = Object.values(sim.playerFatigue ?? {}).some((v) => v >= 72);
  const coachingNote = fatigueHit
    ? "Fatigue affected execution on this snap"
    : sim.coachArchetypeId && (playType === "DROPBACK" || playType === "QUICK_GAME") && (outcome === "SUCCESS" || outcome === "EXPLOSIVE")
      ? "Your offensive system created this opening"
      : undefined;
  return { primaryFactor, secondaryFactor, coachingNote };
}

export type PlayResolution = { sim: GameSim; ended: boolean };
export type PlaySelectionFn = (sim: GameSim) => PlayType;

function getSituationBucket(sim: Pick<GameSim, "down" | "distance" | "ballOn">): SituationBucket {
  if (sim.ballOn >= 80) return "RED_ZONE";
  if (sim.down === 4) return "4TH_DOWN";
  if (sim.down === 3 && sim.distance >= 8) return "3RD_8_PLUS";
  if (sim.down === 3 && sim.distance >= 4) return "3RD_MEDIUM";
  if (sim.down === 3) return "3RD_SHORT";
  return "EARLY_DOWN";
}

function isPressureLook(look: DefensiveLook): boolean {
  return look.blitz === "LIKELY" || (look.blitz === "POSSIBLE" && look.shell === "SINGLE_HIGH");
}

function buildDefensiveCallSignature(defensivePackage: DefensivePackage, look: DefensiveLook): DefensiveCallSignature {
  return `${defensivePackage}:${look.shell}:${look.box}:${look.blitz}`;
}

function rebuildSituationWindowCounts(records: DefensiveCallRecord[]): Partial<Record<SituationBucket, SituationWindowCount>> {
  const counts: Partial<Record<SituationBucket, SituationWindowCount>> = {};
  for (const record of records) {
    const bucketCount = counts[record.situationBucket] ?? { total: 0, pressureLooks: 0, blitzLikely: 0, callsBySignature: {} as Record<DefensiveCallSignature, number> };
    bucketCount.total += 1;
    if (record.pressureLook) bucketCount.pressureLooks += 1;
    if (record.look.blitz === "LIKELY") bucketCount.blitzLikely += 1;
    bucketCount.callsBySignature[record.callSignature] = (bucketCount.callsBySignature[record.callSignature] ?? 0) + 1;
    counts[record.situationBucket] = bucketCount;
  }
  return counts;
}

function recordDefensiveCall(sim: GameSim, record: DefensiveCallRecord): GameSim {
  const previousRecords = sim.defensiveCallRecords ?? [];
  const defensiveCallRecords = [...previousRecords, record];
  const maxRecords = SITUATION_WINDOW_SIZE + 3; // keep enough for situation window + recent calls
  const trimmedDefensiveCallRecords =
    defensiveCallRecords.length > maxRecords
      ? defensiveCallRecords.slice(-maxRecords)
      : defensiveCallRecords;
  const recentDefensiveCalls = trimmedDefensiveCallRecords.slice(-3).reverse();
  const windowRecords = trimmedDefensiveCallRecords.slice(-SITUATION_WINDOW_SIZE);
  return {
    ...sim,
    defensiveCallRecords: trimmedDefensiveCallRecords,
    recentDefensiveCalls,
    situationWindowCounts: rebuildSituationWindowCounts(windowRecords),
    observedSnaps: (sim.observedSnaps ?? 0) + 1,
  };
}


export function resolveArchetypePassives(coach: { archetypeId?: string; tenureYear?: number }, gameContext: { sim: GameSim; playType: PlayType; aggression: AggressionLevel }): PassiveResolution {
  const traits = getArchetypeTraits(coach.archetypeId);
  if (!traits) return {};

  let resolved: PassiveResolution = {};
  for (const trait of traits.passiveTraits) {
    const input = { sim: gameContext.sim, playType: gameContext.playType, aggression: gameContext.aggression };
    if (!trait.triggerCondition(input)) continue;
    const effect = trait.effectFn(input);
    resolved = {
      offensiveExecutionBonus: (resolved.offensiveExecutionBonus ?? 0) + (effect.offensiveExecutionBonus ?? 0),
      defensiveExecutionBonus: (resolved.defensiveExecutionBonus ?? 0) + (effect.defensiveExecutionBonus ?? 0),
      penaltyRateMultiplier: (resolved.penaltyRateMultiplier ?? 1) * (effect.penaltyRateMultiplier ?? 1),
      closeGameExecutionBonus: (resolved.closeGameExecutionBonus ?? 0) + (effect.closeGameExecutionBonus ?? 0),
      notes: [...(resolved.notes ?? []), ...(effect.notes ?? [])],
    };
  }

  return resolved;
}

export type FourthDownRecommendation = {
  best: PlayType;
  ranked: { playType: PlayType; score: number }[];
  breakevenGoRate: number;
};

// ─── PAS (Play Advantage Score) engine ────────────────────────────────────

/** Sigmoid used to convert PAS to success probability */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * CallVsLook: advantage of a play call against the current defensive look.
 * Returns a value roughly in [-1, +1].
 */
function callVsLook(playType: PlayType, look: DefensiveLook): number {
  const { shell, box, blitz } = look;
  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN" || playType === "QB_KEEP";
  const isScreen = playType === "SCREEN";
  const isQuick = playType === "QUICK_GAME";
  const isPlayAction = playType === "PLAY_ACTION";
  const isDeep = playType === "DROPBACK" || playType === "DEEP_PASS";
  const isShort = playType === "SHORT_PASS";

  let score = 0;

  // Box count effects on run game
  if (isRun) {
    if (box === "LIGHT") score += 0.8;
    else if (box === "HEAVY") score -= 0.6;
    if (blitz === "LIKELY") score += 0.25; // blitz = fewer in box for runs
  }

  // Screen is great vs heavy blitz
  if (isScreen) {
    if (blitz === "LIKELY") score += 0.7;
    else if (blitz === "POSSIBLE") score += 0.3;
    // but coverage shell matters less for screens
  }

  // Quick game beats blitz
  if (isQuick) {
    if (blitz === "LIKELY") score += 0.5;
    else if (blitz === "POSSIBLE") score += 0.2;
    // man coverage vs quick game is tighter though
    if (shell === "SINGLE_HIGH") score -= 0.1; // more man
  }

  // Deep shots limited by two-high coverage
  if (isDeep || isShort) {
    if (shell === "TWO_HIGH") score -= 0.6;
    else score += 0.2; // single-high = single safety help
    if (blitz === "LIKELY") score -= 0.3; // still risky under pressure
  }

  // Play action: great vs single-high if you've established run (handled externally)
  if (isPlayAction) {
    if (shell === "SINGLE_HIGH") score += 0.4;
    else score -= 0.1;
    if (box === "HEAVY") score += 0.3; // they loaded box = PA exploits it
  }

  // Outside zone exploits over-pursuit
  if (playType === "OUTSIDE_ZONE") {
    if (box === "HEAVY") score -= 0.2; // heavy box still clogs edges
    if (blitz === "NONE") score += 0.15;
  }

  return clamp(score, -1, 1);
}

/** MatchupEdge from team ratings. Returns roughly [-1, +1]. */
function matchupEdge(playType: PlayType, off: TeamGameRatings, def: TeamGameRatings, sim: GameSim): number {
  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN" || playType === "QB_KEEP";
  const isPass = !isRun && playType !== "SPIKE" && playType !== "KNEEL" && playType !== "PUNT" && playType !== "FG";

  if (isRun) {
    const olVsRunDef = (off.olPassBlock - def.runStop) / 15; // OL run-block vs DL run-stop
    const rbFactor = (off.rbBurst - DEFAULT_RATING) / 17;
    return clamp(olVsRunDef * 0.6 + rbFactor * 0.4, -1, 1);
  }

  if (isPass) {
    const olVsRush = (off.olPassBlock - def.dlPassRush) / 15;
    const wrVsDb = (off.wrSeparation - def.dbCoverage) / 15;
    const qbEdge = (off.qbProcessing - DEFAULT_RATING) / 17;
    return clamp(olVsRush * 0.35 + wrVsDb * 0.4 + qbEdge * 0.25, -1, 1);
  }

  return 0;
}

/** SituationFit: positive when play fits the situation. */
function situationFit(playType: PlayType, sim: GameSim): number {
  const { down, distance, ballOn, clock } = sim;
  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN" || playType === "QB_KEEP";
  const isScreen = playType === "SCREEN";
  const isPA = playType === "PLAY_ACTION";

  let score = 0;

  // Short yardage = run/screen good
  if (distance <= 2 && isRun) score += 0.4;
  if (distance >= 8 && isRun) score -= 0.4;

  // Red zone: compact field hurts deep routes
  if (ballOn >= 80) {
    if (playType === "DROPBACK" || playType === "DEEP_PASS") score -= 0.3;
    if (isRun || playType === "QUICK_GAME" || playType === "SHORT_PASS") score += 0.2;
  }

  // Late game urgency: screen wastes time
  const q = clock.quarter;
  const t = clock.timeRemainingSec;
  if (q === 4 && t < 120 && isScreen) score -= 0.25;
  if (q === 4 && t < 60 && isRun) score -= 0.3;

  // 3rd & medium/long: passes better
  if (down === 3 && distance >= 5 && isRun) score -= 0.3;

  // PA needs run history – we approximate: if early downs and not urgent, it's plausible
  if (isPA && down <= 2 && distance <= 7) score += 0.2;

  return clamp(score, -1, 1);
}

/** ExecutionState: fatigue not modeled yet; returns small modifier. */
export function composeExecutionModifiers(params: { fatigueMod: number; matchupMod: number; pressureRisk: number; isRun: boolean }): number {
  const pressureAdjust = params.isRun ? 1 : 1 / Math.max(0.7, params.pressureRisk);
  const composite = params.fatigueMod * params.matchupMod * pressureAdjust;
  return composite;
}

function executionState(sim: GameSim, playType: PlayType, matchup: MatchupModifier): number {
  const tracked = sim.trackedPlayers[sim.possession] ?? {};
  const runPlay = isRunPlay(playType);
  const weighted: Array<{ pos: FatigueTrackedPosition; w: number }> =
    runPlay
      ? [{ pos: "RB", w: 0.5 }, { pos: "OL", w: 0.35 }, { pos: "QB", w: 0.15 }]
      : [{ pos: "QB", w: 0.45 }, { pos: "WR", w: 0.35 }, { pos: "TE", w: 0.2 }];

  let acc = 0;
  for (const item of weighted) {
    const id = tracked[item.pos];
    const fatigue = id ? clampFatigue(sim.playerFatigue[id] ?? 50) : 50;
    const fx = computeFatigueEffects(fatigue);
    const fatigueMod = runPlay ? fx.speed : fx.accuracy;
    const matchupMod = runPlay ? matchup.runEfficiency : matchup.passEfficiency;
    acc += composeExecutionModifiers({ fatigueMod, matchupMod, pressureRisk: matchup.pressureRisk, isRun: runPlay }) * item.w;
  }

  const lateGame = (sim.clock.quarter === 2 || sim.clock.quarter === 4) && sim.clock.timeRemainingSec <= 120;
  const lateGameBonus = lateGame ? sim.lateGamePracticeRetentionBonus * 0.015 : 0;
  return (acc - 1) * 0.8 + sim.practiceExecutionBonus * 0.02 + lateGameBonus;
}

/** Compute the Play Advantage Score. */
function computePAS(playType: PlayType, look: DefensiveLook, sim: GameSim, matchup: MatchupModifier): { pas: number; cvl: number; me: number; sf: number } {
  const off = sim.possession === "HOME" ? sim.homeRatings : sim.awayRatings;
  const def = sim.possession === "HOME" ? sim.awayRatings : sim.homeRatings;

  const cvl = callVsLook(playType, look);
  const me = off && def ? matchupEdge(playType, off, def, sim) : 0;
  const sf = situationFit(playType, sim);
  const exec = executionState(sim, playType, matchup);
  const qbId = sim.trackedPlayers[sim.possession]?.QB1 ?? sim.trackedPlayers[sim.possession]?.QB;
  const qb = qbId ? (getPlayerById(String(qbId)) as any) : undefined;
  const qbTag = qb ? resolveQbArchetypeTag(qb) : "GAME_MANAGER";
  const schemeId = sim.possession === "HOME" ? sim.homeGameplan?.offenseSchemeId : sim.awayGameplan?.offenseSchemeId;
  const schemeFit = getQbSchemeFitMultiplier(qbTag, schemeId);

  // PAS = weighted sum
  const pas = 0.35 * cvl + 0.35 * me + 0.2 * sf + 0.1 * (exec * schemeFit);
  return { pas, cvl, me, sf };
}

function getTempoModifiers(tempo: TempoMode): { success: number; explosive: number; pressure: number; turnover: number; clockSec: number } {
  if (tempo === "HURRY_UP") return { success: -0.03, explosive: 0.03, pressure: 0.05, turnover: 0.03, clockSec: 8 };
  if (tempo === "MILK") return { success: 0.02, explosive: -0.02, pressure: -0.03, turnover: -0.02, clockSec: -9 };
  return { success: 0, explosive: 0, pressure: 0, turnover: 0, clockSec: 0 };
}

function getAggressionModifiers(aggression: AggressionLevel): { success: number; explosive: number; pressure: number; turnover: number } {
  if (aggression === "AGGRESSIVE") return { success: -0.01, explosive: 0.06, pressure: 0.04, turnover: 0.05 };
  if (aggression === "CONSERVATIVE") return { success: 0.03, explosive: -0.03, pressure: -0.03, turnover: -0.04 };
  return { success: 0, explosive: 0, pressure: 0, turnover: 0 };
}

export function evaluatePlayConcept(
  sim: GameSim,
  playType: PlayType,
  opts: { look?: DefensiveLook; aggression?: AggressionLevel; tempo?: TempoMode; personnelPackage?: PersonnelPackage } = {}
): PlayEvaluation {
  const look = opts.look ?? sim.defLook ?? computeDefensiveLook(sim, contextualRng(sim.seed, `eval-look-${playType}`));
  const aggression = opts.aggression ?? sim.aggression;
  const tempo = opts.tempo ?? sim.tempo;
  const personnelPackage = opts.personnelPackage ?? sim.currentPersonnelPackage;
  const matchup = getMatchupModifier(personnelPackage, sim.selectedDefensivePackage ?? "Nickel");
  const pasComp = computePAS(playType, look, sim, matchup);
  const tempoMod = getTempoModifiers(tempo);
  const aggMod = getAggressionModifiers(aggression);
  const pas = pasComp.pas;

  const isRun = isRunPlay(playType);
  const expectedSuccessProbability = clamp(sigmoid(2.5 * pas + 0.2) + tempoMod.success + aggMod.success, 0.15, 0.9);
  const explosiveChance = clamp(0.08 + 0.18 * pas + tempoMod.explosive + aggMod.explosive, 0.01, 0.45);
  const pressureRiskBase = isRun
    ? 0.08 + (look.box === "HEAVY" ? 0.08 : look.box === "LIGHT" ? -0.02 : 0)
    : 0.14 + (look.blitz === "LIKELY" ? 0.13 : look.blitz === "POSSIBLE" ? 0.07 : 0);
  const pressureRisk = clamp(pressureRiskBase + (0.5 - expectedSuccessProbability) * 0.18 + tempoMod.pressure + aggMod.pressure, 0.03, 0.6);
  const turnoverVariance = clamp((isRun ? 0.03 : 0.055) + pressureRisk * 0.18 + tempoMod.turnover + aggMod.turnover, 0.01, 0.25);

  const runMedian = 2 + pas * 4.2 + expectedSuccessProbability * 2.5;
  const passMedian = 4 + pas * 5 + expectedSuccessProbability * 4;
  const median = isRun ? runMedian : passMedian;
  const volatility = (isRun ? 4.5 : 8.2) + explosiveChance * 13;
  const low = Math.round(clamp(median - volatility * 0.75, -8, 40));
  const medianRounded = Math.round(clamp(median, -3, 45));
  const high = Math.round(clamp(median + volatility, 1, 55));
  const clockImpactSec = Math.round((isRun ? -5 : 2) + tempoMod.clockSec + (playType === "SCREEN" ? 2 : 0));

  const boxAdvantage = clamp((look.box === "LIGHT" && isRun ? 1 : look.box === "HEAVY" && isRun ? -1 : 0) + pasComp.cvl * 0.6, -1, 1);
  const confidence = clamp(expectedSuccessProbability - turnoverVariance * 0.5, 0, 1);
  const risk = clamp(pressureRisk * 0.6 + turnoverVariance * 0.8 - expectedSuccessProbability * 0.3, 0, 1);
  const score = confidence * 0.52 + explosiveChance * 0.28 + (medianRounded / 18) * 0.2 - risk * 0.28;

  return {
    playType,
    expectedSuccessProbability,
    yards: { low, median: medianRounded, high },
    pressureRisk,
    turnoverVariance,
    clockImpactSec,
    explosiveChance,
    boxAdvantage,
    confidence,
    risk,
    score,
  };
}

export function evaluatePlayConcepts(
  sim: GameSim,
  playTypes: PlayType[],
  opts: { look?: DefensiveLook; aggression?: AggressionLevel; tempo?: TempoMode; personnelPackage?: PersonnelPackage } = {}
): PlayEvaluation[] {
  return playTypes.map((playType) => evaluatePlayConcept(sim, playType, opts)).sort((a, b) => b.score - a.score);
}

/** Generate the next defensive look based on game situation. */
export function computeDefensiveLook(sim: GameSim, rng: () => number): DefensiveLook {
  const { down, distance, ballOn, clock } = sim;
  const q = clock.quarter;
  const t = clock.timeRemainingSec;
  const defOvr = sim.possession === "HOME"
    ? (sim.awayRatings?.dbCoverage ?? DEFAULT_RATING)
    : (sim.homeRatings?.dbCoverage ?? DEFAULT_RATING);
  const blitzTend = sim.possession === "HOME"
    ? (sim.awayRatings?.blitzImpact ?? DEFAULT_RATING)
    : (sim.homeRatings?.blitzImpact ?? DEFAULT_RATING);

  // Shell: two-high more common on 3rd & long, late in game, when leading
  const scoreDiff = sim.possession === "HOME"
    ? sim.awayScore - sim.homeScore
    : sim.homeScore - sim.awayScore; // positive = defense is ahead
  let twoHighProb = 0.45;
  if (down === 3 && distance >= 7) twoHighProb += 0.25;
  if (ballOn >= 80) twoHighProb -= 0.2; // red zone = tighter man
  if (scoreDiff > 7) twoHighProb += 0.1; // playing with lead
  if (defOvr >= 75) twoHighProb += 0.05;
  const shell: DefShell = rng() < clamp(twoHighProb, 0.1, 0.85) ? "TWO_HIGH" : "SINGLE_HIGH";

  // Box: heavy when run is likely
  let heavyProb = 0.2;
  let lightProb = 0.25;
  if (down <= 2 && distance <= 5) heavyProb += 0.25;
  if (down === 3 && distance >= 5) { heavyProb -= 0.1; lightProb += 0.2; }
  if (ballOn >= 80) heavyProb += 0.15; // goal line
  const boxRoll = rng();
  let box: DefBox;
  if (boxRoll < clamp(heavyProb, 0.05, 0.6)) box = "HEAVY";
  else if (boxRoll < clamp(heavyProb + lightProb, 0.15, 0.85)) box = "LIGHT";
  else box = "NORMAL";

  // Blitz: more likely on 3rd & short or when defense has strong blitz package
  let likelyBlitzProb = 0.1 + (blitzTend - DEFAULT_RATING) / DEFAULT_RATING * 0.15;
  let possibleBlitzProb = 0.25;
  if (down === 3 && distance <= 4) { likelyBlitzProb += 0.2; possibleBlitzProb += 0.1; }
  if (down === 3 && distance >= 8) { likelyBlitzProb -= 0.05; possibleBlitzProb += 0.1; }
  if ((q === 4 || q === 2) && t < 120) likelyBlitzProb += 0.1;
  const blitzRoll = rng();
  let blitz: DefBlitz;
  if (blitzRoll < clamp(likelyBlitzProb, 0.04, 0.45)) blitz = "LIKELY";
  else if (blitzRoll < clamp(likelyBlitzProb + possibleBlitzProb, 0.15, 0.7)) blitz = "POSSIBLE";
  else blitz = "NONE";

  return { shell, box, blitz };
}

/** Generate 1-2 result tags explaining the outcome. */
function buildResultTags(
  sim: GameSim,
  playType: PlayType,
  look: DefensiveLook,
  pasComponents: { pas: number; cvl: number; me: number; sf: number },
  outcome: "SUCCESS" | "FAILURE" | "EXPLOSIVE" | "NEGATIVE",
  aggression: AggressionLevel
): ResultTag[] {
  const tags: ResultTag[] = [];
  const { cvl, me, sf } = pasComponents;
  const { shell, box, blitz } = look;
  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN" || playType === "QB_KEEP";
  const isPass = !isRun && playType !== "SPIKE" && playType !== "KNEEL" && playType !== "PUNT" && playType !== "FG";

  // Pick the largest contributing factor
  const factors: { key: string; val: number }[] = [
    { key: "cvl", val: Math.abs(cvl) },
    { key: "me", val: Math.abs(me) },
    { key: "sf", val: Math.abs(sf) },
  ].sort((a, b) => b.val - a.val);

  const top = factors[0]?.key;

  if (top === "cvl" || factors[0].val < 0.1) {
    // Describe the look effect
    if (isRun) {
      if (box === "LIGHT") tags.push({ kind: "BOX", text: "Light box – run efficiency" });
      else if (box === "HEAVY") tags.push({ kind: "BOX", text: "Heavy box – congested lanes" });
    }
    if (isPass) {
      if (shell === "TWO_HIGH" && (playType === "DROPBACK" || playType === "DEEP_PASS")) {
        tags.push({ kind: "COVERAGE", text: "Two-high – capped deep shot" });
      } else if (shell === "SINGLE_HIGH" && playType === "PLAY_ACTION") {
        tags.push({ kind: "COVERAGE", text: "Single-high – PA opened window" });
      } else if (blitz === "LIKELY" && playType === "QUICK_GAME") {
        tags.push({ kind: "COVERAGE", text: "Blitz – hot route converted" });
      } else if (blitz === "LIKELY" && isPass && outcome === "NEGATIVE") {
        tags.push({ kind: "PRESSURE", text: "Blitz overwhelmed protection" });
      } else if (blitz === "LIKELY" && playType === "SCREEN") {
        tags.push({ kind: "BOX", text: "Screen vs blitz – cutback lane" });
      }
    }
  }

  if (top === "me") {
    if (isPass) {
      if (me > 0.2) tags.push({ kind: "MISMATCH", text: outcome === "EXPLOSIVE" ? "WR created separation" : "Matchup edge – passing lane" });
      else if (me < -0.2) tags.push({ kind: "PRESSURE", text: outcome === "NEGATIVE" ? "Edge won vs tackle" : "Pressure disrupted timing" });
    }
    if (isRun) {
      if (me > 0.15) tags.push({ kind: "MISMATCH", text: "OL dominated – run lane opened" });
      else if (me < -0.15) tags.push({ kind: "MISMATCH", text: "DL stuffed – no crease" });
    }
  }

  if (top === "sf" && tags.length === 0) {
    if (sf < -0.2) tags.push({ kind: "SITUATION", text: "Play call fought the situation" });
    else if (sf > 0.2) tags.push({ kind: "SITUATION", text: "Good call for down & distance" });
  }

  // Add a secondary tag if outcome warrants it
  if (outcome === "NEGATIVE" && tags.length < 2) {
    if (isPass && blitz === "LIKELY") tags.push({ kind: "PRESSURE", text: "Defense brought pressure" });
    else if (isPass) tags.push({ kind: "MISTAKE", text: "Coverage won the rep" });
    else tags.push({ kind: "EXECUTION", text: "Defenders won at the point of attack" });
  }
  if (outcome === "EXPLOSIVE" && tags.length < 2 && isPass) {
    tags.push({ kind: "MISMATCH", text: shell === "SINGLE_HIGH" ? "Safety help stretched thin" : "WR won the route" });
  }
  if (aggression === "AGGRESSIVE" && outcome === "NEGATIVE" && tags.length < 2) {
    tags.push({ kind: "EXECUTION", text: "Aggressive call – high-risk backfired" });
  }

  return tags.slice(0, 2);
}

/** Empty stats for one side. */
function emptySideStats(): SideStats {
  return { passAttempts: 0, completions: 0, passYards: 0, rushAttempts: 0, rushYards: 0, turnovers: 0, tds: 0, sacks: 0, topRusherYards: 0, topReceiverYards: 0 };
}

function emptyGameStats(): GameStats {
  return { home: emptySideStats(), away: emptySideStats() };
}

function sideRef(sim: GameSim): SideStats {
  return sim.possession === "HOME" ? sim.stats.home : sim.stats.away;
}

function currentWeatherLabel(sim: GameSim): string {
  return String(sim.weather?.condition ?? "CLEAR").toUpperCase();
}

type PlayParticipants = {
  qbId?: string;
  rbId?: string;
  targetRole?: OffenseEligibleRole;
  targetPlayerId?: string;
  primaryDefenderId?: string;
  rusherIds: string[];
  blockerIds: string[];
  primaryRusherId?: string;
};

function emptyPlayerBoxLine(playerId: string, side: Possession): PlayerBoxScore {
  return {
    playerId,
    side,
    snaps: 0,
    passing: { attempts: 0, completions: 0, yards: 0, tds: 0, ints: 0, sacksTaken: 0 },
    rushing: { attempts: 0, yards: 0, tds: 0 },
    receiving: { targets: 0, receptions: 0, yards: 0, tds: 0 },
    defense: { tackles: 0, sacks: 0, tfl: 0, hurries: 0, interceptionsDef: 0, passDeflections: 0, coverageGrade: 0 },
    specialTeams: {
      fieldGoalsMade: 0,
      fieldGoalAttempts: 0,
      fgMadeShort: 0,
      fgMadeMid: 0,
      fgMadeLong: 0,
      extraPointsMade: 0,
      punts: 0,
      puntYards: 0,
      puntsInside20: 0,
    },
  };
}

function upsertPlayerLine(players: PlayerBoxScore[], playerId: string, side: Possession): PlayerBoxScore {
  let line = players.find((p) => p.playerId === playerId && p.side === side);
  if (!line) {
    line = emptyPlayerBoxLine(playerId, side);
    players.push(line);
  }
  return line;
}

export function getPlayParticipants(sim: GameSim, assignmentLog?: PlayAssignmentLog): PlayParticipants {
  const offense = sim.trackedPlayers[sim.possession] ?? {};
  const defenseSide = otherSide(sim.possession);
  const defense = sim.trackedPlayers[defenseSide] ?? {};
  const qbId = offense.QB1 ?? offense.QB;
  const rbId = offense.RB1 ?? offense.RB;
  const targetRole = assignmentLog?.targetRole ?? assignmentLog?.primaryReadRole;
  const targetPlayerId = assignmentLog?.targetPlayerId
    ?? (targetRole ? assignmentLog?.offenseRolesAtSnap?.[targetRole] : undefined)
    ?? (targetRole === "RB"
      ? (offense.RB1 ?? offense.RB)
      : targetRole === "Y"
        ? (offense.TE1 ?? offense.TE)
        : targetRole === "Z"
          ? (assignmentLog?.offenseRolesAtSnap?.Z ?? offense.WR2 ?? offense.WR1 ?? offense.WR)
          : targetRole === "H"
            ? (assignmentLog?.offenseRolesAtSnap?.H ?? offense.WR3 ?? offense.FB1 ?? offense.WR2 ?? offense.WR)
            : (assignmentLog?.offenseRolesAtSnap?.X ?? offense.WR1 ?? offense.WR));
  const primaryDefenderId = assignmentLog?.defenderId
    ?? (targetRole && targetRole !== "QB" ? assignmentLog?.responsibleDefenderByRole?.[targetRole] : undefined)
    ?? defense.CB1
    ?? defense.DB;

  const rushMatchups = assignmentLog?.rushMatchups ?? [];
  const rusherIds = rushMatchups.map((m) => String(m.rusherId));
  const blockerIds = rushMatchups.flatMap((m) => m.blockerIds.map((id) => String(id)));
  const primaryRusherId = rushMatchups.find((m) => (m.note ?? "").toLowerCase().includes("protection side"))?.rusherId
    ?? rushMatchups[0]?.rusherId
    ?? defense.EDGE_L
    ?? defense.DL
    ?? defense.LB;

  return {
    qbId: qbId ? String(qbId) : undefined,
    rbId: rbId ? String(rbId) : undefined,
    targetRole,
    targetPlayerId: targetPlayerId ? String(targetPlayerId) : undefined,
    primaryDefenderId: primaryDefenderId ? String(primaryDefenderId) : undefined,
    rusherIds,
    blockerIds,
    primaryRusherId: primaryRusherId ? String(primaryRusherId) : undefined,
  };
}

export function buildBadgeContextInput(sim: GameSim, playType: PlayType, assignmentLog?: PlayAssignmentLog) {
  const participants = getPlayParticipants(sim, assignmentLog);
  const offenseTracked = sim.trackedPlayers[sim.possession] ?? {};
  const defenseTracked = sim.trackedPlayers[otherSide(sim.possession)] ?? {};
  const targetRole = participants.targetRole;
  const targetPlayerId = participants.targetPlayerId;
  const rbResp = assignmentLog?.responsibleDefenderByRole?.RB;
  const yResp = assignmentLog?.responsibleDefenderByRole?.Y;
  const lbByResponsibility = [rbResp, yResp].find((id) => id && (
    id === assignmentLog?.defenseRolesAtSnap?.LB1
    || id === assignmentLog?.defenseRolesAtSnap?.LB2
    || id === defenseTracked.LB
  ));
  return {
    playType,
    ballOn: sim.ballOn,
    offenseIds: {
      QB: participants.qbId,
      RB: targetRole === "RB" ? targetPlayerId : (participants.rbId ?? offenseTracked.RB1 ?? offenseTracked.RB),
      WR: (targetRole === "X" || targetRole === "Z" || targetRole === "H") ? targetPlayerId : (assignmentLog?.offenseRolesAtSnap?.X ?? offenseTracked.WR1 ?? offenseTracked.WR),
      TE: targetRole === "Y" ? targetPlayerId : (assignmentLog?.offenseRolesAtSnap?.Y ?? offenseTracked.TE1 ?? offenseTracked.TE),
    },
    defenseIds: {
      DL: participants.primaryRusherId ?? defenseTracked.DL,
      LB: lbByResponsibility ?? defenseTracked.LB1 ?? defenseTracked.LB,
      DB: participants.primaryDefenderId ?? defenseTracked.CB1 ?? defenseTracked.DB,
    },
    specialistIds: { K: sim.specialistsBySide[sim.possession]?.K, P: sim.specialistsBySide[sim.possession]?.P },
  };
}

export function applyPlayerStatsForResolvedPlay(
  sim: GameSim,
  params: { playType: PlayType; yards: number; sack: boolean; scramble: boolean; incomplete: boolean; turnover: boolean; turnoverKind?: "INT" | "FUMBLE"; td: boolean; assignmentLog?: PlayAssignmentLog },
): GameSim {
  const offenseSide = sim.possession;
  const defenseSide = otherSide(sim.possession);
  const players = [...(sim.boxScore?.players ?? [])];
  const participants = getPlayParticipants(sim, params.assignmentLog);
  const isRun = params.playType === "INSIDE_ZONE" || params.playType === "OUTSIDE_ZONE" || params.playType === "POWER" || params.playType === "RUN" || params.playType === "QB_KEEP";

  if (isRun) {
    const carrier = params.playType === "QB_KEEP" ? participants.qbId : participants.rbId;
    if (carrier) {
      const line = upsertPlayerLine(players, carrier, offenseSide);
      line.rushing.attempts += 1;
      if (!params.turnover) {
        line.rushing.yards += Math.max(0, params.yards);
        if (params.td) line.rushing.tds += 1;
      }
    }
  } else {
    if (params.scramble && participants.qbId) {
      const qbRunLine = upsertPlayerLine(players, participants.qbId, offenseSide);
      qbRunLine.rushing.attempts += 1;
      if (!params.turnover) {
        qbRunLine.rushing.yards += Math.max(0, params.yards);
        if (params.td) qbRunLine.rushing.tds += 1;
      }
      return { ...sim, boxScore: { ...(sim.boxScore ?? buildGameBoxScore(sim, sim.weekNumber ?? 0)), players } };
    }

    if (participants.qbId) {
      const qbLine = upsertPlayerLine(players, participants.qbId, offenseSide);
      if (!params.sack) qbLine.passing.attempts += 1;
      if (!params.sack && !params.incomplete && !params.turnover) {
        qbLine.passing.completions += 1;
        qbLine.passing.yards += Math.max(0, params.yards);
        if (params.td) qbLine.passing.tds += 1;
      }
      if (params.sack) qbLine.passing.sacksTaken += 1;
      if (params.turnoverKind === "INT") qbLine.passing.ints += 1;
    }

    if (!params.sack && participants.targetPlayerId) {
      const targetLine = upsertPlayerLine(players, participants.targetPlayerId, offenseSide);
      targetLine.receiving.targets += 1;
      if (!params.sack && !params.incomplete && !params.turnover) {
        targetLine.receiving.receptions += 1;
        targetLine.receiving.yards += Math.max(0, params.yards);
        if (params.td) targetLine.receiving.tds += 1;
      }
    }

    if (params.turnoverKind === "INT" && participants.primaryDefenderId) {
      const defender = upsertPlayerLine(players, participants.primaryDefenderId, defenseSide);
      defender.defense.interceptionsDef += 1;
    }

    if (params.sack && participants.primaryRusherId) {
      const rusher = upsertPlayerLine(players, participants.primaryRusherId, defenseSide);
      rusher.defense.sacks += 1;
    }
  }

  return { ...sim, boxScore: { ...(sim.boxScore ?? buildGameBoxScore(sim, sim.weekNumber ?? 0)), players } };
}


function getUnicornForPlayer(sim: GameSim, playerId: string | undefined): PlayerUnicorn | undefined {
  if (!playerId) return undefined;
  return sim.playerUnicorns?.[String(playerId)];
}

/** Resolve a play using the PAS engine, returning yards, tags, and outcome label. */
function resolveWithPAS(
  sim: GameSim,
  rng: () => number,
  playType: PlayType,
  look: DefensiveLook,
  aggression: AggressionLevel,
  snapKey: string,
  defensiveCall?: DefensiveCall,
): { yards: number; tags: ResultTag[]; outcomeLabel: string; turnover: boolean; turnoverKind?: "INT" | "FUMBLE"; td: boolean; sack: boolean; scramble: boolean; incomplete: boolean; diag?: PassPlayDiag; unicornImpact?: { playerId: string; archetypeId: UnicornArchetypeId; description: string }; assignmentLog?: PlayAssignmentLog } {
  const matchup = getMatchupModifier(sim.currentPersonnelPackage, sim.selectedDefensivePackage ?? "Nickel");
  const passive = resolveArchetypePassives(
    { archetypeId: sim.coachArchetypeId, tenureYear: sim.coachTenureYear },
    { sim, playType, aggression }
  );
  const pasComp = computePAS(playType, look, sim, matchup);
  const passivePas = ((passive.offensiveExecutionBonus ?? 0) + (passive.closeGameExecutionBonus ?? 0)) / 40;
  const perkPas = resolvePerkModifiers(
    { archetypeId: sim.coachArchetypeId, tenureYear: sim.coachTenureYear, unlockedPerkIds: sim.coachUnlockedPerkIds },
    { playType, aggression, quarter: Number(sim.clock.quarter ?? 1), timeRemainingSec: sim.clock.timeRemainingSec }
  );

  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN" || playType === "QB_KEEP";
  const isPass = !isRun && playType !== "SPIKE" && playType !== "KNEEL" && playType !== "PUNT" && playType !== "FG";
  const offenseSchemeId = (sim.possession === "HOME" ? sim.homeGameplan?.offenseSchemeId : sim.awayGameplan?.offenseSchemeId) ?? undefined;
  const qbId = sim.trackedPlayers[sim.possession]?.QB1 ?? sim.trackedPlayers[sim.possession]?.QB;
  const qb = qbId ? (getPlayerById(String(qbId)) as any) : undefined;
  const qbTag = qb ? resolveQbArchetypeTag(qb) : "GAME_MANAGER";
  const schemeFit = getQbSchemeFitMultiplier(qbTag, offenseSchemeId);
  const weatherLabel = currentWeatherLabel(sim);
  const qbUnicorn = getUnicornForPlayer(sim, qbId);
  const rbId = sim.trackedPlayers[sim.possession]?.RB1 ?? sim.trackedPlayers[sim.possession]?.RB;
  const rbUnicorn = getUnicornForPlayer(sim, rbId);
  const participants = getPlayParticipants(sim, sim.lastAssignmentLog);
  const defenseTracked = sim.trackedPlayers[otherSide(sim.possession)] ?? {};
  const edgeId = participants.primaryRusherId ?? defenseTracked.EDGE_L ?? defenseTracked.DL ?? defenseTracked.LB;
  const edgeUnicorn = getUnicornForPlayer(sim, edgeId);
  let badgeMods = resolveBadgeSimModifiers(sim.playerBadges ?? {}, buildBadgeContextInput(sim, playType, sim.lastAssignmentLog));

  let yards = 0;
  let turnover = false;
  let td = false;
  let sack = false;
  let scramble = false;
  let incomplete = false;
  let outcomeLabel = "normal";
  let turnoverKind: "INT" | "FUMBLE" | undefined;
  let diag: PassPlayDiag | undefined;
  let unicornImpact: { playerId: string; archetypeId: UnicornArchetypeId; description: string } | undefined;
  let assignmentLogUpdate: PlayAssignmentLog | undefined;

  const baseTags = buildResultTags(sim, playType, look, pasComp, "SUCCESS", aggression);
  const resolverTags: ResultTag[] = [];
  const callFx = applyDefensiveCallMultipliers(defensiveCall);
  if (callFx.debug.length) resolverTags.push({ kind: "SITUATION", text: `DEF_CALL:${callFx.debug.join(",")}` });

  if (isRun) {
    if (sim.distance <= 2 || sim.ballOn >= 96) {
      const pile = resolvePile(
        {
          offense: { OL_pushZ: 0.42, RB_massEff: 218, RB_balanceZ: 0.5 },
          defense: { DL_anchorZ: look.box === "HEAVY" ? 0.72 : 0.4, boxCount: look.box === "HEAVY" ? 8 : 7, LB_fillZ: look.blitz === "LIKELY" ? 0.62 : 0.38 },
          context: { yardsToGo: sim.distance, goalLine: sim.ballOn >= 96, surface: "DRY", fatigue: 0.2 },
        },
        contextualRng(sim.seed, `${snapKey}:pile`),
      );
      yards = pile.yardsGained;
      resolverTags.push(...pile.resultTags);
      if (pile.stuffed && yards === 0) {
        outcomeLabel = "negative";
      }
    }
    const contactRng = contextualRng(sim.seed, `${snapKey}:contact`);
    const rbMods = resolveUnicornModifiers(rbUnicorn?.archetypeId, { weather: weatherLabel, down: sim.down, distance: sim.distance });
    const carrierId = playType === "QB_KEEP" ? (sim.trackedPlayers[sim.possession]?.QB1 ?? sim.trackedPlayers[sim.possession]?.QB) : (sim.trackedPlayers[sim.possession]?.RB1 ?? sim.trackedPlayers[sim.possession]?.RB);
    const carrier = carrierId ? (getPlayerById(String(carrierId)) as any) : undefined;
    const primaryDefender = participants.primaryDefenderId ? (getPlayerById(String(participants.primaryDefenderId)) as any) : undefined;
    const contactInput: ContactInput = {
      ballcarrier: {
        weightLb: getCanonicalRating(carrier, "Weight_Lbs", playType === "QB_KEEP" ? 215 : 208),
        strength: getCanonicalRating(carrier, "Strength", 74) + (rbMods.runTruck ?? 0),
        balance: getCanonicalRating(carrier, "Body_Control", 73),
        agility: getCanonicalRating(carrier, "Agility", 77),
        accel: getCanonicalRating(carrier, "Acceleration", 78) + (rbMods.runBurst ?? 0),
        tackling: 25,
        heightIn: getCanonicalRating(carrier, "Height_Inches", playType === "QB_KEEP" ? 74 : 71),
        jump: getCanonicalRating(carrier, "Jumping", 75),
        fatigue01: 0.25,
      },
      tackler: {
        weightLb: getCanonicalRating(primaryDefender, "Weight_Lbs", look.box === "HEAVY" ? 248 : 228),
        strength: Math.round(getCanonicalRating(primaryDefender, "Strength", look.box === "HEAVY" ? 80 : 74) * callFx.runStuff),
        balance: getCanonicalRating(primaryDefender, "Body_Control", 66),
        agility: getCanonicalRating(primaryDefender, "Agility", 69),
        accel: getCanonicalRating(primaryDefender, "Acceleration", 70),
        tackling: getCanonicalRating(primaryDefender, "Tackling", look.blitz === "LIKELY" ? 78 : 72),
        heightIn: getCanonicalRating(primaryDefender, "Height_Inches", 74),
        jump: getCanonicalRating(primaryDefender, "Jumping", 70),
        fatigue01: 0.22,
      },
      move: { type: playType === "OUTSIDE_ZONE" ? "JUKE" : playType === "POWER" ? "STIFF_ARM" : "NONE", timing01: 0.55 },
      context: {
        angleDeg: look.blitz === "LIKELY" ? 18 : look.shell === "SINGLE_HIGH" ? 34 : 46,
        padLevelOff01: 0.56,
        padLevelDef01: look.box === "HEAVY" ? 0.72 : 0.62,
        shortYardage: sim.distance <= 2,
        pile: sim.distance <= 1,
        surface: "DRY",
      },
    };
    const contact = resolveContact(contactInput, contactRng);
    yards = Math.max(yards, contact.yacYards);
    // Apply RB fatigue as a direct yards reduction (after contact resolution to preserve RNG sequence)
    {
      const rbPlayerId = sim.trackedPlayers[sim.possession]?.RB1 ?? sim.trackedPlayers[sim.possession]?.RB;
      const rbFatigueLevel = rbPlayerId ? clampFatigue(sim.playerFatigue[rbPlayerId] ?? 50) : 50;
      yards = Math.max(-8, yards - Math.floor(Math.max(0, rbFatigueLevel - 40) * 0.04));
    }
    if (badgeMods.runYardsDelta !== 0) yards = Math.max(-8, yards + badgeMods.runYardsDelta);
    const runFumble = resolveFumble(
      {
        carrier: { balanceZ: ratingZ(contactInput.ballcarrier.balance), strengthZ: ratingZ(contactInput.ballcarrier.strength), fatigue01: contactInput.ballcarrier.fatigue01 },
        hitter: { hitPowerZ: ratingZ(contactInput.tackler.strength), tackleZ: ratingZ(contactInput.tackler.tackling) },
        context: { impulseProxy: contact.tackled ? 1 : 0.7, surface: contactInput.context.surface, contactType: sim.distance <= 1 ? "SCRUM" : "RUN" },
      },
      contextualRng(sim.seed, `${snapKey}:fumble-run`),
    );
    turnover = runFumble.fumble && runFumble.recoveredBy === "DEFENSE";
    turnoverKind = turnover ? "FUMBLE" : undefined;
    outcomeLabel = turnover ? "turnover" : contact.tackled ? "success" : contact.yacYards >= 12 ? "explosive" : "success";
    resolverTags.push(...contact.resultTags, ...runFumble.resultTags);
    if (rbUnicorn && (rbMods.runBurst || rbMods.runTruck)) {
      const desc = describeUnicornBoost(rbMods);
      resolverTags.push({ kind: "EXECUTION", text: `UNICORN:${desc}` });
      unicornImpact = { playerId: String(rbId), archetypeId: rbUnicorn.archetypeId, description: desc };
    }
  } else if (isPass) {
    const edgeMods = resolveUnicornModifiers(edgeUnicorn?.archetypeId, { weather: weatherLabel, down: sim.down, distance: sim.distance });
    const rushOutcome = resolvePassRush(
      {
        rusher: { speed: Math.round((look.blitz === "LIKELY" ? 83 : 77) * callFx.passRushWin) + (edgeMods.passRushBurst ?? 0), accel: 79 + (edgeMods.passRushBurst ?? 0), strength: 78, technique: 76, bend: 80 + (edgeMods.passRushBend ?? 0), fatigue01: 0.2 },
        blocker: { passPro: 74, footwork: 73, anchor: 75, fatigue01: 0.2 },
        context: { rushAngleDeg: look.shell === "SINGLE_HIGH" ? 28 : 41, depthYds: playType === "DROPBACK" ? 9 : 6, chipHelp: playType === "SCREEN", quickGame: playType === "QUICK_GAME" },
      },
      contextualRng(sim.seed, `${snapKey}:pass-rush`),
    );
    resolverTags.push(...rushOutcome.resultTags);
    if (edgeUnicorn && (edgeMods.passRushBurst || edgeMods.passRushBend)) {
      const desc = describeUnicornBoost(edgeMods);
      resolverTags.push({ kind: "PRESSURE", text: `UNICORN:${desc}` });
      unicornImpact = { playerId: String(edgeId), archetypeId: edgeUnicorn.archetypeId, description: desc };
    }
    diag = { passRush: rushOutcome.diag };
    if (rushOutcome.sacked) {
      sack = true;
      yards = -Math.round(tri(rng, 4, 7, 12));
      const sackFumble = resolveFumble(
        {
          carrier: { balanceZ: 0.4, strengthZ: 0.35, fatigue01: 0.22 },
          hitter: { hitPowerZ: 0.62, tackleZ: 0.55 },
          context: { impulseProxy: 1.05, surface: "DRY", contactType: "SACK" },
        },
        contextualRng(sim.seed, `${snapKey}:fumble-sack`),
      );
      turnover = sackFumble.fumble && sackFumble.recoveredBy === "DEFENSE";
      turnoverKind = turnover ? "FUMBLE" : undefined;
      resolverTags.push(...sackFumble.resultTags);
      outcomeLabel = "negative";
    } else {
      const pressureTriggered = rushOutcome.pressured || rushOutcome.debug.pPressure > QB_TUNING.PRESSURE_THRESHOLD;
      const scrambleDiscipline = Number(qb?.scrambleDiscipline ?? 55);
      const throwOnRun = pressureTriggered && (["DUAL_THREAT","SCRAMBLER","IMPROVISER"].includes(qbTag)) && scrambleDiscipline >= QB_TUNING.DISCIPLINE_HIGH_THRESHOLD;
      const shouldScramble = pressureTriggered && (["DUAL_THREAT","SCRAMBLER","IMPROVISER"].includes(qbTag)) && scrambleDiscipline < QB_TUNING.SCRAMBLE_DISCIPLINE_BREAKPOINT;
      if (shouldScramble) {
        const escapeRoll = contextualRng(sim.seed, `${snapKey}:qb-escape`)();
        const escapeChance = clamp((Number(qb?.elusiveness ?? 70) - (sim.possession === "HOME" ? sim.awayRatings?.dlPassRush ?? 72 : sim.homeRatings?.dlPassRush ?? 72)) / 120 + 0.45, 0.1, 0.85) * schemeFit;
        if (escapeRoll < escapeChance) {
          const qbContact = resolveContact({
            ballcarrier: { weightLb: Number(qb?.weight ?? 215), strength: Number(qb?.truckContactBalance ?? 66), balance: Number(qb?.truckContactBalance ?? 66), agility: Number(qb?.elusiveness ?? 74), accel: Number(qb?.acceleration ?? 74), tackling: 25, heightIn: 74, jump: 70, fatigue01: 0.24 },
            tackler: { weightLb: 232, strength: 76, balance: 66, agility: 68, accel: 72, tackling: 75, heightIn: 74, jump: 70, fatigue01: 0.22 },
            move: { type: "NONE", timing01: 0.5 },
            context: { angleDeg: 30, padLevelOff01: 0.5, padLevelDef01: 0.65, shortYardage: sim.distance <= 2, pile: false, surface: "DRY" },
          }, contextualRng(sim.seed, `${snapKey}:qb-contact`));
          yards = Math.max(0, qbContact.yacYards);
          scramble = true;
          outcomeLabel = yards >= 12 ? "explosive" : "success";
          if (qbId) sim.qbRunContactsByPlayerId[qbId] = (sim.qbRunContactsByPlayerId[qbId] ?? 0) + (qbContact.tackled ? 1 : 0);
          resolverTags.push(...qbContact.resultTags, { kind: "EXECUTION", text: "QB_SCRAMBLE" });
          diag = { ...(diag ?? {}), scrambleContact: qbContact.diag };
          assignmentLogUpdate = {
            ...((sim.lastAssignmentLog ?? {}) as PlayAssignmentLog),
            targetRole: undefined,
            targetPlayerId: undefined,
            defenderId: participants.primaryRusherId ?? sim.lastAssignmentLog?.defenderId,
          };
          const scrambleFumble = resolveFumble(
            {
              carrier: { balanceZ: ratingZ(Number(qb?.truckContactBalance ?? 66)), strengthZ: ratingZ(Number(qb?.strength ?? 70)), fatigue01: 0.24 },
              hitter: { hitPowerZ: ratingZ(76), tackleZ: ratingZ(75) },
              context: { impulseProxy: qbContact.tackled ? 1 : 0.7, surface: "DRY", contactType: "RUN" },
            },
            contextualRng(sim.seed, `${snapKey}:fumble-scramble`),
          );
          if (scrambleFumble.fumble && scrambleFumble.recoveredBy === "DEFENSE") {
            turnover = true;
            turnoverKind = "FUMBLE";
            outcomeLabel = "turnover";
          }
          resolverTags.push(...scrambleFumble.resultTags);
          const scrambleBadgeMods = resolveBadgeSimModifiers(sim.playerBadges ?? {}, {
            ...buildBadgeContextInput(sim, "RUN", assignmentLogUpdate),
            offenseIds: { QB: qbId ? String(qbId) : undefined, RB: undefined, WR: undefined, TE: undefined },
            defenseIds: {
              DL: participants.primaryRusherId ?? defenseTracked.DL,
              LB: participants.primaryDefenderId ?? defenseTracked.LB1 ?? defenseTracked.LB,
              DB: undefined,
            },
          });
          if (scrambleBadgeMods.runYardsDelta !== 0) {
            yards = Math.max(0, yards + scrambleBadgeMods.runYardsDelta);
          }
        } else {
          sack = true;
          yards = -Math.round(tri(rng, 3, 6, 10));
          outcomeLabel = "negative";
        }
      } else {
      const qbMods = resolveUnicornModifiers(qbUnicorn?.archetypeId, { weather: weatherLabel, down: sim.down, distance: sim.distance });
      const precipPenaltyMitigation = Number(qbMods.weatherPenaltyMitigation ?? 0);
      const basePrecip = sim.weather?.precipTier ?? "NONE";
      const effectivePrecip = basePrecip !== "NONE" && precipPenaltyMitigation >= 0.06 ? "LIGHT" : basePrecip;
      const ballistics = resolveQbBallistics(
        {
          qb: { arm: Number(qb?.armStrength ?? 78) + Number(qbMods.armStrength ?? 0), accuracy: Number((throwOnRun ? qb?.armOnRunAccuracy : qb?.accuracyMid) ?? 76) + Number(qbMods.throwOnMove ?? 0), release: Number(qb?.anticipation ?? 77), spin: 75, fatigue01: 0.22 },
          context: { targetDepth: playType === "DROPBACK" ? 18 : playType === "PLAY_ACTION" ? 14 : 8, windTier: sim.weather?.windTier ?? "LOW", precipTier: effectivePrecip, throwOnRun: throwOnRun || (playType === "PLAY_ACTION" && look.blitz === "LIKELY") },
        },
        contextualRng(sim.seed, `${snapKey}:ballistics`),
      );
      const catchRng = contextualRng(sim.seed, `${snapKey}:catch`);
      const assignmentLog = sim.lastAssignmentLog;
      const primaryRead = (assignmentLog?.primaryReadRole && assignmentLog.primaryReadRole !== "QB") ? assignmentLog.primaryReadRole : "X";
      const progressionReads = (assignmentLog?.progressionRoles ?? []).filter((r) => r !== "QB" && r !== primaryRead);
      const readsOrder: OffenseEligibleRole[] = [primaryRead, ...progressionReads];
      const qbProfile = {
        footballIq: getCanonicalRating(qb, "Football_IQ", 72),
        vision: getCanonicalRating(qb, "Vision", 72),
        awareness: getCanonicalRating(qb, "Awareness", 72),
        focus: getCanonicalRating(qb, "Focus", 70),
        poise: getCanonicalRating(qb, "Poise", 70),
        pocketPresence: getCanonicalRating(qb, "Pocket_Presence", 70),
        release: getCanonicalRating(qb, "Release", 72),
      };
      const baseOpen = (role: OffenseEligibleRole) => {
        const trackedOffense = sim.trackedPlayers[sim.possession] ?? {};
        const rolePlayerId = assignmentLog?.offenseRolesAtSnap?.[role]
          ?? (role === "RB"
            ? (trackedOffense.RB1 ?? trackedOffense.RB)
            : role === "Y"
              ? (trackedOffense.TE1 ?? trackedOffense.TE)
              : role === "QB"
                ? (trackedOffense.QB1 ?? trackedOffense.QB)
                : (trackedOffense.WR1 ?? trackedOffense.WR ?? qbId));
        const defId = role === "QB"
          ? assignmentLog?.responsibleDefenderByRole?.RB ?? assignmentLog?.defenderId
          : assignmentLog?.responsibleDefenderByRole?.[role] ?? assignmentLog?.defenderId;
        const wrP = rolePlayerId ? (getPlayerById(String(rolePlayerId)) as any) : undefined;
        const cbP = defId ? (getPlayerById(String(defId)) as any) : undefined;
        const sep = ((getCanonicalRating(wrP, "Route_Running", 72) + getCanonicalRating(wrP, "Speed", 72) + getCanonicalRating(wrP, "Acceleration", 72)) / 3 - (getCanonicalRating(cbP, "Man_Coverage", 72) + getCanonicalRating(cbP, "Zone_Coverage", 72) + getCanonicalRating(cbP, "Speed", 72)) / 3) / 50;
        const covMod = assignmentLog?.coverageFamily === "Cover0" ? -0.08 : assignmentLog?.coverageFamily === "Drop8" ? -0.06 : assignmentLog?.coverageFamily === "Cover3" ? -0.02 : 0.03;
        return sep + covMod;
      };
      const openScoreByRole: Partial<Record<OffenseEligibleRole, number>> = {
        QB: -1,
        RB: baseOpen("RB"),
        X: baseOpen("X"),
        Z: baseOpen("Z"),
        H: baseOpen("H"),
        Y: baseOpen("Y"),
      };
      const timeToPressureMs = Math.max(600, 2400 - (rushOutcome.diag?.pressureScore ?? 0) * 11);
      const selectedTarget = chooseTargetRole({
        reads: { primary: readsOrder[0] ?? "X", progression: readsOrder.slice(1) },
        qb: qbProfile,
        openScoreByRole,
        timeToPressureMs,
      });
      const targetRole = selectedTarget.chosenRole;
      const trackedOffense = sim.trackedPlayers[sim.possession] ?? {};
      const targetPlayerId = assignmentLog?.offenseRolesAtSnap?.[targetRole]
        ?? (targetRole === "RB"
          ? (trackedOffense.RB1 ?? trackedOffense.RB)
          : targetRole === "Y"
            ? (trackedOffense.TE1 ?? trackedOffense.TE)
            : (trackedOffense.WR1 ?? trackedOffense.WR));
      // QB should never be selected for a pass target; this branch is a defensive guard fallback.
      const targetDefenderId = targetRole === "QB"
        ? assignmentLog?.responsibleDefenderByRole?.RB ?? assignmentLog?.defenderId
        : assignmentLog?.responsibleDefenderByRole?.[targetRole] ?? assignmentLog?.defenderId;
      const wrPlayer = targetPlayerId ? (getPlayerById(String(targetPlayerId)) as any) : undefined;
      const cbPlayer = targetDefenderId ? (getPlayerById(String(targetDefenderId)) as any) : undefined;

      assignmentLogUpdate = {
        ...(assignmentLog ?? sim.lastAssignmentLog),
        primaryReadRole: primaryRead,
        targetRole,
        targetPlayerId: targetPlayerId ? String(targetPlayerId) : undefined,
        defenderId: targetDefenderId ? String(targetDefenderId) : undefined,
        progressionIndexUsed: selectedTarget.progressionIndexUsed,
      };

      const passBadgeMods = resolveBadgeSimModifiers(sim.playerBadges ?? {}, buildBadgeContextInput(sim, playType, assignmentLogUpdate));
      badgeMods = passBadgeMods;
      const passCompShift = Math.max(-10, Math.min(10, Math.round((passivePas + perkPas + passBadgeMods.pasDelta) * 80)));

      const catchInput: CatchInput = {
        qb: { accuracy: Math.round((Number((throwOnRun ? qb?.armOnRunAccuracy : qb?.accuracyMid) ?? 76) + Number(qbMods.throwOnMove ?? 0)) * schemeFit) + passCompShift, arm: Number(qb?.armStrength ?? 78) + Number(qbMods.armStrength ?? 0), decision: Math.round(Number(qb?.decisionSpeed ?? 74) * callFx.pInt) + passCompShift, pressure01: Math.min(0.95, (look.blitz === "LIKELY" ? 0.62 : 0.34) * callFx.sackProb), fatigue01: 0.22 },
        wr: { heightIn: getCanonicalRating(wrPlayer, "Height_Inches", 73), weightLb: getCanonicalRating(wrPlayer, "Weight_Lbs", 198), speed: Math.round((getCanonicalRating(wrPlayer, "Speed", 84) + getCanonicalRating(wrPlayer, "Acceleration", 84)) / 2 * callFx.pExpl), hands: Math.round(getCanonicalRating(wrPlayer, "Hands", 79) * callFx.pComp), jump: getCanonicalRating(wrPlayer, "Jumping", 80), strength: getCanonicalRating(wrPlayer, "Strength", 68), balance: getCanonicalRating(wrPlayer, "Body_Control", 76), fatigue01: 0.24 },
        cb: { heightIn: getCanonicalRating(cbPlayer, "Height_Inches", 72), speed: (getCanonicalRating(cbPlayer, "Speed", 81) + getCanonicalRating(cbPlayer, "Acceleration", 81)) / 2, coverage: (getCanonicalRating(cbPlayer, "Man_Coverage", 77) + getCanonicalRating(cbPlayer, "Zone_Coverage", 77)) / 2, ballSkills: (getCanonicalRating(cbPlayer, "Ball_Skills", 73) + getCanonicalRating(cbPlayer, "Awareness", 73)) / 2, strength: getCanonicalRating(cbPlayer, "Strength", 70), fatigue01: 0.22 },
        context: {
          targetDepth: playType === "SCREEN" || playType === "QUICK_GAME" ? "SHORT" : playType === "DROPBACK" ? "MID" : "DEEP",
          separationYds: (playType === "SCREEN" ? 1.8 : 1.1) + (openScoreByRole[targetRole] ?? 0),
          routeBreakSeverity01: playType === "QUICK_GAME" ? 0.35 : playType === "DROPBACK" ? 0.55 : 0.42,
          highPoint: playType === "DROPBACK",
          contactAtCatch: look.shell === "SINGLE_HIGH" ? "LIGHT" : "NONE",
          surface: "DRY",
          throwQualityAdj: ballistics.throwQualityAdj - (rushOutcome.pressured ? 0.14 : 0) - Math.max(0, selectedTarget.progressionIndexUsed - 1) * 0.03,
          deepVarianceMult: ballistics.deepVarianceMult,
          wobbleChance: ballistics.wobbleChance,
        },
      };
      const catchOutcome = resolveCatchPoint(catchInput, catchRng);
      diag = { ...(diag ?? {}), catchPoint: catchOutcome.diag };
      incomplete = !catchOutcome.completed;
      turnover = catchOutcome.intercepted || (catchOutcome.fumble && catchOutcome.recoveredBy === "DEFENSE");
      turnoverKind = catchOutcome.intercepted ? "INT" : (catchOutcome.fumble && catchOutcome.recoveredBy === "DEFENSE" ? "FUMBLE" : undefined);
      yards = catchOutcome.completed ? Math.round((catchOutcome.yacYards + (playType === "DROPBACK" ? 9 : playType === "PLAY_ACTION" ? 6 : 4)) * callFx.pExpl) : 0;
      outcomeLabel = turnover ? "turnover" : incomplete ? "incomplete" : yards >= Math.round(18 * (2 - callFx.pExpl)) ? "explosive" : "success";
      resolverTags.push(...catchOutcome.resultTags);
      if (qbUnicorn && (qbMods.armStrength || qbMods.throwOnMove || qbMods.weatherPenaltyMitigation)) {
        const desc = describeUnicornBoost(qbMods);
        resolverTags.push({ kind: "EXECUTION", text: `UNICORN:${desc}` });
        unicornImpact = { playerId: String(qbId), archetypeId: qbUnicorn.archetypeId, description: desc };
      }
      }
    }
  }

  const outcome: "SUCCESS" | "FAILURE" | "EXPLOSIVE" | "NEGATIVE" =
    outcomeLabel === "explosive" ? "EXPLOSIVE"
    : outcomeLabel === "negative" || outcomeLabel === "turnover" || sack ? "NEGATIVE"
    : outcomeLabel === "incomplete" ? "FAILURE"
    : "SUCCESS";

  const tags: ResultTag[] = [...baseTags, ...resolverTags, { kind: "EXECUTION", text: `SNAP_KEY:${snapKey}` }];

  if (isPass && !scramble && !sack && !incomplete && !turnover && badgeMods.passYardsDelta !== 0) {
    yards += badgeMods.passYardsDelta;
  }

  if (sim.ballOn + yards >= 100 && !turnover) {
    td = true;
    yards = 100 - sim.ballOn;
  }

  return { yards, tags, outcomeLabel, turnover, turnoverKind, td, sack, scramble, incomplete, diag, unicornImpact, assignmentLog: assignmentLogUpdate ?? sim.lastAssignmentLog };
}

// ─── Existing helpers (unchanged) ─────────────────────────────────────────

function otherSide(p: Possession): Possession {
  return p === "HOME" ? "AWAY" : "HOME";
}

function scoreRef(sim: GameSim): { get: () => number; set: (v: number) => void } {
  return sim.possession === "HOME"
    ? { get: () => sim.homeScore, set: (v) => (sim.homeScore = v) }
    : { get: () => sim.awayScore, set: (v) => (sim.awayScore = v) };
}

function scriptMode(sim: GameSim): "SLOW" | "NORMAL" | "FAST" | "HURRY_UP" | "MILK_CLOCK" | "EXTREME_HURRY" {
  const q = sim.clock.quarter;
  const t = sim.clock.timeRemainingSec;
  const diff = sim.homeScore - sim.awayScore;
  const myDiff = sim.possession === "HOME" ? diff : -diff;

  if (q === 4 && myDiff > 0 && myDiff <= 8) return "MILK_CLOCK";
  if (q === 4 && myDiff < 0 && myDiff >= -14) return t <= 90 ? "EXTREME_HURRY" : "HURRY_UP";
  if (q === 4 && myDiff <= -15) return t <= 120 ? "EXTREME_HURRY" : "HURRY_UP";
  if (q === 2 && t <= 120 && myDiff < 0) return "HURRY_UP";
  return "NORMAL";
}

function canRunSpike(sim: GameSim): boolean {
  const q = sim.clock.quarter;
  const t = sim.clock.timeRemainingSec;
  const lateGameWindow = (q === 2 || q === 4) && t <= 60;
  return lateGameWindow && sim.clock.clockRunning && sim.down < 4;
}

function isClockStoppedResult(tag: "IN_BOUNDS" | "OOB" | "INCOMPLETE" | "SCORE" | "CHANGE") {
  if (tag === "IN_BOUNDS") return { running: true, restart: "READY" as const };
  return { running: false, restart: "SNAP" as const };
}

function adminTime(rng: () => number, kind: "ROUTINE" | "FIRST_DOWN" | "CHANGE" | "PUNT_SETUP" | "FG_SETUP" | "KICKOFF_SETUP"): number {
  const t = (a: number, b: number, c: number) => Math.round(tri(rng, a, b, c));
  switch (kind) {
    case "ROUTINE":
      return t(3, 5, 8);
    case "FIRST_DOWN":
      return t(6, 9, 14);
    case "CHANGE":
      return t(10, 16, 26);
    case "PUNT_SETUP":
      return t(10, 16, 26);
    case "FG_SETUP":
      return t(12, 18, 30);
    case "KICKOFF_SETUP":
      return t(18, 25, 40);
  }
}

function liveTime(rng: () => number, outcome: string): number {
  const t = (a: number, b: number, c: number) => Math.round(tri(rng, a, b, c));
  switch (outcome) {
    case "RUN_IN_BOUNDS":
      return t(26, 34, 44);
    case "RUN_OOB":
      return t(18, 26, 38);
    case "SHORT_IN_BOUNDS":
      return t(18, 27, 40);
    case "SHORT_OOB":
      return t(8, 16, 28);
    case "DEEP_IN_BOUNDS":
      return t(14, 22, 40);
    case "INCOMPLETE":
      return t(4, 7, 11);
    case "SACK":
      return t(14, 23, 34);
    case "SPIKE":
      return t(2, 3, 5);
    case "PUNT_FAIR":
      return t(4, 7, 11);
    case "PUNT_RETURN":
      return t(6, 12, 22);
    case "FG":
      return t(3, 5, 8);
    case "KICKOFF_TB":
      return t(2, 4, 6);
    case "KICKOFF_RET":
      return t(6, 12, 20);
    default:
      return t(16, 24, 36);
  }
}

function quarterAdvanceIfNeeded(sim: GameSim): GameSim {
  let s = sim;
  while (s.clock.timeRemainingSec === 0) {
    if (s.clock.quarter === 4) break;
    s = { ...s, clock: nextQuarter(s.clock) };
  }
  return s;
}

function newDrive(sim: GameSim, possession: Possession): GameSim {
  return {
    ...sim,
    possession,
    driveNumber: sim.driveNumber + 1,
    playNumberInDrive: 0,
    currentDrive: { driveNumber: sim.driveNumber + 1, possession, startBallOn: sim.ballOn, plays: [] },
  };
}

function setNewSeries(sim: GameSim, ballOn: number): GameSim {
  const clamped = clamp(ballOn, 1, 99);
  return {
    ...sim,
    ballOn: clamped,
    down: 1,
    distance: 10,
    currentDrive: { ...sim.currentDrive, startBallOn: clamped },
  };
}


function pushLog(sim: GameSim, playType: PlayType, result: string): GameSim {
  const entry: DriveLogEntry = {
    drive: sim.driveNumber,
    play: sim.playNumberInDrive + 1,
    quarter: sim.clock.quarter,
    clockSec: sim.clock.timeRemainingSec,
    possession: sim.possession,
    down: sim.down,
    distance: sim.distance,
    ballOn: sim.ballOn,
    playType,
    result,
    resultTags: sim.lastResultTags ?? [],
    homeScore: sim.homeScore,
    awayScore: sim.awayScore,
    personnelPackage: sim.currentPersonnelPackage,
    defensivePackage: sim.selectedDefensivePackage,
    explanation: sim.lastPlayResult?.explanation,
    assignmentLog: sim.lastAssignmentLog,
  };
  return {
    ...sim,
    playNumberInDrive: sim.playNumberInDrive + 1,
    driveLog: [entry, ...sim.driveLog],
    currentDrive: { ...sim.currentDrive, plays: [...sim.currentDrive.plays, entry] },
  };
}

function kickoffAfterScore(sim: GameSim, rng: () => number): GameSim {
  const admin = adminTime(rng, "KICKOFF_SETUP");
  let clock = applyTime(sim.clock, admin);
  const tb = rng() < 0.72;
  clock = applyTime(clock, liveTime(rng, tb ? "KICKOFF_TB" : "KICKOFF_RET"));
  const next = setNewSeries(newDrive({ ...sim, clock }, otherSide(sim.possession)), 25);
  return { ...next, clock: { ...next.clock, clockRunning: false, restartMode: "SNAP", playClockLen: 40 } };
}

function turnover(sim: GameSim, rng: () => number): GameSim {
  const admin = adminTime(rng, "CHANGE");
  // Tag the ending drive as TURNOVER only if the caller hasn't already set a more specific result
  const tagged = sim.currentDrive.result
    ? sim
    : { ...sim, currentDrive: { ...sim.currentDrive, result: "TURNOVER" as DriveResult } };
  const next = setNewSeries(newDrive(tagged, otherSide(sim.possession)), 25);
  return { ...next, clock: applyTime({ ...sim.clock, clockRunning: false, restartMode: "SNAP", playClockLen: 40 }, admin) };
}




function punt(sim: GameSim, rng: () => number): GameSim {
  let clock = applyTime(sim.clock, adminTime(rng, "PUNT_SETUP"));
  const gameKey = `${sim.homeTeamId}:${sim.awayTeamId}:${sim.weekType ?? "REGULAR_SEASON"}:${sim.weekNumber ?? 0}`;
  const kickRng = contextualRng(hashSeed(sim.seed, gameKey, sim.playNumberInDrive + 1), "kick-punt");
  const puntBadgeMods = resolveBadgeSimModifiers(sim.playerBadges ?? {}, {
    playType: "PUNT",
    ballOn: sim.ballOn,
    offenseIds: {},
    defenseIds: {},
    specialistIds: { P: sim.specialistsBySide[sim.possession]?.P },
  });
  const puntOutcome = resolvePunt({ power: 78 + puntBadgeMods.puntPowerDelta, accuracy: 73, hang: 76 + puntBadgeMods.puntHangDelta, spin: 74 }, { distanceYds: 100 - sim.ballOn, windTier: sim.weather?.windTier ?? "LOW", precipTier: sim.weather?.precipTier ?? "NONE", surface: sim.weather?.surface ?? "DRY" }, kickRng);
  const returned = puntOutcome.returnable;
  clock = applyTime(clock, liveTime(rng, returned ? "PUNT_RETURN" : "PUNT_FAIR"));
  return turnover({ ...sim, clock, lastResult: `Punt ${puntOutcome.netYds}y${puntOutcome.inside20 ? " (inside 20)" : ""}.`, lastResultTags: puntOutcome.resultTags, currentDrive: { ...sim.currentDrive, result: "PUNT" } }, rng);
}

function fgMakeProb(ballOn: number): number {
  const distFromGoal = 100 - ballOn;
  const kickYards = distFromGoal + 17;
  return clamp(0.92 - Math.max(0, kickYards - 52) * 0.03, 0.08, 0.95);
}

function fgAttempt(sim: GameSim, rng: () => number): GameSim {
  let clock = applyTime(sim.clock, adminTime(rng, "FG_SETUP"));
  clock = applyTime(clock, liveTime(rng, "FG"));
  const kickYards = 100 - sim.ballOn + 17;
  const gameKey = `${sim.homeTeamId}:${sim.awayTeamId}:${sim.weekType ?? "REGULAR_SEASON"}:${sim.weekNumber ?? 0}`;
  const kickRng = contextualRng(hashSeed(sim.seed, gameKey, sim.playNumberInDrive + 1), "kick-fg");
  const fgBadgeMods = resolveBadgeSimModifiers(sim.playerBadges ?? {}, {
    playType: "FG",
    ballOn: sim.ballOn,
    offenseIds: {},
    defenseIds: {},
    specialistIds: { K: sim.specialistsBySide[sim.possession]?.K },
  });
  const fgOutcome = resolveFieldGoal({ power: 79 + fgBadgeMods.fgPowerDelta, accuracy: 77 + fgBadgeMods.fgAccuracyDelta, spin: 74 }, { distanceYds: kickYards, windTier: sim.weather?.windTier ?? "LOW", precipTier: sim.weather?.precipTier ?? "NONE", surface: sim.weather?.surface ?? "DRY" }, kickRng);

  if (fgOutcome.made) {
    const off = scoreRef(sim);
    off.set(off.get() + 3);
    return kickoffAfterScore({ ...sim, clock, lastResult: `FG is GOOD (${kickYards}y)!`, lastResultTags: fgOutcome.resultTags, currentDrive: { ...sim.currentDrive, result: "FG" } }, rng);
  }
  return turnover({ ...sim, clock, lastResult: `FG missed ${fgOutcome.missDir} (${kickYards}y).`, lastResultTags: fgOutcome.resultTags }, rng);
}

function advanceDown(sim: GameSim, gained: number): GameSim {
  if (sim.ballOn >= 99) {
    const off = scoreRef(sim);
    off.set(off.get() + 7);
    const reset = setNewSeries(sim, 25);
    return { ...reset, lastResult: "TOUCHDOWN!", currentDrive: { ...reset.currentDrive, result: "TD" } };
  }

  if (gained >= sim.distance) {
    return { ...sim, down: 1, distance: 10, lastResult: `${sim.lastResult ?? ""} First down!`.trim() };
  }

  const down = (sim.down + 1) as 2 | 3 | 4;
  const distance = Math.max(1, sim.distance - gained);

  if (down > 4) {
    return turnover({ ...sim, lastResult: `${sim.lastResult ?? ""} Turnover on downs.`.trim(), currentDrive: { ...sim.currentDrive, result: "TURNOVER_ON_DOWNS" } }, mulberry32(sim.seed + 999));
  }

  return { ...sim, down, distance };
}

/** True if this play type is one of the new granular PAS-driven plays. */
function isGranularPlay(playType: PlayType): boolean {
  return playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER"
    || playType === "QUICK_GAME" || playType === "DROPBACK" || playType === "SCREEN";
}

function resolveNormalPlay(sim: GameSim, rng: () => number, playType: PlayType, snapKey: string, opts: { aggression?: AggressionLevel; tempo?: TempoMode } = {}): { sim: GameSim; tag: "IN_BOUNDS" | "OOB" | "INCOMPLETE" | "SCORE" | "CHANGE"; live: number; admin: number; playDiag?: PassPlayDiag } {
  if (playType === "SPIKE") {
    const live = liveTime(rng, "SPIKE");
    const spiked = advanceDown({ ...sim, lastResult: "Spike (clock stopped).", lastResultTags: [] as ResultTag[] }, 0);
    return { sim: spiked, tag: "INCOMPLETE" as const, live, admin: 0, playDiag: undefined };
  }

  // ── PAS-driven resolution for granular play types ──────────────────────
  if (isGranularPlay(playType) || playType === "PLAY_ACTION") {
    const look = sim.defLook ?? computeDefensiveLook(sim, rng);
    const aggression = opts.aggression ?? sim.aggression ?? "NORMAL";
    const isRunP = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER";

    let resolved = resolveWithPAS(sim, rng, playType, look, aggression, snapKey, sim.lastDefensiveCall);
    const defensePlan = defenseGameplan(sim);
    if (defensePlan?.defensiveFocus === "STOP_RUN" && isRunP) resolved = { ...resolved, yards: Math.floor(resolved.yards * 0.92) };
    if (defensePlan?.defensiveFocus === "STOP_PASS" && !isRunP) resolved = { ...resolved, incomplete: resolved.incomplete || rng() < 0.22, yards: Math.floor(resolved.yards * 0.9) };
    if (defensePlan?.pressureRate === "HIGH" && !isRunP) resolved = { ...resolved, sack: resolved.sack || rng() < 0.12 };
    const { yards, tags, sack, scramble, incomplete, turnover: isTO, turnoverKind, diag, unicornImpact, assignmentLog } = resolved;
    const simWithAssignment = assignmentLog ? { ...sim, lastAssignmentLog: assignmentLog } : sim;

    // Update stats
    const updatedStats = { ...sim.stats };
    const side = sim.possession === "HOME" ? updatedStats.home : updatedStats.away;
    if (isRunP || scramble) {
      side.rushAttempts += 1;
      if (!isTO) { side.rushYards += Math.max(0, yards); side.topRusherYards += Math.max(0, yards); }
    } else {
      if (!sack) side.passAttempts += 1;
      if (!incomplete && !sack && !isTO) {
        side.completions += 1;
        side.passYards += Math.max(0, yards);
        side.topReceiverYards += Math.max(0, yards);
      }
      if (sack) side.sacks += 1;
    }

    if (isTO) {
      side.turnovers += 1;
    }

    const simWithPlayerStats = applyPlayerStatsForResolvedPlay(
      { ...simWithAssignment, stats: updatedStats },
      { playType, yards, sack, scramble, incomplete, turnover: isTO, turnoverKind, td: resolved.td, assignmentLog },
    );

    if (isTO) {
      const desc = sack
        ? (turnoverKind === "FUMBLE" ? "Strip-sack! Ball lost." : `Sack for ${yards}y.`)
        : turnoverKind === "INT"
          ? "Intercepted!"
          : `Fumble! Ball lost.`;
      let turnoverSim: GameSim = { ...simWithPlayerStats, lastResult: desc, lastResultTags: tags };
      if (unicornImpact) turnoverSim = { ...turnoverSim, unicornImpactLog: [...(turnoverSim.unicornImpactLog ?? []), { playId: snapKey, side: sim.possession, ...unicornImpact }] };
      if (sack) {
        const nextBallOn = clamp(sim.ballOn + yards, 1, 99);
        turnoverSim = advanceDown({ ...turnoverSim, ballOn: nextBallOn }, yards);
      } else {
        turnoverSim = turnover(turnoverSim, rng);
      }
      const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER";
      return { sim: turnoverSim, tag: "IN_BOUNDS" as const, live: liveTime(rng, isRun ? "RUN_IN_BOUNDS" : "SACK"), admin: adminTime(rng, "ROUTINE"), playDiag: !isRunP ? diag : undefined };
    }

    if (sack) {
      const nextBallOn = clamp(sim.ballOn + yards, 1, 99);
      const desc = `Sack for ${yards}y.`;
      let sackSim = advanceDown({ ...simWithPlayerStats, ballOn: nextBallOn, lastResult: desc, lastResultTags: tags }, yards);
      if (unicornImpact) sackSim = { ...sackSim, unicornImpactLog: [...(sackSim.unicornImpactLog ?? []), { playId: snapKey, side: sim.possession, ...unicornImpact }] };
      return { sim: sackSim, tag: "IN_BOUNDS" as const, live: liveTime(rng, "SACK"), admin: adminTime(rng, "ROUTINE"), playDiag: !isRunP ? diag : undefined };
    }

    if (incomplete) {
      const desc = "Incomplete.";
      return {
        sim: unicornImpact
          ? { ...simWithPlayerStats, lastResult: `${desc} 🦄 ${unicornImpact.description}`.trim(), lastResultTags: tags, unicornImpactLog: [...(sim.unicornImpactLog ?? []), { playId: snapKey, side: sim.possession, ...unicornImpact }] }
          : { ...simWithPlayerStats, lastResult: desc, lastResultTags: tags },
        tag: "INCOMPLETE" as const,
        live: liveTime(rng, "INCOMPLETE"),
        admin: adminTime(rng, "ROUTINE"),
      };
    }

    const oob = !isRunP && rng() < (yards >= 16 ? 0.18 : 0.12);
    const label = scramble
      ? `QB scramble for ${yards}y${oob ? " (OOB)" : ""}.`
      : isRunP
      ? `${playType.replace(/_/g, " ")} for ${yards}y${oob ? " (OOB)" : ""}.`
      : `${playType.replace(/_/g, " ")} complete for ${yards}y${oob ? " (OOB)" : ""}.`;
    const newBallOn = clamp(sim.ballOn + yards, 1, 99);

    if (resolved.td) {
      side.tds += 1;
    }

    const labelWithUnicorn = unicornImpact ? `${label} 🦄 ${unicornImpact.description}` : label;
    let resolvedPlaySim = advanceDown({ ...simWithPlayerStats, ballOn: newBallOn, lastResult: labelWithUnicorn, lastResultTags: tags }, yards);
    if (unicornImpact) resolvedPlaySim = { ...resolvedPlaySim, unicornImpactLog: [...(resolvedPlaySim.unicornImpactLog ?? []), { playId: snapKey, side: sim.possession, ...unicornImpact }] };
    return {
      sim: resolvedPlaySim,
      tag: oob ? ("OOB" as const) : ("IN_BOUNDS" as const),
      live: liveTime(rng, oob ? ((isRunP || scramble) ? "RUN_OOB" : "SHORT_OOB") : (isRunP || scramble) ? "RUN_IN_BOUNDS" : yards >= 16 ? "DEEP_IN_BOUNDS" : "SHORT_IN_BOUNDS"),
      admin: adminTime(rng, yards >= sim.distance ? "FIRST_DOWN" : "ROUTINE"),
      playDiag: !isRunP ? diag : undefined,
    };
  }

  // ── Legacy resolution (RUN, SHORT_PASS, DEEP_PASS, KNEEL) ────────────────
  const isPass = playType !== "RUN" && playType !== "KNEEL";
  const kneel = playType === "KNEEL";

  const baseMean: Record<string, number> = { RUN: 3.9, SHORT_PASS: 5.8, DEEP_PASS: 11.2, PLAY_ACTION: 7.1, KNEEL: -1 };
  const baseVol: Record<string, number> = { RUN: 3.2, SHORT_PASS: 6, DEEP_PASS: 13.5, PLAY_ACTION: 8.2, KNEEL: 0.5 };

  const y = clamp(Math.round((baseMean[playType] ?? 5) + (rng() - 0.5) * 2 * (baseVol[playType] ?? 5)), -12, 60);

  if (kneel) {
    const next = advanceDown({ ...sim, ballOn: clamp(sim.ballOn + y, 1, 99), lastResult: "Kneel.", lastResultTags: [] }, y);
    return { sim: next, tag: "IN_BOUNDS" as const, live: liveTime(rng, "RUN_IN_BOUNDS"), admin: adminTime(rng, "ROUTINE") };
  }

  if (isPass) {
    const sackProb = clamp(0.06 + Math.max(0, sim.distance - 7) * 0.01, 0.04, 0.18);
    const incProb = clamp(playType === "DEEP_PASS" ? 0.48 : 0.33, 0.18, 0.62);

    if (rng() < sackProb) {
      const nextBallOn = clamp(sim.ballOn - Math.round(tri(rng, 4, 7, 12)), 1, 99);
      const next = advanceDown({ ...sim, ballOn: nextBallOn, lastResult: "Sack.", lastResultTags: [] }, -(sim.ballOn - nextBallOn));
      return { sim: next, tag: "IN_BOUNDS" as const, live: liveTime(rng, "SACK"), admin: adminTime(rng, "ROUTINE") };
    }

    if (rng() < incProb) {
      return {
        sim: { ...sim, lastResult: "Incomplete.", lastResultTags: [] },
        tag: "INCOMPLETE" as const,
        live: liveTime(rng, "INCOMPLETE"),
        admin: adminTime(rng, "ROUTINE"),
      };
    }

    const oob = rng() < clamp(playType === "DEEP_PASS" ? 0.18 : 0.14, 0, 0.35);
    const next = advanceDown(
      { ...sim, ballOn: clamp(sim.ballOn + y, 1, 99), lastResult: `${playType.replace(/_/g, " ")} complete for ${y}y${oob ? " (OOB)" : ""}.`, lastResultTags: [] },
      y
    );
    return {
      sim: next,
      tag: oob ? ("OOB" as const) : ("IN_BOUNDS" as const),
      live: liveTime(rng, oob ? "SHORT_OOB" : playType === "DEEP_PASS" ? "DEEP_IN_BOUNDS" : "SHORT_IN_BOUNDS"),
      admin: adminTime(rng, y >= sim.distance ? "FIRST_DOWN" : "ROUTINE"),
    };
  }

  const oob = rng() < 0.06;
  const next = advanceDown({ ...sim, ballOn: clamp(sim.ballOn + y, 1, 99), lastResult: `Run for ${y}y${oob ? " (OOB)" : ""}.`, lastResultTags: [] }, y);
  return {
    sim: next,
    tag: oob ? ("OOB" as const) : ("IN_BOUNDS" as const),
    live: liveTime(rng, oob ? "RUN_OOB" : "RUN_IN_BOUNDS"),
    admin: adminTime(rng, y >= sim.distance ? "FIRST_DOWN" : "ROUTINE"),
  };
}

function applySnapLoopTime(sim: GameSim, rng: () => number): GameSim {
  const snapLeft = chooseSnapWithLeft(sim.clock, rng, scriptMode(sim));
  const runoff = betweenPlaysRunoff(sim.clock, rng, snapLeft);
  const planTempo = offenseGameplan(sim)?.tempo;
  const tempoFactor = planTempo === "FAST" ? 0.85 : planTempo === "SLOW" ? 1.15 : 1;
  const adjustedRunoff = Math.max(0, Math.round(runoff * tempoFactor));
  if (adjustedRunoff <= 0) return sim;
  return { ...sim, clock: applyTwoMinuteGate(sim.clock, rng, adjustedRunoff).clock };
}

function applyTimeWithGate(sim: GameSim, rng: () => number, seconds: number): GameSim {
  if (seconds <= 0) return sim;
  const gate = applyTwoMinuteGate(sim.clock, rng, seconds);
  return { ...sim, clock: applyTime(gate.clock, seconds - (gate.didGate ? seconds - gate.applied : 0)) };
}

function urgency(sim: GameSim): number {
  const q = sim.clock.quarter;
  const t = sim.clock.timeRemainingSec;
  const diff = sim.homeScore - sim.awayScore;
  const myDiff = sim.possession === "HOME" ? diff : -diff;
  if (q !== 4 || myDiff >= 0) return 0;
  if (t <= 90) return 1;
  if (t <= 180) return 0.6;
  return 0.3;
}

function goPlayForDistance(distance: number, u: number): PlayType {
  if (distance <= 2) return "RUN";
  if (distance <= 5) return u >= 0.6 ? "SHORT_PASS" : "RUN";
  if (distance <= 9) return "SHORT_PASS";
  return "DEEP_PASS";
}

function estimateGoSuccessProb(sim: GameSim): number {
  const d = sim.distance;
  const base = d <= 1 ? 0.72 : d <= 2 ? 0.62 : d <= 3 ? 0.55 : d <= 5 ? 0.48 : d <= 7 ? 0.4 : d <= 10 ? 0.33 : 0.26;
  const zone = sim.ballOn >= 90 ? 0.05 : sim.ballOn >= 75 ? 0.02 : 0;
  return clamp(base + zone, 0.12, 0.78);
}

function estimatePuntValue(sim: GameSim): number {
  const field = sim.ballOn;
  if (field >= 80) return -0.6;
  if (field >= 65) return -0.1;
  if (field >= 50) return 0.2;
  return 0.45;
}

function estimateGoValue(sim: GameSim): number {
  const p = estimateGoSuccessProb(sim);
  const field = sim.ballOn;
  const u = urgency(sim);
  const success = (field >= 95 ? 3.3 : field >= 85 ? 2.2 : field >= 70 ? 1.5 : field >= 55 ? 1 : 0.7) + 0.8 * u;
  const fail = (field >= 90 ? -1.2 : field >= 70 ? -0.8 : field >= 50 ? -0.5 : -0.3) - 0.4 * u;
  return p * success + (1 - p) * fail;
}

function estimateFgValue(sim: GameSim): number {
  const p = fgMakeProb(sim.ballOn);
  const u = urgency(sim);
  const kickYards = 100 - sim.ballOn + 17;
  const make = 1.15 + (kickYards <= 45 ? 0.2 : 0) + 0.6 * u;
  const miss = sim.ballOn >= 75 ? -0.9 : sim.ballOn >= 60 ? -0.6 : -0.45;
  return p * make + (1 - p) * miss;
}

export function recommendFourthDown(sim: GameSim): FourthDownRecommendation {
  const u = urgency(sim);
  const go = estimateGoValue(sim) + 0.25 * u + (sim.ballOn >= 80 ? 0.08 : 0) + (sim.distance <= 2 ? 0.05 : 0);
  const fg = estimateFgValue(sim) + (sim.ballOn >= 60 ? 0.08 : -0.06);
  const punt = estimatePuntValue(sim) + (sim.ballOn <= 55 ? 0.06 : -0.08);
  const best = fg >= go && fg >= punt ? "FG" : punt >= go && punt >= fg ? "PUNT" : goPlayForDistance(sim.distance, u);

  const success = (sim.ballOn >= 95 ? 3.3 : sim.ballOn >= 85 ? 2.2 : sim.ballOn >= 70 ? 1.5 : sim.ballOn >= 55 ? 1 : 0.7) + 0.8 * u;
  const fail = (sim.ballOn >= 90 ? -1.2 : sim.ballOn >= 70 ? -0.8 : sim.ballOn >= 50 ? -0.5 : -0.3) - 0.4 * u;
  const alt = Math.max(fg, punt);
  const breakevenGoRate = clamp((alt - fail) / (success - fail), 0, 1);

  const ranked = [
    { playType: "FG" as const, score: fg },
    { playType: "PUNT" as const, score: punt },
    { playType: "RUN" as const, score: go },
  ].sort((a, b) => b.score - a.score);

  return { best, ranked, breakevenGoRate };
}

function decideFourthDown(sim: GameSim): PlayType {
  const rec = recommendFourthDown(sim);
  const aggressivePlan = gameplanAggression(sim) === "AGGRESSIVE";
  const shouldForceGo = aggressivePlan && rec.breakevenGoRate <= 0.58;
  const picked = shouldForceGo ? goPlayForDistance(sim.distance, urgency(sim)) : rec.best;
  return picked === "RUN" || picked === "SHORT_PASS" || picked === "DEEP_PASS" || picked === "PLAY_ACTION"
    ? goPlayForDistance(sim.distance, urgency(sim))
    : picked;
}

export function initGameSim(params: {
  homeTeamId: string;
  awayTeamId: string;
  seed: number;
  weekType?: "PRESEASON" | "REGULAR_SEASON" | "PLAYOFFS";
  playoffGameId?: string;
  weekNumber?: number;
  homeRatings?: TeamGameRatings;
  awayRatings?: TeamGameRatings;
  controlMode?: GameSim["controlMode"];
  trackedPlayers?: GameSim["trackedPlayers"];
  specialistsBySide?: GameSim["specialistsBySide"];
  playerFatigue?: Record<string, number>;
  currentPersonnelPackage?: PersonnelPackage;
  practiceExecutionBonus?: number;
  lateGamePracticeRetentionBonus?: number;
  coachArchetypeId?: string;
  coachTenureYear?: number;
  coachUnlockedPerkIds?: string[];
  homeGameplan?: WeeklyGameplan;
  awayGameplan?: WeeklyGameplan;
  weather?: GameWeather;
  playerUnicorns?: Record<string, PlayerUnicorn>;
  playerBadges?: Record<string, PlayerBadge[]>;
  offenseUserMode?: GameSim["offenseUserMode"];
}): GameSim {
  return {
    homeTeamId: params.homeTeamId,
    awayTeamId: params.awayTeamId,
    homeScore: 0,
    awayScore: 0,
    possession: "HOME",
    ballOn: 25,
    down: 1,
    distance: 10,
    clock: initClock(),
    seed: params.seed,
    weekType: params.weekType,
    weekNumber: params.weekNumber,
    driveNumber: 1,
    playNumberInDrive: 0,
    driveLog: [],
    playLog: [],
    currentDrive: { driveNumber: 1, possession: "HOME", startBallOn: 25, plays: [] },
    aggression: "NORMAL",
    tempo: "NORMAL",
    stats: emptyGameStats(),
    homeRatings: params.homeRatings,
    awayRatings: params.awayRatings,
    controlMode: params.controlMode ?? "HYBRID",
    playerFatigue: { ...(params.playerFatigue ?? {}) },
    snapLoadThisGame: {},
    trackedPlayers: { HOME: params.trackedPlayers?.HOME ?? {}, AWAY: params.trackedPlayers?.AWAY ?? {} },
    specialistsBySide: params.specialistsBySide ?? { HOME: {}, AWAY: {} },
    currentPersonnelPackage: params.currentPersonnelPackage ?? "11",
    likelyDefensiveReactions: [],
    defensiveCallRecords: [],
    recentDefensiveCalls: [],
    situationWindowCounts: {},
    observedSnaps: 0,
    practiceExecutionBonus: params.practiceExecutionBonus ?? 0,
    qbRunContactsByPlayerId: {},
    lateGamePracticeRetentionBonus: params.lateGamePracticeRetentionBonus ?? 0,
    coachArchetypeId: params.coachArchetypeId,
    coachTenureYear: Math.max(1, Number(params.coachTenureYear ?? 1)),
    coachUnlockedPerkIds: [...(params.coachUnlockedPerkIds ?? [])],
    homeGameplan: params.homeGameplan,
    awayGameplan: params.awayGameplan,
    weather: params.weather,
    playerUnicorns: { ...(params.playerUnicorns ?? {}) },
    playerBadges: { ...(params.playerBadges ?? {}) },
    unicornImpactLog: [],
    offenseUserMode: params.offenseUserMode ?? "FULL_AUTO",
    pendingOffensiveCall: undefined,
    defenseUserMode: "KEY_DOWNS",
    needsDefensiveCall: false,
    forceAutoDefenseCall: false,
  };
}

function appendPlayLog(sim: GameSim, event: PlayEventV1Expanded): GameSim {
  const nextPlayLog = [...(sim.playLog ?? []), event];
  return {
    ...sim,
    playLog: nextPlayLog.length > MAX_PLAY_LOG_EVENTS ? nextPlayLog.slice(-MAX_PLAY_LOG_EVENTS) : nextPlayLog,
  };
}


function offenseGameplan(sim: GameSim): TeamGameplan | undefined {
  return sim.possession === "HOME" ? sim.homeGameplan : sim.awayGameplan;
}

function defenseGameplan(sim: GameSim): TeamGameplan | undefined {
  return sim.possession === "HOME" ? sim.awayGameplan : sim.homeGameplan;
}

function gameplanAdjustedTempo(sim: GameSim): TempoMode {
  const plan = offenseGameplan(sim);
  if (plan?.tempo === "FAST") return "HURRY_UP";
  if (plan?.tempo === "SLOW") return "MILK";
  return sim.tempo;
}

function gameplanAggression(sim: GameSim): AggressionLevel {
  return offenseGameplan(sim)?.aggression ?? sim.aggression;
}

function trackedForPlay(playType: PlayType): FatigueTrackedPosition[] {
  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN" || playType === "QB_KEEP";
  return isRun ? ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB"] : ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB"];
}

function applySnapFatigue(sim: GameSim, playType: PlayType): GameSim {
  const side = sim.possession;
  const tracked = sim.trackedPlayers[side] ?? {};
  const nextFatigue = { ...sim.playerFatigue };
  const nextLoads = { ...sim.snapLoadThisGame };
  const playId = `${sim.driveNumber}-${sim.playNumberInDrive + 1}`;

  for (const pos of trackedForPlay(playType)) {
    const playerId = tracked[pos];
    if (!playerId) continue;
    const baseCost = BASE_SNAP_COSTS[pos][playType] ?? 0;
    const varianceRoll = contextualRng(sim.seed, `fatigue-variance-${playId}-${playerId}`)();
    const variance = Math.round((varianceRoll * 2 - 1) * FATIGUE_VARIANCE_BAND);
    const increment = Math.max(0, baseCost + variance);
    nextFatigue[playerId] = clampFatigue((nextFatigue[playerId] ?? 50) + increment);
    nextLoads[playerId] = (nextLoads[playerId] ?? 0) + 1;
  }

  return { ...sim, playerFatigue: nextFatigue, snapLoadThisGame: nextLoads };
}

export function stepPlay(sim: GameSim, playType: PlayType, personnelPackage: PersonnelPackage = "11", opts: { userControlsDefense?: boolean } = {}): PlayResolution {
  const downBefore = sim.down;
  const distanceBefore = sim.distance;
  const ballBefore = sim.ballOn;
  let s: GameSim = { ...sim, seed: sim.seed + 1 };

  s = quarterAdvanceIfNeeded(s);
  if (s.clock.timeRemainingSec === 0) return { sim: s, ended: s.clock.quarter === 4 };

  if (playType === "SPIKE" && !canRunSpike(s)) {
    return {
      sim: {
        ...s,
        lastResult: "Spike not available in this situation.",
        lastResultTags: [{ kind: "SITUATION", text: "SPIKE_BLOCKED" }],
      },
      ended: false,
    };
  }

  const preSnapRng = contextualRng(hashSeed(s.seed, "presnap", s.driveNumber, s.playNumberInDrive + 1));
  s = applySnapLoopTime(s, preSnapRng);
  if (s.clock.timeRemainingSec === 0) {
    s = quarterAdvanceIfNeeded(s);
    return { sim: s, ended: s.clock.quarter === 4 && s.clock.timeRemainingSec === 0 };
  }

  const snapKey = `SNAP:${s.driveNumber}:${s.playNumberInDrive + 1}`;
  const gameKey = `${s.homeTeamId}:${s.awayTeamId}:${s.weekType ?? "REGULAR_SEASON"}:${s.weekNumber ?? 0}`;
  const snapSeed = hashSeed(s.seed, gameKey, s.driveNumber, s.playNumberInDrive + 1);
  const rng = contextualRng(snapSeed, snapKey);

  const defensiveSituation = { down: s.down, distance: s.distance, yardLine: 100 - s.ballOn, quarter: Number(s.clock.quarter), clockSec: s.clock.timeRemainingSec };
  const shouldPromptDefenseCall = Boolean(opts.userControlsDefense)
    && (s.defenseUserMode === "ALWAYS" || (s.defenseUserMode === "KEY_DOWNS" && isKeyDefenseSituation(defensiveSituation)));
  if (shouldPromptDefenseCall && !s.pendingDefensiveCall && !s.forceAutoDefenseCall) {
    return {
      sim: { ...s, needsDefensiveCall: true, defensiveCallSituation: defensiveSituation },
      ended: false,
    };
  }

  const activeDefensiveCall = s.pendingDefensiveCall ?? aiSelectDefensiveCall({
    rng,
    defenseScheme: { baseShell: "COVER_3", blitzRate: 52, manRate: 38, front: "MULTIPLE" },
    situation: defensiveSituation,
  });

  // Generate defensive look for this snap (use existing defLook if pre-set, else generate)
  const reactions = getDefensiveReaction(s.down, s.distance, personnelPackage);
  const defRoll = contextualRng(s.seed, `def-package-${s.driveNumber}-${s.playNumberInDrive + 1}`)();
  const selectedDefensivePackage = selectDefensivePackageFromRoll(reactions, defRoll);
  const look = s.defLook ?? computeDefensiveLook(s, rng);
  s = {
    ...s,
    defLook: look,
    currentPersonnelPackage: personnelPackage,
    likelyDefensiveReactions: reactions,
    selectedDefensivePackage,
    lastDefensiveCall: activeDefensiveCall,
    pendingDefensiveCall: undefined,
    needsDefensiveCall: false,
    forceAutoDefenseCall: false,
    defensiveCallSituation: undefined,
  };

  const preAssignments = buildAssignments(s, {
    playType,
    personnelPackage,
    defensivePackage: selectedDefensivePackage,
    defensiveCall: activeDefensiveCall,
  });
  s = { ...s, lastAssignmentLog: preAssignments.log };

  let tag: "IN_BOUNDS" | "OOB" | "INCOMPLETE" | "SCORE" | "CHANGE" = "IN_BOUNDS";
  let live = 0;
  let admin = 0;

  if (playType === "PUNT") {
    s = { ...punt(s, rng), lastPlayDiag: undefined };
    tag = "CHANGE";
  } else if (playType === "FG") {
    s = { ...fgAttempt(s, rng), lastPlayDiag: undefined };
    tag = "SCORE";
  } else {
    const planTempo = gameplanAdjustedTempo(s);
    const planAggression = gameplanAggression(s);
    const resolved = resolveNormalPlay(s, rng, playType, snapKey, { aggression: planAggression, tempo: planTempo });
    s = { ...resolved.sim, lastPlayDiag: resolved.playDiag };
    tag = resolved.tag;
    live = resolved.live;
    admin = resolved.admin;
  }

  if (live > 0) s = applyTimeWithGate(s, rng, live);
  if (admin > 0) s = { ...s, clock: applyTime(s.clock, admin) };

  const status = isClockStoppedResult(tag);
  s = { ...s, clock: { ...s.clock, clockRunning: status.running, restartMode: status.restart, playClockLen: 40 } };

  if (s.clock.timeRemainingSec === 0) s = quarterAdvanceIfNeeded(s);

  s = recordDefensiveCall(s, {
    snap: (s.observedSnaps ?? 0) + 1,
    down: downBefore,
    distance: distanceBefore,
    ballOn: ballBefore,
    defensivePackage: selectedDefensivePackage,
    look,
    callSignature: buildDefensiveCallSignature(selectedDefensivePackage, look),
    situationBucket: getSituationBucket({ down: downBefore, distance: distanceBefore, ballOn: ballBefore }),
    pressureLook: isPressureLook(look),
  });

  // Generate the next snap's defensive look after the play
  const nextLook = computeDefensiveLook(s, mulberry32(s.seed + 13));
  s = { ...s, defLook: nextLook };

  s = applySnapFatigue(s, playType);
  const yardsGained = s.possession === sim.possession ? Number(s.ballOn - ballBefore) : 0;
  const outcome: "SUCCESS" | "FAILURE" | "EXPLOSIVE" | "NEGATIVE" =
    yardsGained >= 20 ? "EXPLOSIVE" : yardsGained >= 3 ? "SUCCESS" : yardsGained < 0 ? "NEGATIVE" : "FAILURE";
  s = {
    ...s,
    lastPlayResult: {
      playId: `${s.driveNumber}-${s.playNumberInDrive + 1}`,
      down: Number(downBefore),
      distance: Number(distanceBefore),
      yardsGained,
      outcome,
      explanation: buildPlayExplanation(s, playType, outcome, yardsGained),
    },
  };
  const playIndex = (s.playLog.at(-1)?.playIndex ?? 0) + 1;

  s = appendPlayLog(s, {
    version: 1,
    playIndex,
    drive: s.driveNumber,
    playInDrive: s.playNumberInDrive,
    quarter: s.clock.quarter,
    clockSec: s.clock.timeRemainingSec,
    possession: s.possession,
    down: s.down,
    distance: s.distance,
    ballOn: s.ballOn,
    playType,
    result: s.lastResult ?? "",
    homeScore: s.homeScore,
    awayScore: s.awayScore,
    ...(s.lastPlayDiag ? { passDiag: s.lastPlayDiag } : {}),
    assignmentLog: s.lastAssignmentLog,
  });
  s = pushLog(s, playType, s.lastResult ?? "");
  return { sim: s, ended: s.clock.quarter === 4 && s.clock.timeRemainingSec === 0 };
}

function pickFromWeights(sim: GameSim, runWeight: number, passWeight: number): PlayType {
  const total = Math.max(0.001, runWeight + passWeight);
  const roll = contextualRng(sim.seed, `autopick:${sim.driveNumber}:${sim.playNumberInDrive + 1}`)() * total;
  return roll <= runWeight ? "INSIDE_ZONE" : "DROPBACK";
}

export function autoPickPlay(sim: GameSim): PlayType {
  const offensePlan = sim.possession === "HOME" ? sim.homeGameplan : sim.awayGameplan;
  if ((sim.driveNumber <= 2 || (sim.driveNumber === 1 && sim.playNumberInDrive < 5)) && offensePlan?.scriptedOpening?.[sim.playNumberInDrive]) {
    return offensePlan.scriptedOpening[sim.playNumberInDrive];
  }
  const q = sim.clock.quarter;
  const t = sim.clock.timeRemainingSec;
  const diff = sim.homeScore - sim.awayScore;
  const myDiff = sim.possession === "HOME" ? diff : -diff;
  const plan = offenseGameplan(sim);

  if (sim.down === 4) return decideFourthDown(sim);
  if ((q === 2 || q === 4) && myDiff < 0 && canRunSpike(sim)) return "SPIKE";
  if (q === 4 && myDiff > 0 && t <= 120) return "KNEEL";
  if (q === 4 && myDiff < 0 && t <= 90) return sim.distance >= 8 ? "DROPBACK" : "QUICK_GAME";
  if (sim.distance >= 9) return offensePlan?.offensiveFocus === "RUN_HEAVY" ? "QUICK_GAME" : "DROPBACK";
  if (sim.distance <= 3) return offensePlan?.offensiveFocus === "PASS_HEAVY" ? "QUICK_GAME" : "INSIDE_ZONE";
  if (sim.distance <= 6) return offensePlan?.offensiveFocus === "RUN_HEAVY" ? "INSIDE_ZONE" : "QUICK_GAME";
  return offensePlan?.offensiveFocus === "RUN_HEAVY" ? "INSIDE_ZONE" : "DROPBACK";
}

export function simulateDriveUntilChangeOrEnd(sim: GameSim, playSelectionFn: PlaySelectionFn = autoPickPlay): PlayResolution {
  const startDrive = sim.driveNumber;
  const startPossession = sim.possession;

  let next = sim;
  let safety = 0;
  while (!(next.clock.quarter === 4 && next.clock.timeRemainingSec === 0) && next.driveNumber === startDrive && next.possession === startPossession) {
    // Selector should be pure with respect to sim state so seeded RNG timelines stay deterministic.
    const stepped = stepPlay(next, playSelectionFn(next));
    next = stepped.sim;
    safety += 1;
    if (safety > 300) break;
  }

  return { sim: next, ended: next.clock.quarter === 4 && next.clock.timeRemainingSec === 0 };
}

export function simulateFullGame(params: {
  homeTeamId: string;
  awayTeamId: string;
  seed: number;
  homeGameplan?: WeeklyGameplan;
  awayGameplan?: WeeklyGameplan;
  includePlayLog?: boolean;
  playSelectionFn?: PlaySelectionFn;
}) {
  const { playSelectionFn = autoPickPlay, ...initParams } = params;
  let sim = initGameSim(initParams);
  sim = { ...sim, clock: { ...sim.clock, clockRunning: false, restartMode: "SNAP" } };

  let safety = 0;
  while (!(sim.clock.quarter === 4 && sim.clock.timeRemainingSec === 0)) {
    // Selector should be pure with respect to sim state so seeded RNG timelines stay deterministic.
    const stepped = stepPlay(sim, playSelectionFn(sim));
    sim = stepped.sim;
    safety += 1;
    if (safety > 6000) break;
  }

  return {
    homeScore: sim.homeScore,
    awayScore: sim.awayScore,
    ...(params.includePlayLog ? { playLog: sim.playLog } : {}),
  };
}

export function buildGameBoxScore(sim: GameSim, season: number): GameBoxScore {
  return {
    season,
    week: sim.weekNumber ?? 0,
    home: {
      teamId: sim.homeTeamId,
      score: sim.homeScore,
      passAttempts: sim.stats.home.passAttempts,
      completions: sim.stats.home.completions,
      passYards: sim.stats.home.passYards,
      rushAttempts: sim.stats.home.rushAttempts,
      rushYards: sim.stats.home.rushYards,
      turnovers: sim.stats.home.turnovers,
      sacks: sim.stats.home.sacks,
      tds: sim.stats.home.tds,
    },
    away: {
      teamId: sim.awayTeamId,
      score: sim.awayScore,
      passAttempts: sim.stats.away.passAttempts,
      completions: sim.stats.away.completions,
      passYards: sim.stats.away.passYards,
      rushAttempts: sim.stats.away.rushAttempts,
      rushYards: sim.stats.away.rushYards,
      turnovers: sim.stats.away.turnovers,
      sacks: sim.stats.away.sacks,
      tds: sim.stats.away.tds,
    },
    players: sim.boxScore?.players ?? [],
    finalized: sim.clock.quarter === 4 && sim.clock.timeRemainingSec === 0,
  };
}
