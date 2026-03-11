import { useEffect, useMemo, useState } from "react";
import { ExplainerDrawer } from "@/components/explainability/ExplainerDrawer";
import { MODEL_CARDS } from "@/components/explainability/modelCards";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(1)}M`;
}

type OfferEdit = { years: string; apy: string };

export default function FreeAgency() {
  const { state, dispatch } = useGame();
  const faModelCard = MODEL_CARDS["fa-market"];

  useEffect(() => {
    dispatch({ type: "FA_INIT_OFFERS" });
  }, [dispatch]);

  const fa = state.offseasonData.freeAgency;
  const remaining = fa.capTotal - fa.capUsed;

  // Per-player offer edits (years / APY in $M)
  const [offerEdits, setOfferEdits] = useState<Record<string, OfferEdit>>({});

  const offers = useMemo(
    () => fa.offers.filter((o) => !fa.rejected[o.playerId] && !fa.withdrawn[o.id] && !fa.signings.includes(o.playerId)),
    [fa.offers, fa.rejected, fa.withdrawn, fa.signings]
  );
  const decisions = fa.decisionReasonByPlayerId ?? {};

  const sign = (offerId: string) => {
    const offer = fa.offers.find((o) => o.id === offerId);
    if (!offer) return;
    const edit = offerEdits[offerId];
    const years = edit?.years ? Math.max(1, Math.min(5, parseInt(edit.years, 10) || offer.years)) : offer.years;
    const apyM = edit?.apy ? parseFloat(edit.apy) : offer.apy / 1_000_000;
    const apy = Math.max(0.5, apyM) * 1_000_000;
    dispatch({ type: "FA_SIGN", payload: { offerId, years, apy } });
  };
  const reject = (playerId: string) => dispatch({ type: "FA_REJECT", payload: { playerId } });
  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "FREE_AGENCY" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });

  const setEdit = (offerId: string, field: "years" | "apy", value: string) => {
    setOfferEdits((prev) => ({ ...prev, [offerId]: { ...(prev[offerId] ?? {}), years: prev[offerId]?.years ?? "", apy: prev[offerId]?.apy ?? "", [field]: value } }));
  };

  // Resolve player names from offers list for signings panel
  const playerNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const o of fa.offers) map[o.playerId] = o.name ?? o.playerId;
    return map;
  }, [fa.offers]);

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold">Free Agency</div>
              <ExplainerDrawer
                title={faModelCard.title}
                description={faModelCard.description}
                factors={faModelCard.factors}
                example={faModelCard.example}
                trigger={<button className="rounded border px-2 py-0.5 text-sm" type="button">ⓘ</button>}
                triggerAriaLabel="Open free-agency market model explainer"
              />
            </div>
            <div className="text-sm text-muted-foreground">Submit offers to UFAs. Edit years/APY before signing.</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Step 4</Badge>
            <Badge variant={remaining >= 0 ? "outline" : "destructive"}>Left {money(remaining)}</Badge>
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
            <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
              {offers.map((o) => {
                const edit = offerEdits[o.id];
                const yearsVal = edit?.years ?? String(o.years);
                const apyMVal = edit?.apy ?? (o.apy / 1_000_000).toFixed(1);
                const apyDisplay = parseFloat(apyMVal) * 1_000_000;
                const can = remaining >= apyDisplay;
                return (
                  <div key={o.id} className="border rounded-md px-3 py-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {o.name} <span className="text-muted-foreground">({o.pos})</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Interest {Math.round(o.interest * 100)}%
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="min-h-11 shrink-0" onClick={() => reject(o.playerId)}>
                        Pass
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Yrs</span>
                        <Input
                          className="w-14 h-8 text-xs px-2"
                          type="number"
                          min={1}
                          max={5}
                          value={yearsVal}
                          onChange={(e) => setEdit(o.id, "years", e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>APY $M</span>
                        <Input
                          className="w-20 h-8 text-xs px-2"
                          type="number"
                          min={0.5}
                          step={0.1}
                          value={apyMVal}
                          onChange={(e) => setEdit(o.id, "apy", e.target.value)}
                        />
                      </div>
                      <Button size="sm" variant="outline" className="min-h-11 ml-auto" onClick={() => sign(o.id)} disabled={!can}>
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
                    <div className="font-medium">{playerNameById[pid] ?? pid}</div>
                    <div className="text-xs text-muted-foreground">{money(fa.capHitsByPlayerId[pid] ?? 0)} APY</div>
                    {decisions[pid] ? <div className="text-xs text-muted-foreground mt-1">Reason: {decisions[pid]}</div> : null}
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
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Rejected</div>
            <Badge variant="outline">{Object.keys(fa.rejected).length}</Badge>
          </div>
          <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
            {Object.keys(fa.rejected).length ? (
              Object.keys(fa.rejected).map((pid) => (
                <div key={pid} className="border rounded-md px-3 py-2 text-sm">
                  Passed: {playerNameById[pid] ?? pid}
                  {decisions[pid] ? <div className="text-xs text-muted-foreground mt-1">Reason: {decisions[pid]}</div> : null}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No passes yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

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
