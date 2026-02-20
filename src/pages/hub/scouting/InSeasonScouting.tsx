import { useGame } from "@/context/GameContext";

export default function InSeasonScouting() {
  const { state, dispatch } = useGame();
  const locked = state.careerStage !== "REGULAR_SEASON";

  return (
    <div className="space-y-3 p-4">
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm opacity-80">{locked ? "Locked until Week 1." : "Weekly film updates + alerts."}</div>
      {locked ? <button className="rounded border border-sky-500 px-3 py-2 text-sky-200" onClick={() => dispatch({ type: "SCOUT_DEV_SIM_WEEK" })}>Simulate Advance Week (dev)</button> : null}
    </div>
  );
}
