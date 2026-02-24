import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function HallOfFame() {
  return (
    <div className="space-y-4">
      <ScreenHeader title="HALL OF FAME" showBack />
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">Coming soon.</CardContent>
      </Card>
    </div>
  );
}
