export type ExpandedPlay = {
  playId: string;
  name: string;
  type: "RUN" | "PASS" | "RPO" | "PA" | "SCREEN";
  family: string;
  diagram: {
    players: Array<{ role: string; x: number; y: number }>;
    paths: Array<{
      role: string;
      points: Array<{ x: number; y: number }>;
      style: "solid" | "dash";
      kind: "route" | "run" | "block";
    }>;
  };
  tags?: string[];
};
