import { foundation as f } from "./foundation";

export const semantic = {
  surface: {
    background: f.color.neutral[900],
    panel: f.color.neutral[800],
    elevated: f.color.neutral[700],
  },
  text: {
    primary: f.color.neutral[0],
    secondary: f.color.neutral[200],
    muted: f.color.neutral[400],
  },
  border: {
    subtle: f.color.neutral[700],
    strong: f.color.neutral[600],
  },
  status: {
    success: f.color.green[500],
    warning: f.color.amber[500],
    danger: f.color.red[500],
    info: f.color.blue[500],
  },
  interactive: {
    primary: f.color.blue[500],
    hover: f.color.blue[600],
    disabled: f.color.neutral[600],
  },
} as const;
