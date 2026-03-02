import { foundation as f } from "./foundation";

export type HubPhase = "STAFF" | "FREE_AGENCY" | "PRE_DRAFT" | "DRAFT" | "REG_SEASON" | "GAME_WEEK" | "GAME_DAY";

export const phaseTheme: Record<HubPhase, { accent: string }> = {
  STAFF: { accent: f.color.blue[500] },
  FREE_AGENCY: { accent: f.color.green[500] },
  PRE_DRAFT: { accent: f.color.amber[500] },
  DRAFT: { accent: f.color.amber[400] },
  REG_SEASON: { accent: f.color.blue[600] },
  GAME_WEEK: { accent: f.color.blue[400] },
  GAME_DAY: { accent: f.color.neutral[0] },
} as const;
