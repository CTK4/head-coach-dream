import { Card, CardContent } from "@/components/ui/card";

export default function Standings() {
  return (
    <Card>
      <CardContent className="p-6 space-y-2">
        <h2 className="text-2xl font-bold">Standings</h2>
        <p className="text-sm text-muted-foreground">
          Placeholder page. Next: conference/division standings + playoff seeds.
        </p>
      </CardContent>
    </Card>
  );
}
