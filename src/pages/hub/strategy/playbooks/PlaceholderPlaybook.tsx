import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PlaceholderPlaybook(props: { title: string; system: string }) {
  return (
    <div className="bg-slate-950 min-h-[60vh]">
      <div className="p-4">
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{props.title}</div>
              <Badge variant="outline">{props.system}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Placeholder. Paste your playbook component for this scheme into this folder and wire it in.
            </div>
            <div className="text-xs text-muted-foreground">
              MVP rule: whichever system your coordinator runs is the one shown here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
