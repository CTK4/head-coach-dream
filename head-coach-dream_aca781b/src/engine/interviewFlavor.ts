export type OfferTier = "PREMIUM" | "STANDARD" | "CONDITIONAL" | "REJECT";

type FlavorPhase = "DURING" | "END";
type DominantTrait =
  | "impatient"
  | "media_sensitive"
  | "volatile"
  | "disciplined"
  | "loyal"
  | "prideful"
  | "aggressive"
  | "risk_averse"
  | "controlling"
  | "neutral";

const TRAIT_PRIORITY = [
  "impatient",
  "short-term results driven",
  "volatile",
  "media",
  "media-sensitive",
  "disciplined",
  "loyal",
  "prideful",
  "aggressive",
  "conservative",
  "risk-averse",
  "risk averse",
  "hands-on",
  "controlling",
] as const;

const TRAIT_BUCKETS: Record<(typeof TRAIT_PRIORITY)[number], DominantTrait> = {
  impatient: "impatient",
  "short-term results driven": "impatient",
  volatile: "volatile",
  media: "media_sensitive",
  "media-sensitive": "media_sensitive",
  disciplined: "disciplined",
  loyal: "loyal",
  prideful: "prideful",
  aggressive: "aggressive",
  conservative: "risk_averse",
  "risk-averse": "risk_averse",
  "risk averse": "risk_averse",
  "hands-on": "controlling",
  controlling: "controlling",
};

function getDominantTrait(ownerTags: string[]): DominantTrait {
  const normalizedTags = ownerTags.map((tag) => tag.toLowerCase());
  const match = TRAIT_PRIORITY.find((tag) => normalizedTags.includes(tag));
  return match ? TRAIT_BUCKETS[match] : "neutral";
}

function getThemeKey(theme: string): string {
  return theme.trim().toUpperCase();
}

function duringLine(theme: string, dominantTrait: DominantTrait): string {
  const themeKey = getThemeKey(theme);

  if (themeKey === "TIMELINE") {
    if (dominantTrait === "impatient") return "The owner wants immediate traction and expects your timeline to open with early momentum.";
    if (dominantTrait === "disciplined") return "The owner values a disciplined timeline that balances urgency with structure.";
    if (dominantTrait === "risk_averse") return "The owner prefers a careful timeline with visible safeguards at each stage.";
    return "The owner is listening for a timeline that sounds decisive and practical from the start.";
  }

  if (themeKey === "CULTURE") {
    if (dominantTrait === "controlling") return "The owner expects a culture you can direct firmly and keep aligned every week.";
    if (dominantTrait === "loyal") return "The owner wants a culture that earns trust and keeps the room unified through adversity.";
    return "The owner wants a clear culture identity that players and staff can feel immediately.";
  }

  if (themeKey === "MEDIA") {
    if (dominantTrait === "media_sensitive") return "The owner is highly tuned to public tone and wants disciplined media command.";
    if (dominantTrait === "volatile") return "The owner reacts quickly to outside noise and wants steady message control.";
    return "The owner cares about media composure and how your message shapes confidence.";
  }

  if (themeKey === "ROSTER") {
    if (dominantTrait === "aggressive") return "The owner wants assertive roster intent that signals conviction.";
    if (dominantTrait === "risk_averse") return "The owner prefers roster choices that protect stability and continuity.";
    return "The owner wants roster decisions that fit your plan and leadership style.";
  }

  return "The owner is weighing whether your approach fits the direction they expect for this team.";
}

function endLine(tier: OfferTier, dominantTrait: DominantTrait): string {
  if (tier === "PREMIUM") {
    if (dominantTrait === "prideful") return "The owner leaves impressed and presents this as a defining hire for the organization.";
    if (dominantTrait === "impatient") return "The owner is energized and ready to move quickly with full conviction behind you.";
    return "The owner is fully sold on your vision and wants to build around your leadership.";
  }

  if (tier === "STANDARD") {
    if (dominantTrait === "controlling") return "The owner is encouraged and open to a partnership with clear shared control.";
    if (dominantTrait === "media_sensitive") return "The owner is positive and sees you as a steady public face for the team.";
    return "The owner likes your direction and is prepared to move forward with confidence.";
  }

  if (tier === "CONDITIONAL") {
    if (dominantTrait === "risk_averse") return "The owner remains cautious and prefers to proceed with clear guardrails.";
    if (dominantTrait === "volatile") return "The owner is uncertain and wants stronger assurance before making a bold commitment.";
    return "The owner is interested but still wants proof that your plan can hold under pressure.";
  }

  if (dominantTrait === "aggressive") return "The owner wants a different direction and closes the conversation without momentum.";
  if (dominantTrait === "loyal") return "The owner does not feel the fit and decides to continue the search elsewhere.";
  return "The owner turns away from this fit and plans to pursue other candidates.";
}

export function getFlavorLine(args: {
  ownerTags: string[];
  theme: string;
  phase: FlavorPhase;
  tier?: OfferTier;
}): string {
  const dominantTrait = getDominantTrait(args.ownerTags);

  if (args.phase === "DURING") {
    return duringLine(args.theme, dominantTrait);
  }

  const tier = args.tier ?? "CONDITIONAL";
  return endLine(tier, dominantTrait);
}
