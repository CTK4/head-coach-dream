import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { genFreeAgents } from "@/engine/offseasonGen";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPositionLabel } from "@/lib/displayLabels";

export default function Tampering() {
  const { state, dispatch } = useGame();
  const seed = state.saveSeed ^ 0x33333333;
  const pool = useMemo(() => genFreeAgents(seed, 18), [seed]);
  const offers = state.offseasonData.tampering.offers;
  const offer = (id: string) => { const p = pool.find((x) => x.id === id); if (!p) return; dispatch({ type: "TAMPERING_ADD_OFFER", payload: { offer: p } }); };
  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "TAMPERING" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card><CardContent className="p-6 flex items-center justify-between"><div className="space-y-1"><div className="text-xl font-bold">Legal Negotiating (Tampering)</div><div className="text-sm text-muted-foreground">Send early feelers. These carry into Free Agency.</div></div><Badge variant="outline">Step 3</Badge></CardContent></Card>
      <div className="grid md:grid-cols-2 gap-4"><Card><CardContent className="p-5 space-y-3"><div className="flex items-center justify-between"><div className="font-semibold">Targets</div><Badge variant="outline">{pool.length}</Badge></div><div className="space-y-2 max-h-[420px] overflow-auto pr-1">{pool.map((p) => (<div key={p.id} className="border rounded-md px-3 py-2 flex items-center justify-between"><div className="min-w-0"><div className="font-medium truncate">{p.name} <span className="text-muted-foreground">({getPositionLabel(p.pos)})</span></div><div className="text-xs text-muted-foreground">{p.years}y · ${Math.round(p.apy / 1_000_000)}M · Interest {Math.round(p.interest * 100)}%</div></div><Button size="sm" variant="outline" onClick={() => offer(p.id)}>Add</Button></div>))}</div></CardContent></Card><Card><CardContent className="p-5 space-y-3"><div className="flex items-center justify-between"><div className="font-semibold">Your Offers</div><Badge variant="secondary">{offers.length}</Badge></div><div className="space-y-2 max-h-[420px] overflow-auto pr-1">{offers.length ? offers.map((o) => (<div key={o.id} className="border rounded-md px-3 py-2"><div className="font-medium">{o.name} <span className="text-muted-foreground">({getPositionLabel(o.pos)})</span></div><div className="text-xs text-muted-foreground">{o.years}y · ${Math.round(o.apy / 1_000_000)}M · Interest {Math.round(o.interest * 100)}%</div></div>)) : <div className="text-sm text-muted-foreground">No offers yet.</div>}</div></CardContent></Card></div>
      <Card><CardContent className="p-6 flex items-center justify-between gap-3"><div className="text-sm text-muted-foreground">Add any targets, then complete.</div><div className="flex gap-2"><Button variant="outline" onClick={completeStep}>Complete Step</Button><Button onClick={next} disabled={!state.offseason.stepsComplete.TAMPERING}>Next →</Button></div></CardContent></Card>
    </div>
  );
}