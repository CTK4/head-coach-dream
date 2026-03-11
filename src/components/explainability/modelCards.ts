import type { ExplainerFactor } from "@/components/explainability/ExplainerDrawer";

export type ModelCardConfig = {
  id:
    | "athletic-composite"
    | "badges"
    | "scouting-confidence"
    | "scouting-reveal"
    | "draft-ai"
    | "trade-ai"
    | "fa-market"
    | "injury-recurrence-concussion"
    | "contract-market";
  title: string;
  description: string;
  factors: ExplainerFactor[];
  example?: string;
};

export const MODEL_CARDS: Record<ModelCardConfig["id"], ModelCardConfig> = {
  "athletic-composite": {
    id: "athletic-composite",
    title: "Athletic composite and labels",
    description:
      "Athletic scouting blends timed drills into one score, then maps each drill to speed/explosiveness/agility/power tiers for a readable archetype label.",
    factors: [
      {
        label: "Forty time drives the biggest share",
        weight: "High",
        description:
          "The composite gives 40-yard dash the heaviest coefficient; faster times raise the score quickly while slower times drag it down.",
      },
      {
        label: "Shuttle is the second major lever",
        weight: "High",
        description:
          "Short shuttle time is weighted strongly, so quick change-of-direction can materially improve the final athletic signal.",
      },
      {
        label: "Vertical jump boosts explosion",
        weight: "Medium",
        description:
          "Vertical jump adds to the score and also feeds the explosiveness tier used in the summary label.",
      },
      {
        label: "Bench contributes to power",
        weight: "Low",
        description:
          "Bench reps are included with a lighter coefficient, so they matter most as a tiebreaker and for power classification.",
      },
      {
        label: "Missing drills are normalized",
        weight: "Rule",
        description:
          "When only some drills are available, the system rescales by covered weights so partial reports stay comparable to full reports.",
      },
    ],
    example:
      "A prospect with elite forty and shuttle but average bench will usually grade as fast/fluid, even if pure power is not a strength.",
  },
  badges: {
    id: "badges",
    title: "Badge triggers",
    description:
      "Season badges evaluate explicit eligibility and stat thresholds from the badge engine, including role-specific exceptions and one-time award filtering.",
    factors: [
      {
        label: "Eligibility rules gate badge checks first",
        weight: "High",
        description:
          "Each badge can define allowed positions; if the player role is not eligible (for example K-only or DB groups), threshold checks are skipped.",
      },
      {
        label: "Threshold comparisons use ge/le operators",
        weight: "High",
        description:
          "Every threshold is a deterministic stat comparison: ge means value ≥ cutoff and le means value ≤ cutoff, with all listed thresholds required unless special-cased.",
      },
      {
        label: "Red Zone Reaper has a multi-stat trigger path",
        weight: "Medium",
        description:
          "RED_ZONE_REAPER is evaluated by alternate touchdown routes, passing with a higher bar (40+) or rushing/receiving with lower bars (10+), so one lane can qualify the badge.",
      },
      {
        label: "Badges are awarded once per player",
        weight: "Rule",
        description:
          "The engine builds a prior badge-ID set and filters those out before evaluating the season, preventing duplicate re-awards of the same badge.",
      },
      {
        label: "Rare and above badges generate news",
        weight: "Rule",
        description:
          "After award resolution, RARE/EPIC/LEGENDARY badges publish league news while COMMON badges remain in player history only.",
      },
    ],
    example: "A CB can hit Shutdown Corner only if position-eligible and both pass-deflection and interception thresholds pass; once awarded, that badge ID is never re-granted.",
  },
  "scouting-confidence": {
    id: "scouting-confidence",
    title: "Scouting confidence",
    description:
      "Confidence is tied to estimate width: narrower projected OVR bands mean higher confidence, while baseline uncertainty depends on position and GM traits.",
    factors: [
      {
        label: "Position sets starting uncertainty",
        weight: "High",
        description: "Each position starts with a default width (for example QB wider than RB/WR), which defines initial confidence before extra scouting.",
      },
      {
        label: "GM film and analytics tighten faster",
        weight: "High",
        description: "Tightening efficiency scales with film process and analytics orientation, reducing band width more effectively per scouting action.",
      },
      {
        label: "Diminishing returns near narrow bands",
        weight: "Medium",
        description: "As a profile gets tighter, additional actions remove less width, preventing near-perfect certainty too early.",
      },
      {
        label: "Center estimate can drift",
        weight: "Medium",
        description: "Each tighten action can shift estimated center up or down slightly, driving stock arrows between windows.",
      },
      {
        label: "Confidence formula is direct",
        weight: "Rule",
        description: "Displayed confidence is computed from width (approximately 100 minus width×4, clamped), so every width reduction is visible to the user.",
      },
    ],
    example: "Two identical prospects can show different confidence if one GM has stronger film/analytics traits and spends more high-efficiency scouting points.",
  },
  "scouting-reveal": {
    id: "scouting-reveal",
    title: "Scouting reveal ranges",
    description:
      "Attribute reveals use deterministic ranges that shrink with reveal percent; medical and character details unlock at clarity thresholds with miss chances.",
    factors: [
      {
        label: "Reveal percent controls shown spread",
        weight: "High",
        description: "The displayed low/high interval is symmetric around true score and contracts linearly as reveal percent rises toward 100%.",
      },
      {
        label: "Maximum spread caps uncertainty",
        weight: "Medium",
        description: "A configurable max spread sets the widest possible reveal range when confidence is near zero.",
      },
      {
        label: "Medical and character unlock in stages",
        weight: "High",
        description: "At moderate clarity, tier info may reveal; at higher clarity, deeper fields like recurrence or leadership unlock.",
      },
      {
        label: "Risk management lowers misses",
        weight: "Medium",
        description: "GM risk-management trait and current clarity reduce the miss probability on partial-threshold reveal attempts.",
      },
      {
        label: "QB specialty attributes can be delayed",
        weight: "Rule",
        description: "Certain QB attributes have minimum reveal thresholds before they can appear, even when other data is visible.",
      },
    ],
    example: "At 60% reveal, an attribute might still show a broad band, but once reveal reaches 100% the range collapses to the exact true score.",
  },
  "draft-ai": {
    id: "draft-ai",
    title: "Draft AI pick logic",
    description:
      "CPU drafting blends board strength, GM bias profile, team need pressure, and seeded noise so decisions feel coherent but not perfectly predictable.",
    factors: [
      {
        label: "Rank-based true value anchors the board",
        weight: "High",
        description: "Prospect rank converts to a baseline value curve, so high-ranked players start with a structural advantage.",
      },
      {
        label: "GM traits add positional/archetype bias",
        weight: "High",
        description: "Bias knobs (star chasing, athleticism, trenches, defense, aggression, urgency) adjust how each team interprets the same class.",
      },
      {
        label: "Need index pushes scarce positions",
        weight: "High",
        description: "Roster minimums convert into need scores per bucket and add pick pressure where depth is thin.",
      },
      {
        label: "Scouting uncertainty varies by GM",
        weight: "Medium",
        description: "GM quality controls sigma: better analytics/film/intel lowers noise while urgency can increase volatility.",
      },
      {
        label: "Deterministic random tie-breakers",
        weight: "Rule",
        description: "Seeded noise and tie rolls keep results reproducible for a save while still creating variation between teams.",
      },
    ],
    example: "A rebuilding team with trenches bias and high OL need may select a slightly lower-ranked tackle over a similarly graded receiver.",
  },
  "trade-ai": {
    id: "trade-ai",
    title: "Trade AI decision model",
    description:
      "Trade acceptance weighs package value, roster needs, cap stress, team window, redundancy, and relationship signals before sampling acceptance probability.",
    factors: [
      {
        label: "Core package delta",
        weight: "High",
        description: "Outgoing and incoming package values form the base score, including pick-specific values and player age-adjusted valuation.",
      },
      {
        label: "Need and loss multipliers",
        weight: "High",
        description: "Incoming players at need positions get boosted, while losing needed positions is penalized more heavily.",
      },
      {
        label: "Cap and age pressure",
        weight: "Medium",
        description: "Veteran incoming value is penalized under high cap stress, reducing acceptance for expensive additions.",
      },
      {
        label: "Team window philosophy",
        weight: "Medium",
        description: "Rebuild mode values picks more and may prefer moving veteran value; contender windows reward immediate impact talent.",
      },
      {
        label: "Hard reject and auto-accept rails",
        weight: "Rule",
        description: "Large deficits are instantly rejected, clearly favorable surplus can auto-accept, and all other offers pass through probabilistic scoring.",
      },
    ],
    example: "Even if total value is close, a cap-strapped contender may reject a veteran-heavy return while a rebuilding club might accept the same framework for picks.",
  },
  "fa-market": {
    id: "fa-market",
    title: "Free-agency market pricing",
    description:
      "Free-agent APY projections come from position multipliers, overall rating, and age curve, then contract decisions compare offer AAV and fit to player thresholds.",
    factors: [
      {
        label: "Position multipliers set market tier",
        weight: "High",
        description: "Premium positions (especially QB, EDGE, WR, CB) apply higher multipliers to the baseline salary curve.",
      },
      {
        label: "Overall rating drives main growth",
        weight: "High",
        description: "OVR is transformed into an APY adjustment band, making talent level the strongest price determinant.",
      },
      {
        label: "Age peak discount",
        weight: "Medium",
        description: "Past the position peak age, annual value is reduced by a decay factor to reflect declining market appetite.",
      },
      {
        label: "Offer quality vs ask",
        weight: "High",
        description: "Acceptance score heavily depends on offer AAV ratio versus the computed ask, with steep penalties below market.",
      },
      {
        label: "Fit context and negotiation memory",
        weight: "Rule",
        description: "Scheme/role/contender/location context nudges decisions, and rejected low offers can reduce interest unless materially improved later.",
      },
    ],
    example: "A strong over-market offer with good scheme fit can still lose if contract length is far from preferred years and interest has already cratered from prior lowballs.",
  },
  "injury-recurrence-concussion": {
    id: "injury-recurrence-concussion",
    title: "Injury, recurrence, and concussion risk",
    description:
      "Weekly injuries are generated from base rates, severity distributions, recurrence multipliers, and context modifiers such as QB contact exposure.",
    factors: [
      {
        label: "Base weekly injury chance",
        weight: "High",
        description: "Injury generation starts from a base probability and is clamped to a bounded range to avoid extreme outcomes.",
      },
      {
        label: "Severity roll controls downtime",
        weight: "High",
        description: "Severity buckets map to statuses and week ranges, with season-ending outcomes forcing long-term IR-style loss.",
      },
      {
        label: "Recurrence window multiplier",
        weight: "Medium",
        description: "Recent same-type injuries within the recurrence window increase risk, and repeat soft-tissue patterns can add chronic pressure.",
      },
      {
        label: "Concussion profile is explicit",
        weight: "Medium",
        description: "Concussions are part of the injury definition pool with head body area and dedicated base/severe recovery ranges.",
      },
      {
        label: "QB run contact exposure",
        weight: "Rule",
        description: "QB injury base rate can be elevated by run-contact exposure and slide behavior, then constrained by tuning bounds.",
      },
    ],
    example: "A QB with repeated run contact and poor sliding can carry elevated weekly injury risk, while a second hamstring issue in-window increases recurrence odds.",
  },
  "contract-market": {
    id: "contract-market",
    title: "Contract market decision thresholds",
    description:
      "Contract acceptance compares total offer strength against player-specific thresholds that increase for top overall players or low-interest situations.",
    factors: [
      {
        label: "Player ask baseline",
        weight: "High",
        description: "Ask AAV is derived from projected market APY by position, age, and overall, then used as the anchor for offer ratio scoring.",
      },
      {
        label: "Term preference by role",
        weight: "Medium",
        description: "Preferred years vary by position and talent tier, and term mismatch adds a measurable penalty.",
      },
      {
        label: "Context quality stack",
        weight: "Medium",
        description: "Scheme fit, projected role, contender status, location preference, and guarantees can each nudge acceptance score up or down.",
      },
      {
        label: "Dynamic threshold for elite talent",
        weight: "High",
        description: "High-OVR players and low-interest states raise acceptance thresholds, requiring stronger offers to close.",
      },
      {
        label: "Lowball floor behavior",
        weight: "Rule",
        description: "Offers far below market are effectively capped to near-zero acceptance unless interest and term fit are exceptionally favorable.",
      },
    ],
    example: "An 88 OVR EDGE with low interest may reject a market-level offer that a mid-tier player would accept, because the threshold curve is steeper at the top end.",
  },
};

export const MODEL_CARD_LIST: ModelCardConfig[] = Object.values(MODEL_CARDS);
