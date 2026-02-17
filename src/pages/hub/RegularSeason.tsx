import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame, REGULAR_SEASON_WEEKS } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type StandingRow = { teamId: string; w: number; l: number; pf: number; pa: number; diff: number };

function buildStandings(standings: Record<string, { w: number; l: number; pf: number; pa: number }>): StandingRow[] {
  return Object.entries(standings)
    .map(([teamId, s]) => ({ teamId, ...s, diff: (s.pf ?? 0) - (s.pa ?? 0) }))
    .sort((a, b) => b.w - a.w || a.l - b.l || b.diff - a.diff || b.pf - a.pf || a.teamId.localeCompare(b.teamId));
}

function StandingsPanel({ myTeamId }: { myTeamId: string }) {
  const { state } = useGame();
  const rows = useMemo(() => buildStandings(state.league.standings), [state.league.standings]);
  const top = rows.slice(0, 10);
  const myRow = rows.find((r) => r.teamId === myTeamId);
  const myRank = myRow ? rows.findIndex((r) => r.teamId === myTeamId) + 1 : null;
  const showMy = myRow && !top.some((r) => r.teamId === myTeamId);

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">League Standings</div>
          <Badge variant="outline">{rows.length} teams</Badge>
        </div>

        <div className="text-xs text-muted-foreground grid grid-cols-[1fr_auto_auto_auto] gap-2 px-1">
          <div>Team</div>
          <div className="text-right">W-L</div>
          <div className="text-right">PF</div>
          <div className="text-right">PA</div>
        </div>

        <div className="space-y-1">
          {top.map((r, idx) => (
            <div
              key={r.teamId}
              className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center rounded-md px-2 py-1 ${
                r.teamId === myTeamId ? "bg-secondary/70" : ""
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="w-8 justify-center shrink-0">
                  {idx + 1}
                </Badge>
                <div className="truncate">{getTeamById(r.teamId)?.name ?? r.teamId}</div>
              </div>
              <div className="text-right tabular-nums">{r.w}-{r.l}</div>
              <div className="text-right tabular-nums">{r.pf}</div>
              <div className="text-right tabular-nums">{r.pa}</div>
            </div>
          ))}

          {showMy && myRow && myRank && (
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center rounded-md px-2 py-1 bg-secondary/70">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="w-8 justify-center shrink-0">
                  {myRank}
                </Badge>
                <div className="truncate">{getTeamById(myTeamId)?.name ?? myTeamId}</div>
              </div>
              <div className="text-right tabular-nums">{myRow.w}-{myRow.l}</div>
              <div className="text-right tabular-nums">{myRow.pf}</div>
              <div className="text-right tabular-nums">{myRow.pa}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const RegularSeason = () => {
  const { state, dispatch, getCurrentTeamMatchup } = useGame();
  const navigate = useNavigate();

  const current = getCurrentTeamMatchup("REGULAR_SEASON");
  const matchup = current?.matchup;
  const teamId = state.acceptedOffer?.teamId;

  const opponentId = matchup ? (matchup.homeTeamId === teamId ? matchup.awayTeamId : matchup.homeTeamId) : undefined;
  const opponent = opponentId ? getTeamById(opponentId) : null;

  const kickoff = () => {
    if (!opponentId || !current) return;
    dispatch({ type: "START_GAME", payload: { opponentTeamId: opponentId, weekType: "REGULAR_SEASON", weekNumber: current.week } });
    navigate("/hub/playcall");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-2xl font-bold">Regular Season Week {state.hub.regularSeasonWeek}</h2>
          <p className="text-sm text-muted-foreground">Regular season currently runs {REGULAR_SEASON_WEEKS} weeks.</p>
          <p>
            Matchup: <strong>{opponent?.name ?? "No matchup available"}</strong>
          </p>
          <Button onClick={kickoff} disabled={!opponentId}>
            Kickoff
          </Button>
        </CardContent>
      </Card>
      {teamId ? <StandingsPanel myTeamId={teamId} /> : null}
    </div>
  );
};

export default RegularSeason;
