import { resolveInjuries as resolveInjuriesEngine } from "@/engine/injuries";
import { REGULAR_SEASON_WEEKS } from "@/engine/schedule";
import type { GameType } from "@/engine/schedule";
import type { GameAction, GameState, WeekKey } from "@/context/GameContext";
import { deriveWeeklySeed } from "@/engine/determinism/seedDerivation";

export function finalizeWeekController(
  state: GameState,
  context: { season: number; week: number; gameType: GameType; weekKey: WeekKey; seed: number },
  reduce: (state: GameState, action: GameAction) => GameState,
): GameState {
  let out = state;
  const alreadyProcessed = Boolean(out.medical.injuryReportsByWeek[context.weekKey]) && Boolean(out.media.storiesByWeek[context.weekKey]);
  if (!alreadyProcessed) {
    out = resolveInjuriesEngine(out);
    out = reduce(out, { type: "MEDICAL_TICK_RECOVERY", payload: { weekKey: context.weekKey } });
    out = reduce(out, { type: "MEDICAL_GENERATE_WEEKLY_INJURIES", payload: { weekKey: context.weekKey, seed: deriveWeeklySeed(context.seed, context.season, context.week, 202) } });
    out = reduce(out, { type: "MEDIA_GENERATE_WEEKLY_STORIES", payload: { weekKey: context.weekKey, seed: deriveWeeklySeed(context.seed, context.season, context.week, 101) } });
  }

  if (context.gameType === "REGULAR_SEASON" && context.week >= REGULAR_SEASON_WEEKS) {
    if (!out.playoffs) out = reduce(out, { type: "PLAYOFFS_INIT_BRACKET" });
    out = reduce(out, { type: "PLAYOFFS_SIM_CPU_GAMES_FOR_ROUND" });
    if (out.league.phase !== "WILD_CARD") out = { ...out, league: { ...out.league, phase: "WILD_CARD" } };
  }

  return out;
}
