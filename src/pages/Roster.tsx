import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { type PlayerRow } from "@/data/leagueDb";
import { getEffectivePlayersByTeam, getDepthSlotLabel } from "@/engine/rosterOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const POS_GROUPS: Record<string, string[]> = {
  Offense: ["QB", "RB", "WR", "TE", "OT", "OG", "C", "OL", "FB", "HB"],
  Defense: ["DE", "DT", "DL", "LB", "OLB", "ILB", "MLB", "CB", "S", "FS", "SS", "DB"],
  "Special Teams": ["K", "P", "LS", "KR", "PR"],
};

function getGroup(pos: string): string {
  const p = (pos ?? "").toUpperCase();
  for (const [group, positions] of Object.entries(POS_GROUPS)) {
    if (positions.includes(p)) return group;
  }
  return "Offense";
}

const Roster = () => {
  const { state } = useGame();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Offense");

  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const allPlayers = getEffectivePlayersByTeam(state, teamId);
  const filtered = allPlayers.filter((p) => getGroup(p.pos ?? "") === tab);
  const sorted = [...filtered].sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Roster</h1>
            <p className="text-sm text-muted-foreground">{allPlayers.length} players</p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/hub")}>← Hub</Button>
        </div>

        <div className="flex gap-2 mb-4">
          {Object.keys(POS_GROUPS).map((group) => (
            <Button
              key={group}
              variant={tab === group ? "default" : "secondary"}
              size="sm"
              onClick={() => setTab(group)}
            >
              {group}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[70vh]">
          <div className="space-y-2 pr-4">
            {sorted.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No players in this group</p>
            ) : (
              sorted.map((player) => (
                <Card key={player.playerId}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-10 justify-center text-xs font-mono">
                        {player.pos}
                      </Badge>
                      {getDepthSlotLabel(state, String(player.playerId)) ? (
                        <Badge variant="outline" className="text-xs">
                          {getDepthSlotLabel(state, String(player.playerId))}
                        </Badge>
                      ) : null}
                      <div>
                        <p className="font-medium text-sm">{player.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          Age {player.age ?? "?"} • {player.college ?? "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${(player.overall ?? 0) >= 80 ? "bg-primary" : (player.overall ?? 0) >= 70 ? "bg-accent" : "bg-secondary"} text-primary-foreground`}>
                        {player.overall ?? "?"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Roster;
