import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import FreeAgencyPage from "./FreeAgency";
import ResignPlayers from "./ResignPlayers";
import TradeHub from "./TradeHub";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

function PhaseLocked({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <ScreenHeader title={title} />
      <div className="p-4 text-sm text-slate-300">{detail}</div>
    </div>
  );
}

export function FreeAgencyRoutes() {
  const { state } = useGame();
  if (state.careerStage !== "FREE_AGENCY") return <Navigate to="/hub" replace />;
  return (
    <Routes>
      <Route index element={<Navigate to="top" replace />} />
      <Route path="top" element={<FreeAgencyPage />} />
      <Route path="targets" element={<PhaseLocked title="MY TARGETS" detail="Tracked free-agent targets and offer watchlist." />} />
      <Route path="transactions" element={<PhaseLocked title="FA TRANSACTIONS" detail="League signing activity feed." />} />
      <Route path="player/:playerId" element={<FreeAgencyPage />} />
    </Routes>
  );
}

export function ReSignRoutes() {
  const { state } = useGame();
  if (state.careerStage !== "RESIGN") return <Navigate to="/hub" replace />;
  return (
    <Routes>
      <Route index element={<Navigate to="expiring" replace />} />
      <Route path="expiring" element={<ResignPlayers />} />
      <Route path="player/:playerId" element={<ResignPlayers />} />
    </Routes>
  );
}

export function TradesRoutes() {
  const { state } = useGame();
  if (state.careerStage !== "REGULAR_SEASON") return <Navigate to="/hub" replace />;
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
  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      {state.careerStage === "FREE_AGENCY" ? <Link to="/free-agency" className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2">Free Agency</Link> : null}
      {state.careerStage === "RESIGN" ? <Link to="/re-sign" className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2">Re-Sign</Link> : null}
      {state.careerStage === "REGULAR_SEASON" ? <Link to="/trades" className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2">Trades</Link> : null}
    </div>
  );
}
