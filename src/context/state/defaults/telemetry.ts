import type { GameState } from "@/context/GameContext";

export function createInitialTelemetryState(): GameState["telemetry"] {
  return { playLogsByGameKey: {}, percentiles: {}, gameAggsByGameKey: {}, seasonAgg: { version: 1, byTeamId: {}, appliedGameKeys: {} } };
}
