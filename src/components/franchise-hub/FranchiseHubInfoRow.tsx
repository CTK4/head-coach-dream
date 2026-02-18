import { getPhaseLabel } from "@/components/franchise-hub/offseasonLabel";
import { hubTheme } from "@/components/franchise-hub/theme";
import type { GameState } from "@/context/GameContext";

type FranchiseHubInfoRowProps = {
  state: GameState;
  capRoomLabel: string;
  pickNumber: number | null;
};

export function FranchiseHubInfoRow({ state, capRoomLabel, pickNumber }: FranchiseHubInfoRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-lg text-slate-100">
        <span className="font-medium">{getPhaseLabel(state)}</span>
        <span>
          Cap Room <span className={hubTheme.goldText}>{capRoomLabel}</span>
        </span>
        <span>Pick {pickNumber ?? "-"}</span>
      </div>
      <div className={hubTheme.metallicDivider} />
    </div>
  );
}
