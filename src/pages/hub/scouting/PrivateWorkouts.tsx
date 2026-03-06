import { useEffect, useMemo } from "react";
import { getDraftClass, useGame } from "@/context/GameContext";

export default function PrivateWorkouts() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
  }, [dispatch, scouting]);

  const prospects = useMemo(
    () =>
      (getDraftClass() as Record<string, unknown>[]).slice(0, 20).map((row, idx) => ({
        id: String(row.id ?? row.prospectId ?? row["Player ID"] ?? `DC_${idx + 1}`),
        name: String(row.name ?? row["Name"] ?? "Unknown Prospect"),
      })),
    [],
  );

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;
  return (
    <div className="space-y-3 p-4">
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
        <div className="font-semibold">Private Workouts</div>
        <div className="mt-1 text-xs text-muted-foreground">Run scripted workouts with deterministic drill grades that can move projection bands.</div>
        <div className="mt-1 text-xs opacity-80">Workouts left: {scouting.visits.privateWorkoutsRemaining}</div>
      </div>
      {prospects.map((prospect) => {
        const result = scouting.workouts.resultsByProspectId?.[prospect.id];
        return (
          <div key={prospect.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-sm">{prospect.name}</span>
              <button
                className="rounded border border-white/20 px-2 py-1 disabled:opacity-40"
                disabled={scouting.visits.privateWorkoutsRemaining <= 0 || scouting.budget.remaining < 4}
                onClick={() => dispatch({ type: "SCOUT_CONDUCT_WORKOUT", payload: { prospectId: prospect.id } })}
              >
                Conduct Workout
              </button>
            </div>
            {result ? (
              <div className="mt-2 space-y-1 text-slate-300">
                <div>Drills: {Object.entries(result.drills).map(([k, v]) => `${k.toUpperCase()} ${v}`).join(" · ")}</div>
                {result.notes.map((note) => <div key={note}>• {note}</div>)}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
