import { Link, useParams, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useUserSettings } from "@/hooks/useUserSettings";
import { confirmAutoAdvance } from "@/lib/autoAdvanceConfirm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { gameKey, scoreForGame, teamName } from "@/pages/hub/schedule/scheduleUtils";

export default function TeamSchedule() {
  const { state, dispatch } = useGame();
  const settings = useUserSettings();
  const navigate = useNavigate();
  const params = useParams();
  const teamId = params.teamId ?? state.acceptedOffer?.teamId;
  const userTeamId = state.acceptedOffer?.teamId;
  const currentWeek = state.hub.regularSeasonWeek;

  if (!teamId) return null;

  const handlePlay = (opponentId: string) => {
    if (state.league.phase === "REGULAR_SEASON") {
      if (!confirmAutoAdvance(settings, "Advance to the next week?")) return;
      dispatch({ type: "ADVANCE_WEEK" });
      navigate("/hub/gameplan");
    } else if (state.league.phase === "REGULAR_SEASON_GAMEPLAN") {
      navigate("/hub/gameplan");
    } else {
      dispatch({ type: "START_GAME", payload: { opponentTeamId: opponentId, weekType: "REGULAR_SEASON", weekNumber: currentWeek } });
      navigate("/hub/playcall");
    }
  };

  const rows = (state.hub.schedule?.regularSeasonWeeks ?? []).flatMap((week) => week.matchups.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId).map((m) => ({ week: week.week, matchup: m })));
  return <div className="space-y-3">{rows.map((row) => {
    const m = row.matchup;
    const key = gameKey("REGULAR_SEASON", row.week, m.homeTeamId, m.awayTeamId);
    const score = scoreForGame(state, key);
    const isHome = m.homeTeamId === teamId;
    const opp = isHome ? m.awayTeamId : m.homeTeamId;
    const wl = !score ? "" : ((isHome ? score.homeScore > score.awayScore : score.awayScore > score.homeScore) ? "W" : "L");
    const isUserTeam = teamId === userTeamId;
    const canPlay = isUserTeam && row.week === currentWeek && !score && state.careerStage === "REGULAR_SEASON";
    return <Card key={key}><CardContent className="p-4 flex items-center justify-between">
      <div className="text-sm">Week {row.week}: {isHome ? "vs" : "@"} {teamName(opp)} {score ? <span className="ml-2 text-xs text-muted-foreground">{wl} {isHome ? `${score.homeScore}-${score.awayScore}` : `${score.awayScore}-${score.homeScore}`}</span> : null}</div>
      <div className="flex items-center gap-2">
        {canPlay && <Button size="sm" onClick={() => handlePlay(opp)}>Play</Button>}
        <Link className="text-sm underline" to={`/hub/schedule/game/${encodeURIComponent(key)}`}>Details</Link>
      </div>
    </CardContent></Card>;
  })}</div>;
}
