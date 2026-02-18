import { useMemo, useState } from "react";
import { useGame, type TagType } from "@/context/GameContext";
import { getContracts, getPlayers } from "@/data/leagueDb";
import { normalizePos, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { projectedMarketApy } from "@/engine/marketModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(1)}M`;
}
function round50k(v: number) {
  return Math.round(v / 50_000) * 50_000;
}
function capAfter(available: number, cost: number) {
  return round50k(available - cost);
}
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
function leverageMeter(ovr: number, pos: string, age: number) {
  const p = normalizePos(pos);
  const premium = new Set(["QB", "EDGE", "WR", "CB"]);
  const o = clamp01((ovr - 70) / 22);
  const a = clamp01((30 - age) / 8);
  const b = premium.has(p) ? 0.12 : 0;
  return Math.round(clamp01(0.18 + o * 0.55 + a * 0.25 + b) * 100);
}

export default function TagCenter() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const availableCap = state.finances.capSpace;
  const decisions = state.offseasonData.resigning.decisions;
  const applied = state.offseasonData.tagCenter.applied;

  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"non" | "ex" | "trans">("non");

  const hasOfferFor = (playerId: string) => decisions?.[playerId]?.action === "RESIGN";

  const eligible = useMemo(() => {
    const contracts = getContracts();
    const ps = getPlayers();

    return ps
      .filter((p: any) => String(state.playerTeamOverrides[String(p.playerId)] ?? p.teamId) === String(teamId))
      .map((p: any) => {
        const c = contracts.find((x: any) => x.contractId === p.contractId);
        const end = Number(c?.endSeason ?? state.season);
        return { p, end };
      })
      .filter((r) => r.end <= state.season)
      .map(({ p }) => {
        const id = String(p.playerId);
        const ovr = Number(p.overall ?? 0);
        const age = Number(p.age ?? 26);
        const pos = normalizePos(String(p.pos ?? "UNK"));
        const marketApy = projectedMarketApy(pos, ovr, age);

        const s = getContractSummaryForPlayer(state, id);
        const priorSeason = state.season - 1;
        const priorSalary = round50k(Number(s?.capHitBySeason?.[priorSeason] ?? 0));
        const min120 = priorSalary > 0 ? round50k(priorSalary * 1.2) : 0;

        const non = Math.max(round50k(marketApy * 1.15), min120 || 0);
        const ex = Math.max(round50k(marketApy * 1.35), min120 || 0);
        const trans = Math.max(round50k(marketApy * 1.05), min120 || 0);

        const pendingExt = decisions[id]?.action === "RESIGN";
        const leverage = leverageMeter(ovr, pos, age);

        const capAfterNon = capAfter(availableCap, non);
        const capAfterEx = capAfter(availableCap, ex);
        const capAfterTrans = capAfter(availableCap, trans);

        const compPickRisk = ovr >= 84 ? "High" : ovr >= 78 ? "Med" : "Low";

        return {
          id,
          name: String(p.fullName),
          pos,
          age,
          ovr,
          marketApy,
          priorSalary,
          min120,
          non,
          ex,
          trans,
          pendingExt,
          leverage,
          capAfterNon,
          capAfterEx,
          capAfterTrans,
          compPickRisk,
        };
      })
      .sort((a, b) => b.ovr - a.ovr);
  }, [state, teamId, decisions, availableCap]);

  const focus = eligible.find((e) => e.id === (selected ?? eligible[0]?.id)) ?? null;

  const canApply = (playerId: string, cost: number) => {
    if (applied) return false;
    if (hasOfferFor(playerId)) return false;
    if (capAfter(availableCap, cost) < 0) return false;
    return true;
  };

  const apply = (playerId: string, type: TagType, cost: number) => dispatch({ type: "TAG_APPLY", payload: { playerId, type, cost } });

  const timeline = useMemo(() => {
    const hasTag = !!applied;
    const ext = hasTag ? "Extension talks open" : "—";
    const deadline = hasTag ? `Deadline: Week 8 (sim)` : "—";
    return { hasTag, ext, deadline };
  }, [applied]);

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Franchise Tag Center</CardTitle>
          <div className="flex items-center gap-2">
            {applied ? (
              <Badge variant="secondary">
                Tagged {applied.type} · {money(applied.cost)}
              </Badge>
            ) : (
              <Badge variant="outline">No tag applied</Badge>
            )}
            {applied ? (
              <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "TAG_REMOVE" })}>
                Remove
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-[1fr_440px] gap-4">
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
                    <div className="text-xs text-muted-foreground truncate">
                      Age {e.age} · OVR {e.ovr} · Market {money(e.marketApy)}/yr · Comp Pick Risk {e.compPickRisk}
                    </div>
                  </div>
                  {applied?.playerId === e.id ? (
                    <Badge>Tagged</Badge>
                  ) : e.pendingExt ? (
                    <Badge variant="outline">Offer Pending</Badge>
                  ) : (
                    <Badge variant="outline">Eligible</Badge>
                  )}
                </div>
              </button>
            ))}
            {eligible.length === 0 ? <div className="text-sm text-muted-foreground">No expiring players eligible.</div> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tag Decision Drawer</CardTitle>
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

                  {applied ? <div className="text-xs text-muted-foreground">Tag already used this offseason. Remove it to choose another player.</div> : null}

                  <div className="text-xs text-muted-foreground">
                    120% rule: {focus.priorSalary > 0 ? `${money(focus.min120)} min (120% of ${money(focus.priorSalary)})` : "N/A (no prior salary)"}{" "}
                    <span className="mx-2">|</span> Cap space now {money(availableCap)}
                  </div>

                  {hasOfferFor(focus.id) ? (
                    <div className="text-xs text-destructive">This player has an active re-sign offer. Clear it in Re-sign or Audit to tag.</div>
                  ) : null}
                </div>

                <div className="rounded-xl border p-3 space-y-2">
                  <div className="text-sm font-semibold">Negotiation Leverage</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                  <Progress value={focus.leverage} />
                  <div className="text-xs text-muted-foreground">Leverage {focus.leverage}/100</div>
                </div>

                <div className="rounded-xl border p-3 space-y-2">
                  <div className="text-sm font-semibold">Timeline</div>
                  <div className="text-xs text-muted-foreground">Tag applied: {timeline.hasTag ? "Yes" : "No"}</div>
                  <div className="text-xs text-muted-foreground">Extension status: {timeline.ext}</div>
                  <div className="text-xs text-muted-foreground">Negotiation deadline: {timeline.deadline}</div>
                </div>

                <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
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
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Cap after tag</span>
                      <span className={`tabular-nums ${focus.capAfterNon < 0 ? "text-destructive" : ""}`}>{money(focus.capAfterNon)}</span>
                    </div>
                    <Separator />
                    <div className="text-xs text-muted-foreground">Cap reservation preview: {money(focus.non)} (counts in Top 51)</div>
                    <Button className="w-full" disabled={!canApply(focus.id, focus.non)} onClick={() => apply(focus.id, "FRANCHISE_NON_EX", focus.non)}>
                      Apply Franchise Tag
                    </Button>
                    {focus.capAfterNon < 0 ? <div className="text-xs text-destructive">Blocked: would put you over the cap.</div> : null}
                  </TabsContent>

                  <TabsContent value="ex" className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost</span>
                      <span className="font-semibold">{money(focus.ex)}/yr</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Cap after tag</span>
                      <span className={`tabular-nums ${focus.capAfterEx < 0 ? "text-destructive" : ""}`}>{money(focus.capAfterEx)}</span>
                    </div>
                    <Separator />
                    <div className="text-xs text-muted-foreground">Cap reservation preview: {money(focus.ex)} (counts in Top 51)</div>
                    <Button className="w-full" disabled={!canApply(focus.id, focus.ex)} onClick={() => apply(focus.id, "FRANCHISE_EX", focus.ex)}>
                      Apply Exclusive Tag
                    </Button>
                    {focus.capAfterEx < 0 ? <div className="text-xs text-destructive">Blocked: would put you over the cap.</div> : null}
                  </TabsContent>

                  <TabsContent value="trans" className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost</span>
                      <span className="font-semibold">{money(focus.trans)}/yr</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Cap after tag</span>
                      <span className={`tabular-nums ${focus.capAfterTrans < 0 ? "text-destructive" : ""}`}>{money(focus.capAfterTrans)}</span>
                    </div>
                    <Separator />
                    <div className="text-xs text-muted-foreground">Cap reservation preview: {money(focus.trans)} (counts in Top 51)</div>
                    <Button
                      className="w-full"
                      variant="secondary"
                      disabled={!canApply(focus.id, focus.trans)}
                      onClick={() => apply(focus.id, "TRANSITION", focus.trans)}
                    >
                      Apply Transition Tag
                    </Button>
                    {focus.capAfterTrans < 0 ? <div className="text-xs text-destructive">Blocked: would put you over the cap.</div> : null}
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
