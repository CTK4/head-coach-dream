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
import { getPlayers } from "@/data/leagueDb";
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
  const [hideSigned, setHideSigned] = useState(true);
  const [myTeamOnly, setMyTeamOnly] = useState(true);

  const myTeamId = String(state.acceptedOffer?.teamId ?? "");

  useEffect(() => {
    dispatch({ type: "FA_BOOTSTRAP_FROM_TAMPERING" });
    dispatch({ type: "FA_CPU_TICK" });
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

        let topOfferAav = 0;
        let topOfferYears = 0;
        for (const o of pendingOffers) {
          const a = Number(o.aav ?? 0);
          const y = Number(o.years ?? 1);
          if (a > topOfferAav || (a === topOfferAav && y > topOfferYears)) {
            topOfferAav = a;
            topOfferYears = y;
          }
        }

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
          topOfferAav,
          topOfferYears,
        };
      })
      .filter((p) => tabMatch(tab, p.pos))
      .filter((p) => (q.trim() ? p.name.toLowerCase().includes(q.trim().toLowerCase()) : true))
      .filter((p) => showAll || p.interest >= 0.45)
      .filter((p) => !(hideSigned && p.signed));

    all.sort((a, b) => {
      if (biddingWarsFirst) return b.offersCount - a.offersCount || b.ovr - a.ovr || Number(b.pendingUser) - Number(a.pendingUser);
      return b.ovr - a.ovr || b.offersCount - a.offersCount || Number(b.pendingUser) - Number(a.pendingUser);
    });

    return all.slice(0, 180);
  }, [state, tab, q, showAll, biddingWarsFirst, hideSigned]);

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
      return offers.some((o) => o.isUser) || String(state.freeAgency.signingsByPlayerId[pid]?.teamId ?? "") === myTeamId;
    });
  }, [state.freeAgency.activity, state.freeAgency.offersByPlayerId, state.freeAgency.signingsByPlayerId, myTeamOnly, myTeamId]);

  const resolvesLeft = Math.max(0, state.freeAgency.maxResolvesPerPhase - state.freeAgency.resolvesUsedThisPhase);

  const offersForActive = activePlayerId ? state.freeAgency.offersByPlayerId[activePlayerId] ?? [] : [];
  const pending = offersForActive.filter((o) => o.status === "PENDING");
  const counters = offersForActive.filter((o) => o.status === "COUNTERED");
  const pendingUserOffer = offersForActive.find((o) => o.isUser && o.status === "PENDING") ?? null;
  const userTeamId = String(state.acceptedOffer?.teamId ?? "");
  const counterToUser = offersForActive.find((o) => o.status === "COUNTERED" && String(o.teamId) === userTeamId) ?? null;

  const topPendingAav = pending.reduce((m, o) => Math.max(m, Number(o.aav ?? 0)), 0);
  const finalists = pending
    .filter((o) => Number(o.aav ?? 0) >= topPendingAav * 0.9)
    .sort((a, b) => Number(b.aav) - Number(a.aav) || Number(b.years) - Number(a.years))
    .slice(0, 5);

  const bestPendingOffer = useMemo(() => {
    if (!activePlayerId) return null as null | { aav: number; years: number };
    if (!pending.length) return null;
    let best = pending[0];
    for (const o of pending) {
      if (Number(o.aav ?? 0) > Number(best.aav ?? 0)) best = o;
      else if (Number(o.aav ?? 0) === Number(best.aav ?? 0) && Number(o.years ?? 0) > Number(best.years ?? 0)) best = o;
    }
    return { aav: Number(best.aav ?? 0), years: Number(best.years ?? 1) };
  }, [activePlayerId, pending]);

  const pActive: any = activePlayerId ? (getPlayers() as any[]).find((x: any) => String(x.playerId) === String(activePlayerId)) : null;
  const activeMarket = pActive ? projectedMarketApy(String(pActive.pos ?? "UNK"), Number(pActive.overall ?? 0), Number(pActive.age ?? 26)) : 0;
  const yourAav = activeDraft?.aav ?? pendingUserOffer?.aav ?? counterToUser?.aav ?? 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-black/30">
      <div className="sticky top-0 z-20 bg-background/70 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-extrabold tracking-widest">FREE AGENCY</div>
          <div className="flex gap-2">
            <Link to="/hub/trades"><Button variant="secondary" className="rounded-2xl px-4">Trades</Button></Link>
            <Button variant="secondary" className="rounded-2xl px-4" onClick={() => dispatch({ type: "FA_OPEN_MY_OFFERS" })}>My Offers{myOffersCount.total ? <Badge variant="outline" className="ml-2 rounded-xl border-white/15 bg-white/5">{myOffersCount.pending}/{myOffersCount.accepted}</Badge> : null}</Button>
            <Button className="rounded-2xl px-4 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold" disabled={resolvesLeft <= 0} onClick={() => dispatch({ type: "FA_RESOLVE" })}>Resolve ({resolvesLeft}/5)</Button>
            <Button variant="secondary" onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })}>Continue</Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-2">
          <div className="flex items-center gap-4 text-sm font-semibold overflow-x-auto">{TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`relative pb-2 whitespace-nowrap transition ${tab === t ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}>{t}{tab === t ? <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-emerald-400 rounded-full" /> : null}</button>)}</div>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players..." className="rounded-2xl bg-white/5 border-white/10" /></div>
            <div className="flex items-center gap-2 px-3 rounded-2xl border border-white/10 bg-white/5"><span className="text-xs text-muted-foreground">Hide uninterested</span><Switch checked={!showAll} onCheckedChange={(v) => setShowAll(!v)} /></div>
            <div className="flex items-center gap-2 px-3 rounded-2xl border border-white/10 bg-white/5"><span className="text-xs text-muted-foreground">Bidding wars first</span><Switch checked={biddingWarsFirst} onCheckedChange={(v) => setBiddingWarsFirst(!!v)} /></div>
            <div className="flex items-center gap-2 px-3 rounded-2xl border border-white/10 bg-white/5"><span className="text-xs text-muted-foreground">Hide signed</span><Switch checked={hideSigned} onCheckedChange={(v) => setHideSigned(!!v)} /></div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-3">
        <ScrollArea className="h-[calc(100vh-260px)] pr-2"><div className="space-y-3">{list.map((p) => {
          const tier = p.interest >= 0.8 ? "High" : p.interest >= 0.6 ? "Med" : p.interest >= 0.45 ? "Low" : "None";
          const badge = tier === "High" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" : tier === "Med" ? "bg-sky-500/15 text-sky-300 border-sky-500/25" : tier === "Low" ? "bg-amber-500/15 text-amber-300 border-amber-500/25" : "bg-white/5 text-muted-foreground border-white/10";
          return <Card key={p.id} className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"><CardContent className="p-3"><div className="flex items-center gap-3"><div className="h-14 w-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">{p.portraitUrl ? <img src={p.portraitUrl} alt={p.name} className="h-full w-full object-cover" /> : <div className="text-xs text-muted-foreground">IMG</div>}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><div className="font-semibold truncate text-base"><button onClick={() => navigate(`/hub/player/${p.id}`)} className="hover:underline text-left">{p.name}</button></div><div className="mt-0.5 text-xs text-muted-foreground">{p.age} | {normalizePos(p.pos)} · Market {moneyShort(p.market)}/yr{p.offersCount > 0 ? <span className="ml-2">· Top offer {moneyShort(p.topOfferAav)}/yr ({p.topOfferYears}y)</span> : null}</div></div><div className="flex items-center gap-2"><Badge variant="outline" className={`rounded-xl border ${badge}`}>Interest {pct(p.interest)}</Badge>{p.offersCount > 0 ? <Badge variant="outline" className="rounded-xl border-white/15 bg-white/5">Offers {p.offersCount}</Badge> : null}{p.signed ? <Badge variant="outline" className="rounded-xl border-emerald-500/25 bg-emerald-500/10 text-emerald-200">Signed</Badge> : null}<Badge variant="outline" className="rounded-xl border-white/15 bg-white/5">{p.ovr}</Badge></div></div><div className="mt-2 flex items-center justify-between gap-2"><div>{p.pendingUser ? <Badge className="rounded-xl" variant="secondary">Offer Pending</Badge> : null}</div><Button variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "FA_OPEN_PLAYER", payload: { playerId: p.id } })}>{p.pendingUser ? "Edit" : "Offer"}</Button></div></div></div></CardContent></Card>;
        })}</div></ScrollArea>
      </div>

      <Dialog open={ui.mode === "PLAYER"} onOpenChange={(o) => !o && dispatch({ type: "FA_CLOSE_MODAL" })}>
        <DialogContent className="max-w-lg rounded-2xl"><DialogHeader><DialogTitle><button className="hover:underline" onClick={() => activePlayerId && navigate(`/hub/player/${activePlayerId}`)}>Offer</button></DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground"><Badge variant="outline">Market {moneyShort(activeMarket)}/yr</Badge><Badge variant="outline">Top {moneyShort(topPendingAav)}/yr</Badge><Badge variant="outline">Yours {moneyShort(yourAav)}/yr</Badge></div>
            {counterToUser ? <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3"><div className="text-sm font-semibold text-amber-200">Awaiting your response</div><div className="text-xs text-muted-foreground mt-1">Player countered: {counterToUser.years}y · {moneyShort(counterToUser.aav)}/yr</div></div> : null}
            {finalists.length ? <div className="rounded-xl border p-3"><div className="text-sm font-semibold">Finalists</div><div className="mt-2 space-y-2">{finalists.map((o) => <div key={o.offerId} className="flex items-center justify-between gap-2 text-sm"><div className="min-w-0 truncate">{o.teamId}{o.isUser ? " (You)" : ""}</div><div className="text-muted-foreground">{o.years}y · {moneyShort(o.aav)}/yr</div></div>)}</div></div> : null}
            {counters.length ? <div className="rounded-xl border p-3"><div className="text-sm font-semibold">Counters Issued</div><div className="mt-2 space-y-2">{counters.sort((a, b) => Number(b.aav) - Number(a.aav) || Number(b.years) - Number(a.years)).slice(0, 5).map((o) => <div key={o.offerId} className="flex items-center justify-between gap-2 text-sm"><div className="min-w-0 truncate">{o.teamId}{o.isUser ? " (You)" : ""}</div><div className="text-muted-foreground">{o.years}y · {moneyShort(o.aav)}/yr</div></div>)}</div></div> : null}

            {counterToUser ? <div className="rounded-xl border p-3"><div className="text-sm font-semibold">Counteroffer</div><div className="text-xs text-muted-foreground mt-1">{counterToUser.years} yrs @ {moneyShort(counterToUser.aav)}/yr</div><div className="mt-2 flex gap-2 justify-end"><Button variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "FA_RESPOND_COUNTER", payload: { playerId: activePlayerId, accept: false } })}>Decline</Button><Button className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold" onClick={() => dispatch({ type: "FA_RESPOND_COUNTER", payload: { playerId: activePlayerId, accept: true } })}>Accept</Button></div></div> : null}

            <Card className="rounded-2xl"><CardContent className="p-4 space-y-3"><div className="font-semibold">Terms</div>
              <div className="flex gap-2"><div className="flex-1"><div className="text-xs text-muted-foreground mb-1">Years</div><Input type="number" min={1} max={5} value={activeDraft?.years ?? pendingUserOffer?.years ?? 2} onChange={(e) => dispatch({ type: "FA_SET_DRAFT", payload: { playerId: activePlayerId, years: Number(e.target.value), aav: activeDraft?.aav ?? pendingUserOffer?.aav ?? 8_000_000 } })} className="rounded-xl" /></div><div className="flex-1"><div className="text-xs text-muted-foreground mb-1">AAV</div><Input type="number" step={50000} min={750000} value={activeDraft?.aav ?? pendingUserOffer?.aav ?? 8_000_000} onChange={(e) => dispatch({ type: "FA_SET_DRAFT", payload: { playerId: activePlayerId, years: activeDraft?.years ?? pendingUserOffer?.years ?? 2, aav: Number(e.target.value) } })} className="rounded-xl" /></div></div>
              <div className="flex gap-2">
                {activePlayerId ? <Button variant="secondary" className="rounded-xl" disabled={!activePlayerId || !!counterToUser} onClick={() => {
                  const curY = activeDraft?.years ?? pendingUserOffer?.years ?? 2;
                  const curA = activeDraft?.aav ?? pendingUserOffer?.aav ?? 8_000_000;
                  const targetA = Math.max(curA, (bestPendingOffer?.aav ?? 0) + 250_000);
                  const targetY = Math.max(curY, bestPendingOffer?.years ?? 0);
                  dispatch({ type: "FA_SET_DRAFT", payload: { playerId: activePlayerId, years: targetY, aav: targetA } });
                }}>Beat Best +$0.25M</Button> : null}
                <Button className="rounded-xl flex-1 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold" disabled={!state.freeAgency.cpuTickedOnOpen || !!counterToUser} onClick={() => {
                  if (!activePlayerId) return;
                  const y = activeDraft?.years ?? pendingUserOffer?.years ?? 2;
                  const a = activeDraft?.aav ?? pendingUserOffer?.aav ?? 8_000_000;
                  dispatch({ type: pendingUserOffer ? "FA_UPDATE_USER_OFFER" : "FA_SUBMIT_OFFER", payload: pendingUserOffer ? { playerId: activePlayerId, years: y, aav: a } : { playerId: activePlayerId } });
                }}>{pendingUserOffer ? "Update Offer" : "Submit Offer"}</Button>
                {pendingUserOffer ? <Button variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "FA_CLEAR_USER_OFFER", payload: { playerId: activePlayerId } })}>Withdraw</Button> : null}
              </div>
            </CardContent></Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={ui.mode === "MY_OFFERS"} onOpenChange={(o) => !o && dispatch({ type: "FA_CLOSE_MODAL" })}>
        <DialogContent className="max-w-lg rounded-2xl"><DialogHeader><DialogTitle>My Offers</DialogTitle></DialogHeader>
          <div className="flex items-center justify-between gap-2"><div className="text-xs text-muted-foreground">Filter</div><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">My team only</span><Switch checked={myTeamOnly} onCheckedChange={(v) => setMyTeamOnly(!!v)} /></div></div>
          <div className="space-y-2">{filteredActivity.length ? <><div className="text-xs text-muted-foreground">Latest results</div><Separator /><div className="space-y-2">{filteredActivity.slice(0, 18).map((a) => <div key={a.ts} className="text-sm">{a.playerId ? <button className="hover:underline" onClick={() => navigate(`/hub/player/${a.playerId}`)}>{a.text}</button> : a.text}</div>)}</div></> : <div className="text-sm text-muted-foreground">No activity yet. Submit offers, then Resolve.</div>}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
