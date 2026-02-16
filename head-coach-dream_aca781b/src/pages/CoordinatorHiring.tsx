import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getCoordinatorFreeAgents, type PersonnelRow } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type CoordRole = "OC" | "DC" | "STC";

const ROLE_LABELS: Record<CoordRole, string> = {
  OC: "Offensive Coordinator",
  DC: "Defensive Coordinator",
  STC: "Special Teams Coordinator",
};

const CoordinatorHiring = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<CoordRole>("OC");

  const roles: CoordRole[] = ["OC", "DC", "STC"];
  const candidates = getCoordinatorFreeAgents(activeRole);

  const isHired = (role: CoordRole) => {
    if (role === "OC") return !!state.staff.ocId;
    if (role === "DC") return !!state.staff.dcId;
    return !!state.staff.stcId;
  };

  const getHiredId = (role: CoordRole) => {
    if (role === "OC") return state.staff.ocId;
    if (role === "DC") return state.staff.dcId;
    return state.staff.stcId;
  };

  const allHired = roles.every(isHired);

  const handleHire = (person: PersonnelRow) => {
    dispatch({ type: "HIRE_STAFF", payload: { role: activeRole, personId: person.personId } });
  };

  if (allHired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Staff Complete!</h2>
            <p className="text-muted-foreground mb-6">Your coaching staff is assembled. Time to get to work.</p>
            <Button onClick={() => navigate("/hub")} className="w-full">Enter Hub</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Hire Your Coordinators</h1>
        <p className="text-muted-foreground text-center mb-6">Fill all three coordinator roles</p>

        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {roles.map((role) => (
            <Button
              key={role}
              variant={activeRole === role ? "default" : "secondary"}
              onClick={() => setActiveRole(role)}
              className="relative"
            >
              {ROLE_LABELS[role]}
              {isHired(role) && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-1.5">✓</Badge>
              )}
            </Button>
          ))}
        </div>

        {isHired(activeRole) ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Badge className="bg-primary text-primary-foreground mb-2">Hired</Badge>
              <p className="text-muted-foreground">
                {ROLE_LABELS[activeRole]} position filled. Select another role.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[60vh]">
            <div className="grid gap-3 pr-4">
              {candidates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No free agent candidates available for this role.</p>
              ) : (
                candidates.map((person) => (
                  <Card key={person.personId} className="hover:border-primary transition-all">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-semibold">{person.fullName}</h3>
                        <div className="flex gap-2 mt-1">
                          {person.scheme && (
                            <Badge variant="outline" className="text-xs">{person.scheme}</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            Rep: {person.reputation ?? "?"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Age {person.age}</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleHire(person)}>Hire</Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default CoordinatorHiring;
