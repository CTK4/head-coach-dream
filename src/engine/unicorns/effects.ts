import type { UnicornArchetypeId } from "@/engine/unicorns/types";

export type UnicornEffect = {
  archetypeId: UnicornArchetypeId;
  conditions?: {
    weather?: string[];
    down?: number[];
    distance?: number[];
  };
  modifiers: { stat: string; delta: number }[];
};

export const UNICORN_EFFECTS: UnicornEffect[] = [
  {
    archetypeId: "QB_UNICORN_ARM_POWER",
    modifiers: [
      { stat: "armStrength", delta: 4 },
      { stat: "throwOnMove", delta: 3 },
    ],
  },
  {
    archetypeId: "QB_UNICORN_ARM_POWER",
    conditions: { weather: ["RAIN", "SNOW"] },
    modifiers: [{ stat: "weatherPenaltyMitigation", delta: 0.08 }],
  },
  {
    archetypeId: "EDGE_UNICORN_BURST",
    modifiers: [
      { stat: "passRushBurst", delta: 4 },
      { stat: "passRushBend", delta: 3 },
    ],
  },
  {
    archetypeId: "EDGE_UNICORN_BURST",
    conditions: { down: [3, 4] },
    modifiers: [{ stat: "passRushBurst", delta: 1 }],
  },
  {
    archetypeId: "RB_UNICORN_MYTHIC",
    modifiers: [{ stat: "runBurst", delta: 5 }],
  },
  {
    archetypeId: "RB_UNICORN_TITAN",
    modifiers: [{ stat: "runTruck", delta: 5 }],
  },
];

export type UnicornEffectContext = {
  weather?: string;
  down?: number;
  distance?: number;
};

export function resolveUnicornModifiers(archetypeId: UnicornArchetypeId | undefined, context: UnicornEffectContext): Record<string, number> {
  if (!archetypeId) return {};
  const out: Record<string, number> = {};
  for (const effect of UNICORN_EFFECTS) {
    if (effect.archetypeId !== archetypeId) continue;
    if (effect.conditions?.weather?.length && !effect.conditions.weather.includes(String(context.weather ?? "").toUpperCase())) continue;
    if (effect.conditions?.down?.length && !effect.conditions.down.includes(Number(context.down ?? 0))) continue;
    if (effect.conditions?.distance?.length && !effect.conditions.distance.includes(Number(context.distance ?? 0))) continue;
    for (const modifier of effect.modifiers) {
      out[modifier.stat] = (out[modifier.stat] ?? 0) + modifier.delta;
    }
  }
  return out;
}

export function describeUnicornBoost(modifiers: Record<string, number>): string {
  const labels: Record<string, string> = {
    armStrength: "arm",
    throwOnMove: "throw-on-move",
    weatherPenaltyMitigation: "weather handling",
    passRushBurst: "rush burst",
    passRushBend: "bend",
    runBurst: "burst",
    runTruck: "truck",
  };
  const parts = Object.entries(modifiers)
    .filter(([, delta]) => Number(delta) !== 0)
    .map(([stat, delta]) => `${labels[stat] ?? stat} +${delta}`);
  return parts.join(", ");
}
