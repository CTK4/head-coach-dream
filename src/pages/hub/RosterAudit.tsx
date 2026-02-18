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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function money(n: number) {
  const m = n / 1_000_000;
  const abs = Math.abs(m);
  const s = abs >= 10 ? `${Math.round(m)}M` : `${Math.round(m * 10) / 10}M`;
  return `$${s}`;
}
function round50k(v: number) {
  return Math.round(v / 50_000) * 50_000;
}

type Row = {
  id: string;
  name: string;
  pos: string;
  age: number;
  ovr: number;
  capHitNow: number;
  deadNowPre: number;
  deadNowPost: number;
  savingsPre: number;
  savingsPost: number;
  restructureEligible: boolean;
  restructureWhyNot: string | null;
};

export default function RosterAudit() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const [openId, setOpenId] = useState<string | null>(null);
  const [restruct, setRestruct] = useState(0);
  const [sortKey, setSortKey] = useState<"ovr" | "savings" | "capHit" | "deadCap" | "restructEligible">("savings");

  const rows = useMemo(() => {
    return getEffectivePlayersByTeam(state, teamId)
      .map((p: any) => {
        const id = String(p.playerId);
        const s = getContractSummaryForPlayer(state, id);
        const capHitNow = round50k(s?.capHitBySeason?.[state.season] ?? 0);
        const deadRaw = round50k(s?.deadCapIfCutNow ?? 0);
        const deadNowPre = round50k(deadRaw);
        const deadNowPost = round50k(deadRaw * 0.5);
        const savingsPre = round50k(capHitNow - deadNowPre);
        const savingsPost = round50k(capHitNow - deadNowPost);

        const gate = getRestructureEligibility(state, id);

        return {
          id,
          name: String(p.fullName),
          pos: normalizePos(String(p.pos ?? "UNK")),
          age: Number(p.age ?? 0),
          ovr: Number(p.overall ?? 0),
          capHitNow,
          deadNowPre,
          deadNowPost,
          savingsPre,
          savingsPost,
          restructureEligible: gate.eligible,
          restructureWhyNot: gate.eligible ? null : gate.reasons[0] ?? "Ineligible",
        } satisfies Row;
      })
      .sort((a, b) => {
        const dir = -1;
        const savings = (r: Row) => (state.finances.postJune1Sim ? r.savingsPost : r.savingsPre);
        const dead = (r: Row) => (state.finances.postJune1Sim ? r.deadNowPost : r.deadNowPre);

        if (sortKey === "restructEligible") return dir * (Number(a.restructureEligible) - Number(b.restructureEligible));
        if (sortKey === "savings") return dir * (savings(a) - savings(b)) || dir * (a.ovr - b.ovr);
        if (sortKey === "capHit") return dir * (a.capHitNow - b.capHitNow) || dir * (a.ovr - b.ovr);
        if (sortKey === "deadCap") return dir * (dead(a) - dead(b)) || dir * (a.ovr - b.ovr);
        return dir * (a.ovr - b.ovr);
      });
  }, [state, teamId, sortKey]);

  const focus = rows.find((r) => r.id === openId) ?? null;
  const gate = focus ? getRestructureEligibility(state, focus.id) : null;
  const maxAmt = focus ? maxRestructureAmount(state, focus.id) : 0;

  const baseTable = focus ? buildCapTable(state, focus.id, 5) : null;
  const simTable = focus ? simulateRestructure(state, focus.id, gate?.eligible ? restruct : 0, 5) : null;
  const designation = focus ? state.offseasonData.rosterAudit.cutDesignations[focus.id] ?? "NONE" : "NONE";
  const cutProj = focus ? computeCutProjection(state, focus.id, designation === "POST_JUNE_1") : null;

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle>Roster Audit</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Post–June 1</span>
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

            <Badge variant="outline">Contract Actions</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {rows.map((r) => {
            const deadNow = state.finances.postJune1Sim ? r.deadNowPost : r.deadNowPre;
            const savingsNow = state.finances.postJune1Sim ? r.savingsPost : r.savingsPre;

            return (
              <div key={r.id} className="rounded-xl border p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {r.name} <span className="text-muted-foreground">({r.pos})</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    Age {r.age || "—"} · OVR {r.ovr || "—"} · Cap {money(r.capHitNow)} · Dead {money(deadNow)} · Save {" "}
                    {money(savingsNow)}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.restructureEligible ? (
                      <Badge variant="outline">Restructure Eligible</Badge>
                    ) : (
                      <Badge variant="secondary" title={r.restructureWhyNot ?? ""}>
                        No Restructure
                      </Badge>
                    )}
                  </div>
                </div>
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
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{focus ? `${focus.name} — Contract Drawer` : "Contract Drawer"}</DialogTitle>
          </DialogHeader>

          {!focus || !baseTable || !simTable || !gate ? null : (
            <div className="space-y-4">
              <div className="rounded-xl border p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">Dead Cap Comparison</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Pre–June 1 {money(focus.deadNowPre)}</Badge>
                    <Badge variant="outline">Post–June 1 {money(focus.deadNowPost)}</Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Savings Now: Pre {money(focus.savingsPre)} · Post {money(focus.savingsPost)}
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

              <div className="grid md:grid-cols-2 gap-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Baseline (5Y)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {baseTable.rows.map((r) => (
                      <div key={r.season} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{r.season}</span>
                        <span className="font-semibold tabular-nums">{money(r.capHit)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">After Restructure (5Y)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {simTable.rows.map((r) => (
                      <div key={r.season} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{r.season}</span>
                        <span className="font-semibold tabular-nums">{money(r.capHit)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
