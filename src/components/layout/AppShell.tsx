import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="flex-1 pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
