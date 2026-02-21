import { Routes, Route } from "react-router-dom";
import DepthChart from "./DepthChart"; // Reusing existing DepthChart
import Roster from "./Roster"; // Reusing existing Roster list

export default function RosterRoutes() {
  return (
    <div className="p-4 text-white">
        {/* We might want a header here or in the sub-pages */}
      <Routes>
        <Route path="/" element={<Roster />} />
        <Route path="depth-chart" element={<DepthChart />} />
        <Route path="needs" element={<div>Team Needs</div>} />
        <Route path="injuries" element={<div>Injury Report</div>} />
        <Route path="development" element={<div>Development</div>} />
      </Routes>
    </div>
  );
}
