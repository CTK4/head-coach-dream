import { useMemo, useState } from "react";
import { useGame, type TagType } from "@/context/GameContext";
import { getContracts, getPlayers } from "@/data/leagueDb";
import { normalizePos } from "@/engine/rosterOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(1)}M`;
}

function projectedApy(pos: string, ovr: number, age: number) {
  const p = normalizePos(pos);
  const posMult: Record<string, number> = {
    QB: 1.7,
    WR: 1.2,
    EDGE: 1.25,
    CB: 1.2,
    OL: 1.15,
    DL: 1.05,
    RB: 0.8,
    TE: 0.85,
    LB: 0.9,
    S: 0.9,
    K: 0.25,
    P: 0.22,
  };
  const base = 900_000;
  const peak = 28;
  const ageAdj = 1 - Math.max(0, age - peak) * 0.03;
  const ovrAdj = Math.max(0.1, Math.min(1.25, (ovr - 55) / 40));
  return Math.round((base + 18_000_000 * ovrAdj * (posMult[p] ?? 1) * ageAdj) / 50_000) * 50_000;
}

export default function TagCenter() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const decisions = state.offseasonData.resigning.decisions;
  const applied = state.offseasonData.tagCenter.applied;

  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"non" | "ex" | "trans">("non");

  const eligible = useMemo(() => {
    const contracts = getContracts();
    return getPlayers()
      .filter((p: any) => String(state.playerTeamOverrides[String(p.playerId)] ?? p.teamId) === String(teamId))
      .map((p: any) => {
        const c = contracts.find((x: any) => x.contractId === p.contractId);
        const end = Number(c?.endSeason ?? state.season);
        return { p, end };
      })
      .filter((r) => r.end <= state.season)
      .map(({ p }) => {
        const ovr = Number(p.overall ?? 0);
        const age = Number(p.age ?? 26);
        const pos = normalizePos(String(p.pos ?? "UNK"));
        const marketApy = projectedApy(pos, ovr, age);
        const prior = 0;
        const min120 = Math.round((prior * 1.2) / 50_000) * 50_000;
        const non = Math.max(Math.round((marketApy * 1.15) / 50_000) * 50_000, min120);
        const ex = Math.max(Math.round((marketApy * 1.35) / 50_000) * 50_000, min120);
        const trans = Math.max(Math.round((marketApy * 1.05) / 50_000) * 50_000, min120);
        const pendingExt = decisions[String(p.playerId)]?.action === "RESIGN";
        return { id: String(p.playerId), name: String(p.fullName), pos, age, ovr, marketApy, non, ex, trans, pendingExt };
      })
      .sort((a, b) => b.ovr - a.ovr);
  }, [state, teamId, decisions]);

  const focus = eligible.find((e) => e.id === (selected ?? eligible[0]?.id)) ?? null;

  const canApply = (playerId: string) => {
    if (!focus) return false;
    if (applied && applied.playerId !== playerId) return false;
    if (decisions[playerId]?.action === "RESIGN") return false;
    return true;
  };

  const apply = (playerId: string, type: TagType, cost: number) => dispatch({ type: "TAG_APPLY", payload: { playerId, type, cost } });

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Franchise Tag Center</CardTitle>
          <div className="flex items-center gap-2">
            {applied ? <Badge variant="secondary">Tagged {applied.type} · {money(applied.cost)}</Badge> : <Badge variant="outline">No tag applied</Badge>}
            {applied ? (
              <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "TAG_REMOVE" })}>
                Remove
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-[1fr_420px] gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eligible Players</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {eligible.map((e) => (
              <button
                key={e.id}
                className={`w-full text-left rounded-xl border p-3 hover:bg-secondary/30 ${focus?.id === e.id ? "bg-secondary/30" : ""}`}
                onClick={() => setSelected(e.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {e.name} <span className="text-muted-foreground">({e.pos})</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">Age {e.age} · OVR {e.ovr} · Market {money(e.marketApy)}/yr</div>
                  </div>
                  {applied?.playerId === e.id ? <Badge>Tagged</Badge> : e.pendingExt ? <Badge variant="outline">Extension Pending</Badge> : <Badge variant="outline">Eligible</Badge>}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!focus ? (
              <div className="text-sm text-muted-foreground">Select a player.</div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="font-semibold">
                    {focus.name} <span className="text-muted-foreground">({focus.pos})</span>
                  </div>
                  {decisions[focus.id]?.action === "RESIGN" ? (
                    <div className="text-xs text-destructive flex items-center justify-between gap-2">
                      <span>Extension offer pending. Clear it to tag.</span>
                      <Button size="sm" variant="outline" onClick={() => dispatch({ type: "RESIGN_CLEAR_DECISION", payload: { playerId: focus.id } })}>
                        Clear Offer
                      </Button>
                    </div>
                  ) : null}
                  {applied && applied.playerId !== focus.id ? <div className="text-xs text-destructive">Only one tag allowed. Remove existing tag first.</div> : null}
                </div>

                <Tabs value={tab} onValueChange={(v) => setTab(v as "non" | "ex" | "trans")}>
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="non">Non-Ex</TabsTrigger>
                    <TabsTrigger value="ex">Ex</TabsTrigger>
                    <TabsTrigger value="trans">Trans</TabsTrigger>
                  </TabsList>

                  <TabsContent value="non" className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost</span>
                      <span className="font-semibold">{money(focus.non)}/yr</span>
                    </div>
                    <Button className="w-full" disabled={!canApply(focus.id)} onClick={() => apply(focus.id, "FRANCHISE_NON_EX", focus.non)}>
                      Apply Franchise Tag
                    </Button>
                  </TabsContent>

                  <TabsContent value="ex" className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost</span>
                      <span className="font-semibold">{money(focus.ex)}/yr</span>
                    </div>
                    <Button className="w-full" disabled={!canApply(focus.id)} onClick={() => apply(focus.id, "FRANCHISE_EX", focus.ex)}>
                      Apply Exclusive Tag
                    </Button>
                  </TabsContent>

                  <TabsContent value="trans" className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost</span>
                      <span className="font-semibold">{money(focus.trans)}/yr</span>
                    </div>
                    <Button className="w-full" variant="secondary" disabled={!canApply(focus.id)} onClick={() => apply(focus.id, "TRANSITION", focus.trans)}>
                      Apply Transition Tag
                    </Button>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
