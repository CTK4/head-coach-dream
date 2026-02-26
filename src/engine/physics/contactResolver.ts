import type { ResultTag } from "@/engine/gameSim";
import { CONTACT_BASE_TACKLE, CONTACT_PILE_TACKLE_BONUS, CONTACT_SHORT_YARDAGE_TACKLE_BONUS } from "@/engine/physics/constants";
import type { BounceSurface } from "@/engine/physics/bounce";
import { resolveMoveAdvantage } from "@/engine/physics/moveResolver";
import { resolveAngleBand } from "@/engine/physics/tackleAngle";
import { codSkill, effectiveMass, handStrength, ratingZ, reachIn } from "@/engine/physics/ratingsToKinematics";

export type ContactMove = "NONE" | "JUKE" | "SPIN" | "STIFF_ARM";
export type ContactContext = {
  angleDeg: number;
  padLevelOff01: number;
  padLevelDef01: number;
  shortYardage: boolean;
  pile: boolean;
  surface: BounceSurface;
};

type ContactAthlete = {
  weightLb: number;
  strength: number;
  balance: number;
  agility: number;
  accel: number;
  tackling: number;
  heightIn: number;
  jump: number;
  fatigue01: number;
};

export type ContactInput = {
  ballcarrier: ContactAthlete;
  tackler: ContactAthlete;
  move: { type: ContactMove; timing01: number };
  context: ContactContext;
};

export type ContactOutcome = {
  tackled: boolean;
  yacYards: number;
  brokenTackle: boolean;
  brokenType?: "ARM" | "LEG" | "HIGH";
  resultTags: ResultTag[];
  debug: Record<string, number>;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * RNG roll order (do not reorder):
 * 1) tackleRoll
 * 2) brokenTypeRoll (only if tackle failed)
 * 3) yacRoll
 */
export function resolveContact(input: ContactInput, rng: () => number): ContactOutcome {
  const angle = clamp(Math.abs(input.context.angleDeg), 0, 90);
  const angleHeadOn01 = 1 - angle / 90;
  const angleVariance = angle / 90;

  const offStrengthZ = ratingZ(input.ballcarrier.strength);
  const defStrengthZ = ratingZ(input.tackler.strength);
  const offBalanceZ = ratingZ(input.ballcarrier.balance);
  const defTackleZ = ratingZ(input.tackler.tackling);

  const offMass = effectiveMass(input.ballcarrier.weightLb, offStrengthZ, input.context.padLevelOff01, input.ballcarrier.fatigue01);
  const defMass = effectiveMass(input.tackler.weightLb, defStrengthZ, input.context.padLevelDef01, input.tackler.fatigue01);
  const leverageDelta = (input.context.padLevelDef01 - input.context.padLevelOff01) * 0.45 + defTackleZ * 0.2 - offBalanceZ * 0.12;

  const moveAdv = resolveMoveAdvantage({
    moveType: input.move.type,
    timing01: input.move.timing01,
    angleDeg: angle,
    ballcarrier: input.ballcarrier,
    tackler: input.tackler,
  });

  const pileBonus = (input.context.pile ? CONTACT_PILE_TACKLE_BONUS : 0) + (input.context.shortYardage ? CONTACT_SHORT_YARDAGE_TACKLE_BONUS : 0);
  const tackleProb = clamp(
    CONTACT_BASE_TACKLE
      + (defMass - offMass) / 520
      + angleHeadOn01 * 0.16
      + leverageDelta
      + pileBonus
      - moveAdv,
    0.08,
    0.96,
  );

  const tackleRoll = rng();
  const tackled = tackleRoll < tackleProb;

  let brokenType: "ARM" | "LEG" | "HIGH" | undefined;
  if (!tackled) {
    const brokenTypeRoll = rng();
    brokenType = brokenTypeRoll < 0.34 ? "ARM" : brokenTypeRoll < 0.7 ? "LEG" : "HIGH";
  }

  const yacRoll = rng();
  const yacBase = tackled ? 0.4 + yacRoll * (1 + angleVariance * 2.1) : 1.5 + yacRoll * (6 + angleVariance * 6);
  const spinVariance = input.move.type === "SPIN" ? (yacRoll - 0.5) * 3 : 0;
  let yacYards = Math.max(0, Math.round(yacBase + spinVariance));
  if (input.context.pile || input.context.shortYardage) yacYards = clamp(yacYards, 0, 3);

  const tags: ResultTag[] = [
    { kind: "EXECUTION", text: `ANGLE:${resolveAngleBand(angle).toLowerCase()}` },
  ];

  if (!tackled) tags.push({ kind: "MISMATCH", text: `BROKEN_TACKLE:${brokenType ?? "ARM"}` });

  return {
    tackled,
    yacYards,
    brokenTackle: !tackled,
    brokenType,
    resultTags: tags,
    debug: {
      tackleProb,
      tackleRoll,
      offMass,
      defMass,
      leverageDelta,
      moveAdv,
      yacBase,
    },
  };
}
