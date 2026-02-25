import { applyTime, applyTwoMinuteGate, betweenPlaysRunoff, chooseSnapWithLeft, initClock, nextQuarter, type ClockState } from "@/engine/clock";
import { clamp, mulberry32, tri } from "@/engine/rand";
import { BASE_SNAP_COSTS, FATIGUE_VARIANCE_BAND, clampFatigue, computeFatigueEffects, type FatigueTrackedPosition } from "@/engine/fatigue";
import { getDefensiveReaction, getMatchupModifier, selectDefensivePackageFromRoll, isRunPlay, type DefensivePackage, type MatchupModifier, type PersonnelPackage } from "@/engine/personnel";
import { rng as contextualRng } from "@/engine/rng";
import type { TeamGameRatings } from "@/engine/game/teamRatings";
import { getArchetypeTraits, type PassiveResolution } from "@/data/archetypeTraits";
import { resolvePerkModifiers } from "@/engine/perkWiring";

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
export type AggressionLevel = "CONSERVATIVE" | "NORMAL" | "AGGRESSIVE";
export type TempoMode = "NORMAL" | "HURRY_UP" | "MILK";

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
const SITUATION_WINDOW_SIZE = 12;

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
  homeScore: number;
  awayScore: number;
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
  weekType?: "PRESEASON" | "REGULAR_SEASON";
  weekNumber?: number;
  driveNumber: number;
  playNumberInDrive: number;
  driveLog: DriveLogEntry[];
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
  trackedPlayers: Record<Possession, Partial<Record<FatigueTrackedPosition, string>>>;
  currentPersonnelPackage: PersonnelPackage;
  likelyDefensiveReactions: Array<{ defensivePackage: DefensivePackage; probability: number }>;
  selectedDefensivePackage?: DefensivePackage;
  defensiveCallRecords: DefensiveCallRecord[];
  recentDefensiveCalls: DefensiveCallRecord[];
  situationWindowCounts: Partial<Record<SituationBucket, SituationWindowCount>>;
  observedSnaps: number;
  practiceExecutionBonus: number;
  coachArchetypeId?: string;
  coachTenureYear: number;
  coachUnlockedPerkIds?: string[];
  lastPlayResult?: PlayResult;
};

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
  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN";
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
function matchupEdge(playType: PlayType, off: TeamGameRatings, def: TeamGameRatings): number {
  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN";
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
  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN";
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
  const tracked = sim.trackedPlayers[sim.possession];
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

  return (acc - 1) * 0.8 + sim.practiceExecutionBonus * 0.02;
}

