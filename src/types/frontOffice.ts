export interface OwnerProfile {
  name: string;
  personality: "PATIENT" | "DEMANDING" | "HANDS_OFF" | "MEDDLESOME";
  priorities: ("WINNING" | "REVENUE" | "YOUTH" | "COMMUNITY")[];
  confidenceInCoach: number;
  tenure: number;
  bio: string;
}

export interface GmProfile {
  name: string;
  philosophy: "ANALYTICS" | "TRADITIONAL" | "HYBRID";
  draftEmphasis: "HIGH" | "MEDIUM" | "LOW";
  faAggression: "AGGRESSIVE" | "SELECTIVE" | "CONSERVATIVE";
  relationship: number;
  tenure: number;
  bio: string;
}

export interface FranchiseOverview {
  teamName: string;
  city: string;
  state: string;
  founded: number;
  championships: number;
  lastChampionship: number | null;
  allTimeRecord: { wins: number; losses: number };
  currentStreak: string;
  prestige: number;
  marketSize: "SMALL" | "MEDIUM" | "LARGE";
  owner: OwnerProfile;
  gm: GmProfile;
}
