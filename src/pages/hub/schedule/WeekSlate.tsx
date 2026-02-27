import { Link, useParams } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { gameKey, scoreForGame, teamName } from "@/pages/hub/schedule/scheduleUtils";

export default function WeekSlate() {
  const { state } = useGame();
  const params = useParams();
  const week = Number(params.weekNumber ?? state.hub.regularSeasonWeek);
  const ws = state.hub.schedule?.regularSeasonWeeks.find((w) => w.week === week);
  if (!ws) return <div className="p-4 text-sm text-muted-foreground">No week slate found.</div>;

  return <div className="space-y-3">{ws.matchups.map((m) => {
    const key = gameKey("REGULAR_SEASON", week, m.homeTeamId, m.awayTeamId);
    const score = scoreForGame(state, key);
    return <Card key={key}><CardContent className="p-4 flex items-center justify-between">
      <div className="text-sm"><div>{teamName(m.awayTeamId)} @ {teamName(m.homeTeamId)}</div>{score ? <div className="text-xs text-muted-foreground">Final {score.awayScore}-{score.homeScore}</div> : <div className="text-xs text-muted-foreground">Scheduled</div>}</div>
      <Link className="text-sm underline" to={`/hub/schedule/game/${encodeURIComponent(key)}`}>Details</Link>
    </CardContent></Card>;
  })}</div>;
}
