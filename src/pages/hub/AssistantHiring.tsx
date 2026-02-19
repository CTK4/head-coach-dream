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
import { HubShell } from "@/components/franchise-hub/HubShell";

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
  const [levelIndex, setLevelIndex] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const remainingBudget = Math.max(0, state.staffBudget.total - state.staffBudget.used);
  const allFilled = useMemo(() => {
    const staff = state.staff;
    const required = ROLE_ORDER.filter((r) => r.key !== "assistantHcId");
    const filled = required.filter((r) => Boolean(staff[r.key as keyof typeof staff]));
    return filled.length >= MIN_REQUIRED;
  }, [state.staff]);

  const roleMeta = useMemo(() => ROLE_ORDER.find((r) => r.key === activeRole)!, [activeRole]);
  const level = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, levelIndex))];

  const candidates: Cand[] = useMemo(() => {
    const teamId = state.acceptedOffer?.teamId;

    const all =
      roleMeta.key === "assistantHcId"
        ? getAssistantHeadCoachCandidatesAll(state, teamId)
        : getPositionCoachCandidatesAll(state, roleMeta.role, teamId);

    const baseList =
      roleMeta.key === "assistantHcId"
        ? getAssistantHeadCoachCandidates(state, teamId)
        : getPositionCoachCandidates(state, roleMeta.role, teamId);

    const source = baseList.length ? baseList : all;

    return source.map((p) => {
      const exp = expectedSalary(p, roleMeta.focus);
      const salary = offerSalary(exp, level);
      return { p, exp, salary, safety: Boolean((p as any).safety), emergency: Boolean((p as any).emergency) };
    });
  }, [state, roleMeta, level]);

  function handleContinue() {
    if (!allFilled) {
      setToast("Fill at least 3 key position coaches before continuing.");
      return;
    }
    dispatch({ type: "ADVANCE_CAREER_STAGE" });
    setToast("Staff phase complete.");
  }

  function handleSelectRole(role: keyof AssistantStaff) {
    setSelectedId(null);
    setActiveRole(role);
  }

  function handleOffer(personId: string) {
    const c = candidates.find((x) => x.p.personId === personId);
    if (!c) return;

    if (c.salary > remainingBudget) {
      setToast("Insufficient staff budget for that offer.");
      return;
    }

    dispatch({
      type: "MAKE_STAFF_OFFER",
      payload: { roleKey: activeRole, personId, salary: c.salary },
    });
    setToast(`Offer submitted: ${c.p.name} (${money(c.salary)})`);
  }

  return (
    <HubShell title="HIRE STAFF">
      <div className="space-y-4">
        {toast ? (
          <Card className="border-slate-300/15 bg-slate-950/35">
            <CardContent className="p-4 text-sm text-slate-100">{toast}</CardContent>
          </Card>
        ) : null}

        <Card className="border-slate-300/15 bg-slate-950/35">
          <CardContent className="p-6 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-100">Staff Construction</div>
              <div className="text-sm text-slate-200/70">Pool backfills with safety and emergency options when needed.</div>
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

        <Card className="border-slate-300/15 bg-slate-950/35">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-100">Role</div>
              <div className="text-xs text-slate-200/70">Select a role to review candidates.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ROLE_ORDER.map((r) => (
                <Button
                  key={r.key}
                  variant={activeRole === r.key ? "default" : "secondary"}
                  className={activeRole === r.key ? "bg-emerald-700 hover:bg-emerald-700/90" : ""}
                  onClick={() => handleSelectRole(r.key)}
                >
                  {r.label} {Boolean((state.staff as any)[r.key]) ? "✓" : ""}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-300/15 bg-slate-950/35">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-100">Offer Level: {LEVEL_LABEL[level]}</div>
              <Slider value={[levelIndex]} min={0} max={2} step={1} onValueChange={(v) => setLevelIndex(v[0] ?? 1)} />
            </div>

            <div className="space-y-2">
              {candidates.map((c) => (
                <button
                  key={c.p.personId}
                  type="button"
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedId === c.p.personId
                      ? "border-emerald-400/50 bg-emerald-900/20"
                      : "border-slate-300/15 bg-slate-950/20 hover:bg-slate-950/35"
                  }`}
                  onClick={() => setSelectedId(c.p.personId)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-100">{c.p.name}</div>
                      <div className="text-xs text-slate-200/70">
                        Rep {(c.p as any).rep ?? "—"} · Expected {money(c.exp)}
                      </div>
                    </div>
                    <Button onClick={(e) => (e.preventDefault(), handleOffer(c.p.personId))} className="shrink-0">
                      Offer {money(c.salary)}
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </HubShell>
  );
}
