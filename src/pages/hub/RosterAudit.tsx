import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getEffectivePlayersByTeam, normalizePos, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import {
  buildCapTable,
  computeCutProjection,
  maxRestructureAmount,
  simulateRestructure,
  getRestructureEligibility,
} from "@/engine/contractMath";
import { projectedMarketApy, extensionBand, tradeReturnEv } from "@/engine/marketModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

function money(n: number) {
  const m = n / 1_000_000;
  const abs = Math.abs(m);
  const s = abs >= 10 ? `${Math.round(m)}M` : `${Math.round(m * 10) / 10}M`;
  return `$${s}`;
}
function round50k(v: number) {
  return Math.round(v / 50_000) * 50_000;
}
function roleFromDepth(depthLabel?: string) {
  if (!depthLabel) return "Depth";
  const m = depthLabel.match(/(\d+)$/);
  const idx = m ? Number(m[1]) : 1;
  if (idx <= 1) return "Starter";
  if (idx <= 2) return "Rotational";
  return "Depth";
}
function snapShareByRole(role: string) {
  if (role === "Starter") return 0.72;
  if (role === "Rotational") return 0.28;
  return 0.08;
}

type Row = {
  id: string;
  name: string;
  pos: string;
  age: number;
  ovr: number;
  capHitNow: number;
  yearsLeft: number;
  deadNowPre: number;
  deadNowPost: number;
  savingsPre: number;
  savingsPost: number;
  role: "Starter" | "Rotational" | "Depth";
  snapShare: number;
  morale: number;
  playingTimeSat: number;
  tradeRisk: "Low" | "Med" | "High";
  restructureEligible: boolean;
  restructureWhyNot: string | null;
  extensionEligible: boolean;
  restructureCandidate: boolean;
  postJune1Candidate: boolean;
  tradeSuggested: boolean;
  marketApy: number;
};