/** Compute the Play Advantage Score. */
function computePAS(playType: PlayType, look: DefensiveLook, sim: GameSim, matchup: MatchupModifier): { pas: number; cvl: number; me: number; sf: number } {
  const off = sim.possession === "HOME" ? sim.homeRatings : sim.awayRatings;
  const def = sim.possession === "HOME" ? sim.awayRatings : sim.homeRatings;

  const cvl = callVsLook(playType, look);
  const me = off && def ? matchupEdge(playType, off, def) : 0;
  const sf = situationFit(playType, sim);
  const exec = executionState(sim, playType, matchup);

  // PAS = weighted sum
  const pas = 0.35 * cvl + 0.35 * me + 0.2 * sf + 0.1 * exec;
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
  playType: PlayType,
  look: DefensiveLook,
  pasComponents: { pas: number; cvl: number; me: number; sf: number },
  outcome: "SUCCESS" | "FAILURE" | "EXPLOSIVE" | "NEGATIVE",
  aggression: AggressionLevel
): ResultTag[] {
  const tags: ResultTag[] = [];
  const { cvl, me, sf } = pasComponents;
  const { shell, box, blitz } = look;
  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN";
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

/** Resolve a play using the PAS engine, returning yards, tags, and outcome label. */
function resolveWithPAS(
  sim: GameSim,
  rng: () => number,
  playType: PlayType,
  look: DefensiveLook,
  aggression: AggressionLevel
): { yards: number; tags: ResultTag[]; outcomeLabel: string; turnover: boolean; td: boolean; sack: boolean; incomplete: boolean } {
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
  const pas = pasComp.pas + passivePas + perkPas;

  // Aggression + tempo modifiers
  const aggMod = aggression === "AGGRESSIVE" ? 0.2 : aggression === "CONSERVATIVE" ? -0.15 : 0;
  const tempoMod = sim.tempo === "HURRY_UP" ? 0.08 : sim.tempo === "MILK" ? -0.06 : 0;

  // Core probabilities
  const pSuccess = clamp(sigmoid(2.5 * pas + 0.2) - Math.max(tempoMod, 0) * 0.1 + Math.max(-tempoMod, 0) * 0.06, 0.25, 0.82);
  const pExplosive = clamp(0.08 + 0.18 * (pas + aggMod) + Math.max(tempoMod, 0) * 0.1, 0.02, 0.34);
  const pNegative = clamp(0.12 - 0.15 * pas + 0.08 * (aggMod > 0 ? aggMod : 0) + Math.max(tempoMod, 0) * 0.08, 0.04, 0.42);

  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN";
  const isPass = !isRun && playType !== "SPIKE" && playType !== "KNEEL" && playType !== "PUNT" && playType !== "FG";

  const roll1 = rng();
  const roll2 = rng();

  let yards = 0;
  let turnover = false;
  let td = false;
  let sack = false;
  let incomplete = false;
  let outcomeLabel = "normal";

  if (isRun) {
    if (roll1 < pNegative) {
      // TFL or stuff
      yards = Math.round(tri(rng, -4, -1, 0));
      outcomeLabel = "negative";
    } else if (roll1 < pNegative + pExplosive) {
      // Chunk or breakaway
      yards = roll2 < 0.25 ? Math.round(tri(rng, 15, 22, 40)) : Math.round(tri(rng, 7, 11, 16));
      outcomeLabel = "explosive";
    } else {
      // Normal gain
      yards = Math.round(tri(rng, 1, 4, 8));
      outcomeLabel = "success";
    }
    // Fumble (rare)
    if (rng() < clamp(0.008 - 0.004 * pas, 0.002, 0.018)) {
      turnover = true;
      yards = Math.max(yards, 0);
      outcomeLabel = "turnover";
    }
  } else if (isPass) {
    // Sack probability (tied to blitz + pass rush)
    const sackBase = (look.blitz === "LIKELY" ? 0.16 : look.blitz === "POSSIBLE" ? 0.1 : 0.07) + Math.max(tempoMod, 0) * 0.05;
    const sackProb = clamp(sackBase - 0.08 * pas, 0.03, 0.22);
    if (roll1 < sackProb) {
      sack = true;
      yards = -Math.round(tri(rng, 4, 7, 12));
      outcomeLabel = "negative";
    } else {
      // Incompletion
      const baseInc = (playType === "DROPBACK" || playType === "DEEP_PASS" ? 0.42 : playType === "PLAY_ACTION" ? 0.28 : 0.3) + Math.max(tempoMod, 0) * 0.05;
      const incProb = clamp(baseInc - 0.18 * pSuccess + 0.1 * (1 - pSuccess), 0.12, 0.58);
      if (roll1 < sackProb + incProb) {
        incomplete = true;
        yards = 0;
        outcomeLabel = "incomplete";
        // INT on incompletion (rare)
        if (rng() < clamp(0.04 - 0.03 * pas + (aggMod > 0 ? 0.02 : 0), 0.005, 0.12)) {
          turnover = true;
          outcomeLabel = "turnover";
        }
      } else if (roll1 < sackProb + incProb + pExplosive) {
        // Explosive completion
        yards = playType === "DROPBACK" || playType === "DEEP_PASS"
          ? Math.round(tri(rng, 16, 28, 45))
          : Math.round(tri(rng, 12, 18, 30));
        outcomeLabel = "explosive";
      } else if (roll2 < pNegative * 0.5) {
        // Short / negative completion
        yards = Math.round(tri(rng, -2, 1, 4));
        outcomeLabel = "negative";
      } else {
        // Normal completion
        yards = playType === "QUICK_GAME" || playType === "SHORT_PASS" || playType === "SCREEN"
          ? Math.round(tri(rng, 2, 6, 10))
          : playType === "PLAY_ACTION"
          ? Math.round(tri(rng, 4, 9, 17))
          : Math.round(tri(rng, 5, 10, 18));
        outcomeLabel = "success";
      }
    }
  }

  const outcome: "SUCCESS" | "FAILURE" | "EXPLOSIVE" | "NEGATIVE" =
    outcomeLabel === "explosive" ? "EXPLOSIVE"
    : outcomeLabel === "negative" || outcomeLabel === "turnover" || sack ? "NEGATIVE"
    : outcomeLabel === "incomplete" ? "FAILURE"
    : "SUCCESS";

  const tags = buildResultTags(playType, look, pasComp, outcome, aggression);

  // Check for TD
  if (sim.ballOn + yards >= 100 && !turnover) {
    td = true;
    yards = 100 - sim.ballOn;
  }

  return { yards, tags, outcomeLabel, turnover, td, sack, incomplete };
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
  return { ...sim, possession, driveNumber: sim.driveNumber + 1, playNumberInDrive: 0 };
}

function setNewSeries(sim: GameSim, ballOn: number): GameSim {
  return { ...sim, ballOn: clamp(ballOn, 1, 99), down: 1, distance: 10 };
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
  };
  return { ...sim, playNumberInDrive: sim.playNumberInDrive + 1, driveLog: [entry, ...sim.driveLog] };
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
  const next = setNewSeries(newDrive(sim, otherSide(sim.possession)), 25);
  return { ...next, clock: applyTime({ ...sim.clock, clockRunning: false, restartMode: "SNAP", playClockLen: 40 }, admin) };
}




