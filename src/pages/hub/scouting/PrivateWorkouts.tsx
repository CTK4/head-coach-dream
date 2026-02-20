import { useEffect } from "react";
import { useGame } from "@/context/GameContext";

export default function PrivateWorkouts() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
  }, [dispatch, scouting]);

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;
  return <div className="p-4">Private workouts remaining: {scouting.visits.privateWorkoutsRemaining}</div>;
}
