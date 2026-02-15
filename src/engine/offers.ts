import type { GameState, InterviewResult, OfferItem } from "@/context/GameContext";
import { interviewProfiles, type TeamInterviewProfile } from "@/data/interviewProfiles";

const BASE_TEAMS = ["MILWAUKEE_NORTHSHORE", "ATLANTA_APEX", "BIRMINGHAM_VULCANS"] as const;

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function computeOfferThreshold(profile: TeamInterviewProfile): number {
  return average([
    profile.offerThreshold.ownerAlignScore,
    profile.offerThreshold.gmTrustScore,
    profile.offerThreshold.schemeFitScore,
    profile.offerThreshold.mediaScore,
  ]);
}

export function computeTeamScore(
  _teamId: string,
  interviewResult: InterviewResult | undefined,
  profile: TeamInterviewProfile
): number {
  if (!interviewResult) return 0;

  const baseScore = average([
    interviewResult.ownerAlignScore,
    interviewResult.gmTrustScore,
    interviewResult.schemeFitScore,
    interviewResult.mediaScore,
  ]);

  const modifier = interviewResult.autonomyDelta * 0.2 + interviewResult.leashDelta * 0.1;
  const floor = computeOfferThreshold(profile) * 0.5;

  return Math.max(floor, baseScore + modifier);
}

export function generateOffer(teamId: string, score: number, profile: TeamInterviewProfile): OfferItem {
  const threshold = computeOfferThreshold(profile);
  const normalized = threshold > 0 ? score / threshold : 0;

  if (normalized >= 1.45) {
    return {
      teamId,
      years: 6,
      salary: 10_000_000,
      autonomy: 88,
      patience: 84,
      mediaNarrativeKey: "offer.elite_hire",
    };
  }

  if (normalized >= 1.25) {
    return {
      teamId,
      years: 5,
      salary: 8_000_000,
      autonomy: 78,
      patience: 74,
      mediaNarrativeKey: "offer.strong_vote_of_confidence",
    };
  }

  if (normalized >= 1.05) {
    return {
      teamId,
      years: 4,
      salary: 6_000_000,
      autonomy: 68,
      patience: 64,
      mediaNarrativeKey: "offer.steady_build",
    };
  }

  return {
    teamId,
    years: 3,
    salary: 4_000_000,
    autonomy: 58,
    patience: 56,
    mediaNarrativeKey: "offer.prove_it",
  };
}

export function generateOffers(state: GameState): OfferItem[] {
  const interviewByTeam = new Map(state.interviews.items.map((item) => [item.teamId, item.result]));

  return BASE_TEAMS.flatMap((teamId) => {
    const profile = interviewProfiles[teamId] ?? interviewProfiles.MILWAUKEE_NORTHSHORE;
    const result = interviewByTeam.get(teamId);
    const score = computeTeamScore(teamId, result, profile);
    const threshold = computeOfferThreshold(profile);

    if (teamId !== "MILWAUKEE_NORTHSHORE" && score < threshold) {
      return [];
    }

    return [generateOffer(teamId, score, profile)];
  });
}
