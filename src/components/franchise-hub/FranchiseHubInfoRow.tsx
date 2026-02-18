import { Info } from "lucide-react";
import { getPhaseLabel } from "@/components/franchise-hub/offseasonLabel";
import { hubTheme } from "@/components/franchise-hub/theme";
import type { GameState } from "@/context/GameContext";
import { computeStrengthOfScheduleNFL } from "@/engine/strengthOfSchedule";

type FranchiseHubInfoRowProps = {
  state: GameState;
  capRoomLabel: string;
  pickNumber: number | null;
};

export function FranchiseHubInfoRow({ state, capRoomLabel, pickNumber }: FranchiseHubInfoRowProps) {
  const userTeamId = state.acceptedOffer?.teamId ?? "";
  const standing = userTeamId ? state.league.standings[userTeamId] : undefined;
  const games = (standing?.w ?? 0) + (standing?.l ?? 0);
  const winPct = games > 0 ? (standing?.w ?? 0) / games : 0;
  const sos = userTeamId ? computeStrengthOfScheduleNFL(state.league, userTeamId) : 0.5;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-lg text-slate-100">
        <span className="font-medium">{getPhaseLabel(state)}</span>
        <span>
          Cap Room <span className={hubTheme.goldText}>{capRoomLabel}</span>
        </span>
        <span className="flex items-center gap-2">
          Pick {pickNumber ?? "—"}
          {import.meta.env.DEV ? (
            <span className="group relative inline-flex">
              <button type="button" aria-label="Draft order tiebreak details" className="rounded p-0.5 text-slate-300 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300">
                <Info className="h-4 w-4" />
              </button>
              <span className="pointer-events-none absolute right-0 top-6 z-20 hidden w-72 rounded-md border border-slate-700 bg-slate-900 p-2 text-xs text-slate-100 shadow-lg group-hover:block group-focus-within:block">
                <div>SOS: {sos.toFixed(3)}</div>
                <div>Win%: {winPct.toFixed(3)}</div>
                <div>Tiebreak: win% → SOS → div → conf → common → diff → PF</div>
              </span>
            </span>
          ) : null}
        </span>
      </div>
      <div className={hubTheme.metallicDivider} />
    </div>
  );
}
