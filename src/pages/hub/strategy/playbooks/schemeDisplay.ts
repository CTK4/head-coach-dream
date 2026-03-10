import { SCHEME_LABELS } from "@/lib/displayLabels";

export type OffenseSchemeId =
  | "AIR_RAID"
  | "SHANAHAN_WIDE_ZONE"
  | "VERTICAL_PASSING"
  | "PRO_STYLE_BALANCED"
  | "POWER_GAP"
  | "ERHARDT_PERKINS"
  | "RUN_AND_SHOOT"
  | "SPREAD_RPO"
  | "WEST_COAST"
  | "AIR_CORYELL"
  | "MODERN_TRIPLE_OPTION"
  | "CHIP_KELLY_RPO"
  | "TWO_TE_POWER_I"
  | "MOTION_BASED_MISDIRECTION"
  | "POWER_SPREAD";

export type DefenseSchemeId =
  | "THREE_FOUR_TWO_GAP"
  | "FOUR_TWO_FIVE"
  | "SEATTLE_COVER_3"
  | "COVER_SIX"
  | "FANGIO_TWO_HIGH"
  | "TAMPA_2"
  | "MULTIPLE_HYBRID"
  | "CHAOS_FRONT"
  | "PHILLIPS_BASE_THREE_FOUR"
  | "LEBEAU_ZONE_BLITZ_THREE_FOUR"
  | "BEARS_FOUR_SIX"
  | "FOUR_THREE_OVER"
  | "SINGLE_HIGH_COVER_3"
  | "SABAN_COVER_4_MATCH"
  | "RYAN_NICKEL_PRESSURE";

export type SchemeId = OffenseSchemeId | DefenseSchemeId;

export const SCHEME_DISPLAY_NAMES: Record<SchemeId, string> = SCHEME_LABELS as Record<SchemeId, string>;

export function getSchemeDisplayName(schemeId: SchemeId): string {
  return SCHEME_DISPLAY_NAMES[schemeId];
}
