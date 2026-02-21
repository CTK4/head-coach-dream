import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { getTeamRosterPlayers } from "@/data/leagueDb";
import { eligibleRosterForSlot, usedPlayerIds } from "@/engine/depthChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HubEmptyState } from "@/components/franchise-hub/states/HubEmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Section = { title: string; slots: string[] };

const SECTIONS: Section[] = [
  { title: "Offense", slots: ["QB1", "QB2", "QB3", "RB1", "RB2", "RB3", "WR1", "WR2", "WR3", "WR4", "WR5", "TE1", "TE2", "TE3", "LT", "LG", "C", "RG", "RT", "OL6", "OL7"] },
  { title: "Defense", slots: ["DT1", "DT2", "DL3", "DL4", "EDGE1", "EDGE2", "EDGE3", "LB1", "LB2", "LB3", "CB1", "CB2", "CB3", "CB4", "FS", "SS", "S3"] },
  { title: "Special Teams", slots: ["K", "P"] },
];

export default function DepthChart() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  const activeIds = state.rosterMgmt.active;

  const roster = useMemo(() => {
    if (!teamId) return [];
    return getTeamRosterPlayers(teamId)
      .filter((p) => !!activeIds[String((p as any).playerId)])
      .map((p) => ({
        id: String((p as any).playerId),
        name: String((p as any).fullName),
        pos: String((p as any).pos ?? "UNK").toUpperCase(),
        ovr: Number((p as any).overall ?? 0),
      }))
      .sort((a, b) => b.ovr - a.ovr);
  }, [teamId, activeIds]);

  if (!teamId) return <HubEmptyState title="Roster not loaded" description="Assign a team to configure your depth chart." action={{ label: "Back to Hub", to: "/hub" }} />;

  const dupes = (() => {
    const counts = new Map<string, number>();
    for (const v of Object.values(state.depthChart.startersByPos)) {
      if (!v) continue;
      counts.set(String(v), (counts.get(String(v)) ?? 0) + 1);
    }
    return [...counts.values()].filter((c) => c > 1).length;
  })();

  const chosenName = (pid?: string) => roster.find((r) => r.id === String(pid))?.name;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle>Depth Chart</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => dispatch({ type: "AUTOFILL_DEPTH_CHART" })}>
              Auto-Fill Empty
            </Button>
            <Button onClick={() => dispatch({ type: "DEPTH_RESET_TO_BEST" })}>Reset to Best</Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-4">
          <ScrollArea className="h-[70vh] pr-2">
            <div className="space-y-4">
              {dupes ? <div className="text-xs text-destructive">Warning: duplicate players assigned to multiple slots.</div> : null}

              {SECTIONS.map((sec) => {
                const filled = sec.slots.reduce((n, slot) => n + (state.depthChart.startersByPos[slot] ? 1 : 0), 0);
                const total = sec.slots.length;

                return (
                  <div key={sec.title} className="space-y-2">
                    <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-background/95 backdrop-blur border-b">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">{sec.title}</div>
                        <Badge variant="outline">{filled}/{total} set</Badge>
                      </div>
                    </div>

                    {sec.slots.map((slot) => {
                      const pid = state.depthChart.startersByPos[slot];
                      const isAuto = !pid;
                      const locked = !!state.depthChart.lockedBySlot?.[slot];

                      const used = usedPlayerIds(state.depthChart);
                      used.delete(String(pid ?? ""));
                      const options = eligibleRosterForSlot(slot, roster, pid, used);

                      return (
                        <div key={slot} className="rounded-xl border p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold">{slot}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {chosenName(pid) ?? "Auto (top OVR)"} {locked ? "• Locked" : ""}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={locked ? "default" : "secondary"}
                              disabled={isAuto}
                              title={isAuto ? "Lock requires a manual selection" : ""}
                              onClick={() => dispatch({ type: "TOGGLE_DEPTH_SLOT_LOCK", payload: { slot } })}
                            >
                              {locked ? "Locked" : "Lock"}
                            </Button>

                            <Select
                              value={pid ?? "AUTO"}
                              onValueChange={(v) => dispatch({ type: "SET_STARTER", payload: { slot, playerId: v as string | "AUTO" } })}
                            >
                              <SelectTrigger className="w-[320px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AUTO">Auto (top OVR)</SelectItem>
                                {options.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name} ({p.pos} {p.ovr})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Badge variant="outline">{pid ? "Manual" : "Auto"}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
