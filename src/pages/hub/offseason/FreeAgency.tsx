import { useEffect, useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FreeAgency() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    dispatch({ type: "FA_INIT_OFFERS" });
  }, [dispatch]);

  const fa = state.offseasonData.freeAgency;
  const remaining = fa.capTotal - fa.capUsed;

  const offers = useMemo(
    () => fa.offers.filter((o) => !fa.rejected[o.playerId] && !fa.withdrawn[o.id] && !fa.signings.includes(o.playerId)),
    [fa.offers, fa.rejected, fa.withdrawn, fa.signings]
  );

  const sign = (offerId: string) => dispatch({ type: "FA_SIGN", payload: { offerId } });
  const reject = (playerId: string) => dispatch({ type: "FA_REJECT", payload: { playerId } });
  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "FREE_AGENCY" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xl font-bold">New League Year / Free Agency / Trades</div>
            <div className="text-sm text-muted-foreground">Sign UFAs (MVP: one-click sign).</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Step 4</Badge>
            <Badge variant={remaining >= 0 ? "outline" : "destructive"}>Left ${Math.round(remaining / 1_000_000)}M</Badge>
          </div>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Free Agents</div>
              <Badge variant="outline">{offers.length}</Badge>
            </div>
            <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
              {offers.map((o) => {
                const can = remaining >= o.apy;
                return (
                  <div key={o.id} className="border rounded-md px-3 py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {o.name} <span className="text-muted-foreground">({o.pos})</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {o.years}y · ${Math.round(o.apy / 1_000_000)}M · Interest {Math.round(o.interest * 100)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="min-h-11" onClick={() => reject(o.playerId)}>
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" className="min-h-11" onClick={() => sign(o.id)} disabled={!can}>
                        Sign
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Signings</div>
              <Badge variant="secondary">{fa.signings.length}</Badge>
            </div>
            <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
              {fa.signings.length ? (
                fa.signings.map((pid) => (
                  <div key={pid} className="border rounded-md px-3 py-2 text-sm">
                    Signed: {pid} · ${Math.round((fa.capHitsByPlayerId[pid] ?? 0) / 1_000_000)}M
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No signings yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">When ready, complete and advance.</div>
          <div className="flex gap-2">
            <Button variant="outline" className="min-h-11" onClick={completeStep}>
              Complete Step
            </Button>
            <Button className="min-h-11" onClick={next} disabled={!state.offseason.stepsComplete.FREE_AGENCY}>
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
