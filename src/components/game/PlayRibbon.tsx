import type { PlayResult, PlayType } from "@/engine/gameSim";
import { Badge } from "@/components/ui/badge";

const PLAY_LABELS: Partial<Record<PlayType, string>> = {
  INSIDE_ZONE: "Inside Zone",
  OUTSIDE_ZONE: "Outside Zone",
  POWER: "Power",
  RPO_READ: "RPO",
  QUICK_GAME: "Quick Game",
  DROPBACK: "Dropback",
  PLAY_ACTION: "Play Action",
  SCREEN: "Screen",
  PUNT: "Punt",
  FG: "Field Goal",
  SPIKE: "Spike",
  KNEEL: "Kneel",
};

export default function PlayRibbon({ latestPlay, playType }: { latestPlay?: PlayResult; playType?: PlayType }) {
  if (!latestPlay) return null;

  const badgeLabel = playType ? (PLAY_LABELS[playType] ?? playType.replace(/_/g, " ")) : "Last Play";

  return (
    <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 transition-all duration-200 animate-in slide-in-from-left-4">
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">{badgeLabel}</Badge>
        <span className="font-medium">{latestPlay.explanation.primaryFactor}</span>
        {latestPlay.explanation.secondaryFactor ? <span className="text-muted-foreground">· {latestPlay.explanation.secondaryFactor}</span> : null}
      </div>
      {latestPlay.explanation.coachingNote ? <p className="mt-1 text-xs italic text-blue-300">{latestPlay.explanation.coachingNote}</p> : null}
    </div>
  );
}
