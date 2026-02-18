import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { routePath } from "@/lib/routes/appRoutes";
import { BottomNav } from "@/lib/ui/BottomNav";

interface HudShellProps {
  title: string;
  yearLabel: string;
  status: { record: string; phase: string; capRoom: string; draftPick: string };
  children: ReactNode;
}

export function HudShell({ title, yearLabel, status, children }: HudShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md px-4 pb-24 pt-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
          <div className="flex items-center justify-between">
            <Link
              to={routePath("leagueMenu")}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 bg-slate-900/60"
              aria-label="League menu"
            >
              <span className="text-sm">🏈</span>
            </Link>

            <div className="text-center text-lg font-semibold tracking-[0.25em]">{title.toUpperCase()}</div>

            <Link
              to={routePath("season")}
              className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-yellow-200"
              aria-label="Season"
            >
              {yearLabel}
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-[repeat(4,minmax(0,1fr))_auto] gap-2 rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-xs">
            <div>
              <div className="text-slate-400">RECORD</div>
              <div className="mt-1 text-sm font-semibold">{status.record}</div>
            </div>
            <div>
              <div className="text-slate-400">PHASE</div>
              <div className="mt-1 text-sm font-semibold">{status.phase}</div>
            </div>
            <div>
              <div className="text-slate-400">CAP ROOM</div>
              <div className="mt-1 text-sm font-semibold">{status.capRoom}</div>
            </div>
            <div>
              <div className="text-slate-400">DRAFT PICK</div>
              <div className="mt-1 text-sm font-semibold">{status.draftPick}</div>
            </div>
            <Link
              to={routePath("search")}
              className="grid h-9 w-9 place-items-center self-end rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-4">{children}</div>
      </div>

      <BottomNav />
    </div>
  );
}
