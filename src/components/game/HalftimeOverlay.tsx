import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface HalftimeOverlayProps {
  open: boolean;
  onDismiss: () => void;
}

export default function HalftimeOverlay({ open, onDismiss }: HalftimeOverlayProps) {
  const { state } = useGame();
  const g = state.game;

  const scoreLine = `${g.homeTeamId} ${g.homeScore} · ${g.awayTeamId} ${g.awayScore}`;

  const panels = useMemo(() => {
    const offenseStats = g.possession === "HOME" ? g.stats.home : g.stats.away;
    const defenseStats = g.possession === "HOME" ? g.stats.away : g.stats.home;

    const basePanels = [
      {
        label: "OFF",
        lines: [
          `${offenseStats.tds} TDs`,
          `${offenseStats.passYards + offenseStats.rushYards} YDS`,
          `${g.possession === "HOME" ? g.homeScore : g.awayScore} PTS`,
        ],
      },
      {
        label: "DEF",
        lines: [
          `${defenseStats.sacks} sacks`,
          `${Math.max(0, (g.driveLog?.length ?? 0) - 1)} drives`,
          `${g.possession === "HOME" ? g.awayScore : g.homeScore} allowed`,
        ],
      },
    ];

    const momentum = (g as any).momentum;
    if (typeof momentum === "number") {
      basePanels.push({
        label: "MOMENTUM",
        lines: [`${momentum > 0 ? "+" : ""}${momentum}`, momentum >= 0 ? "favored" : "trailing"],
      });
    }

    return basePanels;
  }, [g]);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onDismiss(); }}>
      <DialogContent className="max-w-lg border-white/10 bg-slate-900/95 text-slate-100 p-6">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-amber-300">Halftime</div>
          <div className="text-2xl font-black">{scoreLine}</div>
          <div className="h-px bg-white/10" />

          <div className={`grid gap-3 ${panels.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
            {panels.map((panel) => (
              <div key={panel.label} className="rounded-lg border-l-2 border-blue-400/60 bg-slate-900/70 p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{panel.label}</div>
                {panel.lines.map((line) => (
                  <div key={line} className="text-sm text-slate-100">{line}</div>
                ))}
              </div>
            ))}
          </div>

          <Button className="w-full bg-blue-700 hover:bg-blue-600" onClick={onDismiss}>Start Second Half</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
