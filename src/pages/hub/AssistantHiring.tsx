import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { stageToRoute } from "@/components/franchise-hub/stageRouting";

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
  const navigate = useNavigate();
  const teamId = resolveUserTeamId(state);
  const coordinatorsReady = !!(state.staff?.ocId && state.staff?.dcId && state.staff?.stcId);

  const firstUnfilled = useMemo(
    () => ROLE_ORDER.find((r) => !state.assistantStaff[r.key])?.key ?? "assistantHcId",
    [state.assistantStaff]
  );

  const [activeRole, setActiveRole] = useState<keyof AssistantStaff>(firstUnfilled);
  const [toast, setToast] = useState<string | null>(null);
  const [levelIdx, setLevelIdx] = useState(1);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [offerYears, setOfferYears] = useState(2);
  const [offerSalaryValue, setOfferSalaryValue] = useState(0);

  useEffect(() => {
    if (state.assistantStaff[activeRole]) setActiveRole(firstUnfilled);
  }, [activeRole, firstUnfilled, state.assistantStaff]);

  useEffect(() => {
    if (state.uiToast) {
      setToast(state.uiToast);
      const t = setTimeout(() => setToast(null), 1700);
      return () => clearTimeout(t);
    }
  }, [state.uiToast]);

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

  const latestOfferByPerson = useMemo(() => {
    const byPerson: Record<string, (typeof state.staffOffers)[number]> = {};
    for (const offer of state.staffOffers) {
      if (offer.roleType !== "ASSISTANT") continue;
      if (!byPerson[offer.personId]) byPerson[offer.personId] = offer;
    }
    return byPerson;
  }, [state.staffOffers]);

  const allFilled = ROLE_ORDER.every((role) => Boolean(state.assistantStaff[role.key]));

  const openOfferEditor = (candidate: Cand) => {
    setEditingCandidateId(candidate.p.personId);
    setOfferYears(2);
    setOfferSalaryValue(candidate.salary);
  };

  const submitOffer = (personId: string) => {
    if (!teamId) {
      setToast("No team selected yet.");
      return;
    }
    if (state.assistantStaff[activeRole]) {
      setToast("That role is already filled.");
      return;
    }

    dispatch({
      type: "CREATE_STAFF_OFFER",
      payload: { roleType: "ASSISTANT", role: activeRole, personId, years: offerYears, salary: offerSalaryValue },
    });
    setEditingCandidateId(null);
  };

  const handleContinue = () => {
    if (!allFilled) return;
    dispatch({ type: "ADVANCE_CAREER_STAGE" });
    navigate(stageToRoute("ROSTER_REVIEW"));
  };

  return (
    <div className="space-y-4 overflow-x-hidden">
      {toast ? (
        <Card>
          <CardContent className="p-4 text-sm">{toast}</CardContent>
        </Card>
      ) : null}

      {allFilled ? (
        <Card>
          <CardContent className="p-4 text-sm flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Ready to Advance</div>
              <div className="text-muted-foreground text-xs">Next phase: Roster Review</div>
            </div>
            <Button onClick={handleContinue}>Continue →</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Fill all assistant roles to unlock <span className="font-semibold text-slate-200">Roster Review</span>.
          </CardContent>
        </Card>
      )}

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
            <div className="text-xs text-muted-foreground">Counter-offers are not interactive yet (stubbed for a future update).</div>
          </div>
        </div>

        <Separator className="my-3 bg-slate-300/15" />

        {roleAlreadyFilled ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">This role is filled. Pick another role to hire.</CardContent>
          </Card>
        ) : null}

        <div className="space-y-3">
          {candidates.map((c) => {
            const latest = latestOfferByPerson[c.p.personId];
            const isEditing = editingCandidateId === c.p.personId;
            return (
              <Card key={c.p.personId}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar entity={{ type: "personnel", id: String(c.p.personId), name: String(c.p.fullName ?? "Coach"), avatarUrl: c.p.avatarUrl }} size={44} />
                      <div className="space-y-1 min-w-0">
                        <div className="font-semibold truncate">{c.p.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          Rep {repNumber(c.p)} · Suggested {money(c.salary)} · Expected {money(c.exp)} {c.safety ? "· Safety" : ""} {c.emergency ? "· Emergency" : ""}
                        </div>
                        {latest?.status === "REJECTED" ? <div className="text-xs text-amber-300">{latest.reason}</div> : null}
                      </div>
                    </div>
                    <Button onClick={() => openOfferEditor(c)} disabled={roleAlreadyFilled}>
                      Create Offer
                    </Button>
                  </div>

                  {isEditing ? (
                    <div className="flex flex-wrap items-end gap-2 border-t border-slate-400/20 pt-3">
                      <label className="text-xs text-muted-foreground">
                        Years
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={offerYears}
                          onChange={(e) => setOfferYears(Number(e.target.value) || 1)}
                          className="mt-1 w-20 rounded border border-slate-400/30 bg-transparent px-2 py-1 text-sm"
                        />
                      </label>
                      <label className="text-xs text-muted-foreground">
                        Salary (annual, $M)
                        <input
                          type="number"
                          min={0.1}
                          step={0.05}
                          value={(offerSalaryValue / 1_000_000).toFixed(2)}
                          onChange={(e) => setOfferSalaryValue(Math.round((Number(e.target.value) || 0) * 1_000_000))}
                          className="mt-1 w-32 rounded border border-slate-400/30 bg-transparent px-2 py-1 text-sm"
                        />
                      </label>
                      <Button size="sm" onClick={() => submitOffer(c.p.personId)} disabled={offerSalaryValue <= 0}>
                        Submit Offer
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCandidateId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </HubPageCard>
    </div>
  );
}