function punt(sim: GameSim, rng: () => number): GameSim {
  let clock = applyTime(sim.clock, adminTime(rng, "PUNT_SETUP"));
  const returned = rng() < 0.55;
  clock = applyTime(clock, liveTime(rng, returned ? "PUNT_RETURN" : "PUNT_FAIR"));
  return turnover({ ...sim, clock, lastResult: "Punt." }, rng);
}

function fgMakeProb(ballOn: number): number {
  const distFromGoal = 100 - ballOn;
  const kickYards = distFromGoal + 17;
  return clamp(0.92 - Math.max(0, kickYards - 52) * 0.03, 0.08, 0.95);
}

function fgAttempt(sim: GameSim, rng: () => number): GameSim {
  let clock = applyTime(sim.clock, adminTime(rng, "FG_SETUP"));
  clock = applyTime(clock, liveTime(rng, "FG"));
  const makeProb = fgMakeProb(sim.ballOn);
  const kickYards = 100 - sim.ballOn + 17;

  if (rng() < makeProb) {
    const off = scoreRef(sim);
    off.set(off.get() + 3);
    return kickoffAfterScore({ ...sim, clock, lastResult: `FG is GOOD (${kickYards}y)!` }, rng);
  }
  return turnover({ ...sim, clock, lastResult: `FG missed (${kickYards}y).` }, rng);
}

function advanceDown(sim: GameSim, gained: number): GameSim {
  if (sim.ballOn >= 99) {
    const off = scoreRef(sim);
    off.set(off.get() + 7);
    const reset = setNewSeries(sim, 25);
    return { ...reset, lastResult: "TOUCHDOWN!" };
  }

  if (gained >= sim.distance) {
    return { ...sim, down: 1, distance: 10, lastResult: `${sim.lastResult ?? ""} First down!`.trim() };
  }

  const down = (sim.down + 1) as 2 | 3 | 4;
  const distance = Math.max(1, sim.distance - gained);

  if (down > 4) {
    return turnover({ ...sim, lastResult: `${sim.lastResult ?? ""} Turnover on downs.`.trim() }, mulberry32(sim.seed + 999));
  }

  return { ...sim, down, distance };
}

/** True if this play type is one of the new granular PAS-driven plays. */
function isGranularPlay(playType: PlayType): boolean {
  return playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER"
    || playType === "QUICK_GAME" || playType === "DROPBACK" || playType === "SCREEN";
}

