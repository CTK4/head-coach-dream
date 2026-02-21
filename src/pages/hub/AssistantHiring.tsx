import { useEffect, useMemo, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { HubPageCard } from "@/components/franchise-hub/HubPageCard";
import { Avatar } from "@/components/common/Avatar";

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

function resolveUserTeamId(state: any): string | undefined {
  return state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? state.profile?.teamId ?? state.coach?.teamId;
}

function money(n: number) {
  if (!Number.isFinite(n)) return "$0.00M";
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

function repNumber(p: PersonnelRow): number {
  const n = Number(p.reputation ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export default function AssistantHiring() {
  const { state, dispatch } = useGame();
  const teamId = resolveUserTeamId(state);
  const coordinatorsReady = !!(state.staff?.ocId && state.staff?.dcId && state.staff?.stcId);

  const firstUnfilled = useMemo(
    () => ROLE_ORDER.find((r) => !state.assistantStaff[r.key])?.key ?? "assistantHcId",
    [state.assistantStaff]
  );

  const [activeRole, setActiveRole] = useState<keyof AssistantStaff>(firstUnfilled);
  const [toast, setToast] = useState<string | null>(null);
  const [levelIdx, setLevelIdx] = useState(1);

  useEffect(() => {
    if (state.assistantStaff[activeRole]) setActiveRole(firstUnfilled);
  }, [activeRole, firstUnfilled, state.assistantStaff]);

  const remainingBudget = state.staffBudget.total - state.staffBudget.used;

  const repCap = state.season <= 2026 ? 50 : 999;

  const getStrictPool = (roleKey: keyof AssistantStaff): PersonnelRow[] => {
    const role = ROLE_ORDER.find((item) => item.key === roleKey)?.role;
    const base = !role ? getAssistantHeadCoachCandidates() : getPositionCoachCandidates(role);
    return base.filter((p) => repNumber(p) <= repCap);
  };

  const getAllPool = (roleKey: keyof AssistantStaff): PersonnelRow[] => {
    const role = ROLE_ORDER.find((item) => item.key === roleKey)?.role;
    const base = !role ? getAssistantHeadCoachCandidatesAll() : getPositionCoachCandidatesAll(role);
    return base.filter((p) => repNumber(p) <= repCap);
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

  const roleAlreadyFilled = Boolean(state.assistantStaff[activeRole]);

  const candidates = useMemo(() => {
    if (roleAlreadyFilled) return [];

    const strict: Cand[] = getStrictPool(activeRole)
      .filter((p) => !hiredSet.has(p.personId))
      .map((p) => {
        const rep = repNumber(p);
        const exp = expectedSalary(activeRole as any, rep);
        const salary = offerSalary(exp, level);
        return { p, exp, salary, safety: false, emergency: false };
      })
      .filter((x) => Number.isFinite(x.salary) && x.salary <= remainingBudget)
      .sort((a, b) => repNumber(b.p) - repNumber(a.p));

    if (strict.length >= MIN_REQUIRED) return strict.slice(0, 40);

    const seen = new Set(strict.map((x) => x.p.personId));
    const need1 = MIN_REQUIRED - strict.length;

    const safetyAffordable: Cand[] = getAllPool(activeRole)
      .filter((p) => !hiredSet.has(p.personId))
      .filter((p) => !seen.has(p.personId))
      .map((p) => {
        const rep = repNumber(p);
        const exp = expectedSalary(activeRole as any, rep);
        const salary = offerSalary(exp, level);
        return { p, exp, salary, safety: true, emergency: false };
      })
      .filter((x) => Number.isFinite(x.salary) && x.salary <= remainingBudget)
      .sort((a, b) => repNumber(a.p) - repNumber(b.p))
      .slice(0, need1);

    const base = [...strict, ...safetyAffordable];
    if (base.length >= MIN_REQUIRED) return base.slice(0, 40);

    const seen2 = new Set(base.map((x) => x.p.personId));
    const need2 = MIN_REQUIRED - base.length;

    const emergencyAny: Cand[] = getAllPool(activeRole)
      .filter((p) => !hiredSet.has(p.personId))
      .filter((p) => !seen2.has(p.personId))
      .map((p) => {
        const rep = repNumber(p);
        const exp = expectedSalary(activeRole as any, rep);
        const salary = offerSalary(exp, "LOW");
        return { p, exp, salary, safety: true, emergency: true };
      })
      .filter((x) => Number.isFinite(x.salary))
      .sort((a, b) => repNumber(a.p) - repNumber(b.p))
      .slice(0, need2);

    return [...base, ...emergencyAny].slice(0, 40);
  }, [activeRole, hiredSet, level, remainingBudget, roleAlreadyFilled, repCap]);

  const allFilled = ROLE_ORDER.every((role) => Boolean(state.assistantStaff[role.key]));

  const attemptHire = (personId: string, salary: number) => {
    if (!teamId) {
      setToast("No team selected yet.");
      setTimeout(() => setToast(null), 1200);
      return;
    }
    if (state.assistantStaff[activeRole]) {
      setToast("That role is already filled.");
      setTimeout(() => setToast(null), 1200);
      return;
    }
    if (!Number.isFinite(salary)) {
      setToast("Offer amount invalid.");
      setTimeout(() => setToast(null), 1200);
      return;
    }

    dispatch({ type: "HIRE_ASSISTANT", payload: { role: activeRole, personId, salary } });
    setToast("Offer sent.");
    setTimeout(() => setToast(null), 900);
  };

  const handleContinue = () => {
    if (!allFilled) return;
    dispatch({ type: "ADVANCE_CAREER_STAGE" });
  };

  return (
    <div className="space-y-4 overflow-x-hidden">
      {toast ? (
        <Card>
          <CardContent className="p-4 text-sm">{toast}</CardContent>
        </Card>
      ) : null}

      <HubPageCard
        title="Staff Construction"
        subtitle={
          <>
            Initial hiring pool is limited to coaches ≤ {repCap} reputation in {state.season}. Expands after year one.
          </>
        }
        right={
          <>
            <Badge variant="outline">Budget {money(state.staffBudget.total)}</Badge>
            <Badge variant="outline">Used {money(state.staffBudget.used)}</Badge>
            <Badge variant="secondary">Remaining {money(remainingBudget)}</Badge>
            <Badge variant="outline">Cash {money(state.teamFinances.cash)}</Badge>
            <Button onClick={handleContinue} disabled={!allFilled}>
              Continue →
            </Button>
          </>
        }
      >
        {!coordinatorsReady ? (
          <div className="mb-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-100">
            Hire OC/DC/STC first. Assistant roles unlock after coordinator hiring is complete.
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {ROLE_ORDER.map((r) => {
              const filled = Boolean(state.assistantStaff[r.key]);
              return (
                <Button
                  key={String(r.key)}
                  size="sm"
                  variant={activeRole === r.key ? "default" : "secondary"}
                  onClick={() => setActiveRole(r.key)}
                  disabled={filled}
                  title={filled ? "Role already filled" : ""}
                >
                  {r.label} {filled ? "✓" : ""}
                </Button>
              );
            })}
          </div>

          <div className="min-w-[220px]">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>Fair</span>
              <span>High</span>
            </div>
            <Slider value={[levelIdx]} min={0} max={2} step={1} onValueChange={(v) => setLevelIdx(v[0] ?? 1)} />
            <div className="mt-1 text-xs text-muted-foreground">Offer Level: {LEVEL_LABEL[level]}</div>
          </div>
        </div>

        <Separator className="my-3 bg-slate-300/15" />

        {roleAlreadyFilled ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              This role is filled. Pick another role to hire.
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-3">
          {candidates.map((c) => (
            <Card key={c.p.personId}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar entity={{ type: "personnel", id: String(c.p.personId), name: String(c.p.fullName ?? "Coach"), avatarUrl: c.p.avatarUrl }} size={44} />
                  <div className="space-y-1 min-w-0">
                    <div className="font-semibold truncate">{c.p.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      Rep {repNumber(c.p)} · Expected {money(c.exp)} {c.safety ? "· Safety" : ""} {c.emergency ? "· Emergency" : ""}
                    </div>
                  </div>
                </div>
                <Button onClick={() => attemptHire(c.p.personId, c.salary)}>Offer {money(c.salary)}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </HubPageCard>
    </div>
  );
}
