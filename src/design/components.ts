import { semantic as s } from "./semantic";
import { foundation as f } from "./foundation";

export const components = {
  hubTile: {
    background: s.surface.panel,
    radius: f.radius.lg,
    elevation: f.elevation.mid,
    padding: f.spacing.lg,
  },
  primaryButton: {
    background: s.interactive.primary,
    textColor: s.text.primary,
    radius: f.radius.md,
    paddingY: f.spacing.md,
    paddingX: f.spacing.xl,
  },
  badge: {
    radius: f.radius.pill,
    paddingX: f.spacing.sm,
    paddingY: f.spacing.xs,
  },
  modal: {
    background: s.surface.elevated,
    elevation: f.elevation.high,
    radius: f.radius.xl,
  },
} as const;
