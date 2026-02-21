import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { useDesignTokens } from "@/design/useDesignTokens";

export function AppShell() {
  const style = useDesignTokens();

  return (
    <div style={style} className="flex min-h-screen flex-col bg-surface-background text-slate-100">
      <div className="flex-1 pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
