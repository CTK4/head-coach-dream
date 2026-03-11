import remapFile from "@/data/migrations/draftClassIdRemap_v1.json";
import { getTeams } from "@/data/leagueDb";
import { initGameSim, type GameSim } from "@/engine/gameSim";
import { initLeagueState, type LeagueState } from "@/engine/leagueSim";
import { OFFSEASON_STEPS } from "@/engine/offseason";
import { TRADE_DEADLINE_DEFAULT_WEEK, resolveTradeDeadlineWeek } from "@/engine/tradeDeadline";
import { migrateDraftClassIdsInSave } from "@/lib/migrations/migrateDraftClassIds";
import { DEFAULT_CALIBRATION_PACK_ID, DEFAULT_CONFIG_VERSION } from "@/engine/config/configRegistry";
import type { DraftState, GameState, OffseasonData, OffseasonState } from "@/context/GameContext";
import { deriveSaveSeedFromState } from "@/context/state/seedPolicy";
import { deriveCareerSeed, deriveScoutingBoardSeed } from "@/engine/determinism/seedDerivation";
import type { CareerStage } from "@/types/careerStage";

const OFFSEASON_STEP_TO_STAGE: Partial<Record<OffseasonState["stepId"], CareerStage>> = {
  RESIGNING: "RESIGN",
  COMBINE: "COMBINE",
  TAMPERING: "TAMPERING",
  FREE_AGENCY: "FREE_AGENCY",
  PRE_DRAFT: "PRE_DRAFT",
  DRAFT: "DRAFT",
  TRAINING_CAMP: "TRAINING_CAMP",
  PRESEASON: "PRESEASON",
  CUT_DOWNS: "OFFSEASON_HUB",
};



const DRAFT_CLASS_ID_REMAP: Record<string, string> = Object.fromEntries(Object.entries((remapFile as { remap?: Record<string, string> }).remap ?? {}).map(([from, to]) => [String(from), String(to)]));

function remapDraftProspectId(id: unknown): string {
  const normalized = String(id ?? "");
  return DRAFT_CLASS_ID_REMAP[normalized] ?? normalized;
}

function isEmptyMigrationPayload(value: unknown): boolean {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim().length === 0;
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length === 0;
  return false;
}

function mergeRemappedKeyedMap<T>(args: { canonicalMap?: Record<string, T>; legacyMap?: Record<string, T>; validIds: Set<string> }): Record<string, T> {
  const { canonicalMap, legacyMap, validIds } = args;
  const out: Record<string, T> = {};

  for (const [rawId, value] of Object.entries(canonicalMap ?? {})) {
    const id = remapDraftProspectId(rawId);
    if (!validIds.has(id)) continue;
    out[id] = value;
  }

  for (const [rawId, value] of Object.entries(legacyMap ?? {})) {
    const id = remapDraftProspectId(rawId);
    if (!validIds.has(id)) continue;
    if (!(id in out) || (isEmptyMigrationPayload(out[id]) && !isEmptyMigrationPayload(value))) out[id] = value;
  }

  return out;
}

function isMigratedScaffoldScoutProfile(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const snapshotWindow = (value as { lastSnapshot?: { windowKey?: unknown } }).lastSnapshot?.windowKey;
  return String(snapshotWindow ?? "") === "migrated";
}

