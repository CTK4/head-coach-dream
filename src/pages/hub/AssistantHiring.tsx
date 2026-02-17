import { useMemo, useState } from "react";
import { useGame, type AssistantStaff } from "@/context/GameContext";
import {
  getAssistantHeadCoachCandidates,
  getAssistantHeadCoachCandidatesAll,
  getPositionCoachCandidates,
  getPositionCoachCandidatesAll,
  type PersonnelRow,
  type PositionCoachRole,
} from "@/data/leagueDb";
import { type RoleFocus } from "@/engine/assistantHiring";
import { expectedSalary, offerSalary, type SalaryOfferLevel } from "@/engine/staffSalary";
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
const MIN_REQUIRED = 3;

type Cand = { p: PersonnelRow; exp: number; salary: number; safety: boolean; emergency: boolean };
function money(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

export default function AssistantHiring() {
  const { state, dispatch } = useGame();
  const [activeRole, setActiveRole] = useState<keyof AssistantStaff>("assistantHcId");
  const [toast, setToast] = useState<string | null>(null);
  const [levelIdx, setLevelIdx] = useState(1);

  const remainingBudget = state.staffBudget.total - state.staffBudget.used;

  const getStrictPool = (roleKey: keyof AssistantStaff): PersonnelRow[] => {
    const role = ROLE_ORDER.find((item) => item.key === roleKey)?.role;
    if (!role) return getAssistantHeadCoachCandidates();
    return getPositionCoachCandidates(role);
  };

  const getAllPool = (roleKey: keyof AssistantStaff): PersonnelRow[] => {
    const role = ROLE_ORDER.find((item) => item.key === roleKey)?.role;
    if (!role) return getAssistantHeadCoachCandidatesAll();
    return getPositionCoachCandidatesAll(role);
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

  const level = LEVELS[levelIdx];

  const candidates = useMemo(() => {
    const strict: Cand[] = getStrictPool(activeRole)
      .filter((p) => !hiredSet.has(p.personId))
      .map((p) => {
        const exp = expectedSalary(activeRole as any, Number(p.reputation ?? 55));
        const salary = offerSalary(exp, level);
        return { p, exp, salary, safety: false, emergency: false };
      })
      .filter((x) => x.salary <= remainingBudget)
      .sort((a, b) => Number(b.p.reputation ?? 0) - Number(a.p.reputation ?? 0));

    if (strict.length >= MIN_REQUIRED) return strict.slice(0, 40);

    const seen = new Set(strict.map((x) => x.p.personId));
    const need1 = MIN_REQUIRED - strict.length;

    const safetyAffordable: Cand[] = getAllPool(activeRole)
      .filter((p) => !hiredSet.has(p.personId))
      .filter((p) => !seen.has(p.personId))
      .map((p) => {
        const exp = expectedSalary(activeRole as any, Number(p.reputation ?? 55));
        const salary = offerSalary(exp, level);
        return { p, exp, salary, safety: true, emergency: false };
      })
      .filter((x) => x.salary <= remainingBudget)
      .sort((a, b) => Number(a.p.reputation ?? 999) - Number(b.p.reputation ?? 999))
      .slice(0, need1);

    const base = [...strict, ...safetyAffordable];
    if (base.length >= MIN_REQUIRED) return base.slice(0, 40);

    const seen2 = new Set(base.map((x) => x.p.personId));
    const need2 = MIN_REQUIRED - base.length;

    const emergencyAny: Cand[] = getAllPool(activeRole)
      .filter((p) => !hiredSet.has(p.personId))
      .filter((p) => !seen2.has(p.personId))
      .map((p) => {
        const exp = expectedSalary(activeRole as any, Number(p.reputation ?? 55));
        const salary = offerSalary(exp, "LOW");
        return { p, exp, salary, safety: true, emergency: true };
      })
      .sort((a, b) => Number(a.p.reputation ?? 999) - Number(b.p.reputation ?? 999))
      .slice(0, need2);

    return [...base, ...emergencyAny].slice(0, 40);
  }, [activeRole, hiredSet, level, remainingBudget]);

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
            <div className="text-sm text-muted-foreground">Pool backfills with safety and emergency options when needed.</div>
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
            candidates.map(({ p, exp, salary, safety, emergency }) => (
              <div key={p.personId} className="border rounded-md px-3 py-2 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {p.fullName} <span className="text-muted-foreground">({String(p.role ?? "")})</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Rep {Number(p.reputation ?? 0)} · Expected {money(exp)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {safety ? <Badge variant="outline">{emergency ? "Emergency" : "Safety"}</Badge> : null}
                  <Button size="sm" variant="outline" onClick={() => attemptHire(p.personId, salary)}>
                    Offer {money(salary)} {emergency ? "(Emergency)" : safety ? "(Safety)" : ""}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No candidates available for this role.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
