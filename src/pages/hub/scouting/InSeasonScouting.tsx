import { useGame } from "@/context/GameContext";

export default function InSeasonScouting() {
  const { state } = useGame();
  const locked = state.careerStage !== "REGULAR_SEASON";

  return (
    <div className="space-y-3 p-4">
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm opacity-80">
        {locked ? "Available once the regular season begins." : "Weekly film updates + regional focus are active."}
      </div>
    </div>
  );
}
