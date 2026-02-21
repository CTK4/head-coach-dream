import { ChevronRight } from "lucide-react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

function StaffListPage({ market = false }: { market?: boolean }) {
  const rows = market
    ? ["Alex Mercer", "Jordan Hale", "Casey Quinn"]
    : ["Darren Pike", "Mina Cole", "Evan Ross"];
  return (
    <div className="min-w-0">
      <ScreenHeader title="STAFF" subtitle={market ? "Market" : "Current"} />
      <div className="px-4 py-3">
        <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-900 p-1 text-xs">
          <Link to="/staff/current" className={`rounded-lg px-3 py-2 text-center ${!market ? "bg-slate-700" : "text-slate-400"}`}>Current</Link>
          <Link to="/staff/market" className={`rounded-lg px-3 py-2 text-center ${market ? "bg-slate-700" : "text-slate-400"}`}>Market</Link>
        </div>
        <div className="space-y-2">
          {rows.map((name, idx) => (
            <Link
              key={name}
              to={market ? `/staff/candidate/${idx + 1}` : `/staff/profile/${idx + 1}`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 p-3"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{name}</div>
                <div className="text-xs text-slate-400">Fit {82 + idx}% · ${1.2 + idx * 0.3}M/yr</div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StaffDetail({ candidate = false }: { candidate?: boolean }) {
  return (
    <div>
      <ScreenHeader title={candidate ? "CANDIDATE PROFILE" : "STAFF PROFILE"} />
      <div className="space-y-3 px-4 py-3">
        <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p className="text-sm text-slate-300">Ratings · Traits · Scheme Fit · Contract</p>
        </div>
        <button className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-black">{candidate ? "Offer Contract" : "Extend / Fire"}</button>
      </div>
    </div>
  );
}

function StaffBudget() {
  return <div><ScreenHeader title="STAFF BUDGET" /><div className="p-4 text-sm text-slate-300">Budget overview and role spend.</div></div>;
}

export default function StaffRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="current" replace />} />
      <Route path="current" element={<StaffListPage />} />
      <Route path="market" element={<StaffListPage market />} />
      <Route path="profile/:personId" element={<StaffDetail />} />
      <Route path="candidate/:personId" element={<StaffDetail candidate />} />
      <Route path="budget" element={<StaffBudget />} />
    </Routes>
  );
}
