import { Navigate, useParams } from "react-router-dom";
import { useGame } from "@/context/GameContext";

export default function PlayoffGamePage() {
  const { id } = useParams();
  const { state } = useGame();
  if (!state.playoffs) return <Navigate to="/hub" replace />;
  return <div className="p-4">Playoff Game {id}</div>;
}
