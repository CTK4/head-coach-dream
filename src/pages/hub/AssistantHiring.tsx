import { useState } from "react";
import { useGame, type AssistantStaff } from "@/context/GameContext";
import {
  getAssistantHeadCoachCandidates,
  getPositionCoachCandidates,
  getPersonnelById,
  type PersonnelRow,
  type PositionCoachRole,
} from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROLE_ORDER: Array<{ key: keyof AssistantStaff; label: string; role?: PositionCoachRole }> = [
  { key: "assistantHcId", label: "Assistant HC" },
  { key: "qbCoachId", label: "QB Coach", role: "QB_COACH" },
  { key: "olCoachId", label: "OL Coach", role: "OL_COACH" },
  { key: "dlCoachId", label: "DL Coach", role: "DL_COACH" },
  { key: "lbCoachId", label: "LB Coach", role: "LB_COACH" },
  { key: "dbCoachId", label: "DB Coach", role: "DB_COACH" },
  { key: "rbCoachId", label: "RB Coach", role: "RB_COACH" },
  { key: "wrCoachId", label: "WR Coach", role: "WR_COACH" },
];

function normScheme(s?: unknown): string {
  return String(s ?? "").trim().toLowerCase();
}

function computeCoachScore(person: PersonnelRow, preferredSchemes: Set<string>): number {
  const rep = Number(person.reputation ?? 0);
  const scheme = normScheme(person.scheme);
  const schemeMatch =
    preferredSchemes.size > 0 &&
    scheme &&
    Array.from(preferredSchemes).some((ps) => scheme.includes(ps) || ps.includes(scheme));
  return (schemeMatch ? 1_000_000 : 0) + rep * 100 + (person.age ? Math.max(0, 80 - person.age) : 0);
}

const AssistantHiring = () => {
  const { state, dispatch } = useGame();
  const [activeRole, setActiveRole] = useState<keyof AssistantStaff>("assistantHcId");

  const ocScheme = state.staff.ocId ? normScheme(getPersonnelById(state.staff.ocId)?.scheme) : "";
  const dcScheme = state.staff.dcId ? normScheme(getPersonnelById(state.staff.dcId)?.scheme) : "";
  const preferredSchemes = new Set([ocScheme, dcScheme].filter(Boolean));

  const blockedIds = new Set([state.orgRoles.ocCoachId, state.orgRoles.dcCoachId, state.orgRoles.ahcCoachId].filter(Boolean) as string[]);

  const getCandidates = (roleKey: keyof AssistantStaff): PersonnelRow[] => {
    const role = ROLE_ORDER.find((item) => item.key === roleKey)?.role;
    if (!role) return getAssistantHeadCoachCandidates();
    return getPositionCoachCandidates(role);
  };

  const hiredSet = new Set(Object.values(state.assistantStaff).filter(Boolean));
  const candidates = getCandidates(activeRole)
    .filter((p) => !hiredSet.has(p.personId) && !blockedIds.has(p.personId))
    .sort((a, b) => computeCoachScore(b, preferredSchemes) - computeCoachScore(a, preferredSchemes));

  const allFilled = ROLE_ORDER.every((role) => Boolean(state.assistantStaff[role.key]));

  const handleHire = (personId: string) => {
    dispatch({ type: "HIRE_ASSISTANT", payload: { role: activeRole, personId } });
    if (activeRole === "assistantHcId") dispatch({ type: "SET_ORG_ROLE", payload: { role: "ahcCoachId", coachId: personId } });
  };

  const handleContinue = () => {
    if (!allFilled) return;
    dispatch({ type: "ADVANCE_CAREER_STAGE" });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Assistant Hiring</h2>
        <p className="text-sm text-muted-foreground">Fill all required assistant roles before moving on.</p>
        <p className="text-xs text-muted-foreground">Coaches already hired as coordinators won't appear in this pool.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ROLE_ORDER.map((role) => (
          <Button
            key={role.key}
            variant={activeRole === role.key ? "default" : "secondary"}
            onClick={() => setActiveRole(role.key)}
            className="relative"
            size="sm"
          >
            {role.label}
            {state.assistantStaff[role.key] && (
              <Badge className="absolute -top-2 -right-2 text-xs px-1.5">✓</Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="grid gap-3">
        {candidates.map((person) => {
          const hired = false;
          const scheme = normScheme(person.scheme);
          const schemeMatch =
            preferredSchemes.size > 0 &&
            scheme &&
            Array.from(preferredSchemes).some((ps) => scheme.includes(ps) || ps.includes(scheme));
          return (
            <Card key={person.personId} className={hired ? "opacity-60" : ""}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{person.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {person.role} • Rep {person.reputation ?? "?"} • Age {person.age ?? "?"} • {schemeMatch ? "Scheme Fit ✓" : "Scheme Fit —"}
                  </p>
                </div>
                <Button size="sm" disabled={hired} onClick={() => handleHire(person.personId)}>
                  {hired ? "Hired" : "Hire"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button className="w-full" disabled={!allFilled} onClick={handleContinue}>
        Continue to Roster Review
      </Button>
    </div>
  );
};

export default AssistantHiring;
