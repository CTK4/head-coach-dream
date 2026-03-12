import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import { IntelMeters } from "@/components/IntelMeters";
import { ExplainerDrawer } from "@/components/explainability/ExplainerDrawer";
import { MODEL_CARDS } from "@/components/explainability/modelCards";
import { getPositionLabel } from "@/lib/displayLabels";
import { normalizeProspectPosition } from "@/lib/prospectPosition";
import { hashSeed, mulberry32 } from "@/engine/rng";

type DraftTab = "RESULTS" | "POOL" | "MY_PICKS";

function clampDelay(value: number): number {
  if (Number.isNaN(value)) return 800;
  return Math.max(0, Math.min(5000, Math.round(value)));
}

function getDeterministicCpuDelayMs(params: {
  minDelayMs: number;
  maxDelayMs: number;
  saveSeed: number;
  season: number;
  cursor: number;
  slotOverall?: number;
}): number {
  const minDelay = Math.min(params.minDelayMs, params.maxDelayMs);
  const maxDelay = Math.max(params.minDelayMs, params.maxDelayMs);
  const seed = hashSeed("DRAFT_CPU_DELAY", params.saveSeed, params.season, params.cursor, params.slotOverall ?? -1);
  const roll = mulberry32(seed)();
  return Math.floor(roll * (maxDelay - minDelay + 1)) + minDelay;
}

