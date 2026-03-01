import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCard } from "@/components/playbook/PlayCard";
import { getPlaybookPlaysExpanded } from "@/engine/playbooks/getPlaybookPlaysExpanded";
import { getSchemeDisplayName, type OffenseSchemeId } from "../schemeDisplay";
import { OFFENSE_PLAYBOOK_CONTENT } from "./OffensePlaybookContent";

export default function OffensePlaybookTemplate({ schemeId }: { schemeId: OffenseSchemeId }) {
  const content = OFFENSE_PLAYBOOK_CONTENT[schemeId];
  const plays = getPlaybookPlaysExpanded(schemeId);

  return (
    <div className="m-4 space-y-4">
      <Card className="border-white/10 bg-slate-950/40">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">{getSchemeDisplayName(schemeId)}</CardTitle>
            <Badge variant="secondary">Offense</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{content.identity}</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Core Formations</h3>
            <ul className="space-y-1 text-sm">
              {content.formations.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured Concepts</h3>
            <ul className="space-y-1 text-sm">
              {content.concepts.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {plays.map((play) => (
          <PlayCard key={play.playId} play={play} />
        ))}
      </div>
    </div>
  );
}
