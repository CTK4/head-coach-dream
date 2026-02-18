import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getEffectivePlayersByTeam, normalizePos } from "@/engine/rosterOverlay";
import { buildCapTable, maxRestructureAmount, simulateRestructure } from "@/engine/contractMath";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

function money(n: number) {
  const m = n / 1_000_000;
  const abs = Math.abs(m);
  const s = abs >= 10 ? `${Math.round(m)}M` : `${Math.round(m * 10) / 10}M`;
  return `$${s}`;
}

type Row = { id: string; name: string; pos: string; age: number; ovr: number };

export default function RosterAudit() {
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const [openId, setOpenId] = useState<string | null>(null);
  const [restruct, setRestruct] = useState(0);

  const rows = useMemo(() => {
    return getEffectivePlayersByTeam(state, teamId)
      .map((p: any) => ({
        id: String(p.playerId),
        name: String(p.fullName),
        pos: normalizePos(String(p.pos ?? "UNK")),
        age: Number(p.age ?? 0),
        ovr: Number(p.overall ?? 0),
      }))
      .sort((a, b) => b.ovr - a.ovr);
  }, [state, teamId]);

  const focus: Row | null = rows.find((r) => r.id === openId) ?? null;
  const maxAmt = focus ? maxRestructureAmount(state, focus.id) : 0;
  const baseTable = focus ? buildCapTable(state, focus.id, 5) : null;
  const simTable = focus ? simulateRestructure(state, focus.id, restruct, 5) : null;

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Roster Audit</CardTitle>
          <Badge variant="outline">Contract Actions</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">
                  {r.name} <span className="text-muted-foreground">({r.pos})</span>
                </div>
                <div className="text-xs text-muted-foreground">Age {r.age || "—"} · OVR {r.ovr || "—"}</div>
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
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{focus ? `${focus.name} — 5Y Cap Table` : "Cap Table"}</DialogTitle>
          </DialogHeader>

          {!focus || !baseTable || !simTable ? null : (
            <div className="space-y-4">
              <div className="rounded-xl border p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">Restructure Simulation</div>
                  <Badge variant="outline">Max {money(maxAmt)}</Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground w-28">Amount</div>
                  <Slider value={[restruct]} max={maxAmt} step={50_000} onValueChange={(v) => setRestruct(v[0] ?? 0)} disabled={maxAmt <= 0} />
                  <div className="text-sm font-semibold tabular-nums w-24 text-right">{money(restruct)}</div>
                </div>

                <div className="text-xs text-muted-foreground">Requires an override-style contract (FA/tag/re-sign). Base DB contracts show baseline only.</div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Baseline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {baseTable.rows.map((r) => (
                      <div key={r.season} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{r.season}</span>
                        <span className="font-semibold tabular-nums">{money(r.capHit)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t flex justify-between text-sm">
                      <span className="text-muted-foreground">Total 5Y</span>
                      <span className="font-semibold tabular-nums">{money(baseTable.total5y)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">After Restructure</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {simTable.rows.map((r) => (
                      <div key={r.season} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{r.season}</span>
                        <span className="font-semibold tabular-nums">{money(r.capHit)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t flex justify-between text-sm">
                      <span className="text-muted-foreground">Total 5Y</span>
                      <span className="font-semibold tabular-nums">{money(simTable.total5y)}</span>
                    </div>
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
