export const CAP_LIMIT = 255_000_000;

export const SALARY_SCALE = {
  minApy: 750_000,
  depthApy: 2_500_000,
  starterApy: 12_000_000,
  starApy: 28_000_000,
} as const;

export const OFF_SCHEMES = [
  { id: "WEST_COAST", label: "West Coast", emphasis: ["Awareness", "Accuracy", "Route_Running"] },
  { id: "SHANAHAN_WIDE_ZONE", label: "Wide Zone", emphasis: ["Acceleration", "Agility", "Run_Blocking"] },
  { id: "AIR_RAID", label: "Air Raid", emphasis: ["Accuracy", "Release", "Hands"] },
] as const;

export const DEF_SCHEMES = [
  { id: "FOUR_TWO_FIVE", label: "4-2-5", emphasis: ["Speed", "Coverage", "Pursuit"] },
  { id: "THREE_FOUR_TWO_GAP", label: "3-4 Two Gap", emphasis: ["Strength", "Run_Defense", "Shed_Blocks"] },
  { id: "FANGIO_TWO_HIGH", label: "Fangio Two-High", emphasis: ["Zone_Coverage", "Instincts", "Range"] },
] as const;

export type OffSchemeId = (typeof OFF_SCHEMES)[number]["id"];
export type DefSchemeId = (typeof DEF_SCHEMES)[number]["id"];
