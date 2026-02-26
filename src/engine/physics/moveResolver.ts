import { codSkill, handStrength, ratingZ, reachIn } from "@/engine/physics/ratingsToKinematics";
import type { ContactMove } from "@/engine/physics/contactResolver";

export type MoveInput = {
  moveType: ContactMove;
  timing01: number;
  angleDeg: number;
  ballcarrier: { agility: number; accel: number; strength: number; balance: number; heightIn: number; jump: number };
  tackler: { agility: number; accel: number; tackling: number; heightIn: number; jump: number };
};

export function resolveMoveAdvantage(input: MoveInput): number {
  const offCod = codSkill(ratingZ(input.ballcarrier.agility), ratingZ(input.ballcarrier.accel));
  const defCod = codSkill(ratingZ(input.tackler.agility), ratingZ(input.tackler.accel));
  const reachAdv = reachIn(input.ballcarrier.heightIn, ratingZ(input.ballcarrier.jump)) - reachIn(input.tackler.heightIn, ratingZ(input.tackler.jump));
  const offBalanceZ = ratingZ(input.ballcarrier.balance);
  const defTackleZ = ratingZ(input.tackler.tackling);
  const angleVariance = Math.min(90, Math.max(0, input.angleDeg)) / 90;

  if (input.moveType === "JUKE") return (offCod - defCod) * (0.2 + angleVariance * 0.55) + input.timing01 * 0.16;
  if (input.moveType === "SPIN") return (offBalanceZ - defTackleZ) * 0.2 + 0.03;
  if (input.moveType === "STIFF_ARM") {
    return handStrength(ratingZ(input.ballcarrier.strength)) * 0.08 + reachAdv * 0.014 + (input.angleDeg > 20 ? 0.08 : 0);
  }
  return 0;
}
