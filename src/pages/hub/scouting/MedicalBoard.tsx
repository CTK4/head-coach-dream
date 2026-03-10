import { useEffect, useMemo } from "react";
import { getDraftClass, useGame } from "@/context/GameContext";

const riskClass: Record<string, string> = {
  GREEN: "text-emerald-300",
  YELLOW: "text-yellow-300",
  ORANGE: "text-orange-300",
  RED: "text-red-300",
  BLACK: "text-red-500",
};

export default function MedicalBoard() {
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
        <div className="font-semibold">Medical</div>
        <div className="mt-1 text-xs text-muted-foreground">Request full medical packets to surface deterministic risk tiers and adjust grades.</div>
        <div className="mt-1 text-xs opacity-80">Cost: 3 budget per request · Budget: {scouting.budget.remaining}</div>
      </div>
      {prospects.map((prospect) => {
        const result = scouting.medical.resultsByProspectId?.[prospect.id];
        return (
          <div key={prospect.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-sm">{prospect.name}</span>
              <button
                className="rounded border border-white/20 px-2 py-1 disabled:opacity-40"
                disabled={scouting.budget.remaining < 3 || Boolean(result)}
                onClick={() => dispatch({ type: "SCOUT_REQUEST_MEDICAL", payload: { prospectId: prospect.id } })}
              >
                {result ? "Medical Requested" : "Request Medical"}
              </button>
            </div>
            {result ? (
              <div className="mt-2">
                <span className={riskClass[result.riskTier] ?? "text-slate-200"}>{result.riskTier}</span> · {result.category}
                {result.notes ? <div className="mt-1 text-slate-300">{result.notes}</div> : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
