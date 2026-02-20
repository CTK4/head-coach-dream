import { useEffect } from "react";
import { useGame } from "@/context/GameContext";

export default function ScoutingInterviews() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
  }, [dispatch, scouting]);

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;
  return <div className="p-4">Interviews remaining: {scouting.interviews.interviewsRemaining}</div>;
}
