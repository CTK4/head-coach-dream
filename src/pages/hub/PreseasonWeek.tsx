import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getTeamRosterPlayers } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import PreseasonSnaps from "@/pages/hub/PreseasonSnaps";

export default function PreseasonWeek() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const activeCount = Object.keys(state.rosterMgmt.active).length;

  if (!state.rosterMgmt.finalized) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Preseason Locked</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">Finalize cutdowns to exactly 53 active players before preseason.</div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">Active {activeCount}/53</Badge>
              <Badge variant="secondary">Finalized: No</Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/hub/training-camp")}>Go to Training Camp</Button>
              <Button variant="secondary" onClick={() => dispatch({ type: "AUTO_CUT_TO_53" })}>
                Auto Cut → 53
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeIds = state.rosterMgmt.active;

  const activeRoster = useMemo(() => {
    const all = getTeamRosterPlayers(teamId)
      .filter((p) => String((p as any).status ?? "").toUpperCase() !== "IR")
      .map((p) => ({
        id: String((p as any).playerId),
        name: String((p as any).fullName),
        pos: String((p as any).pos ?? "UNK").toUpperCase(),
        ovr: Number((p as any).overall ?? 0),
      }));
    return all.filter((p) => !!activeIds[p.id]).sort((a, b) => b.ovr - a.ovr);
  }, [teamId, activeIds]);

  const week = state.hub.preseasonWeek ?? 1;

  const startGame = () =>
    dispatch({
      type: "START_GAME",
      payload: { opponentTeamId: "TBD", week, gameType: "PRESEASON" },
    });

  return (
    <div className="space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Preseason Week {state.hub.preseasonWeek ?? 1}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">Active {activeRoster.length}/53</Badge>
            <Badge variant="outline">Delegation: MVP</Badge>
          </div>
          <Button onClick={startGame}>Start Preseason Game</Button>
        </CardContent>
      </Card>

      <PreseasonSnaps />

      <Card>
        <CardHeader>
          <CardTitle>Active Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[640px] pr-2">
            <div className="space-y-2">
              {activeRoster.map((p) => (
                <div key={p.id} className="border rounded-md px-3 py-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.pos} · OVR {p.ovr}
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
