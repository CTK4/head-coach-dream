import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { labelUserOfferForUi, upcomingUserPickSlots } from "@/engine/draftSim";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Draft() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeGive, setComposeGive] = useState<Record<number, boolean>>({});
  const [composeAskBack, setComposeAskBack] = useState<number | "NONE">("NONE");

  useEffect(() => {
    dispatch({ type: "DRAFT_INIT" });
  }, [dispatch]);

  const available = useMemo(() => state.draft.prospectPool.filter((p) => !state.draft.takenProspectIds[p.prospectId]), [state.draft.prospectPool, state.draft.takenProspectIds]);

  const slot = state.draft.slots[state.draft.cursor];
  const isUserOnClock = !!slot && slot.teamId === state.draft.userTeamId;

  useEffect(() => {
    if (!state.draft.complete && slot && !isUserOnClock) dispatch({ type: "DRAFT_CPU_ADVANCE" });
  }, [dispatch, isUserOnClock, slot, state.draft.complete]);

  const upcoming = useMemo(() => upcomingUserPickSlots(state.draft, 8), [state.draft]);
  const recent = useMemo(() => (state.draft.selections ?? []).slice(-10).reverse(), [state.draft.selections]);

  const userFuturePicks = useMemo(() => {
    return state.draft.slots
      .slice(state.draft.cursor)
      .filter((p) => p.teamId === state.draft.userTeamId)
      .slice(0, 32);
  }, [state.draft.cursor, state.draft.slots, state.draft.userTeamId]);

  const cpuFuturePicks = useMemo(() => {
    if (!slot) return [];
    return state.draft.slots.slice(state.draft.cursor).filter((p) => p.teamId === slot.teamId && p.overall > slot.overall).slice(0, 32);
  }, [slot, state.draft.cursor, state.draft.slots]);

  const submitPick = () => {
    if (!selectedId || !isUserOnClock) return;
    dispatch({ type: "DRAFT_USER_PICK", payload: { prospectId: selectedId } });
    setSelectedId(null);
  };

  const shop = () => dispatch({ type: "DRAFT_SHOP" });

  const openComposer = () => {
    setComposeOpen(true);
    const seed: Record<number, boolean> = {};
    userFuturePicks.slice(0, 2).forEach((p) => {
      seed[p.overall] = true;
    });
    setComposeGive(seed);
    setComposeAskBack(cpuFuturePicks[0]?.overall ?? "NONE");
  };

  const giveCount = Object.values(composeGive).filter(Boolean).length;

  const sendOffer = () => {
    const giveOveralls = Object.entries(composeGive)
      .filter(([, v]) => v)
      .map(([k]) => Number(k))
      .sort((a, b) => a - b);
    if (!giveOveralls.length) return;
    if (giveOveralls.length > 10) return;

    if (!window.confirm("Send this offer?")) return;
    dispatch({
      type: "DRAFT_SEND_TRADE_UP_OFFER",
      payload: { giveOveralls, askBackOverall: composeAskBack === "NONE" ? null : composeAskBack },
    });
    setComposeOpen(false);
  };

  const acceptTrade = (offerId: string) => {
    if (!window.confirm("Accept this trade?")) return;
    dispatch({ type: "DRAFT_ACCEPT_TRADE", payload: { offerId } });
  };

  const declineOffer = (offerId: string) => dispatch({ type: "DRAFT_DECLINE_OFFER", payload: { offerId } });

  const incoming = (state.draft.tradeOffers ?? []).filter((o) => o.source === "INCOMING");
  const outgoing = (state.draft.tradeOffers ?? []).filter((o) => o.source === "OUTGOING");

  const previewOffer = useMemo(() => {
    if (!composeOpen || isUserOnClock || !slot) return null;

    const give = userFuturePicks.filter((p) => !!composeGive[p.overall]).slice(0, 10);
    if (!give.length) return null;

    const receive = [slot];
    if (composeAskBack !== "NONE") {
      const back = cpuFuturePicks.find((p) => p.overall === composeAskBack);
      if (back) receive.push(back);
    }

    return {
      offerId: "__PREVIEW__",
      source: "OUTGOING" as const,
      direction: "UP" as const,
      fromTeamId: slot.teamId,
      toTeamId: state.draft.userTeamId,
      give,
      receive,
      valueGive: 0,
      valueReceive: 0,
      note: "Preview",
    };
  }, [composeOpen, isUserOnClock, slot, userFuturePicks, composeGive, composeAskBack, cpuFuturePicks, state.draft.userTeamId]);

  const previewLabel = useMemo(() => {
    if (!previewOffer) return null;
    const q = labelUserOfferForUi({ offer: previewOffer });
    const chip =
      q.label === "FAIR" ? "bg-green-600/15 text-green-700" : q.label === "CLOSE" ? "bg-amber-600/15 text-amber-700" : "bg-red-600/15 text-red-700";
    const text = q.label === "FAIR" ? "Fair" : q.label === "CLOSE" ? "Close" : "Bad";
    return { text, chip };
  }, [previewOffer]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">UGF Draft · {state.draft.season}</div>
            <div className="text-2xl font-semibold">
              {state.draft.complete ? "Draft Complete" : slot ? `Round ${slot.round} · Pick ${slot.pickInRound} (Overall ${slot.overall})` : "Draft"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isUserOnClock ? "default" : "secondary"}>{state.draft.complete ? "DONE" : isUserOnClock ? "YOU’RE ON THE CLOCK" : "CPU PICKING"}</Badge>
            <Button variant="outline" onClick={() => navigate("/hub")}>Back to Hub</Button>
          </div>
        </div>

        <Card>
          <CardContent className="py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Your upcoming picks</div>
              <Badge variant="secondary">{upcoming.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {upcoming.map((p) => (
                <Badge key={p.overall} variant={p.overall === slot?.overall ? "default" : "secondary"}>R{p.round}P{p.pickInRound} · OVR {p.overall}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2"><div className="flex items-center justify-between gap-2"><CardTitle>Board</CardTitle><Badge variant="secondary">{available.length} available</Badge></div></CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[60vh] pr-3">
                <div className="space-y-2">
                  {available.slice(0, 220).map((p) => (
                    <button key={p.prospectId} className={`w-full text-left rounded-md border px-3 py-2 hover:bg-accent/40 ${selectedId === p.prospectId ? "bg-accent border-accent" : ""}`} onClick={() => setSelectedId(p.prospectId)}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold truncate">{p.name}</span><Badge variant="outline">{getPositionLabel(p.pos)}</Badge><span className="text-xs text-muted-foreground">#{p.rank}</span>{p.tier ? <Badge variant="secondary">{p.tier}</Badge> : null}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{p.college}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">ID {p.prospectId}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-3 flex items-center gap-2">
                <Button onClick={submitPick} disabled={!isUserOnClock || !selectedId}>Submit Pick</Button>
                <Button variant="outline" onClick={shop} disabled={!slot || state.draft.complete}>{isUserOnClock ? "Shop Pick" : "Trade Up?"}</Button>
                {!isUserOnClock && <Button variant="secondary" onClick={openComposer} disabled={!slot || state.draft.complete}>Send Offer</Button>}
              </div>

              {composeOpen && !isUserOnClock && slot && (
                <div className="mt-4 border rounded-md p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Trade Offer Composer</div>
                    <div className="flex items-center gap-2">
                      {previewLabel && <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${previewLabel.chip}`}>{previewLabel.text}</span>}
                      <div className="text-xs text-muted-foreground">{giveCount}/10 selected</div>
                    </div>
                  </div>
                  <div className="space-y-2"><div className="text-xs text-muted-foreground">Picks you give</div><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{userFuturePicks.map((p) => { const checked = !!composeGive[p.overall]; const disable = !checked && giveCount >= 10; return <label key={p.overall} className={`flex items-center gap-2 text-sm ${disable ? "opacity-50" : ""}`}><input type="checkbox" checked={checked} disabled={disable} onChange={(e) => setComposeGive((s) => ({ ...s, [p.overall]: e.target.checked }))} /><span>O{p.overall} (R{p.round}P{p.pickInRound})</span></label>; })}</div></div>
                  <div className="space-y-2"><div className="text-xs text-muted-foreground">Ask for a pick back (optional)</div><select className="w-full border rounded px-2 py-1 text-sm" value={composeAskBack} onChange={(e) => setComposeAskBack(e.target.value === "NONE" ? "NONE" : Number(e.target.value))}><option value="NONE">None</option>{cpuFuturePicks.slice(0, 9).map((p) => <option key={p.overall} value={p.overall}>O{p.overall} (R{p.round}P{p.pickInRound})</option>)}</select></div>
                  <div className="flex items-center gap-2"><Button onClick={sendOffer} disabled={giveCount === 0 || giveCount > 10}>Send</Button><Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button></div>
                  <div className="text-xs text-muted-foreground">
                    Counters expire when the on-clock pick changes.
                  </div>
                </div>
              )}

              {!isUserOnClock && (
                <div className="mt-4 grid gap-2">
                  {incoming.length ? (
                    incoming.map((o) => (
                      <Card key={o.offerId} className="border-dashed"><CardContent className="py-3 flex items-center justify-between gap-3"><div className="min-w-0"><div className="font-semibold text-sm truncate">{o.note}</div><div className="text-xs text-muted-foreground">Receive: {o.receive.map((p) => `O${p.overall}`).join(", ")} · Give: {o.give.map((p) => `O${p.overall}`).join(", ")}</div></div><div className="flex items-center gap-2"><span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-amber-600/15 text-amber-700">Close</span><Button onClick={() => acceptTrade(o.offerId)}>Accept</Button><Button variant="outline" onClick={() => declineOffer(o.offerId)}>Decline</Button></div></CardContent></Card>
                    ))
                  ) : (
                    <Card className="border-dashed"><CardContent className="py-3 flex items-center justify-between gap-3"><div className="min-w-0"><div className="font-semibold text-sm">Incoming Offers</div><div className="text-xs text-muted-foreground">No incoming offers right now.</div></div><Button variant="outline" onClick={() => dispatch({ type: "DRAFT_SHOP" })}>Refresh</Button></CardContent></Card>
                  )}

                  {!!outgoing.length && (
                    <Card className="border-dashed"><CardContent className="py-3"><div className="font-semibold text-sm">Last Sent</div>{outgoing.slice(0, 1).map((o) => { const q = labelUserOfferForUi({ offer: o }); const chip = q.label === "FAIR" ? "bg-green-600/15 text-green-700" : q.label === "CLOSE" ? "bg-amber-600/15 text-amber-700" : "bg-red-600/15 text-red-700"; return <div key={o.offerId} className="mt-2 flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-xs text-muted-foreground">{o.note} · Give: {o.give.map((p) => `O${p.overall}`).join(", ")} · Receive: {o.receive.map((p) => `O${p.overall}`).join(", ")}</div></div><span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${chip}`}>{q.label === "FAIR" ? "Fair" : q.label === "CLOSE" ? "Close" : "Bad"}</span></div>; })}</CardContent></Card>
                  )}
                </div>
              )}

            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><div className="flex items-center justify-between gap-2"><CardTitle>Recent Picks</CardTitle><Badge variant="secondary">{state.draft.selections.length}/224</Badge></div></CardHeader>
            <CardContent className="pt-0"><ScrollArea className="h-[60vh] pr-3"><div className="space-y-2">{recent.map((p) => <div key={`${p.overall}-${p.prospectId}`} className="rounded-md border px-3 py-2"><div className="flex items-center justify-between gap-2"><div className="font-semibold text-sm">{p.overall}. {p.name}</div><Badge variant="secondary">{getPositionLabel(p.pos)}</Badge></div><div className="text-xs text-muted-foreground">R{p.round}P{p.pickInRound} · {p.teamId} · #{p.rank}</div></div>)}{!recent.length && <div className="text-sm text-muted-foreground">No picks yet.</div>}</div></ScrollArea></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
