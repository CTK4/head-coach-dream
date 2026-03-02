import type { GameState } from "@/context/GameContext";

export type HotSeatLevel = "SECURE" | "WARM" | "HOT" | "CRITICAL";

export interface HotSeatFactor {
  label: string;
  contribution: number;
}

export interface HotSeatStatus {
  level: HotSeatLevel;
  score: number;
  primaryDriver: string;
  factors: HotSeatFactor[];
}

function levelFromScore(score: number): HotSeatLevel {
  if (score >= 70) return "CRITICAL";
  if (score >= 45) return "HOT";
  if (score >= 25) return "WARM";
  return "SECURE";
}

export function computeHotSeatScore(coach: GameState["coach"], gameState: GameState): HotSeatStatus {
  const factors: HotSeatFactor[] = [];
  const record = gameState.currentStandings.find((s) => s.teamId === gameState.acceptedOffer?.teamId);
  const wins = Number(record?.w ?? 0);
  const losses = Number(record?.l ?? 0);
  const games = Math.max(1, wins + losses);
  const over500 = wins - losses;
  const week = Number(gameState.hub.regularSeasonWeek ?? gameState.week ?? 1);

  const ownerExpectation = "PLAYOFFS";
  if (ownerExpectation === "PLAYOFFS" && week >= 8 && over500 <= -3) factors.push({ label: "Under playoff expectation", contribution: 25 });
  if (ownerExpectation !== "PLAYOFFS" && losses > wins) factors.push({ label: "Rebuild losses", contribution: 8 });
  if (over500 >= 3) factors.push({ label: "Exceeding expectations", contribution: -15 });

  const ownerConfidence = Number(gameState.owner.approval ?? 60);
  if (ownerConfidence < 40) factors.push({ label: "Owner confidence low", contribution: 20 });
  else if (ownerConfidence < 60) factors.push({ label: "Owner confidence slipping", contribution: 10 });
  else if (ownerConfidence > 75) factors.push({ label: "Owner confidence strong", contribution: -10 });

  if (coach.tenureYear <= 1) factors.push({ label: "Year 1 honeymoon", contribution: -10 });

  const rep = coach.reputation;
  if ((rep?.leaguePrestige ?? 50) > 70) factors.push({ label: "League prestige", contribution: -8 });
  if ((rep?.leaguePrestige ?? 50) < 45) factors.push({ label: "Limited prestige", contribution: 8 });
  if ((coach.lockerRoomCred ?? 55) < 50) factors.push({ label: "Locker room concerns", contribution: 12 });

  const streak = Number(gameState.league.streakByTeamId?.[gameState.acceptedOffer?.teamId ?? ""] ?? 0);
  if (streak <= -4) factors.push({ label: "Losing streak", contribution: 15 });
  if (streak >= 4) factors.push({ label: "Winning streak", contribution: -10 });

  if (coach.archetypeId === "assistant_grinder") factors.push({ label: "Short owner leash", contribution: 5 });
  if (coach.archetypeId === "young_guru" && (rep?.playerRespect ?? 60) < 55) factors.push({ label: "Veteran skepticism", contribution: 8 });

  const score = Math.max(0, Math.min(100, Math.round(factors.reduce((s, f) => s + f.contribution, 0))));
  const positive = factors.filter((f) => f.contribution > 0).sort((a, b) => b.contribution - a.contribution)[0];

  return {
    level: levelFromScore(score),
    score,
    primaryDriver: positive?.label ?? "Stable outlook",
    factors,
  };
}
