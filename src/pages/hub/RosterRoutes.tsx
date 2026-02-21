import { Navigate, Route, Routes } from "react-router-dom";
import DepthChart from "@/pages/hub/DepthChart";
import InjuryReport from "@/pages/hub/InjuryReport";
import Development from "@/pages/hub/Development";
import PlayerProfile from "@/pages/hub/PlayerProfile";
import RosterAudit from "@/pages/hub/RosterAudit";

export default function RosterRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="depth-chart" replace />} />
      <Route path="depth-chart" element={<DepthChart />} />
      <Route path="injuries" element={<InjuryReport />} />
      <Route path="development" element={<Development />} />
      <Route path="player/:playerId" element={<PlayerProfile />} />
      <Route path="needs" element={<RosterAudit />} />
      <Route path="audit" element={<RosterAudit />} />
      <Route path="*" element={<Navigate to="depth-chart" replace />} />
    </Routes>
  );
}
