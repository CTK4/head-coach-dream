import type { GameState } from "@/context/GameContext";
import { detRand as detRand2 } from "@/engine/scouting/rng";
import type { PrivateWorkoutResult } from "@/engine/scouting/types";

const DRILLS = ["forty", "shuttle", "vert", "bench"];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function conductPrivateWorkout(state: GameState, prospectId: string): PrivateWorkoutResult {
  const scouting = state.scoutingState;
  const truth = scouting?.trueProfiles?.[prospectId];
  const trueOVR = Number(truth?.trueOVR ?? 70);
  const base = clamp(Math.round(trueOVR + (detRand2(state.saveSeed, `workout:${state.season}:${prospectId}:base`) - 0.5) * 10), 45, 99);

  const drills = DRILLS.reduce<Record<string, number>>((acc, drill) => {
    const roll = detRand2(state.saveSeed, `workout:${state.season}:${prospectId}:${drill}`);
    acc[drill] = clamp(Math.round(base + (roll - 0.5) * 16), 40, 99);
    return acc;
  }, {});

  const avg = Math.round(Object.values(drills).reduce((sum, score) => sum + score, 0) / DRILLS.length);
  const notes = [
    avg >= 78 ? "Explosive workout translated on film." : "Workout performance was mixed.",
    drills.forty >= 75 ? "Verified long-speed burst." : "Long-speed remains a projection risk.",
    drills.bench >= 75 ? "Functional strength checked out." : "Play strength requires development.",
  ];

  return { prospectId, drills, notes };
}
