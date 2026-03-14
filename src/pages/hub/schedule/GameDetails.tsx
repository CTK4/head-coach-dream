import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useUserSettings } from "@/hooks/useUserSettings";
import { confirmAutoAdvance } from "@/lib/autoAdvanceConfirm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseGameKey, scoreForGame, teamName } from "@/pages/hub/schedule/scheduleUtils";

export default function GameDetails() {
  const { state, dispatch } = useGame();
  const settings = useUserSettings();
  const navigate = useNavigate();
  const { gameKey } = useParams();
  const decodedGameKey = gameKey ? decodeURIComponent(gameKey) : "";
  const parsed = parseGameKey(decodedGameKey);
  const score = scoreForGame(state, decodedGameKey);
  const box = useMemo(() => (state.gameHistory ?? []).find((g) => g.week === parsed.week && g.home.teamId === parsed.homeTeamId && g.away.teamId === parsed.awayTeamId), [state.gameHistory, parsed.week, parsed.homeTeamId, parsed.awayTeamId]);

  if (!gameKey) return null;

  const userTeamId = state.acceptedOffer?.teamId;
  const isUserGame = userTeamId && (parsed.homeTeamId === userTeamId || parsed.awayTeamId === userTeamId);
  const canPlay = isUserGame && parsed.week === state.hub.regularSeasonWeek && !score && state.careerStage === "REGULAR_SEASON";
  const opponentId = parsed.homeTeamId === userTeamId ? parsed.awayTeamId : parsed.homeTeamId;

  const handlePlay = () => {
    if (state.league.phase === "REGULAR_SEASON") {
      if (!confirmAutoAdvance(settings, "Advance to the next week?")) return;
      dispatch({ type: "ADVANCE_WEEK" });
      navigate("/hub/gameplan");
    } else if (state.league.phase === "REGULAR_SEASON_GAMEPLAN") {
      navigate("/hub/gameplan");
    } else {
      dispatch({ type: "START_GAME", payload: { opponentTeamId: opponentId, weekType: "REGULAR_SEASON", weekNumber: parsed.week } });
      navigate("/hub/playcall");
    }
  };

  return <Card><CardContent className="p-4 space-y-2">
    <h2 className="text-lg font-semibold">{teamName(parsed.awayTeamId)} @ {teamName(parsed.homeTeamId)}</h2>
    <div className="text-sm">Week {parsed.week} · {parsed.gameType}</div>
    {score ? <div className="text-base">Final: {score.awayScore} - {score.homeScore}</div> : <div className="text-sm text-muted-foreground">Game not played yet.</div>}
    {canPlay && <Button onClick={handlePlay}>Play Game</Button>}
    {box ? <div className="text-sm text-muted-foreground">Box: Pass Yds {box.home.passYards}-{box.away.passYards} · Rush Yds {box.home.rushYards}-{box.away.rushYards}</div> : null}
  </CardContent></Card>;
}
