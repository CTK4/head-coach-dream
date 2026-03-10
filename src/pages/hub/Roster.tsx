import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { HubPanel } from "@/components/franchise-hub/HubPanel";
import { HubEmptyState } from "@/components/franchise-hub/states/HubEmptyState";

export default function Roster() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId ?? (state as any).userTeamId ?? (state as any).teamId;

  const canReset = useMemo(() => !!teamId, [teamId]);

  return (
    <HubPanel title="ROSTER">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-300">Manage your lineup and restore best-fit starters.</div>
        {canReset ? (
          <Button variant="secondary" disabled={!canReset} onClick={() => dispatch({ type: "RESET_DEPTH_CHART_BEST" })}>
            Reset to Best
          </Button>
        ) : null}
      </div>
      {!teamId ? <HubEmptyState title="Roster not loaded" description="Assign a team to continue." /> : null}
    </HubPanel>
  );
}
