import { Navigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";

export default function PlayoffBracketPage() {
  const { state } = useGame();
  if (!state.playoffs) return <Navigate to="/hub" replace />;
  return <div className="p-4"><h2 className="text-2xl font-bold">Playoff Bracket</h2></div>;
}
