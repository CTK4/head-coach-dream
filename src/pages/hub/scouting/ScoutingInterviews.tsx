import { useEffect, useMemo } from "react";
import { getDraftClass, useGame } from "@/context/GameContext";

const CATEGORIES = ["CHARACTER", "INTELLIGENCE", "WORK_ETHIC"] as const;

export default function ScoutingInterviews() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
  }, [dispatch, scouting]);

  const prospects = useMemo(
    () =>
      (getDraftClass() as Record<string, unknown>[])
        .slice(0, 20)
        .map((row, idx) => {
          const id = String(row.id ?? row.prospectId ?? row["Player ID"] ?? `DC_${idx + 1}`);
          return {
            id,
            name: String(row.name ?? row["Name"] ?? "Unknown Prospect"),
            pos: String(row.pos ?? row["POS"] ?? "UNK"),
            results: scouting?.interviews.resultsByProspectId?.[id] ?? [],
          };
        }),
    [scouting?.interviews.resultsByProspectId],
  );

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;

  return (
    <div className="space-y-3 p-4">
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
        <div className="font-semibold">Prospect Interviews</div>
        <div className="mt-1 text-xs text-muted-foreground">Run deterministic interviews to reveal work ethic / IQ / character insight.</div>
        <div className="mt-1 text-xs opacity-80">Remaining: {scouting.interviews.interviewsRemaining} · Budget: {scouting.budget.remaining}</div>
      </div>

      {prospects.map((prospect) => (
        <div key={prospect.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-sm font-medium">{prospect.name} <span className="text-xs text-slate-400">({prospect.pos})</span></div>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className="rounded border border-blue-400/40 px-2 py-1 text-xs text-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={scouting.interviews.interviewsRemaining <= 0 || scouting.budget.remaining < 2}
                onClick={() => dispatch({ type: "SCOUT_RUN_INTERVIEW", payload: { prospectId: prospect.id, category } })}
              >
                {category.replace("_", " ")}
              </button>
            ))}
          </div>
          {prospect.results.length ? (
            <div className="mt-2 text-xs text-slate-300">
              Last: {prospect.results[prospect.results.length - 1].category} {prospect.results[prospect.results.length - 1].score}
              {prospect.results[prospect.results.length - 1].reveal ? ` · ${prospect.results[prospect.results.length - 1].reveal}` : ""}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
