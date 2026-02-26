import type { ResultTag } from "@/engine/gameSim";
import { CONTACT_BASE_FUMBLE, CONTACT_BASE_TACKLE, CONTACT_PILE_TACKLE_BONUS, CONTACT_SHORT_YARDAGE_TACKLE_BONUS } from "@/engine/physics/constants";
import { resolveBounce, type BounceSurface } from "@/engine/physics/bounce";
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
  fumble: boolean;
  recoveredBy?: "OFFENSE" | "DEFENSE";
  resultTags: ResultTag[];
  debug: Record<string, number>;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * RNG roll order (do not reorder):
 * 1) tackleRoll
 * 2) brokenTypeRoll (only if tackle failed)
 * 3) yacRoll
 * 4) fumbleRoll
 * 5) bounceRoll(s) (only if fumble)
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

  const offCod = codSkill(ratingZ(input.ballcarrier.agility), ratingZ(input.ballcarrier.accel));
  const defCod = codSkill(ratingZ(input.tackler.agility), ratingZ(input.tackler.accel));
  const reachAdv = reachIn(input.ballcarrier.heightIn, ratingZ(input.ballcarrier.jump)) - reachIn(input.tackler.heightIn, ratingZ(input.tackler.jump));

  let moveAdv = 0;
  if (input.move.type === "JUKE") {
    moveAdv = (offCod - defCod) * (0.2 + angleVariance * 0.55) + input.move.timing01 * 0.16;
  } else if (input.move.type === "SPIN") {
    moveAdv = (offBalanceZ - defTackleZ) * 0.2 + 0.03;
  } else if (input.move.type === "STIFF_ARM") {
    moveAdv = handStrength(offStrengthZ) * 0.08 + reachAdv * 0.014 + (angle > 20 ? 0.08 : 0);
  }

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

  const fumbleRoll = rng();
  const spinRisk = input.move.type === "SPIN" ? 0.012 : 0;
  const contactLoad = tackled ? 0.012 : 0.006;
  const fumbleProb = clamp(
    CONTACT_BASE_FUMBLE + spinRisk + contactLoad + (input.context.surface === "WET" ? 0.006 : input.context.surface === "SNOW" ? 0.01 : 0),
    0.002,
    0.08,
  );
  const fumble = fumbleRoll < fumbleProb;

  let recoveredBy: "OFFENSE" | "DEFENSE" | undefined;
  const tags: ResultTag[] = [
    { kind: "EXECUTION", text: `ANGLE:${angle <= 20 ? "head-on" : angle <= 55 ? "inside" : "glancing"}` },
  ];

  if (!tackled) tags.push({ kind: "MISMATCH", text: `BROKEN_TACKLE:${brokenType ?? "ARM"}` });

  if (fumble) {
    const bounce = resolveBounce({ baseRecoveryBias01: 0.48 + (tackled ? -0.03 : 0.04), surface: input.context.surface }, rng);
    recoveredBy = rng() < bounce.recoveryBias01 ? "OFFENSE" : "DEFENSE";
    tags.push({ kind: "MISTAKE", text: `FUMBLE:${recoveredBy}` });
  }

  return {
    tackled,
    yacYards,
    brokenTackle: !tackled,
    brokenType,
    fumble,
    recoveredBy,
    resultTags: tags,
    debug: {
      tackleProb,
      tackleRoll,
      offMass,
      defMass,
      leverageDelta,
      moveAdv,
      yacBase,
      fumbleProb,
      fumbleRoll,
    },
  };
}
