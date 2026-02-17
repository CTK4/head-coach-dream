import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getTeamById, getTeams } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PLAYS = [
  { id: "RUN", label: "Run", icon: "🏃", desc: "Low risk, steady yards" },
  { id: "SHORT_PASS", label: "Short Pass", icon: "📡", desc: "Medium risk, reliable gains" },
  { id: "DEEP_PASS", label: "Deep Pass", icon: "🚀", desc: "High risk, big reward" },
  { id: "PLAY_ACTION", label: "Play Action", icon: "🎭", desc: "Deception-based, variable" },
];

const Playcall = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [started, setStarted] = useState(!!state.game.opponentTeamId);

  const teamId = state.acceptedOffer?.teamId;
  const team = teamId ? getTeamById(teamId) : null;
  const g = state.game;
  const oppTeam = g.opponentTeamId ? getTeamById(g.opponentTeamId) : null;

  const handleStart = () => {
    // Pick a random opponent
    const allTeams = getTeams().filter((t) => t.teamId !== teamId && t.isActive);
    const opp = allTeams[Math.floor(Math.random() * allTeams.length)];
    dispatch({ type: "START_GAME", payload: { opponentTeamId: opp.teamId } });
    setStarted(true);
  };

  const handlePlay = (playType: string) => {
    dispatch({ type: "RESOLVE_PLAY", payload: { playType } });
  };

  const endGame = () => {
    const type = state.game.weekType;
    dispatch({ type: "FINISH_GAME" });
    setStarted(false);

    if (type === "PRESEASON") {
      navigate("/hub/preseason");
    } else if (type === "REGULAR_SEASON") {
      navigate("/hub/regular-season");
    } else {
      navigate("/hub");
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Gameplan</h1>
            <Button variant="ghost" onClick={() => navigate("/hub")}>← Hub</Button>
          </div>
          <Card className="text-center">
            <CardContent className="p-8">
              <span className="text-5xl mb-4 block">🏟️</span>
              <h2 className="text-xl font-bold mb-2">Ready to Play?</h2>
              <p className="text-muted-foreground mb-6">Start a game against a random opponent</p>
              <Button onClick={handleStart} size="lg">Kick Off</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Game Day</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate("/hub")}>← Hub</Button>
        </div>

        {/* Scoreboard */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-center">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{team?.abbrev ?? "YOU"}</p>
                <p className="text-4xl font-bold">{g.homeScore}</p>
              </div>
              <div className="px-4">
                <Badge variant="outline" className="text-xs">Q{g.quarter}</Badge>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{oppTeam?.abbrev ?? "OPP"}</p>
                <p className="text-4xl font-bold">{g.awayScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Down & Distance */}
        <Card>
          <CardContent className="p-3 flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <span><span className="text-muted-foreground">Down:</span> <strong>{g.down}</strong></span>
              <span><span className="text-muted-foreground">Dist:</span> <strong>{g.distance}</strong></span>
              <span><span className="text-muted-foreground">Ball:</span> <strong>{g.ballOn}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Last Result */}
        {g.lastResult && (
          <Card className={g.lastResult.includes("TOUCHDOWN") ? "border-primary bg-primary/10" : g.lastResult.includes("Turnover") ? "border-destructive bg-destructive/10" : ""}>
            <CardContent className="p-3 text-center">
              <p className="text-sm font-medium">{g.lastResult}</p>
            </CardContent>
          </Card>
        )}

        {/* Play Tiles */}
        <div className="grid grid-cols-2 gap-3">
          {PLAYS.map((play) => (
            <Card
              key={play.id}
              className="cursor-pointer hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10"
              onClick={() => handlePlay(play.id)}
            >
              <CardContent className="p-4 text-center">
                <span className="text-3xl block mb-2">{play.icon}</span>
                <h3 className="font-semibold">{play.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{play.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* New Game */}
        <Button variant="secondary" className="w-full" onClick={handleStart}>
          New Game
        </Button>

        {/* End Game */}
        <Button variant="secondary" className="w-full" onClick={endGame}>
          End Game
        </Button>
      </div>
    </div>
  );
};

export default Playcall;
