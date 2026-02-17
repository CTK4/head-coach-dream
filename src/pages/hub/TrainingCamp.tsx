import { useEffect, useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { getTeamRosterPlayers, type PlayerRow } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

function groupPos(pos?: string) {
  const p = String(pos ?? "").toUpperCase();
  if (p === "QB") return "QB";
  if (p === "RB") return "RB";
  if (p === "WR") return "WR";
  if (p === "TE") return "TE";
  if (["OT", "OG", "C", "OL"].includes(p)) return "OL";
  if (["EDGE", "DE", "DT", "DL"].includes(p)) return "DL";
  if (p === "LB") return "LB";
  if (["CB", "S", "DB"].includes(p)) return "DB";
  if (p === "K") return "K";
  if (p === "P") return "P";
  return "OTHER";
}

export default function TrainingCamp() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  useEffect(() => {
    if (Object.keys(state.rosterMgmt.active).length === 0 && Object.keys(state.rosterMgmt.cuts).length === 0) {
      dispatch({ type: "INIT_TRAINING_CAMP_ROSTER" });
    }
  }, [dispatch, state.rosterMgmt.active, state.rosterMgmt.cuts]);

  const roster = useMemo(() => {
    return getTeamRosterPlayers(teamId)
      .filter((p) => String((p as any).status ?? "").toUpperCase() !== "IR")
      .sort((a, b) => Number((b as any).overall ?? 0) - Number((a as any).overall ?? 0));
  }, [teamId]);

  const activeCount = Object.keys(state.rosterMgmt.active).length;
  const cutCount = Object.keys(state.rosterMgmt.cuts).length;
  const mustSet53 = activeCount === 53;

  const grouped = useMemo(() => {
    const by: Record<string, PlayerRow[]> = {};
    for (const p of roster) (by[groupPos((p as any).pos)] ??= []).push(p);
    for (const k of Object.keys(by)) by[k].sort((a, b) => Number((b as any).overall ?? 0) - Number((a as any).overall ?? 0));
    return by;
  }, [roster]);

  return (
    <div className="space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Training Camp — Final Cutdowns</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant={mustSet53 ? "secondary" : "outline"}>Active {activeCount}/53</Badge>
            <Badge variant="outline">Cuts {cutCount}</Badge>
            <Badge variant={state.rosterMgmt.finalized ? "secondary" : "outline"}>
              Finalized {state.rosterMgmt.finalized ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => dispatch({ type: "AUTO_CUT_TO_53" })} disabled={state.rosterMgmt.finalized}>
              Auto Cut → 53
            </Button>
            <Button onClick={() => dispatch({ type: "FINALIZE_CUTS" })} disabled={!mustSet53 || state.rosterMgmt.finalized}>
              Finalize Cuts
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roster (toggle active; must be exactly 53)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[680px] pr-2">
            <div className="space-y-4">
              {Object.entries(grouped).map(([pos, list]) => (
                <div key={pos} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{pos}</div>
                    <Badge variant="outline">{list.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {list.map((p) => {
                      const pid = String((p as any).playerId);
                      const isActive = Boolean(state.rosterMgmt.active[pid]);
                      return (
                        <div key={pid} className="flex items-center justify-between gap-2 border rounded-md px-3 py-2">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{String((p as any).fullName)}</div>
                            <div className="text-xs text-muted-foreground">
                              OVR {Number((p as any).overall ?? 0)} · Age {Number((p as any).age ?? 0)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={isActive ? "default" : "outline"}
                            onClick={() => dispatch({ type: "TOGGLE_ACTIVE", payload: { playerId: pid } })}
                            disabled={state.rosterMgmt.finalized}
                          >
                            {isActive ? "Active" : "Cut"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
