import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getFreeAgents } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type PosTab = "ALL" | "QB" | "RB" | "WR" | "TE" | "DL" | "EDGE" | "LB" | "CB" | "S" | "K" | "P";
const TABS: PosTab[] = ["ALL", "QB", "RB", "WR", "TE", "DL", "EDGE", "LB", "CB", "S", "K", "P"];

function money(n: number) {
  const m = n / 1_000_000;
  return m >= 10 ? `$${Math.round(m)}M` : `$${Math.round(m * 10) / 10}M`;
}

function tabMatch(tab: PosTab, pos: string) {
  const p = pos.toUpperCase();
  if (tab === "ALL") return true;
  if (tab === "DL") return ["DL", "DT"].includes(p);
  if (tab === "EDGE") return ["EDGE", "DE"].includes(p);
  if (tab === "S") return ["S", "FS", "SS"].includes(p);
  if (tab === "CB") return ["CB", "DB"].includes(p);
  return p === tab;
}

export default function FreeAgency() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [tab, setTab] = useState<PosTab>("ALL");
  const [q, setQ] = useState("");
  const [years, setYears] = useState(2);
  const [aav, setAav] = useState(8_000_000);

  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const offersByPlayerId = state.freeAgency.offersByPlayerId;
  const signings = state.freeAgency.signingsByPlayerId;

  const totalOffers = useMemo(() => {
    let n = 0;
    for (const v of Object.values(offersByPlayerId)) n += v.filter((o) => o.isUser && o.status !== "WITHDRAWN").length;
    return n;
  }, [offersByPlayerId]);

  const list = useMemo(
    () =>
      getFreeAgents()
        .map((p) => ({
          id: String(p.playerId),
          name: String(p.fullName),
          pos: String(p.pos ?? "UNK").toUpperCase(),
          age: Number(p.age ?? 0),
          ovr: Number(p.overall ?? 0),
          portraitUrl: String(p.portraitUrl ?? ""),
        }))
        .filter((p) => !signings[p.id])
        .filter((p) => tabMatch(tab, p.pos))
        .filter((p) => (q.trim() ? p.name.toLowerCase().includes(q.trim().toLowerCase()) : true))
        .sort((a, b) => b.ovr - a.ovr)
        .slice(0, 140),
    [tab, q, signings],
  );

  const ui = state.freeAgency.ui;
  const activePlayerId = ui.mode === "PLAYER" ? ui.playerId : undefined;
  const activeOffers = activePlayerId ? (offersByPlayerId[activePlayerId] ?? []) : [];
  const userOffers = activeOffers.filter((o) => o.isUser && o.status !== "WITHDRAWN");
  const pendingUser = userOffers.find((o) => o.status === "PENDING");
  const accepted = activeOffers.find((o) => o.status === "ACCEPTED");
  const anyPending = activeOffers.some((o) => o.status === "PENDING");
  const week = state.hub.regularSeasonWeek ?? 1;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-black/30">
      <div className="sticky top-0 z-20 bg-background/70 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-extrabold tracking-widest">FREE AGENCY</div>
          <Button variant="secondary" className="rounded-2xl px-4" onClick={() => dispatch({ type: "FA_OPEN_MY_OFFERS" })}>
            My Offers
          </Button>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm font-semibold overflow-x-auto no-scrollbar">
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

            <button onClick={() => dispatch({ type: "FA_OPEN_MY_OFFERS" })} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
              <span>Total Offers: {totalOffers}</span>
              <span className="opacity-70">›</span>
            </button>
          </div>

          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players..." className="rounded-2xl bg-white/5 border-white/10" />
            </div>
            <Button variant="secondary" className="rounded-2xl" onClick={() => dispatch({ type: "FA_RESOLVE_WEEK", payload: { week } })}>
              Advance
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-3">
        <ScrollArea className="h-[calc(100vh-210px)] pr-2">
          <div className="space-y-3">
            {list.map((p) => {
              const offers = offersByPlayerId[p.id] ?? [];
              const user = offers.filter((o) => o.isUser && o.status !== "WITHDRAWN");
              const hasUserOffer = user.length > 0;
              const pending = offers.some((o) => o.status === "PENDING");
              const totalUserAav = user.reduce((a, o) => a + o.aav, 0);

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
                              <button onClick={() => navigate(`/hub/player/${p.id}`)} className="hover:underline text-left">{p.name}</button>
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{p.age} | {p.pos}</div>
                          </div>
                          <Badge variant="outline" className="rounded-xl border-white/15 bg-white/5">{p.ovr}</Badge>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                              {hasUserOffer ? `${user.length} Offer${user.length === 1 ? "" : "s"}` : "No Offer"}
                              <span className="mx-2 opacity-50">|</span>
                              {hasUserOffer ? money(totalUserAav) : "—"}
                            </div>
                            {pending ? <Badge className="rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30" variant="outline">Pending</Badge> : null}
                          </div>

                          <Button onClick={() => dispatch({ type: "FA_OPEN_PLAYER", payload: { playerId: p.id } })} className="rounded-xl px-4 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold">
                            {hasUserOffer ? "View Offers" : "Make Offer"}
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
            <DialogTitle>{activePlayerId ? `Offers: ${activePlayerId}` : "Offers"}</DialogTitle>
          </DialogHeader>
          {!activePlayerId ? null : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline">Week {week}</Badge>
                {accepted ? <Badge variant="secondary">Signed</Badge> : null}
                {anyPending ? <Badge variant="outline">Pending</Badge> : null}
              </div>

              {!accepted ? (
                <Card className="rounded-2xl"><CardContent className="p-4 space-y-3">
                  <div className="font-semibold">Make Offer</div>
                  <div className="flex gap-2">
                    <Input type="number" min={1} max={5} value={years} onChange={(e) => setYears(Number(e.target.value))} className="rounded-xl" />
                    <Input type="number" step={50000} min={750000} value={aav} onChange={(e) => setAav(Number(e.target.value))} className="rounded-xl" />
                  </div>
                  <div className="flex gap-2">
                    <Button className="rounded-xl flex-1 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold" onClick={() => dispatch({ type: "FA_SUBMIT_OFFER", payload: { playerId: activePlayerId, years, aav } })}>Submit Offer</Button>
                    {pendingUser ? <Button variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "FA_WITHDRAW_OFFER", payload: { playerId: activePlayerId, offerId: pendingUser.offerId } })}>Withdraw</Button> : null}
                  </div>
                </CardContent></Card>
              ) : null}

              <Card className="rounded-2xl"><CardContent className="p-4 space-y-2">
                <div className="font-semibold">Offer List</div>
                <div className="space-y-2">
                  {activeOffers.length === 0 ? <div className="text-sm text-muted-foreground">No offers yet.</div> : activeOffers.slice().sort((a, b) => b.aav - a.aav).map((o) => (
                    <div key={o.offerId} className="border rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="text-xs">{o.isUser ? "Your Offer" : o.teamId} · {o.years}y · {money(o.aav)} · {o.status}</div>
                      {o.status === "PENDING" && !accepted ? (
                        <div className="flex gap-2">
                          <Button size="sm" className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold" onClick={() => dispatch({ type: "FA_ACCEPT_OFFER", payload: { playerId: o.playerId, offerId: o.offerId } })}>Accept</Button>
                          <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "FA_REJECT_OFFER", payload: { playerId: o.playerId, offerId: o.offerId } })}>Reject</Button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={ui.mode === "MY_OFFERS"} onOpenChange={(open) => !open && dispatch({ type: "FA_CLOSE_MODAL" })}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader><DialogTitle>My Offers</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {Object.entries(offersByPlayerId)
              .flatMap(([playerId, offers]) => offers.filter((o) => o.isUser && o.status !== "WITHDRAWN").map((o) => ({ ...o, playerId })))
              .sort((a, b) => b.aav - a.aav)
              .map((o) => (
                <div key={o.offerId} className="border rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="text-xs">{o.playerId} · {o.years}y · {money(o.aav)} · {o.status}</div>
                  <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "FA_OPEN_PLAYER", payload: { playerId: o.playerId } })}>View</Button>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
