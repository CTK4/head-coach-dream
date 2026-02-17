import { Navigate, useNavigate } from "react-router-dom";
import { useGame, PRESEASON_WEEKS } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PreseasonWeek = () => {
  const { state, dispatch, getCurrentTeamMatchup } = useGame();
  const navigate = useNavigate();

  if (state.careerStage !== "PRESEASON") return <Navigate to="/hub/offseason" replace />;

  const current = getCurrentTeamMatchup("PRESEASON");
  const matchup = current?.matchup;
  const teamId = state.acceptedOffer?.teamId;

  const opponentId = matchup
    ? matchup.homeTeamId === teamId
      ? matchup.awayTeamId
      : matchup.homeTeamId
    : undefined;
  const opponent = opponentId ? getTeamById(opponentId) : null;

  const kickoff = () => {
    if (!opponentId || !current) return;
    dispatch({ type: "START_GAME", payload: { opponentTeamId: opponentId, weekType: "PRESEASON", weekNumber: current.week } });
    if (state.hub.preseasonWeek >= 3) dispatch({ type: "OFFSEASON_SET_STEP", payload: { stepId: "CUT_DOWNS" } });
    navigate("/hub/playcall");
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <h2 className="text-2xl font-bold">Preseason Week {state.hub.preseasonWeek}</h2>
        <p className="text-sm text-muted-foreground">Preseason is fixed at {PRESEASON_WEEKS} games.</p>
        <p>
          Matchup: <strong>{opponent?.name ?? "No matchup available"}</strong>
        </p>
        <Button onClick={kickoff} disabled={!opponentId}>
          Kickoff
        </Button>
      </CardContent>
    </Card>
  );
};

export default PreseasonWeek;
