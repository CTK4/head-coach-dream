import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { getPersonnelById } from "@/data/leagueDb";
import InjuryModal from "@/components/feedback/InjuryModal";

export default function InjuryAlertController() {
  const { state, dispatch } = useGame();
  const injury = state.pendingInjuryAlert;

  const depth = useMemo(() => {
    if (!injury) return null;
    const injured = getPersonnelById(String(injury.playerId));
    return {
      nextPlayerName: "Next man up",
      nextOverall: Math.max(40, Number((injured as any)?.overall ?? 65) - 8),
      injuredOverall: Number((injured as any)?.overall ?? 65),
      impactLabel: Number((injured as any)?.overall ?? 65) - (Math.max(40, Number((injured as any)?.overall ?? 65) - 8)) >= 10 ? "Significant concern" : "Minimal drop-off",
    };
  }, [injury]);

  if (!injury || !depth) return null;
  const player = getPersonnelById(String(injury.playerId));

  return <InjuryModal injury={injury} player={player as any} depthChartImpact={depth} onDismiss={() => dispatch({ type: "CLEAR_PENDING_INJURY_ALERT" })} />;
}
