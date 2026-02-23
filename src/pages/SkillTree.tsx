import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGame } from "@/context/GameContext";
import { getAvailableNodes, unlockPerk } from "@/engine/perkEngine";
import { getSkillTreeNodes, type PerkNode } from "@/data/skillTree";
import { ARCHETYPE_LABELS, safeLabel } from "@/lib/displayLabels";
import { cn } from "@/lib/utils";

type NodeVisualState = "UNLOCKED" | "UNLOCKABLE" | "LOCKED" | "UNAFFORDABLE";

const ARCHETYPE_BRANCH_LABELS: Record<string, string> = {
  oc_promoted: "Offensive Sovereignty",
  dc_promoted: "Defensive Sovereignty",
  stc_promoted: "Special Teams Edge",
  college_hc: "Program Builder",
  assistant_grinder: "Process Mastery",
  young_guru: "Innovation Track",
};

const PATHS = [
  { id: "COMMANDER", label: "The Commander" },
  { id: "ARCHITECT", label: "The Architect" },
  { id: "OPERATOR", label: "The Operator" },
  { id: "ARCHETYPE", label: "Archetype" },
] as const;

const GRID_COLUMNS: Record<(typeof PATHS)[number]["id"], number> = {
  COMMANDER: 1,
  ARCHITECT: 3,
  OPERATOR: 5,
  ARCHETYPE: 7,
};

