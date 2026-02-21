import { Link, Navigate, Route, Routes } from "react-router-dom";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

function StrategyHome() {
  return (
    <div>
      <ScreenHeader title="FRANCHISE STRATEGY" subtitle="Identity + Priorities" />
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button className="rounded-lg bg-slate-700 px-3 py-2">Rebuild</button>
          <button className="rounded-lg border border-white/10 px-3 py-2">Reload</button>
          <button className="rounded-lg border border-white/10 px-3 py-2">Contend</button>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900 p-4 text-sm">Cap allocation sliders and generated action plan.</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link to="identity" className="rounded-lg border border-white/10 bg-slate-900 p-2">Identity</Link>
          <Link to="priorities" className="rounded-lg border border-white/10 bg-slate-900 p-2">Draft/FA Priorities</Link>
        </div>
      </div>
    </div>
  );
}

const Pane = ({ title }: { title: string }) => <div><ScreenHeader title={title} /><div className="p-4 text-sm text-slate-300">{title} settings.</div></div>;

export default function StrategyRoutes() {
  return (
    <Routes>
      <Route index element={<StrategyHome />} />
      <Route path="identity" element={<Pane title="TEAM IDENTITY" />} />
      <Route path="focus" element={<Pane title="SHORT VS LONG FOCUS" />} />
      <Route path="scheme" element={<Pane title="SCHEME PHILOSOPHY" />} />
      <Route path="allocation" element={<Pane title="CAP ALLOCATION STRATEGY" />} />
      <Route path="priorities" element={<Pane title="DRAFT / FA PRIORITIES" />} />
      <Route path="*" element={<Navigate to="/strategy" replace />} />
    </Routes>
  );
}
