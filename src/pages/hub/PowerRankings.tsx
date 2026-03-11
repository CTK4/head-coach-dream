import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { computeWeeklyPowerRankings } from "@/systems/powerRankings";
import type { TeamWeeklyPerformance } from "@/systems/powerRankings";

export default function PowerRankings() {
  const { state } = useGame();
  const userTeamId = String(state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? "");

  const rankings = useMemo(() => {
    const rows: TeamWeeklyPerformance[] = state.currentStandings.map((s) => {
      const games = s.wins + s.losses + (s.ties ?? 0);
      const last4 = (s.lastFive ?? []).slice(-4);
      return {
        teamId: String(s.teamId),
        wins: s.wins,
        losses: s.losses,
        pointsFor: s.pointsFor ?? 0,
        pointsAgainst: s.pointsAgainst ?? 0,
        strengthOfSchedule: 0.5,
        last4Wins: last4.filter((r) => r === "W").length,
        last4Games: last4.length,
        offensiveEfficiency: games > 0 ? Math.min(1, (s.pointsFor ?? 0) / (games * 28)) : 0.5,
        defensiveEfficiency: games > 0 ? Math.max(0, 1 - (s.pointsAgainst ?? 0) / (games * 28)) : 0.5,
      };
    });
    return computeWeeklyPowerRankings(rows);
  }, [state.currentStandings]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-20">
      <div className="mx-auto max-w-screen-sm space-y-2 px-4 pt-4 text-sm">
        <h1 className="text-xl font-bold">Power Rankings</h1>
        <p className="text-xs text-muted-foreground">Based on record, point differential, recent form, and unit efficiency.</p>
        <div className="space-y-1 pt-1">
          {rankings.map((row) => {
            const team = getTeamById(row.teamId);
            const isUser = row.teamId === userTeamId;
            const standing = state.currentStandings.find((s) => String(s.teamId) === row.teamId);
            const w = standing?.wins ?? 0;
            const l = standing?.losses ?? 0;
            return (
              <div
                key={row.teamId}
                className={`flex items-center gap-3 rounded border px-3 py-2 ${isUser ? "border-blue-500/60 bg-blue-950/30" : "border-white/10 bg-[#13131A]"}`}
              >
                <span className={`w-6 text-center text-base font-bold tabular-nums ${row.rank <= 3 ? "text-amber-400" : "text-muted-foreground"}`}>
                  {row.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${isUser ? "text-blue-300" : ""}`}>
                    {team?.name ?? row.teamId}
                    {isUser && <span className="ml-1 text-xs text-blue-400">(You)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{w}–{l}</div>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">{row.score.toFixed(3)}</span>
              </div>
            );
          })}
          {rankings.length === 0 && (
            <p className="pt-4 text-center text-xs text-muted-foreground">No standings data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
