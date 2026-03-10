import type { GameState } from "@/context/GameContext";

export function createInitialMediaState(): GameState["media"] {
  return { storiesByWeek: {} };
}
