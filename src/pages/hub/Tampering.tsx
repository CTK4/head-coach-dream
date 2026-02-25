import { getPositionLabel } from "@/lib/displayLabels";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { getEffectiveFreeAgents, normalizePos } from "@/engine/rosterOverlay";
import { projectedMarketApy } from "@/engine/marketModel";

type PosTab = "ALL" | "QB" | "RB" | "WR" | "TE" | "DL" | "EDGE" | "LB" | "CB" | "S" | "K" | "P";
const TABS: PosTab[] = ["ALL", "QB", "RB", "WR", "TE", "DL", "EDGE", "LB", "CB", "S", "K", "P"];

function moneyShort(n: number) {
  const m = n / 1_000_000;
  return m >= 10 ? `$${Math.round(m)}M` : `$${Math.round(m * 10) / 10}M`;
}
function tabMatch(tab: PosTab, pos: string) {
  if (tab === "ALL") return true;
  return normalizePos(pos) === tab;
}
function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export default function Tampering() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const [tab, setTab] = useState<PosTab>("ALL");
  const [q, setQ] = useState("");
  const [years, setYears] = useState(2);
  const [aav, setAav] = useState(8_000_000);
  const [showAll, setShowAll] = useState(false);

  const ui = state.tampering.ui;
  const activePlayerId = ui.mode === "PLAYER" ? ui.playerId : "";

  useEffect(() => {
    dispatch({ type: "TAMPERING_INIT" });
  }, [dispatch]);

  const shortListIds = useMemo(() => new Set(state.tampering.shortlistPlayerIds), [state.tampering.shortlistPlayerIds]);

  const list = useMemo(() => {
    const all = getEffectiveFreeAgents(state)
      .map((p: any) => {
        const id = String(p.playerId);
        const pos = String(p.pos ?? "UNK").toUpperCase();
        const ovr = Number(p.overall ?? 0);
        const age = Number(p.age ?? 0);
        const market = projectedMarketApy(pos, ovr, age);
        const interest = state.tampering.interestByPlayerId[id] ?? 0;
        return {
          id,
          name: String(p.fullName),
          pos,
          age,
          ovr,
          portraitUrl: String(p.portraitUrl ?? ""),
          market,
          interest,
          hasSoft: !!state.tampering.softOffersByPlayerId[id],
        };
      })
      .filter((p) => tabMatch(tab, p.pos))
      .filter((p) => (q.trim() ? p.name.toLowerCase().includes(q.trim().toLowerCase()) : true))
      .filter((p) => showAll || p.interest >= 0.45)
      .sort((a, b) => Number(shortListIds.has(b.id)) - Number(shortListIds.has(a.id)) || b.ovr - a.ovr);

    return all.slice(0, 160);
  }, [state, tab, q, shortListIds, showAll]);

  const offers = activePlayerId ? state.tampering.softOffersByPlayerId[activePlayerId] : null;
  const capIllegal = state.finances.capSpace < 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-black/30">
      <div className="sticky top-0 z-20 bg-background/70 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-extrabold tracking-widest">LEGAL NEGOTIATION</div>
          <div className="flex gap-2">
            <Button variant="secondary" className="rounded-2xl px-4" onClick={() => dispatch({ type: "TAMPERING_OPEN_SHORTLIST" })}>
              Shortlist
            </Button>
            <Button variant="secondary" onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })}>
              Continue
            </Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm font-semibold overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative pb-2 whitespace-nowrap transition ${tab === t ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                  {tab === t ? <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-emerald-400 rounded-full" /> : null}
                </button>
              ))}
            </div>

            <button
              onClick={() => dispatch({ type: "TAMPERING_OPEN_SHORTLIST" })}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <span>Shortlist: {state.tampering.shortlistPlayerIds.length}</span>
              <span className="opacity-70">›</span>
            </button>
          </div>

          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players..." className="rounded-2xl bg-white/5 border-white/10" />
            </div>
            <Button variant="secondary" className="rounded-2xl" onClick={() => dispatch({ type: "TAMPERING_AUTO_SHORTLIST", payload: { tab } })}>
              Auto-Shortlist
            </Button>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div>Cap Space: {moneyShort(state.finances.capSpace)} · Cash: {moneyShort(state.finances.cash)}</div>
            <div className="flex items-center gap-2">
              <span>Hide uninterested</span>
              <Switch checked={!showAll} onCheckedChange={(v) => setShowAll(!v)} />
              {capIllegal ? <span className="text-red-300">Cap Illegal</span> : <span>OK</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-3">
        <ScrollArea className="h-[calc(100vh-250px)] pr-2">
          <div className="space-y-3">
            {list.map((p) => {
              const inShort = shortListIds.has(p.id);
              const interestTier = p.interest >= 0.8 ? "High" : p.interest >= 0.6 ? "Med" : p.interest >= 0.45 ? "Low" : "None";
              const interestBadge =
                interestTier === "High"
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                  : interestTier === "Med"
                    ? "bg-sky-500/15 text-sky-300 border-sky-500/25"
                    : interestTier === "Low"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/25"
                      : "bg-white/5 text-muted-foreground border-white/10";

              return (
                <Card key={p.id} className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                        {p.portraitUrl ? <img src={p.portraitUrl} alt={p.name} className="h-full w-full object-cover" /> : <div className="text-xs text-muted-foreground">IMG</div>}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold truncate text-base">
                              <button onClick={() => navigate(`/hub/player/${p.id}`)} className="hover:underline text-left">
                                {p.name}
                              </button>
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {p.age} | {getPositionLabel(normalizePos(p.pos))} · Market {moneyShort(p.market)}/yr
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`rounded-xl border ${interestBadge}`}>
                              Interest {pct(p.interest)}
                            </Badge>
                            <Badge variant="outline" className="rounded-xl border-white/15 bg-white/5">
                              {p.ovr}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {inShort ? <Badge className="rounded-xl" variant="secondary">Shortlisted</Badge> : <Badge className="rounded-xl" variant="outline">Not Shortlisted</Badge>}
                            {p.hasSoft ? <Badge className="rounded-xl" variant="outline">Soft Offer</Badge> : null}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              className="rounded-xl"
                              onClick={() => dispatch({ type: inShort ? "TAMPERING_REMOVE_SHORTLIST" : "TAMPERING_ADD_SHORTLIST", payload: { playerId: p.id } })}
                            >
                              {inShort ? "Remove" : "Shortlist"}
                            </Button>
                            <Button
                              onClick={() => dispatch({ type: "TAMPERING_OPEN_PLAYER", payload: { playerId: p.id } })}
                              className="rounded-xl px-4 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
                            >
                              {p.hasSoft ? "Edit Offer" : "Soft Offer"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={ui.mode === "PLAYER"} onOpenChange={(open) => !open && dispatch({ type: "TAMPERING_CLOSE_MODAL" })}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              <button className="hover:underline" onClick={() => activePlayerId && navigate(`/hub/player/${activePlayerId}`)}>
                Soft Offer (No Signing Yet)
              </button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              {state.tampering.interestByPlayerId[activePlayerId] != null ? (
                <Badge variant="outline">Interest {pct(state.tampering.interestByPlayerId[activePlayerId] ?? 0)}</Badge>
              ) : null}
              {capIllegal ? <Badge variant="destructive">Cap Illegal</Badge> : <Badge variant="outline">OK</Badge>}
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-4 space-y-3">
                <div className="font-semibold">Terms</div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">Years</div>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={offers?.years ?? years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">AAV</div>
                    <Input
                      type="number"
                      step={50000}
                      min={750000}
                      value={offers?.aav ?? aav}
                      onChange={(e) => setAav(Number(e.target.value))}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="rounded-xl flex-1 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
                    onClick={() =>
                      activePlayerId &&
                      dispatch({
                        type: "TAMPERING_SET_SOFT_OFFER",
                        payload: { playerId: activePlayerId, years: Math.max(1, Math.min(5, Math.round(years))), aav: Math.max(750_000, Math.round(aav / 50_000) * 50_000) },
                      })
                    }
                  >
                    Save Soft Offer
                  </Button>
                  {offers ? (
                    <Button variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "TAMPERING_CLEAR_SOFT_OFFER", payload: { playerId: activePlayerId } })}>
                      Clear
                    </Button>
                  ) : null}
                </div>

                <div className="text-xs text-muted-foreground">
                  Soft offers convert into official offers automatically when Free Agency opens.
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={ui.mode === "SHORTLIST"} onOpenChange={(open) => !open && dispatch({ type: "TAMPERING_CLOSE_MODAL" })}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Shortlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {state.tampering.shortlistPlayerIds.length === 0 ? (
              <div className="text-sm text-muted-foreground">No players shortlisted.</div>
            ) : (
              state.tampering.shortlistPlayerIds.map((id) => (
                <div key={id} className="rounded-xl border p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{state.tampering.nameByPlayerId[id] ?? "Unknown Player"}</div>
                    <div className="text-xs text-muted-foreground">
                      Interest {pct(state.tampering.interestByPlayerId[id] ?? 0)} · Soft {state.tampering.softOffersByPlayerId[id] ? "Yes" : "No"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "TAMPERING_OPEN_PLAYER", payload: { playerId: id } })}>
                      Offer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => dispatch({ type: "TAMPERING_REMOVE_SHORTLIST", payload: { playerId: id } })}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
