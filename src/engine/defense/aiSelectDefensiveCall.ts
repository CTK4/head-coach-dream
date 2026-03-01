import type { DefensiveCall } from "@/engine/defense/defensiveCalls";

export function aiSelectDefensiveCall(input: {
  rng: () => number;
  defenseScheme: { baseShell: string; blitzRate: number; manRate: number; front: string };
  situation: { down: number; distance: number; yardLine: number; quarter: number; clockSec: number };
  offenseTendency?: { runRate: number; passRate: number; deepRate: number };
  gameplanBias?: unknown;
}): DefensiveCall {
  const { rng, defenseScheme, situation } = input;
  const longYardage = situation.down >= 3 && situation.distance >= 8;
  const shortYardage = situation.distance <= 2 || situation.yardLine <= 5;

  const pressureBias = Math.min(0.9, Math.max(0.05, defenseScheme.blitzRate / 100 + (longYardage ? 0.12 : shortYardage ? -0.08 : 0)));
  const pressureRoll = rng();
  if (pressureRoll < pressureBias * 0.48) {
    return { kind: "PRESSURE", pressure: "BLITZ", blitzRate: pressureBias > 0.65 ? 2 : 1 };
  }
  if (pressureRoll < pressureBias) {
    return { kind: "PRESSURE", pressure: "SIM", blitzRate: 1 };
  }

  if (shortYardage) {
    return { kind: "RUN_FIT", box: "HEAVY", containEdge: rng() < 0.55 };
  }

  const baseShell = String(defenseScheme.baseShell || "COVER_3").toUpperCase();
  type Shell = "COVER_2" | "COVER_3" | "QUARTERS" | "MAN";
  const shellPool: Shell[] = longYardage
    ? ["QUARTERS", "COVER_2", "COVER_3", "MAN"]
    : ["COVER_3", "COVER_2", "QUARTERS", "MAN"];
  let shell: Shell = shellPool[Math.floor(rng() * shellPool.length)] ?? "COVER_3";

  if (baseShell.includes("2")) shell = longYardage ? "QUARTERS" : "COVER_2";
  else if (baseShell.includes("3")) shell = "COVER_3";
  else if (baseShell.includes("QUART")) shell = "QUARTERS";
  else if (baseShell.includes("MAN")) shell = "MAN";

  const press = shell === "MAN" ? rng() < Math.min(0.75, Math.max(0.2, defenseScheme.manRate / 100)) : false;
  return { kind: "SHELL", shell, press };
}
