import { Link, Navigate, Route, Routes } from "react-router-dom";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Avatar } from "@/components/common/Avatar";

function RosterList() {
  const players = ["Jaylen Fox", "Marco Bell", "Trey Owens"];
  return (
    <div>
      <ScreenHeader title="ROSTER" subtitle="Depth Chart" />
      <div className="space-y-2 p-4">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-900 p-1 text-xs">
          <Link to="/roster/depth-chart" className="rounded-lg bg-slate-700 px-2 py-2 text-center">Depth</Link>
          <Link to="/roster/injuries" className="rounded-lg px-2 py-2 text-center text-slate-400">Injuries</Link>
          <Link to="/roster/development" className="rounded-lg px-2 py-2 text-center text-slate-400">Dev</Link>
        </div>
        {players.map((p, i) => (
          <Link key={p} to={`/roster/player/${i + 1}`} className="block rounded-xl border border-white/10 bg-slate-900 p-3">
            <div className="flex items-center gap-3">
              <Avatar entity={{ type: "player", id: String(i + 1), name: p }} size={40} />
              <div>
                <div className="font-semibold">{p}</div>
                <div className="text-xs text-slate-400">QB{i + 1} · OVR {78 + i}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SimplePanel({ title }: { title: string }) {
  return <div><ScreenHeader title={title} /><div className="p-4 text-sm text-slate-300">{title} content</div></div>;
}

export default function RosterRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="depth-chart" replace />} />
      <Route path="depth-chart" element={<RosterList />} />
      <Route path="player/:playerId" element={<SimplePanel title="PLAYER PROFILE" />} />
      <Route path="needs" element={<SimplePanel title="TEAM NEEDS" />} />
      <Route path="injuries" element={<SimplePanel title="INJURY REPORT" />} />
      <Route path="development" element={<SimplePanel title="DEVELOPMENT" />} />
    </Routes>
  );
}
