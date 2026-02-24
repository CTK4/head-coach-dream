import { useEffect } from "react";
import { useGame } from "@/context/GameContext";

const GROUPS = ["QB", "WR", "RB", "TE", "OL", "DL", "EDGE", "LB", "DB"];

export default function ScoutAllocation() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
  }, [dispatch, scouting]);

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;

  const total = scouting.allocation.poolHours;
  const used = Object.values(scouting.allocation.byGroup).reduce((a, b) => a + b, 0);
  const remaining = Math.max(0, total - used);

  return (
    <div className="space-y-3 p-4">
      <div className="sticky top-0 z-10 -mx-4 border-b border-white/10 bg-slate-950/95 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Scout Allocation</div>
            <div className="text-xs opacity-70">Tip: Keep a few hours unassigned for flexibility.</div>
          </div>
          <div className="text-xs opacity-70">Remaining {remaining} / {total}</div>
        </div>
      </div>

      <div className="space-y-2">
        {GROUPS.map((g) => {
          const v = scouting.allocation.byGroup[g] ?? 0;
          const pct = total > 0 ? Math.min(100, Math.round((v / total) * 100)) : 0;

          return (
            <div key={g} className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{g}</div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded border border-white/10 px-3 py-1"
                    onClick={() => dispatch({ type: "SCOUT_ALLOC_ADJ", payload: { group: g, delta: -2 } })}
                  >
                    -
                  </button>
                  <div className="w-10 text-center">{v}</div>
                  <button
                    className="rounded border border-white/10 px-3 py-1"
                    onClick={() => dispatch({ type: "SCOUT_ALLOC_ADJ", payload: { group: g, delta: 2 } })}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded bg-white/10">
                <div className="h-full bg-sky-500/60" style={{ width: `${pct}%` }} />
              </div>

              <div className="text-[11px] opacity-70">{pct}% of combine hours</div>
            </div>
          );
        })}
      </div>

      <div className="text-xs opacity-70">
        Allocation is a pool; Focus Drill spends hours from this pool and attributes the spend to a position group.
      </div>
    </div>
  );
}
