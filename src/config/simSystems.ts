export const SIM_SYSTEMS_CONFIG = {
  /**
   * Trade pick base values by round (index 0 = round 1).
   * Calibrated so a mid-first (pick ~15) ≈ 500 pts, a late-sixth ≈ 40 pts.
   * A rebuild-stage modifier is applied on top in calculateTradeValue.
   */
  pickRoundBaseValues: [650, 400, 240, 140, 90, 60, 40] as readonly number[],

  offseason: {
    minimumCapBufferRatio: 0.04,
    eliteTagThreshold: 84,
    elitePositionTagBonus: {
      QB: 0.22,
      EDGE: 0.14,
      LT: 0.12,
      CB: 0.1,
      WR: 0.08,
    } as Record<string, number>,
    resign: {
      ageCurvePeak: 26,
      ageDeclinePerYear: 0.035,
      developmentBonusPerPoint: 0.012,
      contenderUrgency: 1.12,
      rebuildPatience: 0.9,
      maxCapPortionPerPlayer: 0.15,
    },
    freeAgency: {
      needWeight: 0.45,
      overallWeight: 0.35,
      valueWeight: 0.2,
      redundancyPenalty: 0.22,
    },
    draft: {
      needWeight: 0.4,
      schemeWeight: 0.2,
      contenderImmediateWeight: 0.3,
      rebuildDevWeight: 0.35,
      rebuildAgeWeight: 0.25,
    },
  },
  defense: {
    coverageCompletionImpact: 0.14,
    coverageDeepBallImpact: 0.2,
    coverageYacImpact: 0.1,
    frontRunYpcImpact: 0.16,
    frontSackImpact: 0.1,
    blitzSackImpact: 0.22,
    blitzExplosiveAllowedImpact: 0.12,
  },
  powerRankings: {
    recordWeight: 0.28,
    pointDifferentialWeight: 0.18,
    strengthOfScheduleWeight: 0.14,
    recentFormWeight: 0.16,
    offenseEfficiencyWeight: 0.12,
    defenseEfficiencyWeight: 0.12,
  },
  awards: {
    /**
     * passYards / passTds / ints apply when passYards is present (pocket QB path).
     * rushPassYards / rushPassTds apply as the fallback for dual-threat QBs, RBs,
     * and any candidate without passing stats — so Lamar-type seasons score properly.
     * teamWins is universal.
     */
    mvp: {
      passYards: 0.02, passTds: 4, ints: -2,
      rushPassYards: 0.015, rushPassTds: 3.5,
      teamWins: 3,
    },
    opoy: { yards: 0.03, tds: 5, explosiveBonus: 1.5 },
    dpoy: { sacks: 4.5, ints: 5, tfl: 1.4, teamDefenseBonus: 2 },
    roy: { yards: 0.025, tds: 4.5, snaps: 0.004 },
    coy: { wins: 4, pointDiff: 0.06, expectationDelta: 8 },
  },

  /**
   * blitzCoverageExposure scales how much blitz rate amplifies explosive plays
   * depending on coverage shell. Man coverage (Cover 0 / Cover 1) is most
   * exposed; zone backs off because underneath routes absorb blitz pressure.
   *
   *   Man  → 1.20  (blitzers leave man defenders isolated with no help)
   *   Cover2→ 0.92  (safeties provide middle help)
   *   Cover3→ 0.96  (zone drops give intermediate safety valve)
   *   Match → 0.88  (match coverage is the best at containing after the catch)
   */
  blitzCoverageExposure: {
    Man:    1.20,
    Cover2: 0.92,
    Cover3: 0.96,
    Match:  0.88,
  } as Record<string, number>,
  trade: {
    ageDeclineStart: 28,
    ageDeclinePerYear: 0.045,
    rookieContractBonus: 0.2,
    capHitPenaltyFactor: 0.17,
    deadCapPenaltyFactor: 0.08,
    contenderPrimeAgeBonus: 0.1,
    rebuildYouthBonus: 0.12,
  },
  progression: {
    snapShareWeight: 0.5,
    efficiencyWeight: 0.3,
    teamSuccessWeight: 0.2,
    breakoutThreshold: 0.78,
    regressionAgeStart: 30,
    regressionPerYear: 0.05,
    injurySetbackPenalty: 0.14,
  },
} as const;

export type SimSystemsConfig = typeof SIM_SYSTEMS_CONFIG;
