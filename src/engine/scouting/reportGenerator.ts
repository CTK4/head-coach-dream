import type { ScoutingReport } from "@/types/scouting";

type ActivityInputs = {
  workoutResult?: unknown;
  interviewResult?: unknown;
  medicalReport?: unknown;
};

const POSITIVE_TEMPLATES: Record<string, string[]> = {
  QB: [
    "Demonstrates above-average pocket manipulation, buying critical time in the second and third windows.",
    "Throws with natural timing and anticipation between the numbers.",
    "Maintains calm footwork against delayed pressure looks.",
  ],
  WR: [
    "Reliable route runner at intermediate depths with good concentration in contested catch situations.",
    "Accelerates quickly out of breaks to create late separation.",
    "Tracks the ball cleanly over either shoulder.",
  ],
  DL: [
    "Elite first-step quickness disrupts timing before the snap — impossible to fully account for in protection schemes.",
    "Plays with heavy hands and strong leverage at contact.",
    "Flashes finishing burst when closing from the backside.",
  ],
  DEFAULT: [
    "Shows dependable processing speed and assignment discipline.",
    "Competitive temperament translates to high-effort reps.",
    "Functional athletic profile should carry to the next level.",
  ],
};

const NEGATIVE_TEMPLATES: Record<string, string[]> = {
  QB: ["Decision-making under pressure deteriorates on third-and-long — happy feet behind the pocket."],
  RB: ["Pass protection assignments are a liability — scheme usage may be limited at the next level."],
  DL: ["Inconsistent effort in run defense — disappears against double teams in the interior."],
  DEFAULT: ["Consistency can dip when forced into extended snaps against top competition."],
};

export function generateScoutingReport(
  prospect: { id: string; pos?: string; name?: string },
  workoutResult?: unknown,
  interviewResult?: unknown,
  medicalReport?: unknown
): ScoutingReport {
  const activities = [workoutResult, interviewResult, medicalReport].filter(Boolean).length;
  if (activities < 1) {
    throw new Error("At least one scouting activity is required before generating a report");
  }

  const pos = String(prospect.pos ?? "DEFAULT").toUpperCase();
  const positivesBank = POSITIVE_TEMPLATES[pos] ?? POSITIVE_TEMPLATES.DEFAULT;
  const negativesBank = NEGATIVE_TEMPLATES[pos] ?? NEGATIVE_TEMPLATES.DEFAULT;

  return {
    prospectId: prospect.id,
    generatedWeek: 1,
    authorLabel: activities === 3 ? "Director of Scouting" : activities === 2 ? "National Scout" : "Regional Scout",
    positives: positivesBank.slice(0, activities === 1 ? 2 : 3),
    negatives: activities >= 2 ? negativesBank.slice(0, activities === 2 ? 1 : 2) : [],
    comparisonPlayer: activities === 3 ? `Reminds evaluators of a young ${prospect.name ?? "impact starter"}.` : "",
    projectedRole: activities === 3 ? "Day-1 starter" : activities === 2 ? "Rotational contributor" : "Developmental contributor",
    draftRecommendation:
      activities === 3
        ? "Recommendation: prioritize in the early rounds if positional value aligns with current roster needs."
        : "",
  };
}

export function canGenerateScoutingReport(inputs: ActivityInputs) {
  return Boolean(inputs.workoutResult || inputs.interviewResult || inputs.medicalReport);
}