export default function Draft() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<DraftTab>("POOL");
  const [pos, setPos] = useState("ALL");
  const [cpuDelayMinMs, setCpuDelayMinMs] = useState(800);
  const [cpuDelayMaxMs, setCpuDelayMaxMs] = useState(1500);
  const resultsEndRef = useRef<HTMLDivElement | null>(null);

  const sim = state.draft;
  const draftAiCard = MODEL_CARDS["draft-ai"];
  const scouting = state.offseasonData.scouting;
  const draftStepComplete = state.offseason.stepsComplete.DRAFT === true;
  const currentSlot = sim.slots[sim.cursor];
  const onClock = !!currentSlot && currentSlot.teamId === sim.userTeamId;

  useEffect(() => {
    if (!sim.started) dispatch({ type: "DRAFT_INIT" });
  }, [dispatch, sim.started]);

  useEffect(() => {
    if (!sim.started || sim.complete || onClock) return;

    const delay = getDeterministicCpuDelayMs({
      minDelayMs: cpuDelayMinMs,
      maxDelayMs: cpuDelayMaxMs,
      saveSeed: Number(state.saveSeed ?? 1),
      season: Number(state.season ?? 0),
      cursor: sim.cursor,
      slotOverall: currentSlot?.overall,
    });

    const timer = window.setTimeout(() => {
      dispatch({ type: "DRAFT_CPU_ADVANCE" });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    currentSlot?.overall,
    cpuDelayMaxMs,
    cpuDelayMinMs,
    dispatch,
    onClock,
    sim.complete,
    sim.cursor,
    sim.started,
    state.saveSeed,
    state.season,
  ]);

  const available = useMemo(() => {
    let list = sim.prospectPool.filter((p) => !sim.takenProspectIds[p.prospectId]);
    if (pos !== "ALL") list = list.filter((p) => normalizeProspectPosition(p.pos, "DRAFT") === pos);
    return list;
  }, [sim.prospectPool, sim.takenProspectIds, pos]);

  const selectionsByOverall = useMemo(() => {
    const map = new Map<number, (typeof sim.selections)[number]>();
    for (const selection of sim.selections) {
      map.set(selection.overall, selection);
    }
    return map;
  }, [sim.selections]);

  const myOwnedSlots = useMemo(
    () => sim.slots.filter((slot) => slot.teamId === sim.userTeamId),
    [sim.slots, sim.userTeamId],
  );

  const myFutureSlots = useMemo(
    () => myOwnedSlots.filter((slot) => slot.overall >= (currentSlot?.overall ?? Number.MAX_SAFE_INTEGER)),
    [myOwnedSlots, currentSlot?.overall],
  );

  const nextUserSlot = useMemo(
    () => sim.slots.slice(sim.cursor).find((slot) => slot.teamId === sim.userTeamId) ?? null,
    [sim.cursor, sim.slots, sim.userTeamId],
  );

  const nearClock = useMemo(() => {
    if (!currentSlot || !nextUserSlot || onClock) return false;
    return nextUserSlot.overall - currentSlot.overall <= 8;
  }, [currentSlot, nextUserSlot, onClock]);

  const shouldShowTradeOffers = onClock || nearClock;
  const incomingTradeOffers = useMemo(
    () => sim.tradeOffers.filter((offer) => offer.source === "INCOMING"),
    [sim.tradeOffers],
  );

  useEffect(() => {
    if (!sim.started || sim.complete || !currentSlot || !shouldShowTradeOffers) return;
    if (sim.tradeOffersForOverall === currentSlot.overall && incomingTradeOffers.length > 0) return;
    dispatch({ type: "DRAFT_SHOP" });
  }, [currentSlot, dispatch, incomingTradeOffers.length, shouldShowTradeOffers, sim.complete, sim.started, sim.tradeOffersForOverall]);

  const myCompletedPicks = useMemo(
    () => myOwnedSlots.map((slot) => ({ slot, selection: selectionsByOverall.get(slot.overall) })).filter((row) => !!row.selection),
    [myOwnedSlots, selectionsByOverall],
  );

  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sim.selections.length]);

  const submitPick = (prospectId: string) => {
    const slot = sim.slots[sim.cursor];
    const canPick = !!slot && slot.teamId === sim.userTeamId;
    if (!canPick || sim.takenProspectIds[prospectId]) return;
    dispatch({ type: "DRAFT_USER_PICK", payload: { prospectId } });
  };

  const acceptTradeOffer = (offerId: string) => {
    dispatch({ type: "DRAFT_ACCEPT_TRADE", payload: { offerId } });
  };

  const declineTradeOffer = (offerId: string) => {
    dispatch({ type: "DRAFT_DECLINE_OFFER", payload: { offerId } });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">DRAFT</h1>
            <ExplainerDrawer
              title={draftAiCard.title}
              description={draftAiCard.description}
              factors={draftAiCard.factors}
              example={draftAiCard.example}
              triggerAriaLabel="Open Draft AI explainer"
              trigger={
                <button type="button" className="rounded border px-2 py-0.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                  ⓘ
                </button>
              }
            />
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold">{sim.complete ? "Draft complete" : onClock ? "YOU ARE ON THE CLOCK" : "CPU SIMULATING"}</div>
            {currentSlot && !sim.complete && (
              <div className="text-xs text-slate-500">
                Round {currentSlot.round}, Pick {currentSlot.pickInRound} · Overall {currentSlot.overall}
              </div>
            )}
          </div>
        </div>
        <div className="rounded border p-3 space-y-2">
          <div className="text-sm font-medium">CPU Pick Delay (client-side)</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="space-y-1">
              <div className="text-xs text-slate-500">Min (ms)</div>
              <input
                type="number"
                min={0}
                max={5000}
                value={cpuDelayMinMs}
                onChange={(e) => setCpuDelayMinMs(clampDelay(Number(e.target.value)))}
                className="w-full rounded border px-2 py-1"
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs text-slate-500">Max (ms)</div>
              <input
                type="number"
                min={0}
                max={5000}
                value={cpuDelayMaxMs}
                onChange={(e) => setCpuDelayMaxMs(clampDelay(Number(e.target.value)))}
                className="w-full rounded border px-2 py-1"
              />
            </label>
          </div>
          <div className="text-xs text-slate-500">CPU picks wait a deterministic pseudo-random delay between min and max before dispatching advance.</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded border bg-slate-50 p-1">
        {[
          { key: "RESULTS", label: "Draft Results" },
          { key: "POOL", label: "Player Pool" },
          { key: "MY_PICKS", label: "My Picks" },
        ].map((entry) => {
          const active = tab === entry.key;
          return (
            <button
              key={entry.key}
              className={`min-h-11 rounded px-2 text-sm font-medium ${active ? "bg-white border" : "text-slate-600"}`}
              onClick={() => setTab(entry.key as DraftTab)}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      {tab === "POOL" && (
        <section className="space-y-3">
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {["ALL", "QB", "RB", "WR", "TE", "OL", "DT", "EDGE", "LB", "CB", "S"].map((x) => (
                <button key={x} className="min-h-11 rounded-full border px-3 py-1" onClick={() => setPos(x)}>
                  {getPositionLabel(x)}
                </button>
              ))}
            </div>
          </div>
          {available.slice(0, 80).map((p) => {
            const taken = !!sim.takenProspectIds[p.prospectId];
            return (
              <div key={p.prospectId} className="border rounded p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {p.name} ({getPositionLabel(normalizeProspectPosition(p.pos, "DRAFT"))})
                  </div>
                  <IntelMeters intel={scouting.intelByProspectId[p.prospectId]} />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    disabled={!onClock || taken}
                    className="min-h-11 rounded border px-3 py-1 disabled:opacity-50"
                    onClick={() => submitPick(p.prospectId)}
                  >
                    Draft Player
                  </button>
                  <button
                    className="min-h-11 rounded border px-3 py-1"
                    onClick={() =>
                      dispatch({
                        type: "SCOUTING_SPEND",
                        payload: {
                          targetType: "PROSPECT",
                          targetId: p.prospectId,
                          actionType: "FILM_DEEP",
                          prospect: { id: p.prospectId, name: p.name, pos: p.pos, archetype: "Prospect", grade: 70, ras: 50, interview: 50 },
                        },
                      })
                    }
                  >
                    Deep Scout (-5)
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {tab === "RESULTS" && (
        <section className="space-y-2">
          <div className="text-sm text-slate-500">Chronological pick feed</div>
          <div className="max-h-[60vh] overflow-y-auto space-y-2 border rounded p-2">
            {sim.selections.length === 0 && <div className="text-sm text-slate-500">No picks yet.</div>}
            {sim.selections.map((pick) => (
              <div key={`${pick.overall}-${pick.prospectId}`} className="rounded border px-3 py-2">
                <div className="font-semibold text-sm">
                  {pick.overall}. {pick.name} ({getPositionLabel(normalizeProspectPosition(pick.pos, "DRAFT"))})
                </div>
                <div className="text-xs text-slate-500">
                  R{pick.round}P{pick.pickInRound} · Team {pick.teamId} · Rank #{pick.rank}
                </div>
              </div>
            ))}
            <div ref={resultsEndRef} />
          </div>
        </section>
      )}

      {tab === "MY_PICKS" && (
        <section className="space-y-3">
          <div className="rounded border p-3">
            <div className="font-semibold">Upcoming User-Owned Slots</div>
            <div className="text-xs text-slate-500 mb-2">Derived from draft slots currently owned by your team.</div>
            {myFutureSlots.length === 0 && <div className="text-sm text-slate-500">No future picks remaining.</div>}
            <div className="space-y-2">
              {myFutureSlots.map((slot) => (
                <div key={slot.overall} className="rounded border px-3 py-2 text-sm">
                  Round {slot.round} · Pick {slot.pickInRound} · Overall {slot.overall}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border p-3">
            <div className="font-semibold">Completed User-Owned Selections</div>
            <div className="text-xs text-slate-500 mb-2">Derived from slots + completed draft selections.</div>
            {myCompletedPicks.length === 0 && <div className="text-sm text-slate-500">No completed picks yet.</div>}
            <div className="space-y-2">
              {myCompletedPicks.map(({ slot, selection }) => (
                <div key={slot.overall} className="rounded border px-3 py-2 text-sm">
                  O{slot.overall} · {selection?.name} ({getPositionLabel(normalizeProspectPosition(String(selection?.pos ?? "ATH"), "DRAFT"))})
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-dashed p-3">
            <div className="font-semibold">Trade Offers</div>
            {!shouldShowTradeOffers && (
              <div className="text-sm text-slate-500">
                Trade offers unlock when you are on the clock or within 8 picks of your next slot.
              </div>
            )}
            {shouldShowTradeOffers && (
              <div className="space-y-2">
                {incomingTradeOffers.length === 0 && <div className="text-sm text-slate-500">No offers right now.</div>}
                {incomingTradeOffers.map((offer) => (
                  <div key={offer.offerId} className="rounded border p-2 text-sm space-y-2">
                    <div className="font-medium">{offer.note}</div>
                    <div className="text-xs text-slate-500">Receive: {offer.receive.map((slot) => `O${slot.overall}`).join(", ")}</div>
                    <div className="text-xs text-slate-500">Give: {offer.give.map((slot) => `O${slot.overall}`).join(", ")}</div>
                    <div className="flex gap-2">
                      <button className="min-h-11 rounded border px-3 py-1" onClick={() => acceptTradeOffer(offer.offerId)}>
                        Accept
                      </button>
                      <button className="min-h-11 rounded border px-3 py-1" onClick={() => declineTradeOffer(offer.offerId)}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
                <button className="min-h-11 rounded border px-3 py-1 text-sm" onClick={() => dispatch({ type: "DRAFT_SHOP" })}>
                  Refresh Offers
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="sticky bottom-0 rounded border bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="min-h-11 rounded border px-3 py-2 text-sm font-medium disabled:opacity-50"
            disabled={!sim.complete}
            onClick={() => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "DRAFT" } })}
          >
            Complete Step
          </button>
          <button
            type="button"
            className="min-h-11 rounded border bg-card px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={!draftStepComplete}
            onClick={() => dispatch({ type: "OFFSEASON_ADVANCE_STEP" })}
          >
            Next →
          </button>
        </div>
      </section>
    </div>
  );
}
