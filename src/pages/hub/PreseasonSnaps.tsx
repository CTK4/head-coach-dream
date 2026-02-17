import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getTeamRosterPlayers } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import SafeScrollArea from "@/components/SafeScrollArea";
import { Button } from "@/components/ui/button";

function groupPos(pos?: string) {
  const p = String(pos ?? "").toUpperCase();
  if (["QB"].includes(p)) return "QB";
  if (["RB"].includes(p)) return "RB";
  if (["WR"].includes(p)) return "WR";
  if (["TE"].includes(p)) return "TE";
  if (["OT", "OG", "C", "OL"].includes(p)) return "OL";
  if (["EDGE", "DE", "DT", "DL"].includes(p)) return "DL";
  if (["LB"].includes(p)) return "LB";
  if (["CB", "S", "DB"].includes(p)) return "DB";
  return "OTHER";
}

function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function PreseasonSnaps() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  const [activeGroup, setActiveGroup] = useState<string>("QB");

  useEffect(() => {
    if (!teamId) return;
    dispatch({ type: "INIT_PRESEASON_ROTATION" });
  }, [teamId, dispatch]);

  const activeIds = state.rosterMgmt.active;

  const players = useMemo(() => {
    if (!teamId) return [];
    return getTeamRosterPlayers(teamId)
      .filter((p) => !!activeIds[String((p as any).playerId)])
      .map((p) => ({
        id: String((p as any).playerId),
        name: String((p as any).fullName),
        pos: String((p as any).pos ?? "UNK").toUpperCase(),
        grp: groupPos((p as any).pos),
        ovr: Number((p as any).overall ?? 0),
      }))
      .sort((a, b) => (a.grp === b.grp ? b.ovr - a.ovr : a.grp.localeCompare(b.grp)));
  }, [teamId, activeIds]);

  const groups = useMemo(() => {
    const by: Record<string, typeof players> = {};
    for (const p of players) (by[p.grp] ??= []).push(p);
    for (const k of Object.keys(by)) by[k].sort((a, b) => b.ovr - a.ovr);
    return by;
  }, [players]);

  const starterByGroup = useMemo(() => {
    const m: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(state.depthChart.startersByPos)) if (v) m[groupPos(k)] = String(v);
    return m;
  }, [state.depthChart.startersByPos]);

  const groupKeys = useMemo(() => Object.keys(groups).filter((k) => k !== "OTHER"), [groups]);
  const list = groups[activeGroup] ?? [];

  const avg = useMemo(() => {
    const vals = Object.values(state.preseason.rotation.byPlayerId);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [state.preseason.rotation.byPlayerId]);

  const quickSet = (grp: string, preset: "STARTERS" | "BALANCED" | "DEEP") => {
    const ids = (groups[grp] ?? []).map((p) => p.id);
    ids.forEach((id, idx) => {
      const pct =
        preset === "STARTERS" ? (idx === 0 ? 85 : idx === 1 ? 30 : 10) :
        preset === "DEEP" ? (idx === 0 ? 60 : idx === 1 ? 55 : idx < 5 ? 35 : 15) :
        (idx === 0 ? 75 : idx === 1 ? 45 : idx < 4 ? 25 : 10);
      dispatch({ type: "SET_PLAYER_SNAP", payload: { playerId: id, pct } });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preseason Rotation (Per Player)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm items-center justify-between">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">Avg Snap {avg}%</Badge>
            <Badge variant="secondary">Higher % = more dev + more injury risk</Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => quickSet(activeGroup, "STARTERS")}>Starters</Button>
            <Button size="sm" variant="secondary" onClick={() => quickSet(activeGroup, "BALANCED")}>Balanced</Button>
            <Button size="sm" variant="secondary" onClick={() => quickSet(activeGroup, "DEEP")}>Deep</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {groupKeys.map((k) => (
            <Button key={k} size="sm" variant={activeGroup === k ? "default" : "secondary"} onClick={() => setActiveGroup(k)}>
              {k}
            </Button>
          ))}
        </div>

        <SafeScrollArea className="pr-2" offset={420}>
          <div className="space-y-3">
            {list.map((p) => {
              const pct = clamp100(state.preseason.rotation.byPlayerId[p.id] ?? 0);
              const isStarter = starterByGroup[p.grp] === p.id;
              return (
                <div key={p.id} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium truncate">{p.name} <span className="text-muted-foreground">({p.pos})</span></div>
                    <div className="flex gap-2">
                      <Badge variant={isStarter ? "secondary" : "outline"}>{isStarter ? "Starter" : "Depth"}</Badge>
                      <Badge variant="outline">OVR {p.ovr}</Badge>
                      <Badge variant="outline">Snaps {pct}%</Badge>
                    </div>
                  </div>
                  <Slider
                    value={[pct]}
                    min={0}
                    max={95}
                    step={5}
                    onValueChange={(v) => dispatch({ type: "SET_PLAYER_SNAP", payload: { playerId: p.id, pct: v[0] ?? pct } })}
                  />
                </div>
              );
            })}
          </div>
        </SafeScrollArea>
      </CardContent>
    </Card>
  );
}
