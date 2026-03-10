import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getPersonnelById, getPersonnelContract } from "@/data/leagueDb";
import { buildStaffAssignments } from "@/pages/hub/staff/staffProfileUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/Avatar";

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

export default function StaffProfile() {
  const { state } = useGame();
  const navigate = useNavigate();
  const { personId = "" } = useParams();

  const assignment = useMemo(
    () => buildStaffAssignments(state).find((item) => String(item.personId) === String(personId)),
    [personId, state]
  );

  const person = getPersonnelById(personId);
  const contract = getPersonnelContract(personId);
  const salary = state.staffBudget.byPersonId[personId] ?? Number(contract?.salaryY1 ?? 0);
  const remainingYears = contract?.endSeason != null ? Math.max(0, Number(contract.endSeason) - state.season) + 1 : 0;
  const yearsOnDeal = contract?.startSeason != null && contract?.endSeason != null ? Number(contract.endSeason) - Number(contract.startSeason) + 1 : undefined;

  if (!person || !assignment) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Staff Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">This staff member is not currently assigned to your coaching staff.</p>
            <Button onClick={() => navigate("/coachs-office")}>Back to Coach&apos;s Office</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Staff Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar entity={{ type: "personnel", id: person.personId, name: person.fullName, avatarUrl: person.avatarUrl }} size={56} />
              <div>
                <div className="text-lg font-semibold">{person.fullName}</div>
                <div className="text-sm text-muted-foreground">{assignment.label}</div>
              </div>
            </div>
            <Badge variant="outline">Rep {Number(person.reputation ?? 0)}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            <div className="rounded-md border p-2">Current Salary: <span className="font-semibold">{money(salary)}</span></div>
            <div className="rounded-md border p-2">Remaining Term: <span className="font-semibold">{remainingYears} year(s)</span></div>
            <div className="rounded-md border p-2">Contract Window: <span className="font-semibold">Y{contract?.startSeason ?? "-"} - Y{contract?.endSeason ?? "-"}</span></div>
            <div className="rounded-md border p-2">Deal Length: <span className="font-semibold">{yearsOnDeal ?? 0} year(s)</span></div>
            <div className="rounded-md border p-2">Preferred Scheme: <span className="font-semibold">{String(person.scheme ?? "N/A")}</span></div>
            <div className="rounded-md border p-2">Role Type: <span className="font-semibold">{String(person.role ?? "COACH")}</span></div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Staff Budget {money(state.staffBudget.total)}</Badge>
            <Badge variant="outline">Used {money(state.staffBudget.used)}</Badge>
            <Badge variant="secondary">Remaining {money(state.staffBudget.total - state.staffBudget.used)}</Badge>
          </div>

          <Button variant="secondary" onClick={() => navigate("/staff/management")}>Back to Staff Management</Button>
        </CardContent>
      </Card>
    </div>
  );
}
