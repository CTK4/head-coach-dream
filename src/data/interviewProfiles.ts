import type { InterviewResult } from "@/context/GameContext";

type AxisKey = "ALIGN" | "AUTO" | "ADAPT" | "ANLT" | "AGGR" | "DISC" | "DEV" | "MEDIA" | "PROC" | "PEOP";

export type InterviewScoreKey = keyof Omit<InterviewResult, "axisTotals">;

export type TeamInterviewProfile = {
  ownerPersonalityTags: string[];
  gmBiasTags: string[];
  questionClusters: string[];
  axisWeights: Record<InterviewScoreKey, Partial<Record<AxisKey, number>>>;
  offerThreshold: {
    ownerAlignScore: number;
    gmTrustScore: number;
    schemeFitScore: number;
    mediaScore: number;
  };
};

export const interviewProfiles: Record<string, TeamInterviewProfile> = {
  MILWAUKEE_NORTHSHORE: {
    ownerPersonalityTags: ["legacy-focused", "discipline", "measured-risk"],
    gmBiasTags: ["analytics-friendly", "process-over-hype"],
    questionClusters: ["MEDIA", "SCHEME", "OWNERSHIP", "VISION"],
    axisWeights: {
      ownerAlignScore: { ALIGN: 1.2, DISC: 1, PROC: 1, PEOP: 0.6 },
      gmTrustScore: { ANLT: 1.3, PROC: 1.1, ADAPT: 0.8, DEV: 0.7 },
      schemeFitScore: { ADAPT: 1.1, ANLT: 0.8, AGGR: 0.6, PROC: 0.6 },
      mediaScore: { MEDIA: 1.4, PEOP: 0.8, DISC: 0.6 },
      autonomyDelta: { AUTO: 1.1, ALIGN: -0.4, PROC: 0.4 },
      leashDelta: { DISC: 1, PROC: 0.6, ALIGN: 0.4, AGGR: -0.3 },
    },
    offerThreshold: { ownerAlignScore: 1.5, gmTrustScore: 1.2, schemeFitScore: 1, mediaScore: 0.8 },
  },
  ATLANTA_APEX: {
    ownerPersonalityTags: ["ambitious", "brand-forward", "aggressive-growth"],
    gmBiasTags: ["upside-bets", "explosive-offense"],
    questionClusters: ["SCHEME", "MEDIA", "VISION", "ROSTER"],
    axisWeights: {
      ownerAlignScore: { ALIGN: 1, AGGR: 0.8, MEDIA: 0.7, PEOP: 0.6 },
      gmTrustScore: { ANLT: 0.8, ADAPT: 1, DEV: 0.8, AGGR: 0.6 },
      schemeFitScore: { ADAPT: 1.2, AGGR: 1.1, ANLT: 0.8, PROC: 0.4 },
      mediaScore: { MEDIA: 1.5, PEOP: 0.7, ALIGN: 0.4 },
      autonomyDelta: { AUTO: 1.3, AGGR: 0.5, ALIGN: -0.2 },
      leashDelta: { AGGR: -0.5, DISC: 0.5, PROC: 0.5, MEDIA: 0.3 },
    },
    offerThreshold: { ownerAlignScore: 1.2, gmTrustScore: 1, schemeFitScore: 1.4, mediaScore: 1.1 },
  },
  BIRMINGHAM_VULCANS: {
    ownerPersonalityTags: ["traditional", "accountability", "locker-room-first"],
    gmBiasTags: ["development-pipeline", "physical-identity"],
    questionClusters: ["CRISIS", "DEVELOPMENT", "CULTURE", "MEDIA"],
    axisWeights: {
      ownerAlignScore: { ALIGN: 1.1, DISC: 1.2, PEOP: 0.9, DEV: 0.7 },
      gmTrustScore: { DEV: 1.2, PROC: 0.9, DISC: 0.8, ANLT: 0.5 },
      schemeFitScore: { DISC: 0.8, ADAPT: 0.9, AGGR: 0.6, PROC: 0.6 },
      mediaScore: { MEDIA: 1.2, DISC: 0.6, PEOP: 0.7 },
      autonomyDelta: { AUTO: 0.8, ALIGN: -0.5, DISC: -0.2, DEV: 0.4 },
      leashDelta: { DISC: 1.1, PROC: 0.7, ALIGN: 0.6, MEDIA: 0.4 },
    },
    offerThreshold: { ownerAlignScore: 1.6, gmTrustScore: 1.3, schemeFitScore: 0.8, mediaScore: 0.9 },
  },
};