function mergeRemappedBoardOrder(args: { canonicalOrder?: string[]; legacyOrder?: string[]; validIds: Set<string> }): string[] {
  const { canonicalOrder, legacyOrder, validIds } = args;
  const seen = new Set<string>();
  const out: string[] = [];

  for (const rawId of [...(canonicalOrder ?? []), ...(legacyOrder ?? [])]) {
    const id = remapDraftProspectId(rawId);
    if (!validIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }

  return out;
}

const OFFSEASON_STAGE_SET = new Set<CareerStage>([
  "OFFSEASON_HUB",
  "RESIGN",
  "COMBINE",
  "TAMPERING",
  "FREE_AGENCY",
  "PRE_DRAFT",
  "DRAFT",
  "TRAINING_CAMP",
  "PRESEASON",
]);


function inferLegacyCareerStage(oldState: Partial<GameState>): CareerStage {
  const leaguePhase = String(oldState.league?.phase ?? "").toUpperCase();

  if (leaguePhase === "OFFSEASON") return "OFFSEASON_HUB";
  if (leaguePhase === "PRESEASON") return "PRESEASON";
  if (leaguePhase === "REGULAR_SEASON" || leaguePhase === "REGULAR_SEASON_GAME" || leaguePhase === "REGULAR_SEASON_GAMEPLAN") {
    return "REGULAR_SEASON";
  }
  if (leaguePhase === "WILD_CARD" || leaguePhase === "DIVISIONAL" || leaguePhase === "CONFERENCE" || leaguePhase === "SUPER_BOWL") {
    return "PLAYOFFS";
  }

  const playoffRound = String((oldState as any).playoffs?.round ?? "").toUpperCase();
  if (playoffRound === "WILD_CARD" || playoffRound === "DIVISIONAL" || playoffRound === "CONFERENCE" || playoffRound === "CHAMPIONSHIP") {
    return "PLAYOFFS";
  }

  return "OFFSEASON_HUB";
}

interface MigrateSaveDependencies {
  createSchedule: (seed: number) => GameState["hub"]["schedule"];
  ensureNewsItems: (items: unknown, now: number) => GameState["hub"]["news"];
  ensureOffseasonCombineData: (state: GameState) => GameState;
  ensureAccolades: (state: GameState) => GameState;
  bootstrapAccolades: (state: GameState) => GameState;
  COMBINE_DEFAULT_INTERVIEW_TOKENS: number;
  DEFAULT_OFFENSE_SCHEME_ID: string;
  DEFAULT_DEFENSE_SCHEME_ID: string;
  DEFAULT_STRATEGY: Record<string, unknown>;
  normalizePriorityList: (value: unknown) => string[];
  LEAGUE_SALARY_CAP: number;
  getPlayers: () => Array<{ playerId: string | number }>;
  clampFatigue: (value: number) => number;
  FATIGUE_DEFAULT: number;
  migratePracticePlan: (plan: unknown) => GameState["practicePlan"];
  DEFAULT_PRACTICE_PLAN: { neglectWeeks: Record<string, number> };
  generateDraftClass: (input: { year: number; count: number; leagueSeed: number; saveSlotId: number }) => GameState["upcomingDraftClass"];
  getActiveSaveId: () => string | null;
  maxExistingPlayerNumericId: () => number;
  OffseasonStepEnum: { TAMPERING: GameState["offseason"]["stepId"]; FREE_AGENCY: GameState["offseason"]["stepId"] };
  clamp: (value: number, min: number, max: number) => number;
  COMBINE_DAY_COUNT: number;
  defaultCombineDays: () => Record<1 | 2 | 3 | 4, { dayIndex: 1 | 2 | 3 | 4; categoryKey: string; interviewsRemaining: number }>;
}

export function ensureLeagueGmMap(state: GameState): GameState {
  const ids = Object.keys(state.league?.standings ?? {});
  const gmByTeamId = state.league?.gmByTeamId ?? {};
  if (ids.length && Object.keys(gmByTeamId).length === ids.length) return state;
  const seeded = initLeagueState(ids.length ? ids : getTeams().map((t) => t.teamId), state.saveSeed);
  return { ...state, league: { ...state.league, gmByTeamId: { ...seeded.gmByTeamId, ...gmByTeamId } } };
}

export function migrateSave(oldState: Partial<GameState>, deps: MigrateSaveDependencies): Partial<GameState> {
  const teams = getTeams().filter((t) => t.isActive).map((t) => t.teamId);
  // Preserve the existing saveSeed to ensure deterministic simulation replay.
  // If missing, derive one from persisted legacy fields.
  const saveSeed = deriveSaveSeedFromState(oldState as Parameters<typeof deriveSaveSeedFromState>[0]);
  const league = oldState.league ?? initLeagueState(teams, Number(oldState.season ?? 2026));
  const schedule = oldState.hub?.schedule ?? deps.createSchedule(saveSeed);
  const now = Number(oldState.season ?? 2026) * 1_000_000 + Number(oldState.week ?? 1) * 10_000;
  const migratedNews = deps.ensureNewsItems((oldState as any).hub?.news, now);
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
  }
  normalizedLeague.tradeDeadlineWeek = resolveTradeDeadlineWeek((normalizedLeague as any).tradeDeadlineWeek);
  normalizedLeague.week = Number((normalizedLeague as any).week ?? Number(oldState.week ?? 1));

  const VALID_MIGRATE_PHASES = new Set(["CREATE", "BACKGROUND", "INTERVIEWS", "OFFERS", "COORD_HIRING", "HUB"]);
  const normalizedPhase = VALID_MIGRATE_PHASES.has(String(oldState.phase ?? "")) ? oldState.phase : "HUB";

  let s: Partial<GameState> = {
    ...oldState,
    configVersion: String((oldState as any).configVersion ?? DEFAULT_CONFIG_VERSION),
    calibrationPackId: String((oldState as any).calibrationPackId ?? DEFAULT_CALIBRATION_PACK_ID),
    phase: normalizedPhase as GameState["phase"],
    saveSeed,
    season: Number((oldState as any).season ?? 2026),
    week: Number((oldState as any).week ?? 1),
    careerSeed: Number((oldState as any).careerSeed ?? deriveCareerSeed(saveSeed)),
    careerStage: (oldState.careerStage as CareerStage) ?? inferLegacyCareerStage(oldState),
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
        combine: { prospects: [], results: {}, generated: false, resultsByProspectId: {}, interviewPoolIds: [], lastRunSeed: 0, shortlist: {} },
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
          decisionReasonByPlayerId: {},
        },
        preDraft: { board: [], visits: {}, workouts: {}, reveals: {}, viewMode: "CONSENSUS", intelByProspectId: {} },
        draft: { board: [], picks: [], completed: false },
        camp: { settings: { intensity: "NORMAL", installFocus: "BALANCED", positionFocus: "NONE" } },
        cutDowns: { decisions: {} },
      } as OffseasonData),
    scheme: {
      offense: {
        style: oldState.scheme?.offense?.style ?? "BALANCED",
        tempo: oldState.scheme?.offense?.tempo ?? "NORMAL",
        schemeId: oldState.scheme?.offense?.schemeId ?? "PRO_STYLE_BALANCED",
      },
      defense: {
        style: oldState.scheme?.defense?.style ?? "MIXED",
        aggression: oldState.scheme?.defense?.aggression ?? "NORMAL",
        schemeId: oldState.scheme?.defense?.schemeId ?? "MULTIPLE_HYBRID",
      },
    },
    playbooks: {
      offensePlaybookId: ((oldState as any).playbooks?.offensePlaybookId ?? oldState.scheme?.offense?.schemeId ?? deps.DEFAULT_OFFENSE_SCHEME_ID) as GameState["playbooks"]["offensePlaybookId"],
      defensePlaybookId: ((oldState as any).playbooks?.defensePlaybookId ?? oldState.scheme?.defense?.schemeId ?? deps.DEFAULT_DEFENSE_SCHEME_ID) as GameState["playbooks"]["defensePlaybookId"],
      userOverride: {
        offense: Boolean((oldState as any).playbooks?.userOverride?.offense),
        defense: Boolean((oldState as any).playbooks?.userOverride?.defense),
      },
    },
    strategy: { ...deps.DEFAULT_STRATEGY, ...((oldState as any).strategy ?? {}), draftFaPriorities: deps.normalizePriorityList((oldState as any).strategy?.draftFaPriorities) },
    scouting: oldState.scouting ?? { boardSeed: deriveScoutingBoardSeed(saveSeed) },
    hub: {
      ...(oldState.hub ?? ({} as any)),
      news: migratedNews,
      newsReadIds,
      newsFilter: String((oldState as any).hub?.newsFilter ?? "ALL"),
      schedule,
      preseasonWeek: oldState.hub?.preseasonWeek ?? 1,
      regularSeasonWeek: oldState.hub?.regularSeasonWeek ?? 1,
    },
    offseasonNews: [],
    newsHistory: Array.isArray((oldState as any).newsHistory) ? (oldState as any).newsHistory : [],
    retiredPlayers: Array.isArray((oldState as any).retiredPlayers) ? (oldState as any).retiredPlayers : [],
    playerAgingDeltasById: { ...((oldState as any).playerAgingDeltasById ?? {}) },
    playerAttributeDeltasById: { ...((oldState as any).playerAttributeDeltasById ?? {}) },
    playerAgeOffsetById: { ...((oldState as any).playerAgeOffsetById ?? {}) },
    playerSnapCountsById: { ...((oldState as any).playerSnapCountsById ?? {}) },
    playerProgressionSeasonStatsById: { ...((oldState as any).playerProgressionSeasonStatsById ?? {}) },
    playerDevelopmentById: { ...((oldState as any).playerDevelopmentById ?? {}) },
    playerBadges: { ...((oldState as any).playerBadges ?? {}) },
    playerUnicorns: { ...((oldState as any).playerUnicorns ?? {}) },
    finances:
      (oldState as any).finances ??
      {
        cap: deps.LEAGUE_SALARY_CAP,
        carryover: 0,
        incentiveTrueUps: 0,
        deadCapThisYear: 0,
        deadCapNextYear: 0,
        baseCommitted: 0,
        capCommitted: 0,
        capSpace: deps.LEAGUE_SALARY_CAP,
        cash: 150_000_000,
        postJune1Sim: false,
      },
    staffBudget: (oldState as any).staffBudget ?? { total: 23_000_000, used: 0, byPersonId: {} },
    teamFinances: (oldState as any).teamFinances ?? { cash: 60_000_000, deadMoneyBySeason: {} },
    memoryLog: Array.isArray((oldState as any).memoryLog) ? (oldState as any).memoryLog : [],
    league: normalizedLeague,
    teamGameplans: { ...((oldState as any).teamGameplans ?? {}) },
    weatherByGameKey: { ...((oldState as any).weatherByGameKey ?? {}) },
    game,
    playerFatigueById: Object.fromEntries(deps.getPlayers().map((pl) => {
      const v = (oldState as any).playerFatigueById?.[String(pl.playerId)];
      return [String(pl.playerId), { fatigue: deps.clampFatigue(Number(v?.fatigue ?? deps.FATIGUE_DEFAULT)), last3SnapLoads: Array.isArray(v?.last3SnapLoads) ? v.last3SnapLoads.map((n: unknown) => Math.max(0, Number(n) || 0)).slice(-3) : [] }];
    })),
    practicePlan: deps.migratePracticePlan((oldState as any).practicePlan),
    practicePlanConfirmed: Boolean((oldState as any).practicePlanConfirmed ?? false),
    practiceNeglectCounters: {
      ...deps.DEFAULT_PRACTICE_PLAN.neglectWeeks,
      ...((oldState as any).practiceNeglectCounters ?? {}),
    },
    cumulativeNeglectPenalty: Number((oldState as any).cumulativeNeglectPenalty ?? 0),
    weeklyFamiliarityBonus: Number((oldState as any).weeklyFamiliarityBonus ?? 0),
    weeklyMentalErrorMod: Number((oldState as any).weeklyMentalErrorMod ?? 0),
    weeklySchemeConceptBonus: Number((oldState as any).weeklySchemeConceptBonus ?? 0),
    weeklyLateGameRetentionBonus: Number((oldState as any).weeklyLateGameRetentionBonus ?? 0),
    nextGameInjuryRiskMod: Number((oldState as any).nextGameInjuryRiskMod ?? 0),
    lastPracticeOutcomeSummary: (oldState as any).lastPracticeOutcomeSummary,
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
      prospectPool: deps.generateDraftClass({ year: Number((oldState as any).season ?? 2026), count: 224, leagueSeed: saveSeed, saveSlotId: Number(deps.getActiveSaveId() ?? 0) || 0 }),
      appliedSelectionCount: 0,
    }) as DraftState,
    upcomingDraftClass: (oldState as any).upcomingDraftClass ?? deps.generateDraftClass({ year: Number((oldState as any).season ?? 2026), count: 224, leagueSeed: saveSeed, saveSlotId: Number(deps.getActiveSaveId() ?? 0) || 0 }),
    futureClasses: (oldState as any).futureClasses ?? {},
    rookies: oldState.rookies ?? [],
    rookieContracts: oldState.rookieContracts ?? {},
    nextPlayerId: Number((oldState as any).nextPlayerId ?? (deps.maxExistingPlayerNumericId() + 1)),
    firing: oldState.firing ?? { pWeekly: 0, pSeasonEnd: 0, drivers: [], lastWeekComputed: 0, lastSeasonComputed: 0, fired: false },
    depthChart: nextDepthChart,
    leagueDepthCharts: (oldState as any).leagueDepthCharts ?? {},
    playerAccolades: (oldState as any).playerAccolades ?? {},
    contracts: (oldState as any).contracts ?? { playerTeamInterestById: {} },
    resign: (oldState as any).resign ?? { lastOfferAavByPlayerId: {}, rejectionCountByPlayerId: {} },
    telemetry: {
      playLogsByGameKey: { ...((oldState as any).telemetry?.playLogsByGameKey ?? {}) },
      gameAggsByGameKey: { ...((oldState as any).telemetry?.gameAggsByGameKey ?? {}) },
      seasonAgg: {
        version: 1 as const,
        appliedGameKeys: { ...((oldState as any).telemetry?.seasonAgg?.appliedGameKeys ?? {}) },
        byTeamId: { ...((oldState as any).telemetry?.seasonAgg?.byTeamId ?? {}) },
      },
      percentiles: { ...((oldState as any).telemetry?.percentiles ?? {}) },
    },
    historicalTelemetry: {
      bySeason: { ...((oldState as any).historicalTelemetry?.bySeason ?? {}) },
    },
    ui: (oldState as any).ui ?? {},
  };

  if (s.offseason?.stepId === deps.OffseasonStepEnum.TAMPERING) {
    s.offseason = { ...s.offseason, stepId: deps.OffseasonStepEnum.FREE_AGENCY };
  }
  if (s.careerStage === "TAMPERING") {
    s.careerStage = "FREE_AGENCY";
  }
  const inferredOffseasonStage = OFFSEASON_STEP_TO_STAGE[s.offseason?.stepId as OffseasonState["stepId"]];
  if (inferredOffseasonStage) {
    const currentCareerStage = (s.careerStage as CareerStage) ?? "OFFSEASON_HUB";
    const priorCareerStage = oldState.careerStage as CareerStage | undefined;
    const hasExplicitOffseasonCareerStage = !!priorCareerStage && OFFSEASON_STAGE_SET.has(priorCareerStage);
    const hasOffseasonLeagueSignal = String(oldState.league?.phase ?? "").toUpperCase() === "OFFSEASON";
    const shouldAlignOffseasonStage = hasExplicitOffseasonCareerStage
      || (!priorCareerStage && hasOffseasonLeagueSignal);
    if (shouldAlignOffseasonStage && currentCareerStage !== inferredOffseasonStage) {
      s.careerStage = inferredOffseasonStage;
    }
  }
  const scoutingState = (s as any).scoutingState;
  if (scoutingState?.combine) {
    const legacyDay = Number(scoutingState.combine.day ?? 1);
    const normalizedDay = deps.clamp(legacyDay, 1, deps.COMBINE_DAY_COUNT) as 1 | 2 | 3 | 4;
    const legacyInterviews = Number(scoutingState.interviews?.interviewsRemaining ?? deps.COMBINE_DEFAULT_INTERVIEW_TOKENS);
    const nextDays = deps.defaultCombineDays();
    const savedDays = scoutingState.combine.days ?? {};
    for (let d = 1; d <= deps.COMBINE_DAY_COUNT; d++) {
      const saved = savedDays[d] ?? savedDays[String(d)] ?? {};
      nextDays[d as 1 | 2 | 3 | 4] = {
        dayIndex: d as 1 | 2 | 3 | 4,
        categoryKey: String(saved.categoryKey ?? nextDays[d as 1 | 2 | 3 | 4].categoryKey),
        interviewsRemaining: deps.clamp(Number(saved.interviewsRemaining ?? deps.COMBINE_DEFAULT_INTERVIEW_TOKENS), 0, deps.COMBINE_DEFAULT_INTERVIEW_TOKENS),
      };
    }
    if (!scoutingState.combine.days) {
      nextDays[normalizedDay].interviewsRemaining = deps.clamp(legacyInterviews, 0, deps.COMBINE_DEFAULT_INTERVIEW_TOKENS);
    }

    const legacyProspects = scoutingState.combine.prospects ?? {};
    const prospects: Record<string, { characterRevealPct: number; intelligenceRevealPct: number; interviewCount: number; notes: string[] }> = {};
    for (const [prospectId, raw] of Object.entries<any>(legacyProspects)) {
      prospects[String(prospectId)] = {
        characterRevealPct: deps.clamp(Number((raw as any)?.characterRevealPct ?? 0), 0, 100),
        intelligenceRevealPct: deps.clamp(Number((raw as any)?.intelligenceRevealPct ?? 0), 0, 100),
        interviewCount: Math.max(0, Number((raw as any)?.interviewCount ?? 0) || 0),
        notes: Array.isArray((raw as any)?.notes) ? (raw as any).notes.map(String) : [],
      };
    }

    scoutingState.combine = {
      ...scoutingState.combine,
      day: normalizedDay,
      selectedByDay: scoutingState.combine.selectedByDay ?? {},
      interviewResultsByProspectId: scoutingState.combine.interviewResultsByProspectId ?? {},
      days: nextDays,
      prospects,
      recapByDay: Object.fromEntries(
        Object.entries(scoutingState.combine.recapByDay ?? {}).filter(([k]) => {
          const day = Number(k);
          return Number.isFinite(day) && day >= 1 && day <= deps.COMBINE_DAY_COUNT;
        }),
      ),
    };
    delete scoutingState.combine.hoursRemaining;
  }

  const canonicalProspectIds = ((s as any).upcomingDraftClass ?? []).map((row: any, i: number) => String(row?.id ?? row?.prospectId ?? row?.["Player ID"] ?? `DC_${i + 1}`));
  const defaultScoutProfiles = Object.fromEntries(canonicalProspectIds.map((id: string) => {
    const row = ((s as any).upcomingDraftClass ?? []).find((p: any) => String(p?.id ?? p?.prospectId ?? p?.["Player ID"]) === id) ?? {};
    const grade = Number(row?.grade ?? row?.ovr ?? row?.["Grade"] ?? 75);
    const estCenter = Number.isFinite(grade) ? Math.max(40, Math.min(99, Math.round(grade))) : 75;
    return [id, {
      prospectId: id,
      estCenter,
      estWidth: 20,
      estLow: Math.max(40, estCenter - 10),
      estHigh: Math.min(99, estCenter + 10),
      confidence: 20,
      clarity: { TALENT: 0, MED: 0, CHAR: 0, FIT: 0 },
      revealed: {},
      lastSnapshot: { windowKey: "migrated", estCenter },
      stockArrow: "FLAT",
      notes: {},
    }];
  }));

  if (scoutingState) {
    scoutingState.scoutProfiles = {
      ...(canonicalProspectIds.length ? defaultScoutProfiles : {}),
      ...(scoutingState.scoutProfiles ?? {}),
    };
    scoutingState.myBoardOrder = Array.isArray(scoutingState.myBoardOrder) && scoutingState.myBoardOrder.length
      ? scoutingState.myBoardOrder
      : canonicalProspectIds;
    scoutingState.combine = {
      generated: Boolean(scoutingState.combine?.generated),
      day: deps.clamp(Number(scoutingState.combine?.day ?? 1), 1, deps.COMBINE_DAY_COUNT),
      selectedByDay: scoutingState.combine?.selectedByDay ?? {},
      interviewResultsByProspectId: scoutingState.combine?.interviewResultsByProspectId ?? {},
      days: scoutingState.combine?.days ?? deps.defaultCombineDays(),
      prospects: scoutingState.combine?.prospects ?? {},
      resultsByProspectId: scoutingState.combine?.resultsByProspectId ?? {},
      feed: scoutingState.combine?.feed ?? [],
      recapByDay: scoutingState.combine?.recapByDay ?? {},
    };
    scoutingState.interviews = {
      interviewsRemaining: Number(scoutingState.interviews?.interviewsRemaining ?? deps.COMBINE_DEFAULT_INTERVIEW_TOKENS),
      history: scoutingState.interviews?.history ?? {},
      modelARevealByProspectId: scoutingState.interviews?.modelARevealByProspectId ?? {},
      resultsByProspectId: scoutingState.interviews?.resultsByProspectId ?? {},
    };
    scoutingState.medical = {
      requests: scoutingState.medical?.requests ?? {},
      resultsByProspectId: scoutingState.medical?.resultsByProspectId ?? {},
    };
    scoutingState.workouts = {
      resultsByProspectId: scoutingState.workouts?.resultsByProspectId ?? {},
    };
  }

  // Canonical scouting invariant after hydration: required scouting containers always exist; keyed records are aligned to canonical draft IDs in a post-migration pass.
  if (!s.scoutingState) {
    s = {
      ...s,
      scoutingState: {
        myBoardOrder: canonicalProspectIds,
        scoutProfiles: defaultScoutProfiles,
        combine: { generated: false, day: 1, selectedByDay: {}, interviewResultsByProspectId: {}, days: deps.defaultCombineDays(), prospects: {}, resultsByProspectId: {}, feed: [], recapByDay: {} },
        interviews: { interviewsRemaining: deps.COMBINE_DEFAULT_INTERVIEW_TOKENS, history: {}, modelARevealByProspectId: {}, resultsByProspectId: {} },
        medical: { requests: {}, resultsByProspectId: {} },
        workouts: { resultsByProspectId: {} },
      } as any,
    };
  }

  const sourceScoutingState = (oldState as any).scoutingState;
  const scoutingBeforeIdMigration = sourceScoutingState
    ? {
      myBoardOrder: Array.isArray(sourceScoutingState.myBoardOrder) ? [...sourceScoutingState.myBoardOrder] : [],
      scoutProfiles: { ...(sourceScoutingState.scoutProfiles ?? {}) },
      combineProspects: { ...(sourceScoutingState.combine?.prospects ?? {}) },
      combineResultsByProspectId: { ...(sourceScoutingState.combine?.resultsByProspectId ?? {}) },
      combineInterviewResultsByProspectId: { ...(sourceScoutingState.combine?.interviewResultsByProspectId ?? {}) },
      interviewHistory: { ...(sourceScoutingState.interviews?.history ?? {}) },
      interviewRevealByProspectId: { ...(sourceScoutingState.interviews?.modelARevealByProspectId ?? {}) },
      interviewResultsByProspectId: { ...(sourceScoutingState.interviews?.resultsByProspectId ?? {}) },
      medicalRequests: { ...(sourceScoutingState.medical?.requests ?? {}) },
      medicalResultsByProspectId: { ...(sourceScoutingState.medical?.resultsByProspectId ?? {}) },
      workoutResultsByProspectId: { ...(sourceScoutingState.workouts?.resultsByProspectId ?? {}) },
    }
    : null;

  s = deps.ensureOffseasonCombineData(s as GameState);
  s = migrateDraftClassIdsInSave(s);

  const postMigrationProspectIds = ((s as any).upcomingDraftClass ?? []).map((row: any, i: number) => String(row?.id ?? row?.prospectId ?? row?.["Player ID"] ?? `DC_${i + 1}`));
  const postMigrationProspectIdSet = new Set<string>(postMigrationProspectIds);

  const scoutingAfterIdMigration = (s as any).scoutingState ?? {};
  const existingProfiles = scoutingAfterIdMigration.scoutProfiles ?? {};
  if (postMigrationProspectIds.length > 0) {
    const remappedLegacyScoutProfiles = mergeRemappedKeyedMap({
      canonicalMap: {},
      legacyMap: scoutingBeforeIdMigration?.scoutProfiles,
      validIds: postMigrationProspectIdSet,
    });
    scoutingAfterIdMigration.scoutProfiles = Object.fromEntries(postMigrationProspectIds.map((id: string) => {
      const canonicalProfile = existingProfiles[id];
      const legacyProfile = remappedLegacyScoutProfiles[id];
      const selectedProfile =
        canonicalProfile == null
          ? legacyProfile
          : isMigratedScaffoldScoutProfile(canonicalProfile) && !isEmptyMigrationPayload(legacyProfile)
            ? legacyProfile
            : isEmptyMigrationPayload(canonicalProfile) && !isEmptyMigrationPayload(legacyProfile)
              ? legacyProfile
              : canonicalProfile;

      return [id, selectedProfile ?? {
        prospectId: id,
        estCenter: 75,
        estWidth: 20,
        estLow: 65,
        estHigh: 85,
        confidence: 20,
        clarity: { TALENT: 0, MED: 0, CHAR: 0, FIT: 0 },
        revealed: {},
        lastSnapshot: { windowKey: "migrated", estCenter: 75 },
        stockArrow: "FLAT",
        notes: {},
      }];
    }));
    scoutingAfterIdMigration.myBoardOrder = mergeRemappedBoardOrder({
      canonicalOrder: Array.isArray(scoutingAfterIdMigration.myBoardOrder) ? scoutingAfterIdMigration.myBoardOrder : postMigrationProspectIds,
      legacyOrder: scoutingBeforeIdMigration?.myBoardOrder,
      validIds: postMigrationProspectIdSet,
    });
    scoutingAfterIdMigration.combine = {
      ...(scoutingAfterIdMigration.combine ?? { generated: false, day: 1, selectedByDay: {}, interviewResultsByProspectId: {}, days: deps.defaultCombineDays(), prospects: {}, resultsByProspectId: {}, feed: [], recapByDay: {} }),
      prospects: mergeRemappedKeyedMap({ canonicalMap: scoutingAfterIdMigration.combine?.prospects, legacyMap: scoutingBeforeIdMigration?.combineProspects, validIds: postMigrationProspectIdSet }),
      resultsByProspectId: mergeRemappedKeyedMap({ canonicalMap: scoutingAfterIdMigration.combine?.resultsByProspectId, legacyMap: scoutingBeforeIdMigration?.combineResultsByProspectId, validIds: postMigrationProspectIdSet }),
      interviewResultsByProspectId: mergeRemappedKeyedMap({ canonicalMap: scoutingAfterIdMigration.combine?.interviewResultsByProspectId, legacyMap: scoutingBeforeIdMigration?.combineInterviewResultsByProspectId, validIds: postMigrationProspectIdSet }),
    };
    scoutingAfterIdMigration.interviews = {
      ...(scoutingAfterIdMigration.interviews ?? { interviewsRemaining: deps.COMBINE_DEFAULT_INTERVIEW_TOKENS, history: {}, modelARevealByProspectId: {}, resultsByProspectId: {} }),
      history: mergeRemappedKeyedMap({ canonicalMap: scoutingAfterIdMigration.interviews?.history, legacyMap: scoutingBeforeIdMigration?.interviewHistory, validIds: postMigrationProspectIdSet }),
      modelARevealByProspectId: mergeRemappedKeyedMap({ canonicalMap: scoutingAfterIdMigration.interviews?.modelARevealByProspectId, legacyMap: scoutingBeforeIdMigration?.interviewRevealByProspectId, validIds: postMigrationProspectIdSet }),
      resultsByProspectId: mergeRemappedKeyedMap({ canonicalMap: scoutingAfterIdMigration.interviews?.resultsByProspectId, legacyMap: scoutingBeforeIdMigration?.interviewResultsByProspectId, validIds: postMigrationProspectIdSet }),
    };
    scoutingAfterIdMigration.medical = {
      ...(scoutingAfterIdMigration.medical ?? { requests: {}, resultsByProspectId: {} }),
      requests: mergeRemappedKeyedMap({ canonicalMap: scoutingAfterIdMigration.medical?.requests, legacyMap: scoutingBeforeIdMigration?.medicalRequests, validIds: postMigrationProspectIdSet }),
      resultsByProspectId: mergeRemappedKeyedMap({ canonicalMap: scoutingAfterIdMigration.medical?.resultsByProspectId, legacyMap: scoutingBeforeIdMigration?.medicalResultsByProspectId, validIds: postMigrationProspectIdSet }),
    };
    scoutingAfterIdMigration.workouts = {
      ...(scoutingAfterIdMigration.workouts ?? { resultsByProspectId: {} }),
      resultsByProspectId: mergeRemappedKeyedMap({ canonicalMap: scoutingAfterIdMigration.workouts?.resultsByProspectId, legacyMap: scoutingBeforeIdMigration?.workoutResultsByProspectId, validIds: postMigrationProspectIdSet }),
    };
    s = { ...(s as any), scoutingState: scoutingAfterIdMigration };
  }

  s = deps.ensureAccolades(deps.bootstrapAccolades(s as GameState));
  return ensureLeagueGmMap(s as GameState);
}