function resolveNormalPlay(sim: GameSim, rng: () => number, playType: PlayType) {
  if (playType === "SPIKE") {
    const live = liveTime(rng, "SPIKE");
    return { sim: { ...sim, lastResult: "Spike.", lastResultTags: [] as ResultTag[] }, tag: "INCOMPLETE" as const, live, admin: adminTime(rng, "ROUTINE") };
  }

  // ── PAS-driven resolution for granular play types ──────────────────────
  if (isGranularPlay(playType) || playType === "PLAY_ACTION") {
    const look = sim.defLook ?? computeDefensiveLook(sim, rng);
    const aggression = sim.aggression ?? "NORMAL";
    const isRunP = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER";

    const resolved = resolveWithPAS(sim, rng, playType, look, aggression);
    const { yards, tags, sack, incomplete, turnover: isTO } = resolved;

    // Update stats
    const updatedStats = { ...sim.stats };
    const side = sim.possession === "HOME" ? updatedStats.home : updatedStats.away;
    if (isRunP) {
      side.rushAttempts += 1;
      if (!isTO) { side.rushYards += Math.max(0, yards); side.topRusherYards += Math.max(0, yards); }
    } else {
      side.passAttempts += 1;
      if (!incomplete && !sack && !isTO) {
        side.completions += 1;
        side.passYards += Math.max(0, yards);
        side.topReceiverYards += Math.max(0, yards);
      }
      if (sack) side.sacks += 1;
    }

    if (isTO) {
      side.turnovers += 1;
      const desc = sack ? `Sack for ${yards}y.` : incomplete ? "Intercepted!" : `Fumble! Ball lost.`;
      let s2 = { ...sim, stats: updatedStats, lastResult: desc, lastResultTags: tags };
      if (sack) {
        const nextBallOn = clamp(sim.ballOn + yards, 1, 99);
        s2 = advanceDown({ ...s2, ballOn: nextBallOn }, yards);
      } else {
        s2 = turnover(s2, rng);
      }
      const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER";
      return { sim: s2, tag: "IN_BOUNDS" as const, live: liveTime(rng, isRun ? "RUN_IN_BOUNDS" : "SACK"), admin: adminTime(rng, "ROUTINE") };
    }

    if (sack) {
      const nextBallOn = clamp(sim.ballOn + yards, 1, 99);
      const desc = `Sack for ${yards}y.`;
      const s2 = advanceDown({ ...sim, stats: updatedStats, ballOn: nextBallOn, lastResult: desc, lastResultTags: tags }, yards);
      return { sim: s2, tag: "IN_BOUNDS" as const, live: liveTime(rng, "SACK"), admin: adminTime(rng, "ROUTINE") };
    }

    if (incomplete) {
      const desc = "Incomplete.";
      return {
        sim: { ...sim, stats: updatedStats, lastResult: desc, lastResultTags: tags },
        tag: "INCOMPLETE" as const,
        live: liveTime(rng, "INCOMPLETE"),
        admin: adminTime(rng, "ROUTINE"),
      };
    }

    const oob = !isRunP && rng() < (yards >= 16 ? 0.18 : 0.12);
    const label = isRunP
      ? `${playType.replace(/_/g, " ")} for ${yards}y${oob ? " (OOB)" : ""}.`
      : `${playType.replace(/_/g, " ")} complete for ${yards}y${oob ? " (OOB)" : ""}.`;
    const newBallOn = clamp(sim.ballOn + yards, 1, 99);

    if (resolved.td) {
      side.tds += 1;
    }

    const s2 = advanceDown({ ...sim, stats: updatedStats, ballOn: newBallOn, lastResult: label, lastResultTags: tags }, yards);
    return {
      sim: s2,
      tag: oob ? ("OOB" as const) : ("IN_BOUNDS" as const),
      live: liveTime(rng, oob ? (isRunP ? "RUN_OOB" : "SHORT_OOB") : isRunP ? "RUN_IN_BOUNDS" : yards >= 16 ? "DEEP_IN_BOUNDS" : "SHORT_IN_BOUNDS"),
      admin: adminTime(rng, yards >= sim.distance ? "FIRST_DOWN" : "ROUTINE"),
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
  if (runoff <= 0) return sim;
  return { ...sim, clock: applyTwoMinuteGate(sim.clock, rng, runoff).clock };
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
  return rec.best === "RUN" || rec.best === "SHORT_PASS" || rec.best === "DEEP_PASS" || rec.best === "PLAY_ACTION"
    ? goPlayForDistance(sim.distance, urgency(sim))
    : rec.best;
}

export function initGameSim(params: {
  homeTeamId: string;
  awayTeamId: string;
  seed: number;
  weekType?: "PRESEASON" | "REGULAR_SEASON";
  weekNumber?: number;
  homeRatings?: TeamGameRatings;
  awayRatings?: TeamGameRatings;
  controlMode?: GameSim["controlMode"];
  trackedPlayers?: GameSim["trackedPlayers"];
  playerFatigue?: Record<string, number>;
  currentPersonnelPackage?: PersonnelPackage;
  practiceExecutionBonus?: number;
  coachArchetypeId?: string;
  coachTenureYear?: number;
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
    aggression: "NORMAL",
    tempo: "NORMAL",
    stats: emptyGameStats(),
    homeRatings: params.homeRatings,
    awayRatings: params.awayRatings,
    controlMode: params.controlMode ?? "HYBRID",
    playerFatigue: { ...(params.playerFatigue ?? {}) },
    snapLoadThisGame: {},
    trackedPlayers: params.trackedPlayers ?? { HOME: {}, AWAY: {} },
    currentPersonnelPackage: params.currentPersonnelPackage ?? "11",
    likelyDefensiveReactions: [],
    defensiveCallRecords: [],
    recentDefensiveCalls: [],
    situationWindowCounts: {},
    observedSnaps: 0,
    practiceExecutionBonus: params.practiceExecutionBonus ?? 0,
    coachArchetypeId: params.coachArchetypeId,
    coachTenureYear: Math.max(1, Number(params.coachTenureYear ?? 1)),
    coachUnlockedPerkIds: [...(params.coachUnlockedPerkIds ?? [])],
  };
}

function trackedForPlay(playType: PlayType): FatigueTrackedPosition[] {
  const isRun = playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN";
  return isRun ? ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB"] : ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB"];
}

function applySnapFatigue(sim: GameSim, playType: PlayType): GameSim {
  const side = sim.possession;
  const tracked = sim.trackedPlayers[side];
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

export function stepPlay(sim: GameSim, playType: PlayType, personnelPackage: PersonnelPackage = "11"): PlayResolution {
  const rng = mulberry32(sim.seed);
  const downBefore = sim.down;
  const distanceBefore = sim.distance;
  const ballBefore = sim.ballOn;
  let s: GameSim = { ...sim, seed: sim.seed + 1 };

  s = quarterAdvanceIfNeeded(s);
  if (s.clock.timeRemainingSec === 0) return { sim: s, ended: s.clock.quarter === 4 };

  s = applySnapLoopTime(s, rng);
  if (s.clock.timeRemainingSec === 0) {
    s = quarterAdvanceIfNeeded(s);
    return { sim: s, ended: s.clock.quarter === 4 && s.clock.timeRemainingSec === 0 };
  }

  // Generate defensive look for this snap (use existing defLook if pre-set, else generate)
  const reactions = getDefensiveReaction(s.down, s.distance, personnelPackage);
  const defRoll = contextualRng(s.seed, `def-package-${s.driveNumber}-${s.playNumberInDrive + 1}`)();
  const selectedDefensivePackage = selectDefensivePackageFromRoll(reactions, defRoll);
  const look = s.defLook ?? computeDefensiveLook(s, rng);
  s = { ...s, defLook: look, currentPersonnelPackage: personnelPackage, likelyDefensiveReactions: reactions, selectedDefensivePackage };

  let tag: "IN_BOUNDS" | "OOB" | "INCOMPLETE" | "SCORE" | "CHANGE" = "IN_BOUNDS";
  let live = 0;
  let admin = 0;

  if (playType === "PUNT") {
    s = punt(s, rng);
    tag = "CHANGE";
  } else if (playType === "FG") {
    s = fgAttempt(s, rng);
    tag = "SCORE";
  } else {
    const resolved = resolveNormalPlay(s, rng, playType);
    s = resolved.sim;
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
  s = pushLog(s, playType, s.lastResult ?? "");
  return { sim: s, ended: s.clock.quarter === 4 && s.clock.timeRemainingSec === 0 };
}

export function autoPickPlay(sim: GameSim): PlayType {
  const q = sim.clock.quarter;
  const t = sim.clock.timeRemainingSec;
  const diff = sim.homeScore - sim.awayScore;
  const myDiff = sim.possession === "HOME" ? diff : -diff;

  if (sim.down === 4) return decideFourthDown(sim);
  if ((q === 2 || q === 4) && t <= 15 && myDiff < 0 && !sim.clock.clockRunning) return "SPIKE";
  if (q === 4 && myDiff > 0 && t <= 120) return "KNEEL";
  if (q === 4 && myDiff < 0 && t <= 90) return sim.distance >= 8 ? "DROPBACK" : "QUICK_GAME";
  if (sim.distance >= 9) return "DROPBACK";
  if (sim.distance <= 3) return "INSIDE_ZONE";
  if (sim.distance <= 6) return "QUICK_GAME";
  return "DROPBACK";
}

export function simulateFullGame(params: { homeTeamId: string; awayTeamId: string; seed: number }) {
  let sim = initGameSim({ ...params });
  sim = { ...sim, clock: { ...sim.clock, clockRunning: false, restartMode: "SNAP" } };

  let safety = 0;
  while (!(sim.clock.quarter === 4 && sim.clock.timeRemainingSec === 0)) {
    const stepped = stepPlay(sim, autoPickPlay(sim));
    sim = stepped.sim;
    safety += 1;
    if (safety > 6000) break;
  }

  return { homeScore: sim.homeScore, awayScore: sim.awayScore };
}
