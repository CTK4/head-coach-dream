import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTeamById } from "@/data/leagueDb";
import { getPlayoffRoundGames } from "@/engine/playoffsSim";

export default function PlayoffsPage() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  if (state.careerStage !== "PLAYOFFS") return <Navigate to="/hub" replace />;
  if (!["WILD_CARD", "DIVISIONAL", "CONFERENCE", "CHAMPIONSHIP"].includes(state.league.phase)) return <Navigate to="/hub" replace />;
  const playoffs = state.playoffs;
  if (!playoffs) return <div className="p-4">No playoff bracket available.</div>;

  const games = getPlayoffRoundGames(playoffs);
  const pending = playoffs.pendingUserGame;

  useEffect(() => {
    dispatch({ type: "PLAYOFFS_SIM_CPU_GAMES_FOR_ROUND" });
  }, [dispatch, playoffs?.round]);


  const playNext = () => {
    if (!pending) return;
    const myTeam = state.acceptedOffer?.teamId;
    const opp = pending.homeTeamId === myTeam ? pending.awayTeamId : pending.homeTeamId;
    if (state.teamGameplans?.[String(state.acceptedOffer?.teamId ?? "")]?.locked !== true) {
      navigate("/hub/gameplan");
      return;
    }
    dispatch({ type: "START_GAME", payload: { opponentTeamId: opp, weekType: "PLAYOFFS", weekNumber: 1, playoffGameId: pending.gameId } });
    navigate("/hub/playcall");
  };

  return <div className="space-y-4"><h2 className="text-2xl font-bold">Playoffs · {playoffs.round.replace("_", " ")}</h2>
    {pending ? <Button onClick={playNext}>Play Next Game</Button> : <div className="text-sm text-muted-foreground">No pending user game this round.</div>}
    <div className="space-y-3">{games.map((g) => {
      const fin = playoffs.completedGames[g.gameId];
      return <Card key={g.gameId}><CardContent className="p-4"><div className="text-sm">{getTeamById(g.awayTeamId)?.name ?? g.awayTeamId} @ {getTeamById(g.homeTeamId)?.name ?? g.homeTeamId}</div>{fin ? <div className="text-xs text-muted-foreground">Final {fin.awayScore}-{fin.homeScore}</div> : <div className="text-xs text-muted-foreground">Pending</div>}</CardContent></Card>;
    })}</div>
  </div>;
}
