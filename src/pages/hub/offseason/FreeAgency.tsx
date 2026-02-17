import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { genFreeAgents } from "@/engine/offseasonGen";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FreeAgency() {
  const { state, dispatch } = useGame();
  const seed = state.saveSeed ^ 0x44444444;
  const pool = useMemo(() => genFreeAgents(seed, 25), [seed]);
  const offers = state.offseasonData.freeAgency.offers.length ? state.offseasonData.freeAgency.offers : [...state.offseasonData.tampering.offers, ...pool];
  const signings = state.offseasonData.freeAgency.signings;
  const sign = (offerId: string) => dispatch({ type: "FA_SIGN", payload: { offerId } });
  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "FREE_AGENCY" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });
  return <div className="p-4 md:p-8 space-y-4"><Card><CardContent className="p-6 flex items-center justify-between"><div className="space-y-1"><div className="text-xl font-bold">New League Year / Free Agency / Trades</div><div className="text-sm text-muted-foreground">Sign UFAs (MVP: one-click sign).</div></div><Badge variant="outline">Step 4</Badge></CardContent></Card><div className="grid md:grid-cols-2 gap-4"><Card><CardContent className="p-5 space-y-3"><div className="flex items-center justify-between"><div className="font-semibold">Free Agents</div><Badge variant="outline">{offers.length}</Badge></div><div className="space-y-2 max-h-[520px] overflow-auto pr-1">{offers.map((o)=>{const signed=signings.includes(o.playerId);return <div key={o.id} className="border rounded-md px-3 py-2 flex items-center justify-between"><div className="min-w-0"><div className="font-medium truncate">{o.name} <span className="text-muted-foreground">({o.pos})</span></div><div className="text-xs text-muted-foreground">{o.years}y · ${Math.round(o.apy/1_000_000)}M · Interest {Math.round(o.interest*100)}%</div></div><Button size="sm" variant={signed?"secondary":"outline"} onClick={()=>sign(o.id)} disabled={signed}>{signed?"Signed":"Sign"}</Button></div>;})}</div></CardContent></Card><Card><CardContent className="p-5 space-y-3"><div className="flex items-center justify-between"><div className="font-semibold">Signings</div><Badge variant="secondary">{signings.length}</Badge></div><div className="space-y-2 max-h-[520px] overflow-auto pr-1">{signings.length?signings.map((pid)=><div key={pid} className="border rounded-md px-3 py-2 text-sm">Signed: {pid}</div>):<div className="text-sm text-muted-foreground">No signings yet.</div>}</div></CardContent></Card></div><Card><CardContent className="p-6 flex items-center justify-between gap-3"><div className="text-sm text-muted-foreground">When ready, complete and advance.</div><div className="flex gap-2"><Button variant="outline" onClick={completeStep}>Complete Step</Button><Button onClick={next} disabled={!state.offseason.stepsComplete.FREE_AGENCY}>Next →</Button></div></CardContent></Card></div>;
}
