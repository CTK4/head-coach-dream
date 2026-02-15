import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getPlayers, type PlayerRow } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const Draft = () => {
  const { state } = useGame();
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRow | null>(null);
  const [scouted, setScouted] = useState<Set<string>>(new Set());

  // Generate draft prospects from free agents / young players
  const prospects = useMemo(() => {
    const all = getPlayers();
    return all
      .filter((p) => {
        const age = p.age ?? 30;
        const status = String(p.status ?? "").toUpperCase();
        return age <= 24 || status === "DRAFT_ELIGIBLE" || status === "ROOKIE";
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, 60);
  }, []);

  const handleScout = (playerId: string) => {
    setScouted((prev) => new Set(prev).add(playerId));
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Draft / Scouting</h1>
            <p className="text-sm text-muted-foreground">{prospects.length} prospects</p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/hub")}>← Hub</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prospect List */}
          <ScrollArea className="h-[70vh]">
            <div className="space-y-2 pr-4">
              {prospects.map((p, i) => (
                <Card
                  key={p.playerId}
                  className={`cursor-pointer transition-all ${selectedPlayer?.playerId === p.playerId ? "border-primary" : "hover:border-primary/50"}`}
                  onClick={() => setSelectedPlayer(p)}
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-6">#{i + 1}</span>
                      <Badge variant="outline" className="text-xs w-10 justify-center">{p.pos}</Badge>
                      <div>
                        <p className="font-medium text-sm">{p.fullName}</p>
                        <p className="text-xs text-muted-foreground">{p.college ?? "Unknown"}</p>
                      </div>
                    </div>
                    {scouted.has(p.playerId) && (
                      <Badge className="bg-primary text-primary-foreground text-xs">{p.overall}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Detail Panel */}
          <div className="hidden md:block">
            {selectedPlayer ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>{selectedPlayer.fullName}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedPlayer.pos}</Badge>
                    <Badge variant="secondary">Age {selectedPlayer.age}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">College</p>
                    <p className="font-medium">{selectedPlayer.college ?? "Unknown"}</p>
                  </div>
                  {scouted.has(selectedPlayer.playerId) ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Overall</p>
                          <p className="text-2xl font-bold">{selectedPlayer.overall ?? "?"}</p>
                        </div>
                        <div className="bg-secondary rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Potential</p>
                          <p className="text-2xl font-bold">{selectedPlayer.potential ?? "?"}</p>
                        </div>
                      </div>
                      {selectedPlayer.Archetype && (
                        <div>
                          <p className="text-sm text-muted-foreground">Archetype</p>
                          <Badge>{selectedPlayer.Archetype}</Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <Button onClick={() => handleScout(selectedPlayer.playerId)} className="w-full">
                      🔍 Scout Player
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Select a prospect to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Mobile Detail Overlay */}
        {selectedPlayer && (
          <div className="md:hidden fixed inset-0 bg-background/95 z-50 p-4 overflow-auto">
            <Button variant="ghost" onClick={() => setSelectedPlayer(null)} className="mb-4">← Back</Button>
            <Card>
              <CardHeader>
                <CardTitle>{selectedPlayer.fullName}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedPlayer.pos}</Badge>
                  <Badge variant="secondary">Age {selectedPlayer.age}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">College</p>
                  <p className="font-medium">{selectedPlayer.college ?? "Unknown"}</p>
                </div>
                {scouted.has(selectedPlayer.playerId) ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Overall</p>
                      <p className="text-2xl font-bold">{selectedPlayer.overall ?? "?"}</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Potential</p>
                      <p className="text-2xl font-bold">{selectedPlayer.potential ?? "?"}</p>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => handleScout(selectedPlayer.playerId)} className="w-full">
                    🔍 Scout Player
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Draft;
