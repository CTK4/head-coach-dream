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
    | "injury-recurrence-model"
    | "concussion-model"
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
    title: "Scouting confidence & reveal logic",
    description:
      "Board ranges, confidence, and detail reveals all flow from the same scouting progression: actions tighten estimate width, mutate center/stock direction, and unlock clearer intel bands.",
    factors: [
      {
        label: "Position baseline sets opening band",
        weight: "High",
        description: "Initial estimate width starts from a position default (for example QB wider than RB/WR), so confidence begins lower for harder-eval profiles.",
      },
      {
        label: "Scouting actions tighten width and can move center",
        weight: "High",
        description: "Each tighten pass reduces estWidth with GM film/analytics efficiency and can shift estCenter, which drives stock arrows between snapshots.",
      },
      {
        label: "Confidence is derived directly from width",
        weight: "Medium",
        description: "Displayed confidence is computed from estimate width (100 - width×4, clamped), so every narrowing pass raises confidence in visible steps.",
      },
      {
        label: "Reveal percent controls attribute estimate spread",
        weight: "Medium",
        description: "Attribute reveal ranges shrink linearly with revealPct around the true score and collapse to exact values at 100% reveal.",
      },
      {
        label: "Board/report visibility respects confidence gates",
        weight: "Rule",
        description: "Big Board report generation is gated until scout confidence clears the threshold (>20), so low-confidence profiles keep broad bands and limited narrative output.",
      },
    ],
    example:
      "A QB might open around 72-90 (~28% confidence). After multiple scouting actions, width narrows to roughly 78-88 (~60% confidence), and continued work can reach 81-86 (~76% confidence) while reveal ranges tighten toward exact values.",
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
      "Each CPU team scores available prospects from rank-derived value, roster need pressure, GM-specific bias, and seeded variance, then picks the highest final score.",
    factors: [
      {
        label: "Team-need weighting comes from bucket shortages",
        weight: "High",
        description:
          "Need index is computed from position-bucket roster minimums, then the current bucket need boosts pick score (need × 3.5) and also amplifies urgency-bias impact.",
      },
      {
        label: "GM traits and biases reshape evaluations",
        weight: "High",
        description:
          "Star, athleticism, trenches, defense, aggression, urgency, and discipline traits add or subtract prospect-specific bias terms before final ranking.",
      },
      {
        label: "Prospect value starts with rank signal",
        weight: "High",
        description:
          "A true-value curve derived from class rank anchors every board, then elite/ceiling flags, trench/defense tags, and athletic proxy signals modify preference through GM bias.",
      },
      {
        label: "Deterministic RNG adds controlled variance",
        weight: "Rule",
        description:
          "Seeded noise per team-prospect pair is added with GM-dependent sigma, and seeded tie-break rolls resolve exact score ties while keeping identical saves reproducible.",
      },
      {
        label: "Bias-value slider provides small global offset",
        weight: "Medium",
        description: "The final score includes a lightweight bias_value offset, nudging conservative value boards without overpowering need/bias/value core terms.",
      },
    ],
    example:
      "With the same board, a GM high on trenches and urgency with OL need can prefer an OT ranked 14th over a WR ranked 10th, while a star-chasing skill-position GM with lower OL need can take the WR.",
  },
  "trade-ai": {
    id: "trade-ai",
    title: "Trade AI decision model",
    description:
      "Trade responses blend package valuation, team-context multipliers, and deterministic acceptance rolls, so equal raw value can still produce different outcomes by team situation.",
    factors: [
      {
        label: "Package value uses player + pick valuation paths",
        weight: "High",
        description:
          "Players are scored through `playerTradeValue` (which calls `calculateTradeValue`), while drafted assets use `draftPickTradeValue(round, year, season)` with round baselines and future-year discounting.",
      },
      {
        label: "Need score and loss pressure reshape equal offers",
        weight: "High",
        description:
          "Incoming assets at priority positions get a need multiplier, while outgoing assets at weak spots get a loss multiplier, so balanced headline value can still grade negatively for thin rosters.",
      },
      {
        label: "Cap stress penalizes veteran incoming contracts",
        weight: "Medium",
        description:
          "Incoming veterans (age 29+) add cap-penalty risk that scales with cap stress. Under tight cap conditions, this can suppress acceptance even when nominal value looks fair.",
      },
      {
        label: "GM mode and team window change preference",
        weight: "Medium",
        description:
          "Rebuild mode boosts pick preference and tolerance for moving older talent, while stronger contender window score increases win-now impact weighting from incoming high-OVR players.",
      },
      {
        label: "Acceptance probability uses deterministic randomness",
        weight: "Rule",
        description:
          "After hard reject/auto-accept rails, the model normalizes trade score into an acceptance probability and compares it to a seeded hash roll. Same save + same package stays reproducible.",
      },
    ],
    example:
      "Example: a package can look 'Fair' on total points, but if the AI team is cap-stressed, already deep at that position, and in rebuild mode prioritizing picks, it may still decline or counter for a future pick instead.",
  },
  "fa-market": {
    id: "fa-market",
    title: "Free-agency market pricing",
    description:
      "Free-agent APY projections start in the market model, while acceptance odds combine offer quality, interest, contextual fit, and FA lifecycle transitions during resolve rounds.",
    factors: [
      {
        label: "Projected APY is anchored by position, OVR, and age",
        weight: "High",
        description: "The market model applies a position multiplier to a base salary curve, scales by OVR, and applies post-peak age decay before rounding to market bands.",
      },
      {
        label: "AAV ratio to ask drives the largest acceptance swing",
        weight: "High",
        description: "Offer decision scoring uses a steep sigmoid around market ask (offerAAV/askAAV), so sub-market bids fall off quickly while over-market bids rise sharply.",
      },
      {
        label: "Interest and context apply additive fit pressure",
        weight: "Medium",
        description: "Team interest plus scheme fit, projected role, contender status, and location each nudge acceptance score; role and contender are explicit context axes.",
      },
      {
        label: "Thresholds and lowball rails gate elite decisions",
        weight: "Rule",
        description: "Higher-OVR players and low-interest situations raise the acceptance threshold; offers below 85% of ask are effectively capped unless interest and term fit are exceptional.",
      },
      {
        label: "FA state transitions shape who can still sign",
        weight: "Rule",
        description: "FA actions bootstrap from tampering, submit/update/withdraw offers, run CPU ticks and resolve rounds, generate counters, and can expire pending offers at resolve cap.",
      },
    ],
    example:
      "Example: if market ask is $12M APY, a $12M offer with neutral context can sit near coin-flip. Keeping APY at $12M but moving contenderStatus and roleProjection from 40 to 80 can push acceptance odds up, while dropping to $10M often still fails despite strong contender/role fit.",
  },
  "injury-recurrence-model": {
    id: "injury-recurrence-model",
    title: "Injury and recurrence model",
    description:
      "Weekly injury generation starts from a base chance and applies recurrence plus context modifiers before a hard clamp keeps probabilities bounded.",
    factors: [
      {
        label: "Base weekly injury chance",
        weight: "High",
        description: "Injury generation starts from a base rate (default 0.035) and applies risk modifiers from neglect/practice context before rolling.",
      },
      {
        label: "Recurrence multiplier window",
        weight: "High",
        description: "Same-type prior injuries inside the recurrence window (default 8 weeks) apply a recurrence multiplier (default 1.3), increasing new-injury odds.",
      },
      {
        label: "Soft-tissue chronic pressure",
        weight: "Medium",
        description: "Two or more prior soft-tissue injuries add a chronic boost in recurrence logic, and new soft-tissue injuries after prior history are flagged chronic.",
      },
      {
        label: "QB exposure and risk clamp",
        weight: "Medium",
        description: "QB run-contact exposure can switch to a QB-specific base injury rate adjusted by slide behavior, then clamped to safe tuning bounds.",
      },
      {
        label: "Final probability clamp",
        weight: "Rule",
        description: "After recurrence and modifiers, final injury probability is clamped to 0.5%–16% so outcomes remain realistic and stable.",
      },
    ],
    example:
      "If a player strains a hamstring again within 8 weeks, the recurrence multiplier raises risk; if that player already has repeated soft-tissue history, chronic logic pushes risk higher again.",
  },
  "concussion-model": {
    id: "concussion-model",
    title: "Concussion severity and return model",
    description:
      "Concussions are explicit injury definitions, then severity rolls and duration ranges determine expected return timing and status progression.",
    factors: [
      {
        label: "Dedicated concussion definition",
        weight: "High",
        description: "Concussion exists as its own injury definition with HEAD body area and distinct base (1–2 weeks) vs severe (3–5 weeks) duration ranges.",
      },
      {
        label: "Severity roll pipeline",
        weight: "High",
        description: "Severity is rolled through weighted buckets (MINOR, MODERATE, SEVERE, SEASON_ENDING), which then drive status and return timing.",
      },
      {
        label: "Duration from severity",
        weight: "Medium",
        description: "MINOR/MODERATE pull from base weeks, SEVERE pulls from severe weeks, and SEASON_ENDING forces long-term loss without expected return.",
      },
      {
        label: "Expected return + status mapping",
        weight: "Medium",
        description: "Expected return week is current week plus duration, while severity maps to status (for example severe/moderate to OUT, season-ending to IR).",
      },
      {
        label: "Practice defaults",
        weight: "Rule",
        description: "New injuries default to LIMITED practice for minor cases and DNP for higher severities, reinforcing return-to-play pacing.",
      },
    ],
    example:
      "A minor concussion can project a 1–2 week return, while a severe concussion projects 3–5 weeks and usually lands as OUT longer before the player reaches return-to-play stages.",
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
