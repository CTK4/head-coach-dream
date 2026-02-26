import type { ResultTag } from "@/engine/gameSim";
import { resolveBounce, type BounceSurface } from "@/engine/physics/bounce";
import { FUMBLE_BASE_RATE } from "@/engine/physics/constants";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export type FumbleInput = {
  carrier: { balanceZ: number; strengthZ: number; fatigue01: number };
  hitter: { hitPowerZ: number; tackleZ: number };
  context: { impulseProxy: number; surface: BounceSurface; contactType: "RUN" | "CATCH" | "SACK" | "SCRUM" };
};

/** roll order: fumbleRoll, bounceRoll(s), recoveryRoll */
export function resolveFumble(input: FumbleInput, rng: () => number): { fumble: boolean; bounce?: { rollYds: number; direction: -1 | 1; weird: boolean }; recoveredBy?: "OFFENSE" | "DEFENSE"; resultTags: ResultTag[]; debug: Record<string, number> } {
  const wetAdder = input.context.surface === "WET" ? 0.008 : input.context.surface === "SNOW" ? 0.012 : 0;
  const impulseAdder = input.context.impulseProxy * 0.018;
  const fatigueAdder = input.carrier.fatigue01 * 0.012;
  const securityReducer = input.carrier.balanceZ * 0.008 + input.carrier.strengthZ * 0.006;
  const hitterAdder = input.hitter.hitPowerZ * 0.005 + input.hitter.tackleZ * 0.004;
  const typeAdder = input.context.contactType === "SACK" ? 0.004 : input.context.contactType === "SCRUM" ? 0.006 : 0;
  const fumbleProb = clamp(FUMBLE_BASE_RATE + wetAdder + impulseAdder + fatigueAdder + hitterAdder + typeAdder - securityReducer, 0.002, 0.16);

  const fumbleRoll = rng();
  const fumble = fumbleRoll < fumbleProb;
  const resultTags: ResultTag[] = [];
  if (!fumble) return { fumble, resultTags, debug: { fumbleProb, fumbleRoll } };

  const bounce = resolveBounce({ baseRecoveryBias01: 0.5 + (input.context.contactType === "RUN" ? 0.05 : 0), surface: input.context.surface }, rng);
  const recoveryRoll = rng();
  const recoveredBy = recoveryRoll < bounce.recoveryBias01 ? "OFFENSE" : "DEFENSE";
  resultTags.push({ kind: "MISTAKE", text: `FUMBLE:${recoveredBy}` });
  if (bounce.weird) resultTags.push({ kind: "MISTAKE", text: "WEIRD_BOUNCE" });
  return { fumble, bounce: { rollYds: bounce.rollYds, direction: bounce.direction, weird: bounce.weird }, recoveredBy, resultTags, debug: { fumbleProb, fumbleRoll, recoveryRoll, recoveryBias01: bounce.recoveryBias01 } };
}
