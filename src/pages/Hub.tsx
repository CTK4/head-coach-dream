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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p>No team assigned. Please complete the hiring process.</p>
            <Button onClick={() => navigate("/")} className="mt-4">Start Over</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Team Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{team.name}</h1>
                <p className="text-muted-foreground">{team.region} • {team.stadium}</p>
                <p className="text-sm text-muted-foreground mt-1">HC: {state.coach.name}</p>
              </div>
              <div className="text-right">
                <Badge className="text-lg px-3 py-1">{summary?.overall ?? 0} OVR</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
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

        {/* Navigation Cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => navigate("/roster")}>
            <CardContent className="p-5 text-center">
              <span className="text-3xl">📋</span>
              <h3 className="font-semibold mt-2">Roster</h3>
              <p className="text-xs text-muted-foreground">View your team</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => navigate("/draft")}>
            <CardContent className="p-5 text-center">
              <span className="text-3xl">🔍</span>
              <h3 className="font-semibold mt-2">Draft / Scouting</h3>
              <p className="text-xs text-muted-foreground">Scout prospects</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => navigate("/playcall")}>
            <CardContent className="p-5 text-center">
              <span className="text-3xl">🏟️</span>
              <h3 className="font-semibold mt-2">Gameplan</h3>
              <p className="text-xs text-muted-foreground">Call plays</p>
            </CardContent>
          </Card>
        </div>

        {/* News Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">League News</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {state.hub.news.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start border-b border-border/50 pb-3 last:border-0">
                    <Badge variant="outline" className="shrink-0 mt-0.5 text-xs">NEWS</Badge>
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Reset */}
        <Button variant="ghost" className="text-xs text-muted-foreground" onClick={() => { dispatch({ type: "RESET" }); navigate("/"); }}>
          Reset Save
        </Button>
      </div>
    </div>
  );
};

export default Hub;
