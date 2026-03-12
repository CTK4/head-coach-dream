import { useMemo, useState } from "react";
import { ExplainerDrawer } from "@/components/explainability/ExplainerDrawer";
import { MODEL_CARDS } from "@/components/explainability/modelCards";
import { useGame } from "@/context/GameContext";
import { getEffectiveFreeAgents } from "@/engine/rosterOverlay";
import { ContractMarketInfoTrigger } from "@/components/explainability/ContractMarketInfoTrigger";

export function selectFreeAgencyPool(state: any) {
  const ids = new Set((state.freeAgency.boardPlayerIds ?? []).map((id: string) => String(id)));
  const players = getEffectiveFreeAgents(state).filter((p: any) => ids.size === 0 || ids.has(String(p.playerId)));
  return players.map((p: any) => {
    const market = state.freeAgency.marketApyByPlayerId?.[String(p.playerId)] ?? { years: 2, apy: 1_000_000 };
    return {
      id: String(p.playerId),
      name: String(p.fullName),
      pos: String(p.pos ?? "UNK").toUpperCase(),
      age: Number(p.age ?? 0),
      ovr: Number(p.overall ?? 0),
      market,
    };
  });
}

export default function FreeAgency() {
  const { state, dispatch } = useGame();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const faModelCard = MODEL_CARDS["fa-market"];

  const pool = useMemo(() => selectFreeAgencyPool(state).sort((a, b) => b.ovr - a.ovr), [state]);
  const pendingUserOffers = Object.values(state.freeAgency.offersByPlayerId ?? {}).flat().filter((offer: any) => offer.isUser && offer.status === "PENDING").length;

  const selectedPlayer = pool.find((p) => p.id === selectedPlayerId) ?? null;
  const selectedOffers = selectedPlayerId ? state.freeAgency.offersByPlayerId[selectedPlayerId] ?? [] : [];
  const selectedDraft = selectedPlayerId ? state.freeAgency.draftByPlayerId[selectedPlayerId] : undefined;

  const openDraft = (playerId: string) => {
    dispatch({ type: "FA_CREATE_DRAFT", payload: { playerId } });
    setSelectedPlayerId(playerId);
  };

  const updateDraft = (field: "years" | "apy", value: number) => {
    if (!selectedPlayerId) return;
    dispatch({ type: "FA_UPDATE_DRAFT", payload: { playerId: selectedPlayerId, patch: { [field]: value } } });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">FREE AGENCY</h1>
          <ExplainerDrawer
            title={faModelCard.title}
            description={faModelCard.description}
            factors={faModelCard.factors}
            example={faModelCard.example}
            trigger={<button className="rounded border px-2 py-0.5 text-sm" type="button">ⓘ</button>}
            triggerAriaLabel="Open free-agency market model explainer"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>Cap Space: ${Math.round(Number(state.finances.capSpace ?? 0) / 1_000_000)}M</span>
          <span>Pending Offers: {pendingUserOffers}</span>
          <button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: "FA_ADVANCE_MARKET" })} disabled={state.freeAgency.initStatus !== "ready"}>Advance Market</button>
          <button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: "FA_COMPLETE_PHASE" })}>Complete Free Agency</button>
        </div>
      </div>

      {state.freeAgency.error ? <div className="rounded border border-rose-700/70 bg-rose-950/40 p-2 text-xs text-rose-200">{state.freeAgency.error}</div> : null}
      {state.freeAgency.initStatus !== "ready" ? <div className="rounded border border-slate-700/70 bg-slate-900/50 p-3 text-sm text-slate-300">Market status: {state.freeAgency.status ?? state.freeAgency.initStatus ?? "idle"}</div> : null}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <div className="space-y-2">
          {pool.length === 0 ? <div className="rounded border border-slate-700/70 bg-slate-900/50 p-3 text-sm text-slate-300">No free agents available.</div> : null}
          {pool.map((p) => {
            const signing = state.freeAgency.signingsByPlayerId[p.id];
            return (
              <div key={p.id} className="border rounded p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.name} {signing ? "(SIGNED)" : ""}</div>
                  <div className="text-xs opacity-70">{p.pos} · Age {p.age} · OVR {p.ovr}</div>
                  <div className="text-xs opacity-70">Projected: {p.market.years}y / ${Math.round(p.market.apy / 1_000_000)}M APY</div>
                </div>
                <button className="px-2 py-1 border rounded" onClick={() => openDraft(p.id)} disabled={!!signing}>Offer</button>
              </div>
            );
          })}
        </div>

        <div className="border rounded border-slate-300/15 bg-slate-900/60 p-3 space-y-2 h-fit text-slate-100">
          <div className="flex items-center gap-1">
            <h2 className="font-semibold">Offer Drawer</h2>
            <ContractMarketInfoTrigger className="h-5 w-5 text-muted-foreground" />
          </div>
          {!selectedPlayer ? <div className="text-sm opacity-70">Select a player to create/edit an offer.</div> : (
            <>
              <div className="text-sm">{selectedPlayer.name} ({selectedPlayer.pos})</div>
              <label className="text-xs block">Years
                <input className="w-full border border-slate-500/60 bg-slate-950 text-slate-100 rounded px-2 py-1" type="number" value={Number(selectedDraft?.years ?? selectedPlayer.market.years)} onChange={(e) => updateDraft("years", Number(e.target.value))} />
              </label>
              <label className="text-xs block">APY
                <input className="w-full border border-slate-500/60 bg-slate-950 text-slate-100 rounded px-2 py-1" type="number" value={Number(selectedDraft?.aav ?? selectedPlayer.market.apy)} onChange={(e) => updateDraft("apy", Number(e.target.value))} />
              </label>
              <div className="flex gap-2">
                <button className="px-2 py-1 border rounded border-slate-500/60 bg-slate-800 text-slate-100" onClick={() => dispatch({ type: "FA_SUBMIT_USER_OFFER", payload: { playerId: selectedPlayer.id } })}>Submit</button>
                {selectedOffers.filter((o: any) => o.isUser && o.status === "PENDING").map((o: any) => (
                  <button key={o.offerId} className="px-2 py-1 border rounded border-slate-500/60 bg-slate-800 text-slate-100" onClick={() => dispatch({ type: "FA_WITHDRAW_USER_OFFER", payload: { playerId: selectedPlayer.id, offerId: o.offerId } })}>Withdraw</button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
