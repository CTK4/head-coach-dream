import { SIM_SYSTEMS_CONFIG } from "@/config/simSystems";

export type DefensiveScheme = {
  baseFront: "4-3" | "3-4" | "Nickel Heavy";
  coverageBase: "Cover2" | "Cover3" | "Man" | "Match";
  blitzRate: number;
  runFocus: number;
};

export type DefensiveEffects = {
  completionMultiplier: number;
  deepBallMultiplier: number;
  yacMultiplier: number;
  runYpcMultiplier: number;
  sackMultiplier: number;
  explosiveAllowedMultiplier: number;
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function defaultDefensiveScheme(seed = 0): DefensiveScheme {
  const index = Math.abs(seed) % 3;
  return {
    baseFront: index === 0 ? "4-3" : index === 1 ? "3-4" : "Nickel Heavy",
    coverageBase: index === 0 ? "Cover3" : index === 1 ? "Man" : "Match",
    blitzRate: 0.22 + index * 0.08,
    runFocus: 0.5,
  };
}

export function computeDefensiveEffects(scheme: DefensiveScheme): DefensiveEffects {
  const c = SIM_SYSTEMS_CONFIG.defense;
  const blitz = clamp01(scheme.blitzRate);
  const runFocus = clamp01(scheme.runFocus);

  const coverageStrength =
    scheme.coverageBase === "Match"  ? 1    :
    scheme.coverageBase === "Man"    ? 0.92 :
    scheme.coverageBase === "Cover2" ? 0.88 : 0.9;

  const frontRunAnchor  = scheme.baseFront === "3-4" ? 1.04 : scheme.baseFront === "4-3" ? 1.02 : 0.96;
  const frontRushAnchor = scheme.baseFront === "Nickel Heavy" ? 1.06 : 1;

  // Blitz × coverage interaction: how much does blitzing expose the defense
  // to big plays depends on the coverage shell behind it. Man coverage is most
  // vulnerable (defenders have no help); Match zone is most disciplined.
  const blitzCoverageExposure = SIM_SYSTEMS_CONFIG.blitzCoverageExposure[scheme.coverageBase] ?? 1.0;

  return {
    completionMultiplier:       1 - c.coverageCompletionImpact * coverageStrength,
    deepBallMultiplier:         1 - c.coverageDeepBallImpact * coverageStrength + blitz * c.blitzExplosiveAllowedImpact * blitzCoverageExposure,
    yacMultiplier:              1 - c.coverageYacImpact * coverageStrength,
    runYpcMultiplier:           1 - c.frontRunYpcImpact * frontRunAnchor * runFocus,
    sackMultiplier:            (1 + c.frontSackImpact * frontRushAnchor) * (1 + blitz * c.blitzSackImpact),
    // Explosive allowed scales with blitz rate AND how exposed the coverage is.
    explosiveAllowedMultiplier: (1 + blitz * c.blitzExplosiveAllowedImpact * blitzCoverageExposure)
                              * (1 - c.coverageDeepBallImpact * coverageStrength * 0.35),
  };
}
