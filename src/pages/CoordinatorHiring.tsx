import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { computeStaffAcceptance } from "@/engine/assistantHiring";
import { expectedSalary, offerQualityScore, offerSalary, type SalaryOfferLevel } from "@/engine/staffSalary";
import { getCoordinatorCandidates, getPersonnelById, type PersonnelRow } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

function normScheme(s?: unknown): string {
  return String(s ?? "").trim().toLowerCase();
}
function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
function money(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

const LEVELS: SalaryOfferLevel[] = ["LOW", "FAIR", "HIGH"];
const LEVEL_LABEL: Record<SalaryOfferLevel, string> = { LOW: "Low", FAIR: "Fair", HIGH: "High" };

export default function CoordinatorHiring() {
  const { state, dispatch } = useGame();
  const [role, setRole] = useState<"OC" | "DC" | "STC">("OC");
  const [levelIdx, setLevelIdx] = useState(1);

  const rep = state.coach.reputation;
  const teamOutlook = clamp100(45 + (state.acceptedOffer?.score ?? 0) * 40);

  const remainingBudget = state.staffBudget.total - state.staffBudget.used;

  const hiredSet = useMemo(
    () =>
      new Set(
        [state.staff.ocId, state.staff.dcId, state.staff.stcId, ...Object.values(state.assistantStaff).filter(Boolean)].filter(Boolean) as string[]
      ),
    [state.staff, state.assistantStaff]
  );

  const ocScheme = state.staff.ocId ? normScheme(getPersonnelById(state.staff.ocId)?.scheme) : "";
  const dcScheme = state.staff.dcId ? normScheme(getPersonnelById(state.staff.dcId)?.scheme) : "";
  const preferredSchemes = new Set([ocScheme, dcScheme].filter(Boolean));

  const focus = role === "OC" ? "OFF" : role === "DC" ? "DEF" : "ST";
  const level = LEVELS[levelIdx];

  const candidates = useMemo(() => {
    const raw = getCoordinatorCandidates(role).filter((p: PersonnelRow) => !hiredSet.has((p as any).personId));
    const pool = raw
      .map((p: PersonnelRow) => {
        const scheme = normScheme((p as any).scheme);
        const schemeCompat =
          preferredSchemes.size ? (Array.from(preferredSchemes).some((x) => scheme.includes(x) || x.includes(scheme)) ? 80 : 55) : 60;

        const exp = expectedSalary(role, Number((p as any).reputation ?? 55));
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
          roleFocus: focus as any,
          kind: "COORDINATOR",
        });

        return { p, acc, exp, salary };
      })
      .filter((x) => x.acc.accept)
      .filter((x) => x.salary <= remainingBudget)
      .sort((a, b) => Number((b.p as any).reputation ?? 0) - Number((a.p as any).reputation ?? 0))
      .slice(0, 18);

    return pool;
  }, [role, hiredSet, preferredSchemes, state.saveSeed, rep, teamOutlook, level, remainingBudget]);

  const hire = (personId: string, salary: number) => dispatch({ type: "HIRE_STAFF", payload: { role, personId, salary } });

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-2xl font-bold">Coordinator Hiring</div>
            <div className="text-sm text-muted-foreground">Interested candidates only. Salary offers impact acceptance.</div>
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
            <Button size="sm" variant={role === "OC" ? "default" : "secondary"} onClick={() => setRole("OC")}>
              OC
            </Button>
            <Button size="sm" variant={role === "DC" ? "default" : "secondary"} onClick={() => setRole("DC")}>
              DC
            </Button>
            <Button size="sm" variant={role === "STC" ? "default" : "secondary"} onClick={() => setRole("STC")}>
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
                    {(p as any).fullName} <span className="text-muted-foreground">({String((p as any).scheme ?? "-")})</span>
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
                  <Button size="sm" variant="outline" onClick={() => hire((p as any).personId, salary)} disabled={salary > remainingBudget}>
                    Offer {money(salary)}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No interested candidates for this role at this offer level.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
