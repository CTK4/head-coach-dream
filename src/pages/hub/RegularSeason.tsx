import { useNavigate } from "react-router-dom";
import { useGame, REGULAR_SEASON_WEEKS } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const RegularSeason = () => {
  const { state, dispatch, getCurrentTeamMatchup } = useGame();
  const navigate = useNavigate();

  const current = getCurrentTeamMatchup("REGULAR_SEASON");
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
    dispatch({ type: "START_GAME", payload: { opponentTeamId: opponentId, weekType: "REGULAR_SEASON", weekNumber: current.week } });
    navigate("/hub/playcall");
  };

  return (
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
  );
};

export default RegularSeason;
