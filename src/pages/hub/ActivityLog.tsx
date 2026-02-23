import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";

export default function ActivityLog() {
  const { state } = useGame();
  const [filter, setFilter] = useState("ALL");
  const categories = useMemo(() => ["ALL", ...Array.from(new Set(state.feedbackHistory.map((e) => e.category)))], [state.feedbackHistory]);
  const rows = useMemo(() => state.feedbackHistory.filter((e) => filter === "ALL" || e.category === filter), [state.feedbackHistory, filter]);

  return (
    <div className="p-4 md:p-8 space-y-3">
      <h1 className="text-xl font-bold">Activity Log</h1>
      <div className="flex flex-wrap gap-2">{categories.map((c) => <button key={c} className="px-2 py-1 rounded border text-xs" onClick={() => setFilter(c)}>{c}</button>)}</div>
      <div className="space-y-2">
        {rows.map((e) => (
          <div key={e.id} className="rounded border p-3">
            <div className="text-sm font-semibold">{e.title}</div>
            <div className="text-xs text-muted-foreground">{e.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
