import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { expectedSalary, offerSalary, type SalaryOfferLevel } from "@/engine/staffSalary";
import { getCoordinatorFreeAgents, getCoordinatorFreeAgentsAll, type PersonnelRow } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { HubShell } from "@/components/franchise-hub/HubShell";

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

const LEVELS: SalaryOfferLevel[] = ["LOW", "FAIR", "HIGH"];
const LEVEL_LABEL: Record<SalaryOfferLevel, string> = { LOW: "Low", FAIR: "Fair", HIGH: "High" };
const MIN_REQUIRED = 3;

type Cand = { p: PersonnelRow; exp: number; salary: number; safety: boolean; emergency: boolean };

export default function CoordinatorHiring() {
  const { state, dispatch } = useGame();
  const [role, setRole] = useState<"OC" | "DC" | "STC">("OC");
  const [levelIdx, setLevelIdx] = useState(1);

  const remainingBudget = state.staffBudget.total - state.staffBudget.used;

  const roleFilled =
    (role === "OC" && Boolean(state.staff.ocId)) ||
    (role === "DC" && Boolean(state.staff.dcId)) ||
    (role === "STC" && Boolean(state.staff.stcId));

  const hiredSet = useMemo(
    () =>
      new Set(
        [state.staff.ocId, state.staff.dcId, state.staff.stcId, ...Object.values(state.assistantStaff).filter(Boolean)].filter(Boolean) as string[]
      ),
    [state.staff, state.assistantStaff]
  );

  const level = LEVELS[levelIdx];

  const candidates = useMemo(() => {
    const strict: Cand[] = getCoordinatorFreeAgents(role)
      .filter((p) => !hiredSet.has(p.personId))
      .map((p) => {
        const exp = expectedSalary(role, Number(p.reputation ?? 60));
        const salary = offerSalary(exp, level);
        return { p, exp, salary, safety: false, emergency: false };
      })
      .filter((x) => x.salary <= remainingBudget)
      .sort((a, b) => Number(b.p.reputation ?? 0) - Number(a.p.reputation ?? 0));

    if (strict.length >= MIN_REQUIRED) return strict.slice(0, 30);

    const seen = new Set(strict.map((x) => x.p.personId));
    const need1 = MIN_REQUIRED - strict.length;

    const safetyAffordable: Cand[] = getCoordinatorFreeAgentsAll(role)
      .filter((p) => !hiredSet.has(p.personId))
      .filter((p) => !seen.has(p.personId))
      .map((p) => {
        const exp = expectedSalary(role, Number(p.reputation ?? 60));
        const salary = offerSalary(exp, level);
        return { p, exp, salary, safety: true, emergency: false };
      })
      .filter((x) => x.salary <= remainingBudget)
      .sort((a, b) => Number(a.p.reputation ?? 999) - Number(b.p.reputation ?? 999))
      .slice(0, need1);

    const base = [...strict, ...safetyAffordable];
    if (base.length >= MIN_REQUIRED) return base.slice(0, 30);

    const seen2 = new Set(base.map((x) => x.p.personId));
    const need2 = MIN_REQUIRED - base.length;

    const emergencyAny: Cand[] = getCoordinatorFreeAgentsAll(role)
      .filter((p) => !hiredSet.has(p.personId))
      .filter((p) => !seen2.has(p.personId))
      .map((p) => {
        const exp = expectedSalary(role, Number(p.reputation ?? 60));
        const salary = offerSalary(exp, "LOW");
        return { p, exp, salary, safety: true, emergency: true };
      })
      .sort((a, b) => Number(a.p.reputation ?? 999) - Number(b.p.reputation ?? 999))
      .slice(0, need2);

    return [...base, ...emergencyAny].slice(0, 30);
  }, [role, hiredSet, level, remainingBudget]);

  const hire = (personId: string, salary: number) => {
    if (roleFilled) return;
    dispatch({ type: "HIRE_STAFF", payload: { role, personId, salary } });
  };

  const wrapInShell = state.phase === "COORD_HIRING" && !location?.pathname?.startsWith?.("/hub/");

  const content = (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-2xl font-bold">Coordinator Hiring</div>
            <div className="text-sm text-muted-foreground">Pool backfills with safety and emergency options when needed.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">Budget {money(state.staffBudget.total)}</Badge>
            <Badge variant="outline">Used {money(state.staffBudget.used)}</Badge>
            <Badge variant="secondary">Remaining {money(remainingBudget)}</Badge>
            <Badge variant="outline">Cash {money(state.teamFinances.cash)}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={role === "OC" ? "default" : "secondary"}
              onClick={() => setRole("OC")}
              disabled={Boolean(state.staff.ocId)}
              title={state.staff.ocId ? "OC already hired" : ""}
            >
              OC
            </Button>
            <Button
              size="sm"
              variant={role === "DC" ? "default" : "secondary"}
              onClick={() => setRole("DC")}
              disabled={Boolean(state.staff.dcId)}
              title={state.staff.dcId ? "DC already hired" : ""}
            >
              DC
            </Button>
            <Button
              size="sm"
              variant={role === "STC" ? "default" : "secondary"}
              onClick={() => setRole("STC")}
              disabled={Boolean(state.staff.stcId)}
              title={state.staff.stcId ? "STC already hired" : ""}
            >
              STC
            </Button>
          </div>
          <div className="min-w-[220px]">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>Fair</span>
              <span>High</span>
            </div>
            <Slider value={[levelIdx]} min={0} max={2} step={1} onValueChange={(v) => setLevelIdx(v[0] ?? 1)} />
            <div className="text-xs text-muted-foreground mt-1">Offer: {LEVEL_LABEL[level]}</div>
            {roleFilled ? <div className="text-xs text-amber-300">Role already filled</div> : null}
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
                    {p.fullName} <span className="text-muted-foreground">({String(p.scheme ?? "-")})</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Rep {Number(p.reputation ?? 0)} · Expected {money(exp)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {safety ? <Badge variant="outline">{emergency ? "Emergency" : "Safety"}</Badge> : null}
                  <Button size="sm" variant="outline" onClick={() => hire(p.personId, salary)} disabled={roleFilled || salary > remainingBudget}>
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

  return wrapInShell ? <HubShell title="HIRE COORDINATORS">{content}</HubShell> : <div className="p-4 md:p-8">{content}</div>;
}