export default function SkillTree() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const coach = state.coach;
  const perkPoints = coach.perkPoints ?? 0;
  const unlockedSet = useMemo(() => new Set(coach.unlockedPerkIds ?? []), [coach.unlockedPerkIds]);
  const availableIds = useMemo(() => new Set(getAvailableNodes(coach).map((node) => node.id)), [coach]);
  const nodes = useMemo(() => getSkillTreeNodes(coach.archetypeId), [coach.archetypeId]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id ?? null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [connectorLines, setConnectorLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number; strong: boolean }>>([]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;

  useLayoutEffect(() => {
    const computeLines = () => {
      const root = canvasRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const nextLines: Array<{ x1: number; y1: number; x2: number; y2: number; strong: boolean }> = [];

      for (const node of nodes) {
        for (const req of node.requires ?? []) {
          if (req.type !== "PERK") continue;
          const from = nodeRefs.current[req.perkId];
          const to = nodeRefs.current[node.id];
          if (!from || !to) continue;
          const a = from.getBoundingClientRect();
          const b = to.getBoundingClientRect();
          nextLines.push({
            x1: a.left - rect.left + a.width / 2,
            y1: a.top - rect.top + a.height,
            x2: b.left - rect.left + b.width / 2,
            y2: b.top - rect.top,
            strong: unlockedSet.has(req.perkId) && unlockedSet.has(node.id),
          });
        }
      }
      setConnectorLines(nextLines);
    };

    computeLines();
    window.addEventListener("resize", computeLines);
    return () => window.removeEventListener("resize", computeLines);
  }, [nodes, unlockedSet]);

  const getNodeState = (node: PerkNode): NodeVisualState => {
    if (unlockedSet.has(node.id)) return "UNLOCKED";
    const unlockable = availableIds.has(node.id);
    if (unlockable && perkPoints >= node.cost) return "UNLOCKABLE";
    if (unlockable && perkPoints < node.cost) return "UNAFFORDABLE";
    return "LOCKED";
  };

  const requirements = (node: PerkNode) =>
    (node.requires ?? []).map((req) => {
      if (req.type === "PERK") {
        const met = unlockedSet.has(req.perkId);
        const reqNode = nodes.find((n) => n.id === req.perkId);
        return { label: `Requires ${reqNode?.label ?? req.perkId}`, met };
      }
      const met = (coach.tenureYear ?? 1) >= req.minTenureYear;
      return { label: `Requires tenure year ${req.minTenureYear}+`, met };
    });

  const onUnlock = () => {
    if (!selectedNode) return;
    const result = unlockPerk(coach, selectedNode.id);
    if (result.error) {
      setUnlockError(result.error);
      return;
    }
    setUnlockError(null);
    dispatch({ type: "SET_COACH", payload: result.coach });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <header className="mb-4 flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <div className="text-lg font-semibold">{coach.name || "Unnamed Coach"} · {ARCHETYPE_LABELS[coach.archetypeId] ?? safeLabel(coach.archetypeId)}</div>
        </div>
        <h1 className="text-2xl font-bold tracking-wide">Coach Development</h1>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-indigo-400/50 text-indigo-200">⬡ {perkPoints} Points Available</Button>
            </PopoverTrigger>
            <PopoverContent className="bg-slate-900 border-slate-700 text-slate-100 w-72">
              <p className="text-sm font-semibold mb-2">Perk point sources</p>
              {(coach.perkPointLog ?? []).length ? (
                <ul className="space-y-1 text-xs">
                  {(coach.perkPointLog ?? []).map((entry, idx) => <li key={`${entry.source}-${idx}`}>{entry.source} {entry.amount > 0 ? `+${entry.amount}` : entry.amount}</li>)}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">No perk points earned yet.</p>
              )}
            </PopoverContent>
          </Popover>
          <Button variant="secondary" onClick={() => navigate((location.state as any)?.from ?? -1)}>Back</Button>
        </div>
      </header>
      {perkPoints === 0 && state.careerStage === "REGULAR_SEASON" ? <p className="text-xs text-slate-400 mb-2">Earn points via season milestones and events.</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div ref={canvasRef} className="relative rounded-xl border border-slate-800 bg-slate-900/40 p-4 overflow-auto min-h-[70vh]">
          <div className="grid grid-cols-7 gap-4">
            {PATHS.map((path) => (
              <div key={path.id} className="col-span-1 text-center font-semibold text-sm text-slate-300" style={{ gridColumn: GRID_COLUMNS[path.id] }}>
                <div className={cn("rounded-md py-2", path.id === "ARCHETYPE" && "text-indigo-200 bg-indigo-500/10 border border-indigo-400/30")}>{path.id === "ARCHETYPE" ? (ARCHETYPE_BRANCH_LABELS[coach.archetypeId] ?? "Archetype") : path.label}</div>
              </div>
            ))}

            {nodes.map((node) => {
              const stateClass = getNodeState(node);
              const col = GRID_COLUMNS[node.pathId] + (node.columnOffset ?? 0);
              return (
                <div
                  key={node.id}
                  ref={(el) => { nodeRefs.current[node.id] = el; }}
                  onMouseEnter={() => { setSelectedNodeId(node.id); setUnlockError(null); }}
                  onFocus={() => { setSelectedNodeId(node.id); setUnlockError(null); }}
                  tabIndex={0}
                  style={{ gridColumn: col, gridRow: node.tier + 1 }}
                  className={cn(
                    "h-24 w-40 rounded-lg border p-2 transition-all",
                    stateClass === "UNLOCKED" && "border-emerald-400 bg-emerald-900/20",
                    stateClass === "UNLOCKABLE" && "border-sky-400 bg-sky-900/20 shadow-[0_0_14px_rgba(56,189,248,0.35)] animate-pulse",
                    stateClass === "LOCKED" && "opacity-40 border-slate-600 bg-slate-800/40",
                    stateClass === "UNAFFORDABLE" && "border-amber-500/50 bg-slate-800/80"
                  )}
                >
                  <div className="text-sm font-bold leading-tight">{node.label}</div>
                  <div className="mt-2 text-xs">⬡ <span className={stateClass === "UNAFFORDABLE" ? "text-red-400" : "text-slate-200"}>{node.cost}</span></div>
                  <div className="text-xs mt-1">{stateClass === "UNLOCKED" ? "✓" : stateClass === "LOCKED" ? "🔒" : ""}</div>
                </div>
              );
            })}
          </div>

          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {connectorLines.map((line, idx) => (
              <line
                key={idx}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={line.strong ? "#22c55e" : "#64748b"}
                strokeWidth={2}
                strokeDasharray={line.strong ? "0" : "6 6"}
              />
            ))}
          </svg>
        </div>

        <Card className="bg-slate-900 border-slate-700 h-fit sticky top-4">
          <CardHeader><CardTitle className="text-base">{selectedNode?.label ?? "Select a node"}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-slate-300">{selectedNode?.description}</p>
            {selectedNode ? <p>Cost: <strong>⬡ {selectedNode.cost}</strong></p> : null}
            {selectedNode ? (
              <div>
                <p className="font-semibold mb-1">Requirements</p>
                <ul className="space-y-1 text-xs">
                  {requirements(selectedNode).length ? requirements(selectedNode).map((req) => (
                    <li key={req.label} className={req.met ? "text-emerald-300" : "text-slate-400"}>{req.met ? "✓" : "•"} {req.label}</li>
                  )) : <li className="text-slate-400">None</li>}
                </ul>
              </div>
            ) : null}
            {selectedNode?.grants?.length ? (
              <div>
                <p className="font-semibold mb-1">Effects</p>
                <ul className="text-xs space-y-1 text-slate-300">{selectedNode.grants.map((effect) => <li key={effect}>• {effect}</li>)}</ul>
              </div>
            ) : null}

            {selectedNode ? (
              unlockedSet.has(selectedNode.id) ? <Badge className="bg-emerald-600">✓ Unlocked</Badge> : (
                <Button
                  onClick={onUnlock}
                  disabled={!availableIds.has(selectedNode.id) || perkPoints < selectedNode.cost}
                  className="w-full"
                >
                  Unlock
                </Button>
              )
            ) : null}
            {selectedNode && !availableIds.has(selectedNode.id) && !unlockedSet.has(selectedNode.id) ? <p className="text-xs text-slate-400">Node is locked until requirements are met.</p> : null}
            {selectedNode && availableIds.has(selectedNode.id) && perkPoints < selectedNode.cost ? <p className="text-xs text-amber-300">Need {selectedNode.cost - perkPoints} more point(s).</p> : null}
            {unlockError ? <p className="text-xs text-red-400">{unlockError}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
