import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getPlayers, getContracts } from "@/data/leagueDb";
import { getDepthSlotLabel } from "@/engine/rosterOverlay";
import { projectedMarketApy } from "@/engine/marketModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

function money(n: number) {
  const m = n / 1_000_000;
  const abs = Math.abs(m);
  const s = abs >= 10 ? `${Math.round(m)}M` : `${Math.round(m * 10) / 10}M`;
  return `$${s}`;
}

export default function ResignPlayers() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const [openId, setOpenId] = useState<string | null>(null);

  const expiring = useMemo(() => {
    const players = getPlayers().filter((p: any) => String(state.playerTeamOverrides[String(p.playerId)] ?? p.teamId) === String(teamId));
    const contracts = getContracts();
    return players
      .map((p: any) => {
        const c = contracts.find((x: any) => x.contractId === p.contractId);
        const end = Number(c?.endSeason ?? state.season);
        return { p, end };
      })
      .filter((r) => r.end <= state.season)
      .sort((a, b) => Number(b.p.overall ?? 0) - Number(a.p.overall ?? 0));
  }, [state, teamId]);

  const focus = useMemo(() => {
    if (!openId) return null;
    const p: any = getPlayers().find((x: any) => String(x.playerId) === String(openId));
    if (!p) return null;
    const market = projectedMarketApy(String(p.pos ?? "UNK"), Number(p.overall ?? 0), Number(p.age ?? 26));
    const decision: any = state.offseasonData.resigning.decisions?.[String(openId)];
    const offer = decision?.offer ?? null;
    return { p, market, decision, offer };
  }, [state, openId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Re-sign Window</CardTitle>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })}>
            Continue
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-sm text-muted-foreground mb-3">Make an offer. If accepted, contract updates immediately. If rejected, try again.</div>

        <ScrollArea className="h-[60vh] pr-3">
          <div className="space-y-2">
            {expiring.length === 0 ? <div className="text-sm text-muted-foreground">No expiring contracts.</div> : null}
            {expiring.map(({ p }) => {
              const depth = getDepthSlotLabel(state, String(p.playerId));
              const decision: any = state.offseasonData.resigning.decisions?.[String(p.playerId)];
              const offer = decision?.offer;

              return (
                <div key={p.playerId} className="rounded-xl border border-border p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      <button className="hover:underline" onClick={() => navigate(`/hub/player/${p.playerId}`)}>
                        {p.fullName}
                      </button>{" "}
                      <span className="text-muted-foreground">({p.pos})</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Age {p.age ?? "—"} · {depth ? `Depth ${depth}` : "Depth —"} · OVR {p.overall ?? "—"}
                    </div>
                    {offer ? (
                      <div className="text-xs text-muted-foreground mt-1">
                        Offer: {money(Number(offer.apy ?? 0))}/yr · {Number(offer.years ?? 0)} yrs · {Math.round(Number(offer.guaranteesPct ?? 0) * 100)}% gtd ·
                        Rejected {Number(offer.rejectedCount ?? 0)}x
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    {offer ? <Badge variant="outline">{offer.createdFrom === "AUDIT" ? "Drafted" : "Offer"}</Badge> : <Badge variant="outline">Projected</Badge>}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setOpenId(String(p.playerId));
                        if (!offer) dispatch({ type: "RESIGN_MAKE_OFFER", payload: { playerId: String(p.playerId), createdFrom: "RESIGN_SCREEN" } });
                      }}
                    >
                      {offer ? "View" : "Make Offer"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>

      <Dialog open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Offer</DialogTitle>
          </DialogHeader>

          {!focus ? null : (
            <div className="space-y-3">
              <div className="font-semibold">
                {focus.p.fullName} <span className="text-muted-foreground">({focus.p.pos})</span>
              </div>
              <div className="text-xs text-muted-foreground">Market projection: {money(focus.market)}/yr</div>

              <div className="rounded-xl border p-3 space-y-1">
                {focus.offer ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Years</span>
                      <span className="font-semibold tabular-nums">{focus.offer.years}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">APY</span>
                      <span className="font-semibold tabular-nums">{money(focus.offer.apy)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Guarantees</span>
                      <span className="font-semibold tabular-nums">{Math.round(Number(focus.offer.guaranteesPct ?? 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Early discount</span>
                      <span className="tabular-nums">{Math.round(Number(focus.offer.discountPct ?? 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Rejected</span>
                      <span className="tabular-nums">{Number(focus.offer.rejectedCount ?? 0)}x</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No offer found.</div>
                )}
              </div>

              <Separator />

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenId(null)}>
                  Close
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => dispatch({ type: "RESIGN_MAKE_OFFER", payload: { playerId: String(openId), createdFrom: "RESIGN_SCREEN" } })}
                >
                  New Offer
                </Button>
                <Button variant="destructive" onClick={() => dispatch({ type: "RESIGN_REJECT_OFFER", payload: { playerId: String(openId) } })}>
                  Rejected
                </Button>
                <Button onClick={() => dispatch({ type: "RESIGN_ACCEPT_OFFER", payload: { playerId: String(openId) } })}>Accepted</Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Rejecting bumps price and reduces the early discount on the next offer.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
