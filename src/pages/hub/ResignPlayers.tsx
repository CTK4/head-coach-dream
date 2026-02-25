import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getPlayers } from "@/data/leagueDb";
import { getDepthSlotLabel, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { projectedMarketApy } from "@/engine/marketModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import type { ResignOffer } from "@/engine/offseasonData";
import { getPositionLabel } from "@/lib/displayLabels";

type PlayerRow = {
  playerId: string;
  fullName: string;
  pos: string;
  age: number;
  overall: number;
};

function money(n: number) {
  const m = n / 1_000_000;
  const abs = Math.abs(m);
  const s = abs >= 10 ? `${Math.round(m)}M` : `${Math.round(m * 10) / 10}M`;
  return `$${s}`;
}

function cloneOffer(offer: ResignOffer): ResignOffer {
  return {
    years: Number(offer.years ?? 2),
    apy: Number(offer.apy ?? 0),
    guaranteesPct: Number(offer.guaranteesPct ?? 0.5),
    discountPct: Number(offer.discountPct ?? 0),
    createdFrom: offer.createdFrom ?? "RESIGN_SCREEN",
    rejectedCount: Number(offer.rejectedCount ?? 0),
  };
}

export default function ResignPlayers() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const [openId, setOpenId] = useState<string | null>(null);
  const [draftOffer, setDraftOffer] = useState<ResignOffer | null>(null);

  const expiring = useMemo(() => {
    const players = getPlayers().filter((p) => String(state.playerTeamOverrides[String(p.playerId)] ?? p.teamId) === String(teamId));
    return players
      .map((p) => {
        const summary = getContractSummaryForPlayer(state, String(p.playerId));
        return { p, end: Number(summary?.endSeason ?? -1) };
      })
      .filter((r) => r.end === Number(state.season))
      .sort((a, b) => Number(b.p.overall ?? 0) - Number(a.p.overall ?? 0));
  }, [state, teamId]);

  const focus = useMemo(() => {
    if (!openId) return null;
    const p = getPlayers().find((x) => String(x.playerId) === String(openId));
    if (!p) return null;
    const market = projectedMarketApy(String(p.pos ?? "UNK"), Number(p.overall ?? 0), Number(p.age ?? 26));
    const decision = state.offseasonData.resigning.decisions?.[String(openId)];
    const offer = decision?.offer ?? null;
    return { p: p as PlayerRow, market, decision, offer };
  }, [state, openId]);

  useEffect(() => {
    if (!focus?.offer) {
      setDraftOffer(null);
      return;
    }
    setDraftOffer(cloneOffer(focus.offer));
  }, [focus?.offer]);

  useEffect(() => {
    if (!openId) return;
    const stillExpiring = expiring.some((x) => String(x.p.playerId) === String(openId));
    if (!stillExpiring) {
      setOpenId(null);
      setDraftOffer(null);
    }
  }, [expiring, openId]);

  const pushOfferDraft = () => {
    if (!openId || !draftOffer) return;
    dispatch({
      type: "RESIGN_SET_DECISION",
      payload: {
        playerId: String(openId),
        decision: {
          action: "RESIGN",
          offer: cloneOffer(draftOffer),
        },
      },
    });
  };

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
        <div className="text-sm text-muted-foreground mb-3">Make an offer. If accepted, contract updates immediately. If rejected, create a new offer.</div>

        <ScrollArea className="h-[60vh] pr-3">
          <div className="space-y-2">
            {expiring.length === 0 ? <div className="text-sm text-muted-foreground">No expiring contracts.</div> : null}
            {expiring.map(({ p }) => {
              const depth = getDepthSlotLabel(state, String(p.playerId));
              const decision = state.offseasonData.resigning.decisions?.[String(p.playerId)];
              const offer = decision?.offer;

              return (
                <div key={p.playerId} className="rounded-xl border border-border p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      <button className="hover:underline" onClick={() => navigate(`/hub/player/${p.playerId}`)}>
                        {p.fullName}
                      </button>{" "}
                      <span className="text-muted-foreground">({getPositionLabel(p.pos)})</span>
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
            <DialogTitle>Offer Dashboard</DialogTitle>
          </DialogHeader>

          {!focus ? null : (
            <div className="space-y-3">
              <div className="font-semibold">
                {focus.p.fullName} <span className="text-muted-foreground">({focus.p.pos})</span>
              </div>
              <div className="text-xs text-muted-foreground">Market projection: {money(focus.market)}/yr</div>

              <div className="rounded-xl border p-3 space-y-2">
                {draftOffer ? (
                  <>
                    <div className="text-sm font-medium">Current offer</div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Years</span>
                      <span className="font-semibold tabular-nums">{draftOffer.years}</span>
                    </div>
                    <Slider
                      value={[draftOffer.years]}
                      min={2}
                      max={5}
                      step={1}
                      onValueChange={(v) => setDraftOffer((cur) => (cur ? { ...cur, years: v[0] ?? cur.years } : cur))}
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">APY</span>
                      <span className="font-semibold tabular-nums">{money(draftOffer.apy)}</span>
                    </div>
                    <Slider
                      value={[draftOffer.apy]}
                      min={Math.max(500_000, Math.round(focus.market * 0.6))}
                      max={Math.max(1_000_000, Math.round(focus.market * 1.6))}
                      step={50_000}
                      onValueChange={(v) => setDraftOffer((cur) => (cur ? { ...cur, apy: Math.round(v[0] ?? cur.apy) } : cur))}
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Guarantees</span>
                      <span className="font-semibold tabular-nums">{Math.round(draftOffer.guaranteesPct * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(draftOffer.guaranteesPct * 100)]}
                      min={30}
                      max={90}
                      step={1}
                      onValueChange={(v) =>
                        setDraftOffer((cur) => (cur ? { ...cur, guaranteesPct: (v[0] ?? Math.round(cur.guaranteesPct * 100)) / 100 } : cur))
                      }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Discount</span>
                      <span className="tabular-nums">{Math.round(Number(draftOffer.discountPct ?? 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Rejected</span>
                      <span className="tabular-nums">{Number(draftOffer.rejectedCount ?? 0)}x</span>
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
                  onClick={() => {
                    setOpenId(String(openId));
                    if (focus.offer) {
                      setDraftOffer(cloneOffer(focus.offer));
                    }
                  }}
                >
                  New Offer
                </Button>
                <Button variant="secondary" onClick={pushOfferDraft} disabled={!draftOffer}>
                  Save Offer
                </Button>
                <Button variant="destructive" onClick={() => dispatch({ type: "RESIGN_REJECT_OFFER", payload: { playerId: String(openId) } })}>
                  Decline
                </Button>
                <Button onClick={() => draftOffer && dispatch({ type: "RESIGN_SUBMIT_OFFER", payload: { playerId: String(openId), offer: cloneOffer(draftOffer) } })} disabled={!draftOffer}>Submit Offer</Button>
              </div>

              <div className="text-xs text-muted-foreground">New Offer loads the existing offer into this dashboard for edits. Decline clears the active offer.</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}