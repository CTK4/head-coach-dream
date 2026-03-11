export type DrillInput = {
  forty?: number | null;
  vert?: number | null;
  shuttle?: number | null;
  bench?: number | null;
};

function finite(value: number | null | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function getDrillCompositeScore(input: DrillInput): number {
  const forty = finite(input.forty, 4.9);
  const vert = finite(input.vert, 30);
  const shuttle = finite(input.shuttle, 4.4);
  const bench = finite(input.bench, 18);
  return (5.3 - forty) * 36 + vert * 0.9 + (5.2 - shuttle) * 24 + bench * 0.45;
}
