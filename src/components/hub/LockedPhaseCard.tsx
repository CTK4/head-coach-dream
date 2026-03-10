import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LockedPhaseCard({
  title,
  message,
  nextAvailable,
}: {
  title: string;
  message: string;
  nextAvailable: string;
}) {
  const navigate = useNavigate();
  return (
    <Card className="border-slate-300/15 bg-slate-950/35">
      <CardContent className="space-y-3 p-6">
        <div className="text-2xl font-bold text-slate-100">{title}</div>
        <div className="text-sm text-slate-200/70">{message}</div>
        <div className="text-sm text-slate-200/70">
          <span className="font-semibold text-slate-100">Next available:</span> {nextAvailable}
        </div>
        <div className="pt-2">
          <Button variant="secondary" onClick={() => navigate("/hub")}>
            Back to Hub
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
