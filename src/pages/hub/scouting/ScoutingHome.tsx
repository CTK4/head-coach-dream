import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";

const Card = ({ title, desc, to }: { title: string; desc: string; to: string }) => {
  const nav = useNavigate();
  return (
    <button onClick={() => nav(to)} className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10">
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-xs opacity-70">{desc}</div>
    </button>
  );
};

export default function ScoutingHome() {
  const { state } = useGame();
  const off = state.careerStage !== "REGULAR_SEASON";
  return (
    <div className="space-y-3 p-4">
      <div className="text-sm opacity-70">Phase: {state.careerStage}</div>
      <Card title="Big Board" desc="Tiers, ordering, and prospect profiles." to="/hub/scouting/big-board" />
      <Card title="Combine" desc="Day tabs, feed, buzz, recap." to="/hub/scouting/combine" />
      <Card title="Private Workouts" desc="Spend visits for focused clarity gains." to="/hub/scouting/private-workouts" />
      <Card title="Interviews" desc="IQ/Leadership/Stress/Cultural slots." to="/hub/scouting/interviews" />
      <Card title="Medical Board" desc="Clarity-gated medical intel and flags." to="/hub/scouting/medical" />
      <Card title="Allocation" desc="Distribute hours by position group." to="/hub/scouting/allocation" />
      <Card title="In-Season Scouting" desc={off ? "Locked until Week 1" : "Weekly film updates + regional focus"} to="/hub/scouting/in-season" />
    </div>
  );
}
