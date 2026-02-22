import { Link, Navigate, Route, Routes } from "react-router-dom";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import CapProjection from "@/pages/hub/CapProjection";
import PlayerContractScreen from "@/pages/hub/PlayerContractScreen";
import DeadMoney from "@/pages/hub/DeadMoney";
import TagCenter from "@/pages/hub/TagCenter";
import CapBaseline from "@/pages/hub/CapBaseline";
import RosterAudit from "@/pages/hub/RosterAudit";
import PlayerContracts from "@/pages/hub/PlayerContracts";

function Summary() {
  return (
    <div>
      <ScreenHeader title="CONTRACTS & CAP" subtitle="Cap Summary" />
      <div className="space-y-3 p-4">
        <Link
          to="/contracts/cap-baseline"
          className="block rounded-xl border border-white/10 bg-slate-900 p-4 text-sm hover:bg-white/5"
        >
          Cap chart + top cap hits
        </Link>
        <Link
          to="/contracts/roster-audit"
          className="block rounded-xl border border-white/10 bg-slate-900 p-4 text-sm hover:bg-white/5"
        >
          Roster audit + cut/restructure workflow
        </Link>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link to="/contracts/players" className="rounded-lg border border-white/10 bg-slate-900 p-3">Player Contracts</Link>
          <Link to="/contracts/dead-money" className="rounded-lg border border-white/10 bg-slate-900 p-3">Dead Money</Link>
          <Link to="/contracts/projection" className="rounded-lg border border-white/10 bg-slate-900 p-3">Projection</Link>
          <Link to="/contracts/tag" className="rounded-lg border border-white/10 bg-slate-900 p-3">Franchise Tag</Link>
        </div>
      </div>
    </div>
  );
}

export default function ContractsRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="summary" replace />} />
      <Route path="summary" element={<Summary />} />
      <Route path="players" element={<PlayerContracts />} />
      <Route path="player/:playerId" element={<PlayerContractScreen />} />
      <Route path="dead-money" element={<DeadMoney />} />
      <Route path="projection" element={<CapProjection />} />
      <Route path="tag" element={<TagCenter />} />
      <Route path="cap-baseline" element={<CapBaseline />} />
      <Route path="roster-audit" element={<RosterAudit />} />
    </Routes>
  );
}
