import { useMemo, type CSSProperties } from "react";
import { useGame } from "@/context/GameContext";
import { semantic } from "./semantic";
import { phaseTheme, type HubPhase } from "./phases";

function phaseFromState(careerStage?: string, week?: number): HubPhase {
  switch (careerStage) {
    case "ASSISTANT_HIRING":
    case "STAFF_CONSTRUCTION":
      return "STAFF";
    case "FREE_AGENCY":
      return "FREE_AGENCY";
    case "PRE_DRAFT":
      return "PRE_DRAFT";
    case "DRAFT":
      return "DRAFT";
    case "REGULAR_SEASON":
      return week != null ? "GAME_WEEK" : "REG_SEASON";
    default:
      return "REG_SEASON";
  }
}

export function useDesignTokens(): CSSProperties {
  const { state } = useGame();

  return useMemo(() => {
    const phase = phaseFromState(state.careerStage, state.week);
    const accent = phaseTheme[phase].accent;

    return {
      ["--accent-color" as any]: accent,
      ["--surface-bg" as any]: semantic.surface.background,
      ["--surface-panel" as any]: semantic.surface.panel,
      ["--surface-elevated" as any]: semantic.surface.elevated,
      ["--text-primary" as any]: semantic.text.primary,
      ["--text-secondary" as any]: semantic.text.secondary,
      ["--text-muted" as any]: semantic.text.muted,
      ["--border-subtle" as any]: semantic.border.subtle,
      ["--border-strong" as any]: semantic.border.strong,
    };
  }, [state.careerStage, state.week]);
}
