import draftClassJson from "@/data/draftClass.json";
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
  const saveSeed = deriveSaveSeedFromState(oldState);
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

  if (scoutingState) {
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

  // Ensure scoutingState has at minimum a myBoardOrder so migrations can validate IDs
  if (!s.scoutingState) {
    const boardOrder = (draftClassJson as any[]).map((row: any, i: number) => String(row["Player ID"] ?? `DC_${i + 1}`));
    s = { ...s, scoutingState: { myBoardOrder: boardOrder } as any };
  }

  s = deps.ensureOffseasonCombineData(s as GameState);
  s = migrateDraftClassIdsInSave(s);
  s = deps.ensureAccolades(deps.bootstrapAccolades(s as GameState));
  return ensureLeagueGmMap(s as GameState);
}

