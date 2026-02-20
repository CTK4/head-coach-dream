import { useEffect } from "react";
import { useGame } from "@/context/GameContext";

export default function ScoutingCombine() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
    if (scouting && !scouting.combine.generated) dispatch({ type: "SCOUT_COMBINE_GENERATE" });
  }, [dispatch, scouting]);

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;

  const feed = scouting.combine.feed.filter((f) => f.day === scouting.combine.day).slice(-12).reverse();

  return (
    <div className="space-y-3 p-4">
      <div className="font-semibold">Combine Day {scouting.combine.day}</div>
      <div className="space-y-2">
        {feed.length ? feed.map((i) => <div key={i.id} className="rounded border border-white/10 p-2">{i.text}</div>) : <div className="text-sm opacity-70">No events yet.</div>}
      </div>
    </div>
  );
}
