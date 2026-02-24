import type { SeasonSummary } from "@/types/season";

export type Milestone = {
  id: string;
  label: string;
  category: "record" | "reputation" | "archetype";
  pointValue: number;
  repeatable: boolean;
  archetypeExclusive?: string;
  condition: (summary: SeasonSummary) => boolean;
};

export const MILESTONES: Milestone[] = [
  // Record milestones
  { id: "winning_record", label: "Winning Record", category: "record", pointValue: 1, repeatable: true, condition: (s) => s.wins > s.losses },
  { id: "double_digit_wins", label: "10+ Win Season", category: "record", pointValue: 1, repeatable: true, condition: (s) => s.wins >= 10 },
  { id: "division_winner", label: "Division Champion", category: "record", pointValue: 1, repeatable: true, condition: (s) => s.divisionWinner },
  { id: "playoff_appearance", label: "Playoff Appearance", category: "record", pointValue: 1, repeatable: true, condition: (s) => s.playoffResult !== "missed" },
  {
    id: "conference_finals",
    label: "Conference Championship",
    category: "record",
    pointValue: 2,
    repeatable: true,
    condition: (s) => s.playoffResult === "conference" || s.playoffResult === "superbowlLoss" || s.playoffResult === "champion",
  },
  {
    id: "super_bowl_appearance",
    label: "Super Bowl Appearance",
    category: "record",
    pointValue: 2,
    repeatable: false,
    condition: (s) => s.playoffResult === "superbowlLoss" || s.playoffResult === "champion",
  },
  { id: "champion", label: "Champion", category: "record", pointValue: 3, repeatable: false, condition: (s) => s.playoffResult === "champion" },
  { id: "top_offense", label: "Top-5 Offense", category: "record", pointValue: 1, repeatable: true, condition: (s) => s.offenseRank <= 5 },
  { id: "top_defense", label: "Top-5 Defense", category: "record", pointValue: 1, repeatable: true, condition: (s) => s.defenseRank <= 5 },
  {
    id: "complete_team",
    label: "Top-10 Offense and Defense",
    category: "record",
    pointValue: 2,
    repeatable: true,
    condition: (s) => s.offenseRank <= 10 && s.defenseRank <= 10,
  },

  // Reputation milestones
  { id: "rep_prestige_breakout", label: "Prestige Breakout", category: "reputation", pointValue: 1, repeatable: false, condition: (s) => s.reputationSnapshot.leaguePrestige >= 70 },
  { id: "rep_prestige_elite", label: "Elite Reputation", category: "reputation", pointValue: 2, repeatable: false, condition: (s) => s.reputationSnapshot.leaguePrestige >= 85 },
  { id: "rep_locker_room", label: "Locker Room Leader", category: "reputation", pointValue: 1, repeatable: false, condition: (s) => s.lockerRoomCred >= 80 },
  { id: "rep_media_darling", label: "Media Darling", category: "reputation", pointValue: 1, repeatable: false, condition: (s) => s.reputationSnapshot.mediaRep >= 75 },
  { id: "rep_player_respect", label: "Players' Coach", category: "reputation", pointValue: 1, repeatable: false, condition: (s) => s.reputationSnapshot.playerRespect >= 80 },
  { id: "rep_leadership_trust", label: "Trusted Leader", category: "reputation", pointValue: 1, repeatable: false, condition: (s) => s.reputationSnapshot.leadershipTrust >= 80 },
  { id: "rep_big_delta_prestige", label: "Reputation Surge", category: "reputation", pointValue: 1, repeatable: true, condition: (s) => s.reputationDeltas.leaguePrestige >= 10 },
  {
    id: "rep_stability",
    label: "Steady Hand",
    category: "reputation",
    pointValue: 1,
    repeatable: true,
    condition: (s) => s.volatilityEvents <= 1 && s.reputationDeltas.leadershipTrust >= 5,
  },
  { id: "rep_owner_confidence", label: "Owner's Full Confidence", category: "reputation", pointValue: 1, repeatable: false, condition: (s) => s.ownerConfidence >= 85 },

  // Archetype milestones
  {
    id: "arch_oc_def_credibility",
    label: "Defensive Credibility Earned",
    category: "archetype",
    pointValue: 2,
    repeatable: false,
    archetypeExclusive: "oc_promoted",
    condition: (s) => s.defenseRank <= 10 && s.tenureYear >= 3,
  },
  {
    id: "arch_dc_off_credibility",
    label: "Offensive Credibility Earned",
    category: "archetype",
    pointValue: 2,
    repeatable: false,
    archetypeExclusive: "dc_promoted",
    condition: (s) => s.offenseRank <= 10 && s.tenureYear >= 3,
  },
  {
    id: "arch_stc_legitimacy",
    label: "Legitimacy Established",
    category: "archetype",
    pointValue: 2,
    repeatable: false,
    archetypeExclusive: "stc_promoted",
    condition: (s) => s.reputationSnapshot.leaguePrestige >= 60 && s.tenureYear >= 2,
  },
  {
    id: "arch_college_veteran_trust",
    label: "Veteran Buy-In",
    category: "archetype",
    pointValue: 2,
    repeatable: false,
    archetypeExclusive: "college_hc",
    condition: (s) => s.reputationSnapshot.playerRespect >= 70 && s.tenureYear >= 2,
  },
  {
    id: "arch_grinder_defined",
    label: "Identity Defined",
    category: "archetype",
    pointValue: 2,
    repeatable: false,
    archetypeExclusive: "assistant_grinder",
    condition: (s) => s.reputationSnapshot.mediaRep >= 60 && s.reputationSnapshot.leaguePrestige >= 55,
  },
  {
    id: "arch_guru_culture",
    label: "Culture Established",
    category: "archetype",
    pointValue: 2,
    repeatable: false,
    archetypeExclusive: "young_guru",
    condition: (s) => s.lockerRoomCred >= 70 && s.reputationSnapshot.playerRespect >= 65,
  },
];

export function checkMilestones(
  summary: SeasonSummary,
  earnedMilestoneIds: Set<string>,
): {
  awarded: { source: string; amount: number }[];
  newEarnedIds: Set<string>;
  totalPoints: number;
} {
  const awarded: { source: string; amount: number }[] = [];

  awarded.push({ source: "Season Completion", amount: 3 });

  for (const milestone of MILESTONES) {
    if (milestone.archetypeExclusive && milestone.archetypeExclusive !== summary.archetypeId) continue;
    if (!milestone.repeatable && earnedMilestoneIds.has(milestone.id)) continue;

    if (milestone.condition(summary)) {
      awarded.push({ source: milestone.label, amount: milestone.pointValue });
      earnedMilestoneIds.add(milestone.id);
    }
  }

  const totalPoints = awarded.reduce((sum, award) => sum + award.amount, 0);
  return { awarded, newEarnedIds: earnedMilestoneIds, totalPoints };
}
