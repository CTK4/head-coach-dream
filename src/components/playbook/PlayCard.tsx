import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PlayDiagram } from "@/components/playbook/PlayDiagram";
import type { ExpandedPlay } from "@/engine/playbooks/types";

export function PlayCard({ play }: { play: ExpandedPlay }) {
  return (
    <Card className="border-white/10 bg-slate-950/30">
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-slate-100">{play.name}</div>
            <div className="text-xs text-muted-foreground">{play.family}</div>
          </div>
          <Badge variant="outline">{play.type}</Badge>
        </div>

        {play.diagram.paths.length > 0 ? (
          <PlayDiagram diagram={play.diagram} />
        ) : (
          <div className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-3 text-xs text-amber-200">
            Missing diagram data ({play.playId})
          </div>
        )}
      </CardContent>
    </Card>
  );
}
