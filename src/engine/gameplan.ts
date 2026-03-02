import type { PlayType } from "@/engine/gameSim";
import { hashSeed, rng } from "@/engine/rng";

export type WeeklyGameplan = {
  offensiveFocus: "BALANCED" | "RUN_HEAVY" | "PASS_HEAVY";
  tempo: "SLOW" | "NORMAL" | "FAST";
  aggression: "CONSERVATIVE" | "STANDARD" | "AGGRESSIVE";
  defensiveFocus: "STOP_RUN" | "STOP_PASS" | "BALANCED";
  pressureRate: "LOW" | "MEDIUM" | "HIGH";
  starAssignments: {
    doubleTeamPlayerId?: string;
    spyPlayerId?: string;
  };
  scriptedOpening: PlayType[];
  locked: boolean;
};

export type OpponentTendencies = {
  earlyDownRunRate: number;
  thirdDownPassRate: number;
  redZonePassRate: number;
  blitzRate: number;
  targetShareLeaders: Array<{ playerName: string; targetShare: number }>;
};

export const DEFAULT_WEEKLY_GAMEPLAN: WeeklyGameplan = {
  offensiveFocus: "BALANCED",
  tempo: "NORMAL",
  aggression: "STANDARD",
  defensiveFocus: "BALANCED",
  pressureRate: "MEDIUM",
  starAssignments: {},
  scriptedOpening: ["INSIDE_ZONE", "QUICK_GAME", "DROPBACK"],
  locked: false,
};

export function deriveOpponentTendencies(seed: number, teamId: string, weekIndex: number): OpponentTendencies {
  const r = rng(hashSeed(seed, "opponent-tendencies", teamId, weekIndex));
  const earlyDownRunRate = 0.35 + r() * 0.3;
  const thirdDownPassRate = 0.5 + r() * 0.35;
  const redZonePassRate = 0.35 + r() * 0.4;
  const blitzRate = 0.15 + r() * 0.35;
  return {
    earlyDownRunRate,
    thirdDownPassRate,
    redZonePassRate,
    blitzRate,
    targetShareLeaders: [
      { playerName: `${teamId} WR1`, targetShare: 0.27 + r() * 0.08 },
      { playerName: `${teamId} TE1`, targetShare: 0.18 + r() * 0.07 },
    ],
  };
}

export function buildCpuGameplan(params: { seed: number; teamId: string; weekIndex: number; strengthDelta: number }): WeeklyGameplan {
  const r = rng(hashSeed(params.seed, "cpu-gameplan", params.teamId, params.weekIndex));
  const offensiveFocus = params.strengthDelta > 4 ? "RUN_HEAVY" : params.strengthDelta < -4 ? "PASS_HEAVY" : (r() > 0.5 ? "BALANCED" : "PASS_HEAVY");
  const defensiveFocus = params.strengthDelta > 4 ? "STOP_RUN" : params.strengthDelta < -4 ? "STOP_PASS" : "BALANCED";
  const aggression = params.strengthDelta < 0 ? "AGGRESSIVE" : "STANDARD";

  return {
    offensiveFocus,
    tempo: r() > 0.65 ? "FAST" : "NORMAL",
    aggression,
    defensiveFocus,
    pressureRate: r() > 0.7 ? "HIGH" : "MEDIUM",
    starAssignments: {},
    scriptedOpening: offensiveFocus === "RUN_HEAVY" ? ["INSIDE_ZONE", "POWER", "QUICK_GAME"] : ["QUICK_GAME", "DROPBACK", "INSIDE_ZONE"],
    locked: true,
  };
}
