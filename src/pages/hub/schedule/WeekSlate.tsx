import { Link, useParams, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useUserSettings } from "@/hooks/useUserSettings";
import { confirmAutoAdvance } from "@/lib/autoAdvanceConfirm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { gameKey, scoreForGame, teamName } from "@/pages/hub/schedule/scheduleUtils";

export default function WeekSlate() {
  const { state, dispatch } = useGame();
  const settings = useUserSettings();
  const navigate = useNavigate();
  const params = useParams();
  const week = Number(params.weekNumber ?? state.hub.regularSeasonWeek);
  const ws = state.hub.schedule?.regularSeasonWeeks.find((w) => w.week === week);
  const userTeamId = state.acceptedOffer?.teamId;
  const currentWeek = state.hub.regularSeasonWeek;

  if (!ws) return <div className="p-4 text-sm text-muted-foreground">No week slate found.</div>;

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

  return <div className="space-y-3">{ws.matchups.map((m) => {
    const key = gameKey("REGULAR_SEASON", week, m.homeTeamId, m.awayTeamId);
    const score = scoreForGame(state, key);
    const isUserGame = userTeamId && (m.homeTeamId === userTeamId || m.awayTeamId === userTeamId);
    const canPlay = isUserGame && week === currentWeek && !score && state.careerStage === "REGULAR_SEASON";
    const opponentId = m.homeTeamId === userTeamId ? m.awayTeamId : m.homeTeamId;
    return <Card key={key}><CardContent className="p-4 flex items-center justify-between">
      <div className="text-sm"><div>{teamName(m.awayTeamId)} @ {teamName(m.homeTeamId)}</div>{score ? <div className="text-xs text-muted-foreground">Final {score.awayScore}-{score.homeScore}</div> : <div className="text-xs text-muted-foreground">Scheduled</div>}</div>
      <div className="flex items-center gap-2">
        {canPlay && <Button size="sm" onClick={() => handlePlay(opponentId)}>Play</Button>}
        <Link className="text-sm underline" to={`/hub/schedule/game/${encodeURIComponent(key)}`}>Details</Link>
      </div>
    </CardContent></Card>;
  })}</div>;
}
