import { useMemo, useState } from "react";
import { useGame, type AssistantStaff } from "@/context/GameContext";
import {
  getAssistantHeadCoachCandidates,
  getPositionCoachCandidates,
  getPersonnelById,
  type PersonnelRow,
  type PositionCoachRole,
} from "@/data/leagueDb";
import { computeStaffAcceptance, type RoleFocus } from "@/engine/assistantHiring";
import { expectedSalary, offerQualityScore, offerSalary, type SalaryOfferLevel } from "@/engine/staffSalary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

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

const LEVELS: SalaryOfferLevel[] = ["LOW", "FAIR", "HIGH"];
const LEVEL_LABEL: Record<SalaryOfferLevel, string> = { LOW: "Low", FAIR: "Fair", HIGH: "High" };

function normScheme(s?: unknown): string {
  return String(s ?? "").trim().toLowerCase();
}
function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
function money(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

export default function AssistantHiring() {
  const { state, dispatch } = useGame();
  const [activeRole, setActiveRole] = useState<keyof AssistantStaff>("assistantHcId");
  const [toast, setToast] = useState<string | null>(null);
  const [levelIdx, setLevelIdx] = useState(1);

  const remainingBudget = state.staffBudget.total - state.staffBudget.used;

  const ocScheme = state.staff.ocId ? normScheme(getPersonnelById(state.staff.ocId)?.scheme) : "";
  const dcScheme = state.staff.dcId ? normScheme(getPersonnelById(state.staff.dcId)?.scheme) : "";
  const preferredSchemes = new Set([ocScheme, dcScheme].filter(Boolean));

  const getCandidates = (roleKey: keyof AssistantStaff): PersonnelRow[] => {
    const role = ROLE_ORDER.find((item) => item.key === roleKey)?.role;
    if (!role) return getAssistantHeadCoachCandidates();
    return getPositionCoachCandidates(role);
  };

  const hiredSet = useMemo(
    () =>
      new Set(
        [
          ...Object.values(state.assistantStaff).filter(Boolean),
          state.staff.ocId,
          state.staff.dcId,
          state.staff.stcId,
        ].filter(Boolean) as string[]
      ),
    [state.assistantStaff, state.staff.ocId, state.staff.dcId, state.staff.stcId]
  );

  const rep = state.coach.reputation;
  const teamOutlook = clamp100(45 + (state.acceptedOffer?.score ?? 0) * 40);
  const roleFocus = ROLE_ORDER.find((x) => x.key === activeRole)?.focus ?? "GEN";
  const level = LEVELS[levelIdx];

  const candidates = useMemo(() => {
    const raw = getCandidates(activeRole).filter((p) => !hiredSet.has((p as any).personId));
    const interested = raw
      .map((p) => {
        const scheme = normScheme((p as any).scheme);
        const schemeCompat =
          preferredSchemes.size ? (Array.from(preferredSchemes).some((x) => scheme.includes(x) || x.includes(scheme)) ? 80 : 55) : 60;

        const exp = expectedSalary(activeRole as any, Number((p as any).reputation ?? 55));
        const salary = offerSalary(exp, level);
        const offerQuality = offerQualityScore(salary, exp);

        const acc = computeStaffAcceptance({
          saveSeed: state.saveSeed,
          rep,
          staffRep: Number((p as any).reputation ?? 0),
          personId: (p as any).personId,
          schemeCompat,
          offerQuality,
          teamOutlook,
          roleFocus,
          kind: "ASSISTANT",
        });

        return { p, acc, exp, salary };
      })
      .filter((x) => x.acc.accept)
      .filter((x) => x.salary <= remainingBudget);

    return interested.slice(0, 18);
  }, [activeRole, hiredSet, preferredSchemes, state.saveSeed, rep, teamOutlook, roleFocus, level, remainingBudget]);

  const allFilled = ROLE_ORDER.every((role) => Boolean(state.assistantStaff[role.key]));

  const attemptHire = (personId: string, salary: number) => {
    dispatch({ type: "HIRE_ASSISTANT", payload: { role: activeRole, personId, salary } });
    setToast("Offer sent.");
    setTimeout(() => setToast(null), 900);
  };

  const handleContinue = () => {
    if (!allFilled) return;
    dispatch({ type: "ADVANCE_CAREER_STAGE" });
  };

  return (
    <div className="space-y-4">
      {toast ? (
        <Card>
          <CardContent className="p-4 text-sm">{toast}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-2xl font-bold">Staff Construction</div>
            <div className="text-sm text-muted-foreground">Interested candidates only. Salary offers matter.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">Budget {money(state.staffBudget.total)}</Badge>
            <Badge variant="outline">Used {money(state.staffBudget.used)}</Badge>
            <Badge variant="secondary">Remaining {money(remainingBudget)}</Badge>
            <Badge variant="outline">Cash {money(state.teamFinances.cash)}</Badge>
            <Button onClick={handleContinue} disabled={!allFilled}>
              Continue →
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {ROLE_ORDER.map((r) => (
              <Button
                key={String(r.key)}
                size="sm"
                variant={activeRole === r.key ? "default" : "secondary"}
                onClick={() => setActiveRole(r.key)}
              >
                {r.label} {state.assistantStaff[r.key] ? "✓" : ""}
              </Button>
            ))}
          </div>
          <div className="min-w-[220px]">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>Fair</span>
              <span>High</span>
            </div>
            <Slider value={[levelIdx]} min={0} max={2} step={1} onValueChange={(v) => setLevelIdx(v[0] ?? 1)} />
            <div className="text-xs text-muted-foreground mt-1">Offer: {LEVEL_LABEL[level]}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          {candidates.length ? (
            candidates.map(({ p, acc, exp, salary }) => (
              <div key={(p as any).personId} className="border rounded-md px-3 py-2 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {(p as any).fullName} <span className="text-muted-foreground">({String((p as any).role ?? "")})</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Rep {Number((p as any).reputation ?? 0)} · Expected {money(exp)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge title={`Tier ${acc.tier} · Score ${acc.score} · Threshold ${acc.threshold}`} variant="outline">
                    Tier {acc.tier}
                  </Badge>
                  <Badge variant="secondary">AS {acc.score}</Badge>
                  <Button size="sm" variant="outline" onClick={() => attemptHire((p as any).personId, salary)} disabled={salary > remainingBudget}>
                    Offer {money(salary)}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No interested candidates available for this role at this offer level.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
