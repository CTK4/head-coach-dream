import { Link, useParams } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { gameKey, scoreForGame, teamName } from "@/pages/hub/schedule/scheduleUtils";

export default function TeamSchedule() {
  const { state } = useGame();
  const params = useParams();
  const teamId = params.teamId ?? state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const rows = (state.hub.schedule?.regularSeasonWeeks ?? []).flatMap((week) => week.matchups.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId).map((m) => ({ week: week.week, matchup: m })));
  return <div className="space-y-3">{rows.map((row) => {
    const m = row.matchup;
    const key = gameKey("REGULAR_SEASON", row.week, m.homeTeamId, m.awayTeamId);
    const score = scoreForGame(state, key);
    const isHome = m.homeTeamId === teamId;
    const opp = isHome ? m.awayTeamId : m.homeTeamId;
    const wl = !score ? "" : ((isHome ? score.homeScore > score.awayScore : score.awayScore > score.homeScore) ? "W" : "L");
    return <Card key={key}><CardContent className="p-4 flex items-center justify-between"><div className="text-sm">Week {row.week}: {isHome ? "vs" : "@"} {teamName(opp)} {score ? <span className="ml-2 text-xs text-muted-foreground">{wl} {isHome ? `${score.homeScore}-${score.awayScore}` : `${score.awayScore}-${score.homeScore}`}</span> : null}</div><Link className="text-sm underline" to={`/hub/schedule/game/${encodeURIComponent(key)}`}>Details</Link></CardContent></Card>;
  })}</div>;
}
