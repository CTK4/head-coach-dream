import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getDepthSlotLabel, getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const POS_GROUPS: Record<string, string[]> = {
  Offense: ["QB", "RB", "WR", "TE", "OT", "OG", "C", "OL", "FB", "HB"],
  Defense: ["DE", "DT", "DL", "LB", "OLB", "ILB", "MLB", "CB", "S", "FS", "SS", "DB", "EDGE"],
  "Special Teams": ["K", "P", "LS", "KR", "PR"],
};

function getGroup(pos: string): keyof typeof POS_GROUPS {
  const p = String(pos ?? "").toUpperCase();
  for (const [group, positions] of Object.entries(POS_GROUPS)) {
    if (positions.includes(p)) return group as keyof typeof POS_GROUPS;
  }
  return "Offense";
}

export default function Roster() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<keyof typeof POS_GROUPS>("Offense");

  const teamId = state.acceptedOffer?.teamId ?? (state as any).userTeamId ?? (state as any).teamId;
  if (!teamId) return null;

  const { allPlayers, sorted } = useMemo(() => {
    const all = getEffectivePlayersByTeam(state, String(teamId));
    const filtered = all.filter((p) => getGroup(String(p.pos ?? "")) === tab);
    const s = [...filtered].sort((a, b) => Number(b.overall ?? b.ovr ?? 0) - Number(a.overall ?? a.ovr ?? 0));
    return { allPlayers: all, sorted: s };
  }, [state, teamId, tab]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="space-y-1">
            <div className="text-2xl font-bold">Manage Team</div>
            <div className="text-sm text-muted-foreground">{allPlayers.length} players</div>
          </div>
          <Button variant="secondary" onClick={() => dispatch({ type: "RESET_DEPTH_CHART_BEST" })}>
            Reset to Best
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(POS_GROUPS) as Array<keyof typeof POS_GROUPS>).map((group) => (
              <Button key={group} variant={tab === group ? "default" : "secondary"} size="sm" onClick={() => setTab(group)}>
                {group}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {sorted.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">No players in this group</CardContent>
          </Card>
        ) : (
          sorted.map((player) => {
            const depthSlot = getDepthSlotLabel(state, String(player.playerId));
            const locked = depthSlot ? Boolean(state.depthChart.lockedBySlot[depthSlot]) : false;
            const ovr = player.overall ?? player.ovr;

            return (
              <Card key={player.playerId}>
                <CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge variant="outline" className="w-10 shrink-0 justify-center text-xs font-mono">
                      {player.pos ?? "—"}
                    </Badge>
                    {depthSlot ? (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {depthSlot}
                      </Badge>
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{player.fullName ?? player.name ?? "Unknown Player"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        OVR {ovr ?? "—"} • Age {player.age ?? "—"} • {player.college ?? "Unknown"}
                        {depthSlot ? ` • ${locked ? "Locked" : "Unlocked"}` : ""}
                      </p>
                    </div>
                  </div>

                  <Badge className="shrink-0 text-xs">{ovr ?? "—"}</Badge>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
