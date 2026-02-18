import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";

export default function Roster() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;

  const canReset = useMemo(() => !!teamId, [teamId]);

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xl font-semibold">Roster</div>
        <Button
          variant="secondary"
          disabled={!canReset}
          onClick={() => dispatch({ type: "RESET_DEPTH_CHART_BEST" })}
        >
          Reset to Best
        </Button>
      </div>
    </div>
  );
}
