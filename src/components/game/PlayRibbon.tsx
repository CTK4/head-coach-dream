import type { PlayResult, PlayType } from "@/engine/gameSim";
import { Badge } from "@/components/ui/badge";

function label(playId?: string): PlayType | "PLAY" {
  if (!playId) return "PLAY";
  return "PLAY";
}

export default function PlayRibbon({ latestPlay }: { latestPlay?: PlayResult }) {
  if (!latestPlay) return null;

  return (
    <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 transition-all duration-200 animate-in slide-in-from-left-4">
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">{label(latestPlay.playId)}</Badge>
        <span className="font-medium">{latestPlay.explanation.primaryFactor}</span>
        {latestPlay.explanation.secondaryFactor ? <span className="text-muted-foreground">· {latestPlay.explanation.secondaryFactor}</span> : null}
      </div>
      {latestPlay.explanation.coachingNote ? <p className="mt-1 text-xs italic text-blue-300">{latestPlay.explanation.coachingNote}</p> : null}
    </div>
  );
}
