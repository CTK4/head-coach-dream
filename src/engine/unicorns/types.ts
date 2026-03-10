export type UnicornArchetypeId =
  | "QB_UNICORN_ARM_POWER"
  | "QB_UNICORN_POWER_DUAL"
  | "QB_UNICORN_RAW_SUPERATH"
  | "RB_UNICORN_MYTHIC"
  | "RB_UNICORN_TITAN"
  | "WR_UNICORN_MEGAX"
  | "WR_UNICORN_VERTICAL_ALIEN"
  | "TE_UNICORN_INLINE_DOMINATOR"
  | "DT_UNICORN_DISRUPTOR"
  | "EDGE_UNICORN_BURST"
  | "CB_UNICORN_ERASER"
  | "K_UNICORN_SNIPER";

export interface UnicornDefinition {
  id: UnicornArchetypeId;
  name: string;
  description: string;
  rarity: number;
  requiredTraits: string[];
  statThresholds: { stat: string; value: number; operator: "ge" }[];
  minAge?: number;
  maxAge?: number;
}

export type PlayerUnicorn = {
  archetypeId: UnicornArchetypeId;
  discoveredSeason: number;
  confidence: number;
};
