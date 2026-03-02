/**
 * devTrait.ts — Canonical development trait multipliers.
 *
 * Three named functions expose intentionally-different scales for their domain:
 *
 *  getDevTraitProgressionMultiplier  — highest spread (0.90–1.25)
 *    Used in snap-based development deltas. XF players grow faster; unknown
 *    traits are penalised because development habits are unproven.
 *
 *  getDevTraitValuationMultiplier    — moderate spread (1.00–1.20)
 *    Used in trade value calculations. Unknown trait is floor-neutral (1.0)
 *    because trade value is based on observed production, not projection.
 *
 *  getDevTraitResignMultiplier       — conservative spread (0.95–1.18)
 *    Used in CPU re-sign / free-agency scoring. Slightly narrower than
 *    progression because contract length limits the upside window.
 *
 * Keeping these as distinct named exports makes the intentional divergence
 * explicit and discoverable rather than buried in three private copies.
 */

function parseDevTrait(devTrait?: string): "XF" | "STAR" | "NORMAL" | "UNKNOWN" {
  const t = String(devTrait ?? "").toUpperCase();
  if (t.includes("SUPER") || t.includes("X_FACTOR") || t.includes("XF") || t === "X") return "XF";
  if (t.includes("STAR")) return "STAR";
  if (t.includes("NORMAL")) return "NORMAL";
  return "UNKNOWN";
}

/**
 * For snap-based progression deltas.
 * Wide spread to model how XF prospects compound their growth over a season.
 */
export function getDevTraitProgressionMultiplier(devTrait?: string): number {
  switch (parseDevTrait(devTrait)) {
    case "XF":     return 1.25;
    case "STAR":   return 1.12;
    case "NORMAL": return 1.00;
    case "UNKNOWN":
    default:       return 0.90;
  }
}

/**
 * For trade valuation.
 * Unknown trait floors at 1.0 — a player with no known dev trait is valued
 * on observable overall alone, with no projection penalty.
 */
export function getDevTraitValuationMultiplier(devTrait?: string): number {
  switch (parseDevTrait(devTrait)) {
    case "XF":     return 1.20;
    case "STAR":   return 1.10;
    case "NORMAL":
    case "UNKNOWN":
    default:       return 1.00;
  }
}

/**
 * For CPU re-sign / free-agency scoring.
 * Conservative spread: unknown trait incurs a small penalty because CPU
 * teams are risk-averse with cap dollars on uncertain profiles.
 */
export function getDevTraitResignMultiplier(devTrait?: string): number {
  switch (parseDevTrait(devTrait)) {
    case "XF":     return 1.18;
    case "STAR":   return 1.11;
    case "NORMAL": return 1.00;
    case "UNKNOWN":
    default:       return 0.95;
  }
}
