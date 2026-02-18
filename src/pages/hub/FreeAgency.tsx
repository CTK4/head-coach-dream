import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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

export default function FreeAgency() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const [tab, setTab] = useState<PosTab>("ALL");
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [biddingWarsFirst, setBiddingWarsFirst] = useState(true);
  const [myTeamOnly, setMyTeamOnly] = useState(true);

  const myTeamId = String(state.acceptedOffer?.teamId ?? "");

  useEffect(() => {
    dispatch({ type: "FA_BOOTSTRAP_FROM_TAMPERING" });
  }, [dispatch]);

  const ui = state.freeAgency.ui;
  const activePlayerId = ui.mode === "PLAYER" ? ui.playerId : "";
  const activeDraft = activePlayerId ? state.freeAgency.draftByPlayerId[activePlayerId] : null;

  const list = useMemo(() => {
    const all = getEffectiveFreeAgents(state)
      .map((p: any) => {
        const id = String(p.playerId);
        const interest = state.tampering.interestByPlayerId[id] ?? 0;
        const market = projectedMarketApy(String(p.pos ?? "UNK"), Number(p.overall ?? 0), Number(p.age ?? 26));
        const offers = state.freeAgency.offersByPlayerId[id] ?? [];
        const pendingOffers = offers.filter((o) => o.status === "PENDING");
        const pendingUser = pendingOffers.some((o) => o.isUser);
        const signed = !!state.freeAgency.signingsByPlayerId[id];
        return {
          id,
          name: String(p.fullName),
          pos: String(p.pos ?? "UNK").toUpperCase(),
          age: Number(p.age ?? 0),
          ovr: Number(p.overall ?? 0),
          portraitUrl: String(p.portraitUrl ?? ""),
          interest,
          market,
          pendingUser,
          signed,
          offersCount: pendingOffers.length,
        };
      })
      .filter((p) => tabMatch(tab, p.pos))
      .filter((p) => (q.trim() ? p.name.toLowerCase().includes(q.trim().toLowerCase()) : true))
      .filter((p) => showAll || p.interest >= 0.45);

    all.sort((a, b) => {
      if (biddingWarsFirst) return b.offersCount - a.offersCount || b.ovr - a.ovr || Number(b.pendingUser) - Number(a.pendingUser);
      return b.ovr - a.ovr || b.offersCount - a.offersCount || Number(b.pendingUser) - Number(a.pendingUser);
    });

    return all.slice(0, 180);
  }, [state, tab, q, showAll, biddingWarsFirst]);

  const myOffersCount = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    for (const offers of Object.values(state.freeAgency.offersByPlayerId)) {
      for (const o of offers) {
        if (!o.isUser) continue;
        if (o.status === "PENDING") pending++;
        if (o.status === "ACCEPTED") accepted++;
      }
    }
    for (const s of Object.values(state.freeAgency.signingsByPlayerId)) {
      if (String(s.teamId) === myTeamId) accepted++;
    }
    return { pending, accepted, total: pending + accepted };
  }, [state.freeAgency.offersByPlayerId, state.freeAgency.signingsByPlayerId, myTeamId]);

  const filteredActivity = useMemo(() => {
    const a = state.freeAgency.activity ?? [];
    if (!myTeamOnly) return a;

    return a.filter((x) => {
      if (!x.playerId) return false;
      const pid = String(x.playerId);
      const offers = state.freeAgency.offersByPlayerId[pid] ?? [];
      const hadUserOffer = offers.some((o) => o.isUser);
      const signedToUser = String(state.freeAgency.signingsByPlayerId[pid]?.teamId ?? "") === myTeamId;
      return hadUserOffer || signedToUser;
    });
  }, [state.freeAgency.activity, state.freeAgency.offersByPlayerId, state.freeAgency.signingsByPlayerId, myTeamOnly, myTeamId]);

  const resolvesLeft = Math.max(0, state.freeAgency.maxResolvesPerPhase - state.freeAgency.resolvesUsedThisPhase);

  const offersForActive = activePlayerId ? state.freeAgency.offersByPlayerId[activePlayerId] ?? [] : [];
  const pendingUserForActive = offersForActive.some((o) => o.isUser && o.status === "PENDING");

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-black/30">
      <div className="sticky top-0 z-20 bg-background/70 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-extrabold tracking-widest">FREE AGENCY</div>
          <div className="flex gap-2">
            <Link to="/hub/trades">
              <Button variant="secondary" className="rounded-2xl px-4">
                Trades
              </Button>
            </Link>
            <Button variant="secondary" className="rounded-2xl px-4" onClick={() => dispatch({ type: "FA_OPEN_MY_OFFERS" })}>
              My Offers
              {myOffersCount.total ? (
                <Badge variant="outline" className="ml-2 rounded-xl border-white/15 bg-white/5">
                  {myOffersCount.pending}/{myOffersCount.accepted}
                </Badge>
              ) : null}
            </Button>
            <Button
              className="rounded-2xl px-4 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
              disabled={resolvesLeft <= 0}
              onClick={() => dispatch({ type: "FA_RESOLVE_BATCH" })}
              title={resolvesLeft <= 0 ? "No resolves left this phase" : ""}
            >
              Resolve ({resolvesLeft}/5)
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
          </div>

          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players..." className="rounded-2xl bg-white/5 border-white/10" />
            </div>
            <div className="flex items-center gap-2 px-3 rounded-2xl border border-white/10 bg-white/5">
              <span className="text-xs text-muted-foreground">Hide uninterested</span>
              <Switch checked={!showAll} onCheckedChange={(v) => setShowAll(!v)} />
            </div>
            <div className="flex items-center gap-2 px-3 rounded-2xl border border-white/10 bg-white/5">
              <span className="text-xs text-muted-foreground">Bidding wars first</span>
              <Switch checked={biddingWarsFirst} onCheckedChange={(v) => setBiddingWarsFirst(!!v)} />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div>Cap Space: {moneyShort(state.finances.capSpace)} · Cash: {moneyShort(state.finances.cash)}</div>
            <div>Resolves left: {resolvesLeft}/5</div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-3">
        <ScrollArea className="h-[calc(100vh-260px)] pr-2">
          <div className="space-y-3">
            {list.map((p) => {
              const tier = p.interest >= 0.8 ? "High" : p.interest >= 0.6 ? "Med" : p.interest >= 0.45 ? "Low" : "None";
              const badge =
                tier === "High"
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                  : tier === "Med"
                    ? "bg-sky-500/15 text-sky-300 border-sky-500/25"
                    : tier === "Low"
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
                              {p.age} | {normalizePos(p.pos)} · Market {moneyShort(p.market)}/yr
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`rounded-xl border ${badge}`}>
                              Interest {pct(p.interest)}
                            </Badge>
                            {p.offersCount > 0 ? (
                              <Badge variant="outline" className="rounded-xl border-white/15 bg-white/5">
                                Offers {p.offersCount}
                              </Badge>
                            ) : null}
                            <Badge variant="outline" className="rounded-xl border-white/15 bg-white/5">
                              {p.ovr}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {p.pendingUser ? <Badge className="rounded-xl" variant="secondary">Offer Pending</Badge> : null}
                            {p.signed ? <Badge className="rounded-xl" variant="outline">Signed</Badge> : null}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              className="rounded-xl"
                              onClick={() => dispatch({ type: "FA_OPEN_PLAYER", payload: { playerId: p.id } })}
                            >
                              {p.pendingUser ? "Edit" : "Offer"}
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

      <Dialog open={ui.mode === "PLAYER"} onOpenChange={(o) => !o && dispatch({ type: "FA_CLOSE_MODAL" })}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              <button className="hover:underline" onClick={() => activePlayerId && navigate(`/hub/player/${activePlayerId}`)}>
                Offer
              </button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">Cap Space {moneyShort(state.finances.capSpace)}</Badge>
              {pendingUserForActive ? <Badge variant="secondary">Pending</Badge> : <Badge variant="outline">New</Badge>}
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
                      value={activeDraft?.years ?? 2}
                      onChange={(e) => dispatch({ type: "FA_SET_DRAFT", payload: { playerId: activePlayerId, years: Number(e.target.value), aav: activeDraft?.aav ?? 8_000_000 } })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">AAV</div>
                    <Input
                      type="number"
                      step={50000}
                      min={750000}
                      value={activeDraft?.aav ?? 8_000_000}
                      onChange={(e) => dispatch({ type: "FA_SET_DRAFT", payload: { playerId: activePlayerId, years: activeDraft?.years ?? 2, aav: Number(e.target.value) } })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="rounded-xl flex-1 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
                    onClick={() => activePlayerId && dispatch({ type: "FA_SUBMIT_OFFER", payload: { playerId: activePlayerId } })}
                  >
                    Submit Offer
                  </Button>
                  {pendingUserForActive ? (
                    <Button variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "FA_CLEAR_USER_OFFER", payload: { playerId: activePlayerId } })}>
                      Withdraw
                    </Button>
                  ) : null}
                </div>

                <div className="text-xs text-muted-foreground">
                  Press Resolve to process a batch (up to 5 players). You can resolve up to 5 times this phase.
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={ui.mode === "MY_OFFERS"} onOpenChange={(o) => !o && dispatch({ type: "FA_CLOSE_MODAL" })}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>My Offers</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">Filter</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">My team only</span>
              <Switch checked={myTeamOnly} onCheckedChange={(v) => setMyTeamOnly(!!v)} />
            </div>
          </div>

          <div className="space-y-2">
            {filteredActivity.length ? (
              <>
                <div className="text-xs text-muted-foreground">Latest results</div>
                <Separator />
                <div className="space-y-2">
                  {filteredActivity.slice(0, 18).map((a) => (
                    <div key={a.ts} className="text-sm">
                      {a.playerId ? (
                        <button className="hover:underline" onClick={() => navigate(`/hub/player/${a.playerId}`)}>
                          {a.text}
                        </button>
                      ) : (
                        a.text
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No activity yet. Submit offers, then Resolve.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
