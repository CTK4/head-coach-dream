import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getEffectiveFreeAgents, normalizePos, getEffectivePlayer } from "@/engine/rosterOverlay";

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

function capBlock(capSpace: number) {
  return (
    <div className="mt-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-200">
      Cap Illegal: {moneyShort(capSpace)}. You must get under the cap to submit/accept offers.
    </div>
  );
}

export default function FreeAgency() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const [tab, setTab] = useState<PosTab>("ALL");
  const [q, setQ] = useState("");
  const [years, setYears] = useState(2);
  const [aav, setAav] = useState(8_000_000);

  const teamId = state.acceptedOffer?.teamId;
  const week = state.hub.regularSeasonWeek ?? 1;

  const ui = state.freeAgency.ui;
  const activePlayerId = ui.mode === "PLAYER" ? ui.playerId : "";
  const offersByPlayerId = state.freeAgency.offersByPlayerId;

  const offers = activePlayerId ? offersByPlayerId[activePlayerId] ?? [] : [];
  const anyPending = offers.some((o) => o.status === "PENDING");
  const pendingUser = offers.find((o) => o.isUser && o.status === "PENDING");
  const accepted = offers.find((o) => o.status === "ACCEPTED");
  const capIllegal = state.finances.capSpace < 0;

  const totalOffers = useMemo(() => {
    let n = 0;
    for (const v of Object.values(offersByPlayerId)) n += v.filter((o) => o.isUser && o.status !== "WITHDRAWN").length;
    return n;
  }, [offersByPlayerId]);

  const list = useMemo(() => {
    return getEffectiveFreeAgents(state)
      .map((p: any) => ({
        id: String(p.playerId),
        name: String(p.fullName),
        pos: String(p.pos ?? "UNK").toUpperCase(),
        age: Number(p.age ?? 0),
        ovr: Number(p.overall ?? 0),
        portraitUrl: String(p.portraitUrl ?? ""),
      }))
      .filter((p) => tabMatch(tab, p.pos))
      .filter((p) => (q.trim() ? p.name.toLowerCase().includes(q.trim().toLowerCase()) : true))
      .sort((a, b) => b.ovr - a.ovr)
      .slice(0, 140);
  }, [state, tab, q]);

  if (!teamId) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-black/30">
      <div className="sticky top-0 z-20 bg-background/70 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button size="icon" variant="ghost" className="rounded-2xl">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Button>

          <div className="text-lg font-extrabold tracking-widest">FREE AGENCY</div>

          <Button variant="secondary" className="rounded-2xl px-4" onClick={() => dispatch({ type: "FA_OPEN_MY_OFFERS" })}>
            My Offers
          </Button>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm font-semibold overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative pb-2 whitespace-nowrap transition ${
                    tab === t ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                  {tab === t ? <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-emerald-400 rounded-full" /> : null}
                </button>
              ))}
            </div>

            <button
              onClick={() => dispatch({ type: "FA_OPEN_MY_OFFERS" })}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <span>Total Offers: {totalOffers}</span>
              <span className="opacity-70">›</span>
            </button>
          </div>

          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search players..."
                className="pl-10 rounded-2xl bg-white/5 border-white/10"
              />
            </div>
            <Button
              variant="secondary"
              className="rounded-2xl"
              onClick={() => dispatch({ type: "FA_RESOLVE_WEEK", payload: { week } })}
            >
              Advance
            </Button>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div>Cap Space: {moneyShort(state.finances.capSpace)} · Cash: {moneyShort(state.finances.cash)}</div>
            <div>Week {week}</div>
          </div>
          {state.finances.capSpace < 0 ? capBlock(state.finances.capSpace) : null}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-3">
        <ScrollArea className="h-[calc(100vh-250px)] pr-2">
          <div className="space-y-3">
            {list.map((p) => {
              const rowOffers = offersByPlayerId[p.id] ?? [];
              const userOffers = rowOffers.filter((o) => o.isUser && o.status !== "WITHDRAWN");
              const has = userOffers.length > 0;
              const pending = rowOffers.some((o) => o.status === "PENDING");
              const totalUser = userOffers.reduce((a, o) => a + o.aav, 0);

              return (
                <Card
                  key={p.id}
                  className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                        {p.portraitUrl ? (
                          <img src={p.portraitUrl} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-xs text-muted-foreground">IMG</div>
                        )}
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
                              {p.age} | {normalizePos(p.pos)}
                            </div>
                          </div>
                          <Badge variant="outline" className="rounded-xl border-white/15 bg-white/5">
                            {p.ovr}
                          </Badge>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                              {has ? `${userOffers.length} Offer${userOffers.length === 1 ? "" : "s"}` : "No Offer"}
                              <span className="mx-2 opacity-50">|</span>
                              {has ? moneyShort(totalUser) : "—"}
                            </div>
                            {pending ? (
                              <Badge className="rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30" variant="outline">
                                Pending
                              </Badge>
                            ) : null}
                          </div>

                          <Button
                            onClick={() => dispatch({ type: "FA_OPEN_PLAYER", payload: { playerId: p.id } })}
                            className="rounded-xl px-4 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
                          >
                            {has ? "View Offers" : "Make Offer"}
                          </Button>
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

      <Dialog open={ui.mode === "PLAYER"} onOpenChange={(open) => !open && dispatch({ type: "FA_CLOSE_MODAL" })}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              <button className="hover:underline" onClick={() => activePlayerId && navigate(`/hub/player/${activePlayerId}`)}>
                Player Offers
              </button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              {accepted ? <Badge variant="secondary">Signed</Badge> : null}
              {anyPending ? <Badge variant="outline">Pending</Badge> : null}
            </div>

            {!accepted ? (
              <Card className="rounded-2xl">
                <CardContent className="p-4 space-y-3">
                  <div className="font-semibold">Make Offer</div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Years</div>
                      <Input type="number" min={1} max={5} value={years} onChange={(e) => setYears(Number(e.target.value))} className="rounded-xl" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">AAV</div>
                      <Input type="number" step={50000} min={750000} value={aav} onChange={(e) => setAav(Number(e.target.value))} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="rounded-xl flex-1 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
                      disabled={capIllegal}
                      onClick={() => activePlayerId && dispatch({ type: "FA_SUBMIT_OFFER", payload: { playerId: activePlayerId, years, aav } })}
                    >
                      Submit Offer
                    </Button>
                    {pendingUser ? (
                      <Button
                        variant="secondary"
                        className="rounded-xl"
                        onClick={() => dispatch({ type: "FA_WITHDRAW_OFFER", payload: { playerId: pendingUser.playerId, offerId: pendingUser.offerId } })}
                      >
                        Withdraw
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="rounded-2xl">
              <CardContent className="p-4 space-y-2">
                <div className="font-semibold">Offer List</div>
                <div className="space-y-2">
                  {offers.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No offers yet.</div>
                  ) : (
                    offers
                      .slice()
                      .sort((a, b) => b.aav - a.aav)
                      .map((o) => (
                        <div key={o.offerId} className="border rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{o.isUser ? "Your Offer" : o.teamId}</div>
                            <div className="text-xs text-muted-foreground">
                              {o.years}y · {moneyShort(o.aav)} · {o.status}
                            </div>
                          </div>
                          {o.status === "PENDING" && !accepted ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
                                disabled={capIllegal}
                                onClick={() => dispatch({ type: "FA_ACCEPT_OFFER", payload: { playerId: o.playerId, offerId: o.offerId } })}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="rounded-xl"
                                onClick={() => dispatch({ type: "FA_REJECT_OFFER", payload: { playerId: o.playerId, offerId: o.offerId } })}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "FA_CLOSE_MODAL" })}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={ui.mode === "MY_OFFERS"} onOpenChange={(open) => !open && dispatch({ type: "FA_CLOSE_MODAL" })}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>My Offers</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {Object.entries(offersByPlayerId)
              .flatMap(([playerId, os]) => os.filter((o) => o.isUser && o.status !== "WITHDRAWN").map((o) => ({ ...o, playerId })))
              .sort((a, b) => b.aav - a.aav)
              .map((o) => {
                const pl: any = getEffectivePlayer(state, o.playerId);
                const nm = String(pl?.fullName ?? o.playerId);
                const pos = normalizePos(String(pl?.pos ?? "UNK"));
                const ovr = Number(pl?.overall ?? 0);
                return (
                  <div key={o.offerId} className="border rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        <button className="hover:underline text-left" onClick={() => navigate(`/hub/player/${o.playerId}`)}>
                          {nm}
                        </button>{" "}
                        <span className="text-muted-foreground">({pos} · {ovr})</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {o.years}y · {moneyShort(o.aav)} · {o.status}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "FA_OPEN_PLAYER", payload: { playerId: o.playerId } })}>
                      View
                    </Button>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
