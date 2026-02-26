import type { ResultTag } from "@/engine/gameSim";
import { CATCH_BASE_COMPLETION, CATCH_BASE_INT } from "@/engine/physics/constants";
import { resolveFumble } from "@/engine/physics/fumbleResolver";
import { codSkill, ratingZ, reachIn } from "@/engine/physics/ratingsToKinematics";

export type CatchContact = "NONE" | "LIGHT" | "HEAVY";
export type CatchInput = {
  qb: { accuracy: number; arm: number; decision: number; pressure01: number; fatigue01: number };
  wr: { heightIn: number; weightLb: number; speed: number; hands: number; jump: number; strength: number; balance: number; fatigue01: number };
  cb: { heightIn: number; speed: number; coverage: number; ballSkills: number; strength: number; fatigue01: number };
  context: {
    targetDepth: "SHORT" | "MID" | "DEEP";
    separationYds: number;
    routeBreakSeverity01: number;
    highPoint: boolean;
    contactAtCatch: CatchContact;
    surface: "DRY" | "WET" | "SNOW";
    throwQualityAdj?: number;
    deepVarianceMult?: number;
    wobbleChance?: number;
  };
};

export type CatchOutcome = {
  completed: boolean;
  pbu: boolean;
  intercepted: boolean;
  yacYards: number;
  fumble: boolean;
  recoveredBy?: "OFFENSE" | "DEFENSE";
  catchType: "OPEN" | "CONTESTED" | "HIGH_POINT" | "THROUGH_CONTACT";
  resultTags: ResultTag[];
  debug: Record<string, number>;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * RNG roll order (do not reorder):
 * 1) sepNoiseRoll
 * 2) completionRoll
 * 3) if incomplete: pbuRoll
 * 4) if turnover-eligible: intRoll
 * 5) if completed: yacRoll
 * 6) if contactAtCatch != NONE: secureCatchRoll
 */
export function resolveCatchPoint(input: CatchInput, rng: () => number): CatchOutcome {
  const wrCod = codSkill(ratingZ(input.wr.speed), ratingZ(input.wr.balance));
  const cbCod = codSkill(ratingZ(input.cb.speed), ratingZ(input.cb.coverage));

  const sepNoiseRoll = rng();
  const sepNoise = (sepNoiseRoll - 0.5) * 0.8;
  const sepDelta = (wrCod - cbCod) * (0.35 + input.context.routeBreakSeverity01 * 0.85) + sepNoise;
  const effSeparation = input.context.separationYds + sepDelta;

  const throwQ = ratingZ(input.qb.accuracy)
    - input.qb.pressure01 * 0.7
    - input.qb.fatigue01 * 0.2
    + ratingZ(input.qb.arm) * 0.1
    + ratingZ(input.qb.decision) * 0.08;

  const reachAdvIn = reachIn(input.wr.heightIn, ratingZ(input.wr.jump)) - reachIn(input.cb.heightIn, 0);
  const skillDelta = ratingZ(input.wr.hands) - ratingZ(input.cb.coverage) + ratingZ(input.wr.strength) * 0.08;
  const highPointBonus = input.context.highPoint ? reachAdvIn * 0.05 : 0;

  const depthVariancePenalty = input.context.targetDepth === "DEEP" ? ((input.context.deepVarianceMult ?? 1) - 1) * 0.14 : 0;
  const completionProb = clamp(
    CATCH_BASE_COMPLETION + (throwQ + (input.context.throwQualityAdj ?? 0)) * 0.18 + effSeparation * 0.12 + skillDelta * 0.1 + highPointBonus - depthVariancePenalty,
    0.06,
    0.9,
  );

  const completionRoll = rng();
  let completed = completionRoll < completionProb;
  let pbu = false;
  let intercepted = false;
  let yacYards = 0;
  let fumble = false;
  let recoveredBy: "OFFENSE" | "DEFENSE" | undefined;
  const tags: ResultTag[] = [];

  if (!completed) {
    const pbuRoll = rng();
    pbu = pbuRoll < clamp(0.42 + ratingZ(input.cb.ballSkills) * 0.12 - effSeparation * 0.07, 0.1, 0.85);

    const turnoverEligible = input.context.targetDepth !== "SHORT" || effSeparation < 0.8;
    if (turnoverEligible) {
      const intRoll = rng();
      const intProb = clamp(CATCH_BASE_INT + ratingZ(input.cb.ballSkills) * 0.09 - ratingZ(input.qb.decision) * 0.08 + (pbu ? 0.05 : 0), 0.01, 0.32);
      intercepted = intRoll < intProb;
    }
  }

  if (completed) {
    const yacRoll = rng();
    const depthFactor = input.context.targetDepth === "SHORT" ? 1.2 : input.context.targetDepth === "MID" ? 1 : 0.8;
    yacYards = Math.max(0, Math.round((0.8 + yacRoll * 7 + Math.max(0, effSeparation) * 1.3) * depthFactor));

    if (input.context.contactAtCatch !== "NONE") {
      const secureCatchRoll = rng();
      const contactPenalty = input.context.contactAtCatch === "HEAVY" ? 0.36 : 0.2;
      const secureScore = ratingZ(input.wr.hands) * 0.45 + ratingZ(input.wr.strength) * 0.25 + ratingZ(input.wr.balance) * 0.3 - contactPenalty;
      const wetPenalty = input.context.surface === "WET" ? 0.11 : input.context.surface === "SNOW" ? 0.07 : 0;
      const secureProb = clamp(0.72 + secureScore - wetPenalty, 0.08, 0.98);
      if (secureCatchRoll > secureProb) {
        completed = false;
        yacYards = 0;
        tags.push({ kind: "MISTAKE", text: "THROUGH_CONTACT_DROP" });
      } else if (input.context.contactAtCatch === "HEAVY" && secureCatchRoll > secureProb - 0.12) {
        tags.push({ kind: "MISMATCH", text: "JARRED LOOSE RISK" });
      }

      if (completed && input.context.contactAtCatch === "HEAVY") {
        const fumbleOutcome = resolveFumble(
          {
            carrier: { balanceZ: ratingZ(input.wr.balance), strengthZ: ratingZ(input.wr.strength), fatigue01: input.wr.fatigue01 },
            hitter: { hitPowerZ: ratingZ(input.cb.strength), tackleZ: ratingZ(input.cb.coverage) },
            context: { impulseProxy: 1.2, surface: input.context.surface, contactType: "CATCH" },
          },
          rng,
        );
        fumble = fumbleOutcome.fumble;
        recoveredBy = fumbleOutcome.recoveredBy;
        tags.push(...fumbleOutcome.resultTags);
      }
    }
  }

  const catchType: CatchOutcome["catchType"] = !completed
    ? (input.context.highPoint ? "HIGH_POINT" : "CONTESTED")
    : input.context.contactAtCatch !== "NONE"
    ? "THROUGH_CONTACT"
    : input.context.highPoint
    ? "HIGH_POINT"
    : effSeparation >= 1.4
    ? "OPEN"
    : "CONTESTED";

  if (input.context.highPoint) tags.push({ kind: "EXECUTION", text: `HIGH_POINT_ADV:${reachAdvIn.toFixed(2)}` });

  return {
    completed,
    pbu,
    intercepted,
    yacYards,
    fumble,
    recoveredBy,
    catchType,
    resultTags: tags,
    debug: {
      sepDelta,
      effSeparation,
      throwQ,
      reachAdvIn,
      completionProb,
      completionRoll,
    },
  };
}
