import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getTeamById, getTeamSummary } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const Hub = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const teamId = state.acceptedOffer?.teamId;
  const team = teamId ? getTeamById(teamId) : null;
  const summary = teamId ? getTeamSummary(teamId) : null;

  if (!teamId || !team) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>No team assigned. Please complete the hiring process.</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Start Over
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{team.name}</h2>
              <p className="text-muted-foreground">{team.region} • {team.stadium}</p>
              <p className="text-sm text-muted-foreground mt-1">HC: {state.coach.name}</p>
            </div>
            <Badge className="text-lg px-3 py-1">{summary?.overall ?? 0} OVR</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Players</p>
            <p className="text-2xl font-bold">{summary?.playerCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Cap Space</p>
            <p className="text-2xl font-bold">${((summary?.capSpace ?? 0) / 1_000_000).toFixed(0)}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Contract</p>
            <p className="text-2xl font-bold">{state.acceptedOffer?.years ?? 0}yr</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">League News</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {state.hub.news.map((item, i) => (
                <div key={i} className="flex gap-3 items-start border-b border-border/50 pb-3 last:border-0">
                  <Badge variant="outline" className="shrink-0 mt-0.5 text-xs">
                    NEWS
                  </Badge>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })}>Advance Career Stage</Button>
        <Button variant="ghost" onClick={() => { dispatch({ type: "RESET" }); navigate("/"); }}>
          Reset Save
        </Button>
      </div>
    </div>
  );
};

export default Hub;
