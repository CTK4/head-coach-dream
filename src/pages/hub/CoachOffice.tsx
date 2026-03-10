import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getPersonnelById } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildStaffAssignments } from "@/pages/hub/staff/staffProfileUtils";

export default function CoachOffice() {
  const { state } = useGame();
  const navigate = useNavigate();

  const staffRows = useMemo(
    () =>
      buildStaffAssignments(state)
        .filter((item) => !!item.personId)
        .map((item) => {
          const person = getPersonnelById(String(item.personId));
          return {
            ...item,
            personId: String(item.personId),
            name: String(person?.fullName ?? "Coach"),
            reputation: Number(person?.reputation ?? 0),
          };
        }),
    [state]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Coach&apos;s Office</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border p-3">
            <div className="font-semibold">Coach Navigation</div>
            <p className="text-xs text-muted-foreground">Access your identity profile, skill tree, and coordinator details.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => navigate("/coachs-office/my-profile")}>My Profile</Button>
              <Button variant="secondary" onClick={() => navigate("/skill-tree")}>Skill Tree</Button>
              <Button variant="secondary" onClick={() => navigate("/staff/management")}>Staff Management</Button>
            </div>
          </div>

          <div className="space-y-2">
            {staffRows.map((row) => (
              <button
                key={row.personId}
                type="button"
                onClick={() => navigate(`/coachs-office/staff/${row.personId}`)}
                className="w-full rounded-md border p-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="font-medium">{row.name}</div>
                <div className="text-xs text-muted-foreground">{row.label} · Rep {row.reputation}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
