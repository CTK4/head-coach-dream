import type { CoachReputation } from "@/engine/reputation";
import { applyRejectionPenalty, computeHrs, ownerPatienceToStability, volatilityTo100, clamp100 } from "@/engine/reputation";

export type AssistantTier = "A" | "B" | "C" | "D";
export type RoleFocus = "OFF" | "DEF" | "ST" | "GEN";
export type StaffKind = "ASSISTANT" | "COORDINATOR";

export type StaffAcceptance = {
  accept: boolean;
  score: number;
  tier: AssistantTier;
  threshold: number;
};

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function assistantTierFromRep(rep: number): AssistantTier {
  if (rep >= 80) return "A";
  if (rep >= 70) return "B";
  if (rep >= 60) return "C";
  return "D";
}

function tierThreshold(t: AssistantTier): number {
  if (t === "A") return 75;
  if (t === "B") return 65;
  if (t === "C") return 55;
  return 45;
}

function deriveAssistantEgoPenalty(seed: number, personId: string): number {
  const rng = mulberry32(seed ^ hashStr(personId));
  const ambition = clamp100(35 + rng() * 65);
  const hcDesire = clamp100(20 + rng() * 80);
  const riskTol = clamp100(25 + rng() * 75);
  return clamp100(0.3 * ambition + 0.4 * hcDesire - 0.2 * riskTol);
}

function roleCred(rep: CoachReputation, focus: RoleFocus): number {
  if (focus === "OFF") return rep.offCred;
  if (focus === "DEF") return rep.defCred;
  if (focus === "ST") return Math.round(rep.leadershipTrust * 0.55 + rep.playerRespect * 0.45);
  return Math.round((rep.offCred + rep.defCred) / 2);
}

function autonomyDemand(tier: AssistantTier, kind: StaffKind): number {
  if (kind === "ASSISTANT") return tier === "A" ? 70 : 0;
  if (tier === "A") return 75;
  if (tier === "B") return 60;
  return 0;
}

function credPenaltyFromTier(tier: AssistantTier, cred: number, kind: StaffKind): number {
  if (kind === "COORDINATOR") {
    if (tier === "A" && cred < 62) return 14;
    if (tier === "B" && cred < 55) return 9;
    return 0;
  }
  if (tier === "A" && cred < 60) return 10;
  if (tier === "B" && cred < 52) return 6;
  return 0;
}

export function computeStaffAcceptance(args: {
  saveSeed: number;
  rep: CoachReputation | undefined;
  staffRep: number;
  personId: string;
  schemeCompat: number;
  offerQuality: number;
  teamOutlook: number;
  roleFocus: RoleFocus;
  kind: StaffKind;
}): StaffAcceptance {
  const { saveSeed, rep, staffRep, personId, schemeCompat, offerQuality, teamOutlook, roleFocus, kind } = args;
  if (!rep) return { accept: true, score: 99, tier: "D", threshold: 0 };

  const hrs = computeHrs(rep);
  const tier = assistantTierFromRep(staffRep);
  const threshold = tierThreshold(tier);

  const egoPenalty = deriveAssistantEgoPenalty(saveSeed ^ 0x9e3779b9, personId);
  const orgPrestige = rep.leaguePrestige;
  const ownerStability = ownerPatienceToStability(rep.ownerPatienceMult);
  const rebuildIndex = clamp100(55 - (teamOutlook - 50) * 0.6);

  const careerRisk = clamp100(0.4 * (100 - ownerStability) + 0.3 * volatilityTo100(rep.volatilityExpectation) + 0.3 * rebuildIndex);
  const demand = autonomyDemand(tier, kind);
  const autonomyPenalty = demand > 0 && rep.autonomyLevel < demand ? 15 : 0;

  const cred = roleCred(rep, roleFocus);
  const credPenalty = credPenaltyFromTier(tier, cred, kind);

  const w = kind === "COORDINATOR"
    ? { hrs: 0.38, outlook: 0.18, offer: 0.18, org: 0.1, scheme: 0.07, cred: 0.16 }
    : { hrs: 0.4, outlook: 0.2, offer: 0.15, org: 0.1, scheme: 0.08, cred: 0.12 };

  const score =
    w.hrs * hrs +
    w.outlook * teamOutlook +
    w.offer * offerQuality +
    w.org * orgPrestige +
    w.scheme * schemeCompat +
    w.cred * cred -
    0.15 * egoPenalty -
    0.1 * careerRisk -
    autonomyPenalty -
    credPenalty;

  return { accept: score >= threshold, score: clamp100(score), tier, threshold };
}

export function applyStaffRejection(rep: CoachReputation): CoachReputation {
  return applyRejectionPenalty(rep);
}
