import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { computeCapLedgerV2, type CapLedgerSnapshotV2 } from "@/engine/capLedger";
import { getTeamById, getPlayers } from "@/data/leagueDb";
import { computeCutProjection } from "@/engine/contractMath";
import { getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function money(v: number): string {
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  return `${sign}$${(abs / 1_000_000).toFixed(abs >= 100_000_000 ? 0 : 1)}M`;
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CapBaseline() {
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const team = getTeamById(teamId);

  const snap = useMemo<CapLedgerSnapshotV2>(() => computeCapLedgerV2(state, teamId), [state, teamId]);

  const [openPlayerId, setOpenPlayerId] = useState<string | null>(null);

  const openPlayer = useMemo(() => {
    if (!openPlayerId) return null;
    const p: any = getPlayers().find((x: any) => String(x.playerId) === String(openPlayerId));
    const s = getContractSummaryForPlayer(state, String(openPlayerId));
    const postJ = !!state.finances.postJune1Sim;
    const cut = computeCutProjection(state, String(openPlayerId), postJ);
    return { p, s, cut, postJ };
  }, [state, openPlayerId]);

  const designationRows = useMemo(() => {
    const des = state.offseasonData?.rosterAudit?.cutDesignations ?? {};
    const players = getPlayers();
    return Object.entries(des)
      .filter(([, v]) => v === "POST_JUNE_1")
      .map(([playerId]) => {
        const p: any = players.find((x: any) => String(x.playerId) === String(playerId));
        const proj = computeCutProjection(state, String(playerId), true);
        return {
          playerId: String(playerId),
          name: String(p?.fullName ?? "Unknown"),
          pos: String(p?.pos ?? "UNK"),
          deadThisYear: proj.deadThisYear,
          deadNextYear: proj.deadNextYear,
          savingsThisYear: proj.savingsThisYear,
        };
      })
      .sort((a, b) => b.savingsThisYear - a.savingsThisYear);
  }, [state]);

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border rounded-xl">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg border flex items-center justify-center font-bold">
              {(team?.abbrev ?? team?.name ?? "TM").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-muted-foreground">{team?.name ?? "Team"}</div>
              <div className="text-xl font-bold">CAP ROOM</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">League Year {state.season}</Badge>
            <Badge variant={snap.alerts.overCap ? "destructive" : "secondary"}>Adjusted Cap Room {money(snap.lines.find((l) => l.id === "AVAILABLE_CAP")?.value ?? 0)}</Badge>
            <Badge variant="outline">Mode {snap.capMode === "POST_JUNE_1" ? "Post–June 1" : "Standard"}</Badge>
            <Button variant="secondary" size="sm" onClick={() => downloadJson(`cap_summary_${teamId}_${state.season}.json`, snap)}>
              Export
            </Button>
            <Link to="/hub/finances">
              <Button variant="ghost" size="sm">
                ← Finances
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cap Ledger Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Accordion type="single" collapsible className="w-full">
                {snap.lines.map((line) => {
                  const hasDetails = !!(line.details && line.details.length);
                  const isComputed = line.id === "ADJUSTED_CAP" || line.id === "AVAILABLE_CAP";
                  const v = line.value;

                  return (
                    <AccordionItem key={line.id} value={line.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="w-full flex items-center justify-between gap-3 pr-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold truncate">{line.label}</span>
                            {isComputed ? <Badge variant="outline">Computed</Badge> : null}
                            {!hasDetails ? <Badge variant="secondary">—</Badge> : null}
                          </div>
                          <div className={`font-semibold tabular-nums ${v < 0 ? "text-destructive" : ""}`}>{money(v)}</div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        {hasDetails ? (
                          <div className="rounded-lg border overflow-hidden">
                            <div className="divide-y">
                              {line.details!.slice(0, line.id === "TOP_51" ? 51 : 50).map((d) => (
                                <button
                                  key={d.id}
                                  className="w-full text-left p-3 flex items-center justify-between gap-3 hover:bg-muted/40"
                                  onClick={() => {
                                    if (line.id !== "TOP_51") return;
                                    setOpenPlayerId(String(d.id));
                                  }}
                                >
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold truncate">{d.label}</div>
                                    {d.meta?.yearsLeft != null ? (
                                      <div className="text-xs text-muted-foreground">Years left {Number(d.meta.yearsLeft)}</div>
                                    ) : null}
                                  </div>
                                  <div className={`text-sm font-semibold tabular-nums ${d.value < 0 ? "text-destructive" : ""}`}>{money(d.value)}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No detail rows.</div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dead Cap Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">Total Dead Cap This Year</div>
                <div className="text-lg font-bold tabular-nums">{money(snap.dead.thisYear)}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">Dead Cap Next Year</div>
                <div className="text-lg font-bold tabular-nums">{money(snap.dead.nextYear)}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">Void-Year Accel Pending</div>
                <div className="text-lg font-bold tabular-nums">{money(snap.dead.voidYearAccelPending)}</div>
              </div>

              <div className="md:col-span-3">
                <Separator className="my-2" />
                {designationRows.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No Post–June 1 cut designations.</div>
                ) : (
                  <div className="rounded-lg border">
                    <div className="p-3 text-sm font-semibold">Post–June 1 Designations</div>
                    <Separator />
                    <div className="divide-y">
                      {designationRows.slice(0, 20).map((r) => (
                        <div key={r.playerId} className="p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold truncate">
                              {r.name} <span className="text-muted-foreground">({r.pos})</span>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              Save {money(r.savingsThisYear)} · Dead now {money(r.deadThisYear)} · Dead next {money(r.deadNextYear)}
                            </div>
                          </div>
                          <div className="text-sm font-semibold tabular-nums">{money(r.savingsThisYear)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {snap.alerts.overCap ? (
                <Alert variant="destructive">
                  <AlertTitle>Over Cap</AlertTitle>
                  <AlertDescription>You are cap-illegal in the current mode. Use Audit to cut/trade/restructure.</AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertTitle>Cap Compliant</AlertTitle>
                  <AlertDescription>You are currently under the cap in this mode.</AlertDescription>
                </Alert>
              )}

              {snap.alerts.june1ReliefAvailable ? (
                <Alert>
                  <AlertTitle>June 1 Relief Available</AlertTitle>
                  <AlertDescription>One or more Post–June 1 cut designations are active.</AlertDescription>
                </Alert>
              ) : null}

              {snap.alerts.highDeadCapRisk ? (
                <Alert variant="destructive">
                  <AlertTitle>High Dead Cap Risk</AlertTitle>
                  <AlertDescription>Dead cap this year is a large share of the cap.</AlertDescription>
                </Alert>
              ) : null}

              <div className="grid grid-cols-1 gap-2">
                <Link to="/hub/roster-audit">
                  <Button variant="secondary" className="w-full">
                    Open Roster Audit
                  </Button>
                </Link>
                <Link to="/hub/tag-center">
                  <Button variant="secondary" className="w-full">
                    Open Tag Center
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Read</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div>Adjusted Cap = League Cap + Carryover + True-Ups − Dead Cap.</div>
              <div>Available Cap = Adjusted Cap − Top 51.</div>
              <div className="text-xs text-muted-foreground">Global mode controls totals; use Audit drawers to compare Pre vs Post.</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Drawer open={!!openPlayerId} onOpenChange={(o) => !o && setOpenPlayerId(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Player Cap Breakdown</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {!openPlayer ? (
              <div className="text-sm text-muted-foreground">No player selected.</div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-bold truncate">{String(openPlayer.p?.fullName ?? "Unknown")}</div>
                    <div className="text-sm text-muted-foreground">
                      {String(openPlayer.p?.pos ?? "UNK")} · Years left {Number(openPlayer.s?.yearsRemaining ?? 0)} · Mode{" "}
                      {openPlayer.postJ ? "Post–June 1" : "Standard"}
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => setOpenPlayerId(null)}>
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border p-3">
                    <div className="text-xs text-muted-foreground">Cap Hit (This Year)</div>
                    <div className="text-lg font-bold tabular-nums">{money(Number(openPlayer.s?.capHitBySeason?.[state.season] ?? openPlayer.s?.capHit ?? 0))}</div>
                  </div>
                  <div className="rounded-xl border p-3">
                    <div className="text-xs text-muted-foreground">Dead Cap (This Year)</div>
                    <div className="text-lg font-bold tabular-nums">{money(openPlayer.cut.deadThisYear)}</div>
                  </div>
                  <div className="rounded-xl border p-3">
                    <div className="text-xs text-muted-foreground">Savings (This Year)</div>
                    <div className="text-lg font-bold tabular-nums">{money(openPlayer.cut.savingsThisYear)}</div>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <div className="p-3 text-sm font-semibold">Cap by Season</div>
                  <Separator />
                  <ScrollArea className="h-[220px]">
                    <div className="divide-y">
                      {Object.entries(openPlayer.s?.capHitBySeason ?? {})
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .slice(0, 5)
                        .map(([season, hit]) => (
                          <div key={season} className="p-3 flex items-center justify-between">
                            <div className="text-sm">Season {season}</div>
                            <div className="text-sm font-semibold tabular-nums">{money(Number(hit ?? 0))}</div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>

                {openPlayer.postJ ? (
                  <div className="text-xs text-muted-foreground">Post–June 1 shows dead split across this year / next year.</div>
                ) : null}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
