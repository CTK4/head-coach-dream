import type { ExpandedPlay } from "@/engine/playbooks/types";

type PlayDiagramProps = {
  diagram: ExpandedPlay["diagram"];
};

const KIND_COLOR: Record<ExpandedPlay["diagram"]["paths"][number]["kind"], string> = {
  route: "#a78bfa",
  run: "#ef4444",
  block: "#64748b",
};

export function PlayDiagram({ diagram }: PlayDiagramProps) {
  return (
    <svg viewBox="0 0 100 100" className="h-32 w-full rounded-md border border-white/10 bg-slate-950/60" aria-label="Play diagram">
      <line x1="0" y1="72" x2="100" y2="72" stroke="#334155" strokeWidth="1" strokeDasharray="4 3" />

      {diagram.players.map((player, index) => (
        <g key={`${player.role}-${index}`}>
          <circle cx={player.x} cy={player.y} r="1.8" fill="#f8fafc" />
          <text x={player.x + 2.2} y={player.y - 1.8} fontSize="3" fill="#cbd5e1">
            {player.role}
          </text>
        </g>
      ))}

      {diagram.paths.map((path, index) => (
        <polyline
          key={`${path.role}-${index}`}
          points={path.points.map((point) => `${point.x},${point.y}`).join(" ")}
          fill="none"
          stroke={KIND_COLOR[path.kind]}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={path.style === "dash" ? "4 3" : undefined}
        />
      ))}
    </svg>
  );
}
