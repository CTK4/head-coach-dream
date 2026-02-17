import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

export default function Finance() {
  const { state } = useGame();
  const navigate = useNavigate();
  const dmThis = state.teamFinances.deadMoneyBySeason[state.season] ?? 0;
  const dmNext = state.teamFinances.deadMoneyBySeason[state.season + 1] ?? 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Finances</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline">Cash {money(state.teamFinances.cash)}</Badge>
          <Badge variant="outline">Dead Money Y{state.season} {money(dmThis)}</Badge>
          <Badge variant="outline">Dead Money Y{state.season + 1} {money(dmNext)}</Badge>
          <Badge variant="outline">Owner Approval {state.owner.approval}</Badge>
          <Badge variant="outline">Financial Rating {state.owner.financialRating}</Badge>
          <Badge variant="secondary" className="cursor-pointer" onClick={() => navigate("/hub/firing-meter")}>
            Job Security {state.owner.jobSecurity}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
