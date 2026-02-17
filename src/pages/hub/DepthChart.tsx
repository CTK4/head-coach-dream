import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getTeamRosterPlayers } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SafeScrollArea from "@/components/SafeScrollArea";

type SlotGroup = { title: string; slots: Array<{ slot: string; label: string; pos: string[] }> };

const GROUPS: SlotGroup[] = [
  { title: "Offense", slots: [
    { slot: "QB1", label: "QB1", pos: ["QB"] },
    { slot: "RB1", label: "RB1", pos: ["RB"] },
    { slot: "WR1", label: "WR1", pos: ["WR"] },
    { slot: "WR2", label: "WR2", pos: ["WR"] },
    { slot: "TE1", label: "TE1", pos: ["TE"] },
    { slot: "LT", label: "LT", pos: ["OT", "OL"] },
    { slot: "LG", label: "LG", pos: ["OG", "OL"] },
    { slot: "C", label: "C", pos: ["C", "OL"] },
    { slot: "RG", label: "RG", pos: ["OG", "OL"] },
    { slot: "RT", label: "RT", pos: ["OT", "OL"] },
  ]},
  { title: "Defense", slots: [
    { slot: "EDGE1", label: "EDGE1", pos: ["EDGE", "DE", "DL"] },
    { slot: "DT1", label: "DT1", pos: ["DT", "DL"] },
    { slot: "DT2", label: "DT2", pos: ["DT", "DL"] },
    { slot: "EDGE2", label: "EDGE2", pos: ["EDGE", "DE", "DL"] },
    { slot: "LB1", label: "LB1", pos: ["LB"] },
    { slot: "LB2", label: "LB2", pos: ["LB"] },
    { slot: "CB1", label: "CB1", pos: ["CB", "DB"] },
    { slot: "CB2", label: "CB2", pos: ["CB", "DB"] },
    { slot: "FS", label: "FS", pos: ["S", "DB"] },
    { slot: "SS", label: "SS", pos: ["S", "DB"] },
  ]},
  { title: "Special Teams", slots: [
    { slot: "K", label: "K", pos: ["K"] },
    { slot: "P", label: "P", pos: ["P"] },
  ]},
];

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

export default function DepthChart() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  const [activeGroup, setActiveGroup] = useState(GROUPS[0].title);
  if (!teamId) return null;

  const activeIds = state.rosterMgmt.active;

  const roster = useMemo(() => {
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

  const getCandidates = (posList: string[]) => {
    const set = new Set(posList.map((x) => x.toUpperCase()));
    return roster.filter((p) => set.has(p.pos)).slice(0, 12);
  };

  const group = GROUPS.find((g) => g.title === activeGroup) ?? GROUPS[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Depth Chart</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">Active {Object.keys(state.rosterMgmt.active).length}/53</Badge>
            <Badge variant="outline">Preseason uses these starters for rotation seeding</Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">Approval {state.owner.approval}</Badge>
            <Badge variant="outline">Financial {state.owner.financialRating}</Badge>
            <Badge variant="secondary">Job Security {state.owner.jobSecurity}</Badge>
            <Badge variant="outline">Cash {money(state.teamFinances.cash)}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <Button key={g.title} size="sm" variant={activeGroup === g.title ? "default" : "secondary"} onClick={() => setActiveGroup(g.title)}>
              {g.title}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <SafeScrollArea className="pr-2" offset={360}>
            <div className="space-y-4">
              {group.slots.map((s) => {
                const chosen = state.depthChart.startersByPos[s.slot];
                const chosenName = chosen ? roster.find((p) => p.id === chosen)?.name : undefined;
                const candidates = getCandidates(s.pos);
                return (
                  <div key={s.slot} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{s.label}</div>
                      <Badge variant="outline">{chosenName ?? "Auto (top OVR)"}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {candidates.map((p) => (
                        <Button
                          key={p.id}
                          size="sm"
                          variant={p.id === chosen ? "default" : "outline"}
                          onClick={() => dispatch({ type: "SET_STARTER", payload: { slot: s.slot, playerId: p.id } })}
                        >
                          {p.name} ({p.ovr})
                        </Button>
                      ))}
                      {!candidates.length ? <div className="text-sm text-muted-foreground">No active candidates.</div> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </SafeScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
