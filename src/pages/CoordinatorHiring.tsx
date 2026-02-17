import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { computeStaffAcceptance } from "@/engine/assistantHiring";
import { getCoordinatorFreeAgents, getPersonnelById, type PersonnelRow } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function normScheme(s?: unknown): string {
  return String(s ?? "").trim().toLowerCase();
}
function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function CoordinatorHiring() {
  const { state, dispatch } = useGame();
  const [role, setRole] = useState<"OC" | "DC" | "STC">("OC");

  const rep = state.coach.reputation;
  const teamOutlook = clamp100(45 + (state.acceptedOffer ? 30 : 0));
  const offerQuality = 70;

  const hiredSet = useMemo(
    () => new Set([state.staff.ocId, state.staff.dcId, state.staff.stcId, ...Object.values(state.assistantStaff).filter(Boolean)].filter(Boolean) as string[]),
    [state.staff, state.assistantStaff]
  );

  const ocScheme = state.staff.ocId ? normScheme(getPersonnelById(state.staff.ocId)?.scheme) : "";
  const dcScheme = state.staff.dcId ? normScheme(getPersonnelById(state.staff.dcId)?.scheme) : "";
  const preferredSchemes = new Set([ocScheme, dcScheme].filter(Boolean));

  const focus = role === "OC" ? "OFF" : role === "DC" ? "DEF" : "ST";

  const candidates = useMemo(() => {
    const raw = getCoordinatorFreeAgents(role).filter((p: PersonnelRow) => !hiredSet.has(p.personId));
    return raw
      .map((p: PersonnelRow) => {
        const scheme = normScheme(p.scheme);
        const schemeCompat = preferredSchemes.size ? (Array.from(preferredSchemes).some((x) => scheme.includes(x) || x.includes(scheme)) ? 80 : 55) : 60;
        const acc = computeStaffAcceptance({
          saveSeed: state.saveSeed,
          rep,
          staffRep: Number(p.reputation ?? 0),
          personId: p.personId,
          schemeCompat,
          offerQuality,
          teamOutlook,
          roleFocus: focus,
          kind: "COORDINATOR",
        });

        return { p, acc };
      })
      .filter((x) => x.acc.accept)
      .sort((a, b) => Number(b.p.reputation ?? 0) - Number(a.p.reputation ?? 0))
      .slice(0, 18);
  }, [role, hiredSet, preferredSchemes, state.saveSeed, rep, teamOutlook, focus]);

  const hire = (personId: string) => dispatch({ type: "COORD_ATTEMPT_HIRE", payload: { role, personId } });

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardContent className="p-6 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-2xl font-bold">Coordinator Hiring</div>
            <div className="text-sm text-muted-foreground">Only interested candidates appear (reputation + tier gating).</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={role === "OC" ? "default" : "secondary"} onClick={() => setRole("OC")}>OC</Button>
            <Button size="sm" variant={role === "DC" ? "default" : "secondary"} onClick={() => setRole("DC")}>DC</Button>
            <Button size="sm" variant={role === "STC" ? "default" : "secondary"} onClick={() => setRole("STC")}>STC</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          {candidates.length ? (
            candidates.map(({ p, acc }) => (
              <div key={p.personId} className="border rounded-md px-3 py-2 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {p.fullName} <span className="text-muted-foreground">({String(p.scheme ?? "-")})</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Rep {Number(p.reputation ?? 0)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge title={`Tier ${acc.tier} · Score ${acc.score} · Threshold ${acc.threshold}`} variant="outline">Tier {acc.tier}</Badge>
                  <Badge title={`Score ${acc.score} / ${acc.threshold}`} variant="secondary">AS {acc.score}</Badge>
                  <Button size="sm" variant="outline" onClick={() => hire(p.personId)}>Offer</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No interested candidates for this role right now.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
