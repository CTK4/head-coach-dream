import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PlaceholderPlaybookProps = {
  side: "Offense" | "Defense";
  schemeId: string;
};

export default function PlaceholderPlaybook({ side, schemeId }: PlaceholderPlaybookProps) {
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="text-base">{side} Playbook Placeholder</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Placeholder for <span className="font-mono text-slate-200">{schemeId}</span>. Paste your full playbook component into this file when ready.
        </p>
      </CardContent>
    </Card>
  );
}
