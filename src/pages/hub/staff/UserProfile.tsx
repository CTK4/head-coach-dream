import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getPersonnel, getTeamById } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function UserProfile() {
  const { state } = useGame();
  const navigate = useNavigate();

  const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? state.profile?.teamId ?? state.coach?.teamId;
  const team = getTeamById(String(teamId ?? ""));

  const gm = useMemo(() => {
    return getPersonnel().find((person) => {
      const role = String(person.role ?? "").toUpperCase();
      return String(person.teamId) === String(teamId) && (role === "GENERAL_MANAGER" || role === "GM");
    });
  }, [teamId]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-md border p-3">
            <div className="text-lg font-semibold">{state.coach.name || "Unnamed Coach"}</div>
            <div className="text-muted-foreground">Head Coach · {team?.region} {team?.name}</div>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="rounded-md border p-2">Archetype: <span className="font-semibold">{state.coach.archetypeId || "UNSET"}</span></div>
            <div className="rounded-md border p-2">Tenure Year: <span className="font-semibold">{state.coach.tenureYear}</span></div>
            <div className="rounded-md border p-2">Perk Points: <span className="font-semibold">{state.coach.perkPoints ?? 0}</span></div>
            <div className="rounded-md border p-2">Owner Approval: <span className="font-semibold">{state.owner.approval}</span></div>
            <div className="rounded-md border p-2">Job Security: <span className="font-semibold">{state.owner.jobSecurity}</span></div>
            <div className="rounded-md border p-2">GM Relationship: <span className="font-semibold">{state.coach.gmRelationship ?? 50}</span></div>
          </div>

          <div className="rounded-md border p-3">
            <div className="font-semibold">General Manager</div>
            <div>{gm?.fullName ?? "General Manager"}</div>
            <div className="text-muted-foreground">{team?.region} {team?.name}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Season {state.season}</Badge>
            <Badge variant="outline">Cash ${(state.teamFinances.cash / 1_000_000).toFixed(2)}M</Badge>
            <Badge variant="outline">Staff Budget ${(state.staffBudget.total / 1_000_000).toFixed(2)}M</Badge>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => navigate("/skill-tree")}>Open Skill Tree</Button>
            <Button variant="secondary" onClick={() => navigate("/coachs-office")}>Back to Coach&apos;s Office</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
