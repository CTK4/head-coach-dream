import { useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import FreeAgencyPage from "./FreeAgency";
import ResignPlayers from "./ResignPlayers";
import TradeHub from "./TradeHub";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEffectiveFreeAgents } from "@/engine/rosterOverlay";
import { getPlayers } from "@/data/leagueDb";
import { canAccessFreeAgency, canAccessReSign, canAccessTrades, getHubQuickLinkAvailability } from "@/services/gameProgressionService";

function StepFooter({ stepId, completeLabel }: { stepId: "FREE_AGENCY" | "RESIGNING"; completeLabel: string }) {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const isOffseasonActive = state.phase === "HUB" && Boolean(state.offseason) && state.offseason.stepId === stepId;
  if (!isOffseasonActive) return null;

  const isStepComplete = Boolean(state.offseason?.stepsComplete?.[stepId]);

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-slate-950/90 backdrop-blur p-3">
      <div className="mx-auto flex max-w-5xl items-center justify-end gap-2">
        <Button variant="outline" onClick={() => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId } })} disabled={isStepComplete}>
          {completeLabel}
        </Button>
        <Button
          onClick={() => {
            if (!state.offseason?.stepsComplete?.[stepId]) return;
            dispatch({ type: "OFFSEASON_ADVANCE_STEP" });
            navigate("/offseason", { replace: true });
          }}
          disabled={!isStepComplete}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}

function PhaseLocked({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <ScreenHeader title={title} showBack />
      <div className="p-4 text-sm text-slate-300">{detail}</div>
    </div>
  );
}

function FaTargets() {
  const { state } = useGame();
  const [filter, setFilter] = useState("");
  const mediaRep = Number(state.coach.reputation?.mediaRep ?? 50);
  const playerRespect = Number(state.coach.reputation?.playerRespect ?? 50);
  const archetypeAdj = state.coach.archetypeId?.includes("promoted") ? 4 : 0;

  const rows = useMemo(() => {
    return getEffectiveFreeAgents(state)
      .map((p: any) => {
        const base = 40 + (Number(p.overall ?? 60) - 60) * 0.8;
        const interest = Math.max(0, Math.min(100, Math.round(base + (mediaRep - 50) * 0.15 + (playerRespect - 50) * 0.2 + archetypeAdj)));
        return {
          id: String(p.playerId),
          name: String(p.fullName ?? "Unknown"),
          pos: String(p.pos ?? "UNK"),
          ovr: Number(p.overall ?? 0),
          interest,
        };
      })
      .filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()) || r.pos.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => b.interest - a.interest)
      .slice(0, 80);
  }, [state, filter, mediaRep, playerRespect, archetypeAdj]);

  return (
    <div>
      <ScreenHeader title="MY TARGETS" showBack />
      <div className="p-4 space-y-3">
        <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by name or position" />
        {rows.map((r) => (
          <Card key={r.id} className="border-white/10 bg-slate-900">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-100">{r.name}</div>
                <div className="text-xs text-slate-400">{r.pos} · OVR {r.ovr}</div>
              </div>
              <Badge variant="outline" className={r.interest >= 70 ? "text-emerald-300 border-emerald-500/50" : r.interest >= 45 ? "text-amber-300 border-amber-500/50" : "text-rose-300 border-rose-500/50"}>
                Interest {r.interest}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FaTransactions() {
  const { state } = useGame();
  const players = getPlayers();
  const signingRows = Object.entries(state.freeAgency.signingsByPlayerId ?? {}).map(([playerId, deal]) => {
    const player: any = players.find((p: any) => String(p.playerId) === String(playerId));
    return {
      id: `SIGN_${playerId}`,
      text: `${String(player?.fullName ?? playerId)} signed (${deal.years}y / $${Math.round(deal.aav / 1_000_000)}M AAV)`,
    };
  });
  const txRows = (state.transactions ?? []).map((tx) => ({
    id: tx.id,
    text: `${tx.playerName} ${tx.type === "TRADE" ? `to ${tx.toTeamId}` : tx.type.toLowerCase()} (${tx.season})`,
  }));
  const rows = [...signingRows, ...txRows];

  return (
    <div>
      <ScreenHeader title="FA TRANSACTIONS" showBack />
      <div className="p-4 space-y-2">
        {rows.length === 0 ? <div className="text-sm text-slate-400">No offseason transactions yet.</div> : null}
        {rows.map((r) => (
          <Card key={r.id} className="border-white/10 bg-slate-900">
            <CardContent className="p-3 text-sm text-slate-200">{r.text}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function FreeAgencyRoutes() {
  const { state } = useGame();
  if (!canAccessFreeAgency(state)) return <Navigate to="/hub" replace />;
  return (
    <>
      <Routes>
        <Route index element={<Navigate to="top" replace />} />
        <Route path="top" element={<FreeAgencyPage />} />
        <Route path="targets" element={<FaTargets />} />
        <Route path="transactions" element={<FaTransactions />} />
        <Route path="player/:playerId" element={<FreeAgencyPage />} />
      </Routes>
      <StepFooter stepId="FREE_AGENCY" completeLabel="Complete Free Agency Step" />
    </>
  );
}

export function ReSignRoutes() {
  const { state } = useGame();
  if (!canAccessReSign(state)) return <Navigate to="/hub" replace />;
  return (
    <>
      <Routes>
        <Route index element={<Navigate to="expiring" replace />} />
        <Route path="expiring" element={<ResignPlayers />} />
        <Route path="player/:playerId" element={<ResignPlayers />} />
      </Routes>
      <StepFooter stepId="RESIGNING" completeLabel="Complete Re-Signing Step" />
    </>
  );
}

export function TradesRoutes() {
  const { state } = useGame();
  if (!canAccessTrades(state)) return <Navigate to="/hub" replace />;
  return (
    <Routes>
      <Route index element={<Navigate to="block" replace />} />
      <Route path="block" element={<TradeHub />} />
      <Route path="propose" element={<TradeHub />} />
      <Route path="player/:playerId" element={<TradeHub />} />
      <Route path="offers" element={<TradeHub />} />
    </Routes>
  );
}

export function ProspectProfileScreen() {
  return <PhaseLocked title="PROSPECT PROFILE" detail="Prospect report, combine metrics, and notes." />;
}

export function HubPhaseQuickLinks() {
  const { state } = useGame();
  const { freeAgency: isFreeAgency, trades: isTradeWindow } = getHubQuickLinkAvailability(state);
  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      {isFreeAgency ? <Link to="/free-agency" className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2">Free Agency</Link> : null}
      {state.offseason?.stepId === "RESIGNING" || state.careerStage === "RESIGN" ? <Link to="/re-sign" className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2">Re-Sign</Link> : null}
      {isTradeWindow ? <Link to="/trades" className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2">Trades</Link> : null}
    </div>
  );
}
