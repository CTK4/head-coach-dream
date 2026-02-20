import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function ScoutingLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="rounded border border-white/10 px-3 py-1" onClick={() => nav(-1)}>Back</button>
            <div className="font-semibold">Scouting</div>
          </div>
          <div className="text-xs opacity-70">{loc.pathname.replace("/hub/scouting", "") || "/"}</div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
