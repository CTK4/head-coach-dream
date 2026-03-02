import type { PlayerSeasonStats } from "@/types/stats";

export interface HOFmFactor { label: string; value: number; }
export interface HOFmResult {
  score: number;
  tier: "LOCK" | "STRONG" | "BORDERLINE" | "LONGSHOT" | "UNLIKELY";
  label: string;
  breakdown: HOFmFactor[];
}

type InputPlayer = {
  pos?: string;
  overall?: number;
  careerStats?: { seasons: PlayerSeasonStats[]; careerTotals?: Record<string, number> };
  accolades?: { proBowls?: number; formerAllPro?: boolean; formerMvp?: boolean; formerDPOY?: boolean; championships?: number; allDecade?: number; allProSelections?: number };
};

const tierFor = (score: number): Pick<HOFmResult, "tier" | "label"> => {
  if (score >= 150) return { tier: "LOCK", label: "First-Ballot Lock" };
  if (score >= 100) return { tier: "STRONG", label: "Strong Candidate" };
  if (score >= 80) return { tier: "BORDERLINE", label: "Borderline Candidate" };
  if (score >= 60) return { tier: "LONGSHOT", label: "Long Shot" };
  return { tier: "UNLIKELY", label: "Unlikely" };
};

export function computeHOFm(player: InputPlayer): HOFmResult | null {
  const seasons = player.careerStats?.seasons ?? [];
  if (seasons.length < 3) return null;
  const overall = Number(player.overall ?? 75);
  const avArr = seasons.map((s) => (overall / 99) * 20 * (Number(s.gamesPlayed ?? 0) / 17)).sort((a, b) => b - a);
  const weighted = avArr.reduce((sum, v, i) => sum + v * Math.max(0.25, 1 - i * 0.05), 0);

  const a = player.accolades ?? {};
  const proBowls = Number(a.proBowls ?? 0);
  const allPro = Number(a.allProSelections ?? (a.formerAllPro ? 1 : 0));
  const mvp = a.formerMvp ? 1 : 0;
  const dpoy = a.formerDPOY ? 1 : 0;
  const decade = Number(a.allDecade ?? 0);
  const champs = Number(a.championships ?? 0);

  let milestones = 0;
  const totals = player.careerStats?.careerTotals ?? {};
  const pos = String(player.pos ?? "").toUpperCase();
  if (pos === "QB") { milestones += Math.max(0, (Number(totals.passingYards ?? 0) - 40000) * 0.00075); milestones += Math.max(0, (Number(totals.passingTDs ?? 0) - 250) * 0.0075); }
  if (pos === "RB") { milestones += Math.max(0, (Number(totals.rushingYards ?? 0) - 10000) * 0.002); milestones += Math.max(0, (Number(totals.rushingTDs ?? 0) - 75) * 0.15); }
  if (["WR", "TE"].includes(pos)) { milestones += Math.max(0, (Number(totals.receivingYards ?? 0) - 10000) * 0.001); milestones += Math.max(0, (Number(totals.receptions ?? 0) - 750) * 0.025); }
  if (["DE", "OLB", "EDGE"].includes(pos)) { const sacks = Number(totals.sacks ?? 0); milestones += Math.max(0, (sacks - 100) * 0.25); milestones += Math.max(0, (sacks - 125) * 0.25); }
  if (["ILB", "MLB", "LB"].includes(pos)) milestones += Math.max(0, (Number(totals.tackles ?? 0) - 1000) * 0.01);
  if (["CB", "DB", "S", "FS", "SS"].includes(pos)) milestones += Math.max(0, (Number((totals as any).interceptionsDef ?? 0) - 40) * 0.5);
  if (pos === "K") milestones += Math.max(0, (Number((totals as any).fieldGoalsMade ?? 0) - 300) * 0.1);

  const consistency = allPro / seasons.length > 0.33 ? 25 : 0;
  const champBonus = champs * (pos === "QB" ? 2.5 : 2);

  const breakdown: HOFmFactor[] = [
    { label: "Weighted Career Value", value: weighted },
    { label: `Pro Bowl Selections (${proBowls})`, value: proBowls * 3 },
    { label: `1st-Team All-Pro (${allPro})`, value: allPro * 4.5 },
    { label: "Awards", value: mvp * 12.5 + dpoy * 12.5 + decade * 25 },
    { label: "Championships", value: champBonus },
    { label: "Consistency", value: consistency },
    { label: "Statistical Milestones", value: milestones },
  ];

  const score = breakdown.reduce((s, b) => s + b.value, 0);
  const tier = tierFor(score);
  return { score: Number(score.toFixed(1)), ...tier, breakdown: breakdown.map((b) => ({ ...b, value: Number(b.value.toFixed(1)) })) };
}
