import { useMemo, useState } from "react";
import { useGame, type AssistantStaff } from "@/context/GameContext";
import { getAssistantHeadCoachCandidates, getPositionCoachCandidates, getPersonnelById, type PersonnelRow, type PositionCoachRole } from "@/data/leagueDb";
import { computeStaffAcceptance, type RoleFocus } from "@/engine/assistantHiring";
import { computeHrs } from "@/engine/reputation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROLE_ORDER: Array<{ key: keyof AssistantStaff; label: string; role?: PositionCoachRole; focus: RoleFocus }> = [
  { key: "assistantHcId", label: "Assistant HC", focus: "GEN" },
  { key: "qbCoachId", label: "QB Coach", role: "QB_COACH", focus: "OFF" },
  { key: "olCoachId", label: "OL Coach", role: "OL_COACH", focus: "OFF" },
  { key: "dlCoachId", label: "DL Coach", role: "DL_COACH", focus: "DEF" },
  { key: "lbCoachId", label: "LB Coach", role: "LB_COACH", focus: "DEF" },
  { key: "dbCoachId", label: "DB Coach", role: "DB_COACH", focus: "DEF" },
  { key: "rbCoachId", label: "RB Coach", role: "RB_COACH", focus: "OFF" },
  { key: "wrCoachId", label: "WR Coach", role: "WR_COACH", focus: "OFF" },
];

function normScheme(s?: unknown): string {
  return String(s ?? "").trim().toLowerCase();
}

function computeCoachScore(person: PersonnelRow, preferredSchemes: Set<string>): number {
  const rep = Number(person.reputation ?? 0);
  const scheme = normScheme(person.scheme);
  const schemeMatch = preferredSchemes.size > 0 && scheme && Array.from(preferredSchemes).some((ps) => scheme.includes(ps) || ps.includes(scheme));
  return (schemeMatch ? 1_000_000 : 0) + rep * 100 + (person.age ? Math.max(0, 80 - person.age) : 0);
}

function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function AssistantHiring() {
  const { state, dispatch } = useGame();
  const [activeRole, setActiveRole] = useState<keyof AssistantStaff>("assistantHcId");
  const [toast, setToast] = useState<string | null>(null);

  const ocScheme = state.staff.ocId ? normScheme(getPersonnelById(state.staff.ocId)?.scheme) : "";
  const dcScheme = state.staff.dcId ? normScheme(getPersonnelById(state.staff.dcId)?.scheme) : "";
  const preferredSchemes = new Set([ocScheme, dcScheme].filter(Boolean));

  const getCandidates = (roleKey: keyof AssistantStaff): PersonnelRow[] => {
    const role = ROLE_ORDER.find((item) => item.key === roleKey)?.role;
    if (!role) return getAssistantHeadCoachCandidates();
    return getPositionCoachCandidates(role);
  };

  const hiredSet = useMemo(
    () => new Set([...Object.values(state.assistantStaff).filter(Boolean), state.staff.ocId, state.staff.dcId, state.staff.stcId].filter(Boolean) as string[]),
    [state.assistantStaff, state.staff.ocId, state.staff.dcId, state.staff.stcId]
  );

  const teamOutlook = clamp100(45 + (state.acceptedOffer ? 30 : 0));
  const offerQuality = 70;
  const roleFocus = ROLE_ORDER.find((x) => x.key === activeRole)?.focus ?? "GEN";

  const candidates = useMemo(() => {
    const rep = state.coach.reputation;
    const raw = getCandidates(activeRole).filter((p) => !hiredSet.has(p.personId));

    const interested = raw
      .map((p) => {
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
          roleFocus,
          kind: "ASSISTANT",
        });

        return { p, acc };
      })
      .filter((x) => x.acc.accept);

    return interested.sort((a, b) => computeCoachScore(b.p, preferredSchemes) - computeCoachScore(a.p, preferredSchemes)).slice(0, 18);
  }, [activeRole, hiredSet, preferredSchemes, state.coach.reputation, state.saveSeed, teamOutlook, roleFocus]);

  const allFilled = ROLE_ORDER.every((role) => Boolean(state.assistantStaff[role.key]));

  const attemptHire = (personId: string) => {
    dispatch({ type: "ASSISTANT_ATTEMPT_HIRE", payload: { role: activeRole, personId } });
    setToast("Offer sent.");
    setTimeout(() => setToast(null), 900);
  };

  return (
    <div className="space-y-4">
      {toast ? <Card><CardContent className="p-4 text-sm">{toast}</CardContent></Card> : null}

      <Card>
        <CardContent className="p-6 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-2xl font-bold">Staff Construction</div>
            <div className="text-sm text-muted-foreground">Only interested candidates appear in the pool.</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">HRS {state.coach.reputation ? computeHrs(state.coach.reputation) : 0}</Badge>
            <Button onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })} disabled={!allFilled}>Continue →</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2">
          {ROLE_ORDER.map((r) => (
            <Button key={String(r.key)} size="sm" variant={activeRole === r.key ? "default" : "secondary"} onClick={() => setActiveRole(r.key)}>
              {r.label} {state.assistantStaff[r.key] ? "✓" : ""}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          {candidates.length ? (
            candidates.map(({ p, acc }) => (
              <div key={p.personId} className="border rounded-md px-3 py-2 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.fullName} <span className="text-muted-foreground">({String(p.role ?? "")})</span></div>
                  <div className="text-xs text-muted-foreground">Rep {Number(p.reputation ?? 0)} · Scheme {String(p.scheme ?? "-")}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge title={`Tier ${acc.tier} · Score ${acc.score} · Threshold ${acc.threshold}`} variant="outline">Tier {acc.tier}</Badge>
                  <Badge title={`Score ${acc.score} / ${acc.threshold}`} variant="secondary">AS {acc.score}</Badge>
                  <Button size="sm" variant="outline" onClick={() => attemptHire(p.personId)}>Offer Job</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No interested candidates available for this role right now.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