export default function RosterAudit() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const [openId, setOpenId] = useState<string | null>(null);
  const [restruct, setRestruct] = useState(0);
  const [tab, setTab] = useState<"contract" | "morale">("contract");
  const [sortKey, setSortKey] = useState<"ovr" | "savings" | "capHit" | "deadCap" | "restructEligible">("savings");

  const rows = useMemo(() => {
    const raw = getEffectivePlayersByTeam(state, teamId).map((p: any) => {
      const id = String(p.playerId);
      const s = getContractSummaryForPlayer(state, id);
      const capHitNow = round50k(s?.capHitBySeason?.[state.season] ?? s?.capHit ?? 0);
      const yearsLeft = Math.max(0, Number(s?.yearsRemaining ?? 0));

      const designation = state.offseasonData.rosterAudit.cutDesignations[id] ?? "NONE";
      const deadPre = round50k(s?.deadCapIfCutNow ?? 0);
      const postProj = computeCutProjection(state, id, designation === "POST_JUNE_1");
      const deadNowPre = round50k(deadPre);
      const deadNowPost = round50k(postProj.deadThisYear);
      const savingsPre = round50k(capHitNow - deadNowPre);
      const savingsPost = round50k(capHitNow - deadNowPost);

      const gate = getRestructureEligibility(state, id);

      const depthLabel = String((s as any)?.depthSlotLabel ?? "");
      const role = roleFromDepth(depthLabel) as Row["role"];
      const snapShare = snapShareByRole(role);

      const expectedRole = Number(p.overall ?? 0) >= 80 ? "Starter" : Number(p.overall ?? 0) >= 72 ? "Rotational" : "Depth";
      const playingTimeSat =
        expectedRole === role ? 85 : expectedRole === "Starter" && role !== "Starter" ? 28 : expectedRole === "Rotational" && role === "Depth" ? 45 : 65;

      const morale = Math.max(0, Math.min(100, 62 + (playingTimeSat - 65) * 0.6));
      const tradeRisk: Row["tradeRisk"] = playingTimeSat < 35 ? "High" : playingTimeSat < 55 ? "Med" : "Low";

      const pos = normalizePos(String(p.pos ?? "UNK"));
      const ovr = Number(p.overall ?? 0);
      const age = Number(p.age ?? 26);

      const marketApy = projectedMarketApy(pos, ovr, age);

      const restructureCandidate = gate.eligible && capHitNow >= 7_000_000;
      const postJune1Candidate = yearsLeft >= 1 && (state.finances.postJune1Sim ? savingsPost : savingsPre) >= 3_000_000 && (state.finances.postJune1Sim ? deadNowPost : deadNowPre) <= capHitNow * 0.75;
      const extensionEligible = yearsLeft === 1 && age <= 30 && ovr >= 72;
      const tradeSuggested = capHitNow >= 10_000_000 && ovr <= 74 && age >= 28;

      return {
        id,
        name: String(p.fullName),
        pos,
        age,
        ovr,
        capHitNow,
        yearsLeft,
        deadNowPre,
        deadNowPost,
        savingsPre,
        savingsPost,
        role,
        snapShare,
        morale: round50k(morale * 10_000) / 10_000,
        playingTimeSat,
        tradeRisk,
        restructureEligible: gate.eligible,
        restructureWhyNot: gate.eligible ? null : gate.reasons[0] ?? "Ineligible",
        extensionEligible,
        restructureCandidate,
        postJune1Candidate,
        tradeSuggested,
        marketApy,
      } satisfies Row;
    });

    const dir = -1;
    const savings = (r: Row) => (state.finances.postJune1Sim ? r.savingsPost : r.savingsPre);
    const dead = (r: Row) => (state.finances.postJune1Sim ? r.deadNowPost : r.deadNowPre);

    return raw.sort((a, b) => {
      if (sortKey === "restructEligible") return dir * (Number(a.restructureEligible) - Number(b.restructureEligible));
      if (sortKey === "savings") return dir * (savings(a) - savings(b)) || dir * (a.ovr - b.ovr);
      if (sortKey === "capHit") return dir * (a.capHitNow - b.capHitNow) || dir * (a.ovr - b.ovr);
      if (sortKey === "deadCap") return dir * (dead(a) - dead(b)) || dir * (a.ovr - b.ovr);
      return dir * (a.ovr - b.ovr);
    });
  }, [state, teamId, sortKey]);

  const capRoom = state.finances.capSpace;
  const openSpots = Math.max(0, 53 - rows.length);
  const expiring = rows.filter((r) => r.yearsLeft <= 0).length;
  const unhappy = rows.filter((r) => r.playingTimeSat < 45).length;
  const chemistry = Math.max(0, Math.min(100, Math.round(rows.reduce((a, r) => a + r.morale, 0) / Math.max(1, rows.length))));

  const focus = rows.find((r) => r.id === openId) ?? null;
  const gate = focus ? getRestructureEligibility(state, focus.id) : null;
  const maxAmt = focus ? maxRestructureAmount(state, focus.id) : 0;

  const baseTable = focus ? buildCapTable(state, focus.id, 5) : null;
  const simTable = focus ? simulateRestructure(state, focus.id, gate?.eligible ? restruct : 0, 5) : null;

  const designation = focus ? state.offseasonData.rosterAudit.cutDesignations[focus.id] ?? "NONE" : "NONE";
  const cutProj = focus ? computeCutProjection(state, focus.id, designation === "POST_JUNE_1") : null;

  const extBand = focus ? extensionBand(focus.marketApy) : null;
  const tradeEv = focus ? tradeReturnEv(focus.pos, focus.ovr, focus.age, focus.capHitNow) : null;

  const teamMorale = chemistry;
  const qbwrChem = Math.max(0, Math.min(100, Math.round(teamMorale * 0.92)));

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <span>Roster Audit Dashboard</span>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Cap Mode</span>
                <Switch
                  checked={!!state.finances.postJune1Sim}
                  onCheckedChange={() =>
                    dispatch({ type: "FINANCES_PATCH", payload: { postJune1Sim: !state.finances.postJune1Sim } })
                  }
                />
              </div>

              <Select value={sortKey} onValueChange={(v) => setSortKey(v as any)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Sort: Savings Now</SelectItem>
                  <SelectItem value="capHit">Sort: Cap Hit</SelectItem>
                  <SelectItem value="deadCap">Sort: Dead Cap</SelectItem>
                  <SelectItem value="ovr">Sort: OVR</SelectItem>
                  <SelectItem value="restructEligible">Sort: Restructure Eligible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Cap Room</div>
              <div className={`text-lg font-bold tabular-nums ${capRoom < 0 ? "text-destructive" : ""}`}>{money(capRoom)}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Open Roster Spots</div>
              <div className="text-lg font-bold tabular-nums">{openSpots}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Expiring Contracts</div>
              <div className="text-lg font-bold tabular-nums">{expiring}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Unhappy Players</div>
              <div className="text-lg font-bold tabular-nums">{unhappy}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Chemistry</div>
              <div className="text-lg font-bold tabular-nums">{chemistry}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="contract">Contract Actions</TabsTrigger>
          <TabsTrigger value="morale">Morale & Role</TabsTrigger>
        </TabsList>

        <TabsContent value="contract" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contract Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rows.map((r) => {
                const deadNow = state.finances.postJune1Sim ? r.deadNowPost : r.deadNowPre;
                const savingsNow = state.finances.postJune1Sim ? r.savingsPost : r.savingsPre;

                return (
                  <div key={r.id} className="rounded-xl border p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {r.name} <span className="text-muted-foreground">({r.pos})</span> <span className="text-muted-foreground">· OVR {r.ovr}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        Age {r.age} · Role {r.role} · Cap {money(r.capHitNow)} · Dead {money(deadNow)} · Save {money(savingsNow)} · Yrs {r.yearsLeft}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.restructureCandidate ? <Badge variant="outline">Restructure Candidate</Badge> : null}
                        {r.postJune1Candidate ? <Badge variant="outline">Post–June 1 Candidate</Badge> : null}
                        {r.extensionEligible ? <Badge variant="outline">Extension Eligible</Badge> : null}
                        {r.tradeSuggested ? <Badge variant="secondary">Trade Block Suggested</Badge> : null}

                        {r.restructureEligible ? (
                          <Badge variant="outline">Restructure Eligible</Badge>
                        ) : (
                          <Badge variant="secondary" title={r.restructureWhyNot ?? ""}>
                            No Restructure
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setOpenId(r.id);
                          setRestruct(0);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="morale" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Morale</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">Overall Morale</div>
                <div className="text-lg font-bold tabular-nums">{teamMorale}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">Locker Room Chemistry</div>
                <div className="text-lg font-bold tabular-nums">{chemistry}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">QB–WR Chemistry</div>
                <div className="text-lg font-bold tabular-nums">{qbwrChem}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Player Dissatisfaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rows
                .filter((r) => r.tradeRisk !== "Low")
                .sort((a, b) => a.playingTimeSat - b.playingTimeSat)
                .slice(0, 25)
                .map((r) => (
                  <div key={r.id} className="rounded-xl border p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {r.name} <span className="text-muted-foreground">({r.pos})</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        Role {r.role} · Snap Share {Math.round(r.snapShare * 100)}% · Satisfaction {r.playingTimeSat}% · Trade Risk {r.tradeRisk}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => setOpenId(r.id)}>
                      View
                    </Button>
                  </div>
                ))}
              {rows.filter((r) => r.tradeRisk !== "Low").length === 0 ? (
                <div className="text-sm text-muted-foreground">No major dissatisfaction detected.</div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-w-4xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{focus ? `${focus.name} — Player Drawer` : "Player Drawer"}</DialogTitle>
          </DialogHeader>

          {!focus || !baseTable || !simTable || !gate ? null : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-4 gap-3">
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Cap Hit (Now)</div>
                  <div className="text-lg font-bold tabular-nums">{money(focus.capHitNow)}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Role</div>
                  <div className="text-lg font-bold tabular-nums">{focus.role}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Market APY</div>
                  <div className="text-lg font-bold tabular-nums">{money(focus.marketApy)}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Trade Return EV</div>
                  <div className="text-lg font-bold tabular-nums">{tradeEv}</div>
                </div>
              </div>

              <div className="rounded-xl border p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">Pre vs Post–June 1 (Cut)</div>
                  <Badge variant="outline">Compare only</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Pre: Dead {money(focus.deadNowPre)} · Save {money(focus.savingsPre)}{" "}
                  <span className="mx-2">|</span> Post: Dead {money(focus.deadNowPost)} · Save {money(focus.savingsPost)}
                </div>
              </div>

              <div className="rounded-xl border p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">Cut Designation</div>
                  <Select
                    value={designation}
                    onValueChange={(v) =>
                      dispatch({
                        type: "ROSTERAUDIT_SET_CUT_DESIGNATION",
                        payload: { playerId: focus.id, designation: v as "NONE" | "POST_JUNE_1" },
                      })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Standard Cut</SelectItem>
                      <SelectItem value="POST_JUNE_1">Post–June 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {cutProj ? (
                  <div className="text-xs text-muted-foreground">
                    Save now {money(cutProj.savingsThisYear)} · Dead now {money(cutProj.deadThisYear)} · Dead next {money(cutProj.deadNextYear)}
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      dispatch({ type: "CUT_APPLY", payload: { playerId: focus.id } });
                      setOpenId(null);
                    }}
                  >
                    Apply Cut
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">Extension Projection</div>
                  {focus.extensionEligible ? <Badge variant="outline">Eligible</Badge> : <Badge variant="secondary">Not Eligible</Badge>}
                </div>

                {extBand ? (
                  <div className="text-xs text-muted-foreground">
                    Market band: {money(extBand.lo)} – {money(extBand.hi)} / yr
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    disabled={!focus.extensionEligible}
                    onClick={() => dispatch({ type: "RESIGN_DRAFT_FROM_AUDIT", payload: { playerId: focus.id } })}
                  >
                    Initiate Extension Talk
                  </Button>
                  <Button variant="secondary" onClick={() => dispatch({ type: "RESIGN_CLEAR_DECISION", payload: { playerId: focus.id } })}>
                    Clear Offer
                  </Button>
                </div>

                {state.offseasonData.resigning.decisions?.[focus.id]?.action === "RESIGN" ? (
                  <div className="text-xs text-muted-foreground">
                    Draft offer: {money((state.offseasonData.resigning.decisions as any)[focus.id].offer?.apy ?? 0)}/yr ·{" "}
                    {(state.offseasonData.resigning.decisions as any)[focus.id].offer?.years ?? 0} yrs ·{" "}
                    {Math.round(((state.offseasonData.resigning.decisions as any)[focus.id].offer?.guaranteesPct ?? 0) * 100)}% gtd ·{" "}
                    {Math.round(((state.offseasonData.resigning.decisions as any)[focus.id].offer?.discountPct ?? 0) * 100)}% early discount
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">Restructure</div>
                  <div className="flex items-center gap-2">
                    {gate.eligible ? <Badge variant="outline">Eligible</Badge> : <Badge variant="destructive">Ineligible</Badge>}
                    <Badge variant="outline">Max {money(maxAmt)}</Badge>
                  </div>
                </div>

                {!gate.eligible ? <div className="text-xs text-muted-foreground">{gate.reasons.join(" ")}</div> : null}

                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground w-28">Amount</div>
                  <Slider
                    value={[restruct]}
                    max={maxAmt}
                    step={50_000}
                    onValueChange={(v) => setRestruct(v[0] ?? 0)}
                    disabled={!gate.eligible || maxAmt <= 0}
                  />
                  <div className="text-sm font-semibold tabular-nums w-24 text-right">{money(restruct)}</div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpenId(null)}>
                    Close
                  </Button>
                  <Button
                    disabled={!gate.eligible || restruct <= 0 || maxAmt <= 0}
                    onClick={() => {
                      dispatch({ type: "CONTRACT_RESTRUCTURE_APPLY", payload: { playerId: focus.id, amount: restruct } });
                      setOpenId(null);
                    }}
                  >
                    Apply Restructure
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border p-3 space-y-3">
                <div className="text-sm font-semibold">5-Year Cap Table (Cash vs Cap)</div>
                <Separator />
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-xl border p-3">
                    <div className="text-xs text-muted-foreground mb-2">Baseline</div>
                    <div className="space-y-2">
                      {baseTable.rows.map((r) => (
                        <div key={r.season} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{r.season}</span>
                          <span className="tabular-nums">{money(r.salary + r.bonus)} cash</span>
                          <span className="font-semibold tabular-nums">{money(r.capHit)} cap</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border p-3">
                    <div className="text-xs text-muted-foreground mb-2">After Restructure</div>
                    <div className="space-y-2">
                      {simTable.rows.map((r) => (
                        <div key={r.season} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{r.season}</span>
                          <span className="tabular-nums">{money(r.salary + r.bonus)} cash</span>
                          <span className="font-semibold tabular-nums">{money(r.capHit)} cap</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
