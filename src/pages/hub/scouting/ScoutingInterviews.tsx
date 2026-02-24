import { useEffect } from "react";
import { useGame } from "@/context/GameContext";

export default function ScoutingInterviews() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
  }, [dispatch, scouting]);

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;
  return (
    <div className="space-y-3 p-4">
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
        <div className="font-semibold">Prospect Interviews</div>
        <div className="mt-1 text-xs text-muted-foreground">Coming soon: spend interview slots to reveal traits + IQ range.</div>
      </div>
      <button
        className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-400"
        disabled
        title="This feature is not implemented yet"
      >
        Start Interview (Coming Soon)
      </button>
      <div className="text-xs opacity-70">Interviews remaining: {scouting.interviews.interviewsRemaining}</div>
    </div>
  );
}
