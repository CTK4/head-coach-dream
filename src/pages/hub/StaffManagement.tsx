import { useMemo, useState } from "react";
import { useGame, type AssistantStaff } from "@/context/GameContext";
import {
  getPersonnelById,
  getPersonnelContract,
  getTeamRosterPlayers,
  getCoordinatorFreeAgentsAll,
  getPositionCoachCandidatesAll,
  type PersonnelRow,
  type PositionCoachRole,
} from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buyoutTotal, splitBuyout } from "@/engine/buyout";
import { Avatar } from "@/components/common/Avatar";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

type StaffItem = { label: string; personId?: string };

// Role → display label
const COORD_LABELS: Record<"OC" | "DC" | "STC", string> = {
  OC: "Offensive Coordinator",
  DC: "Defensive Coordinator",
  STC: "Special Teams Coordinator",
};

// Position coach role → AssistantStaff key
const ROLE_TO_ASSISTANT_KEY: Record<string, keyof AssistantStaff> = {
  QB_COACH: "qbCoachId",
  WR_COACH: "wrCoachId",
  OL_COACH: "olCoachId",
  RB_COACH: "rbCoachId",
  LB_COACH: "lbCoachId",
  DB_COACH: "dbCoachId",
  DL_COACH: "dlCoachId",
};

// Position coach role → display label
const POS_COACH_LABELS: Partial<Record<PositionCoachRole, string>> = {
  QB_COACH: "QB Coach",
  WR_COACH: "WR Coach",
  OL_COACH: "OL Coach",
  RB_COACH: "RB Coach",
  LB_COACH: "LB Coach",
  DB_COACH: "DB Coach",
  DL_COACH: "DL Coach",
};

const POS_COACH_ROLES: PositionCoachRole[] = [
  "QB_COACH", "WR_COACH", "OL_COACH", "RB_COACH", "LB_COACH", "DB_COACH", "DL_COACH",
];

function repTier(rep: number): string {
  if (rep >= 80) return "Elite";
  if (rep >= 60) return "High";
  if (rep >= 40) return "Mid";
  return "Developing";
}

function CandidateCard({
  person,
  label,
  alreadyHired,
  onHire,
}: {
  person: PersonnelRow;
  label: string;
  alreadyHired: boolean;
  onHire: () => void;
}) {
  const rep = Number(person.reputation ?? 0);
  const salary = Number(person.salary ?? 1_200_000);
  const scheme = String(person.scheme ?? person.systemId ?? "—");

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-medium">{person.fullName}</div>
          <div className="text-xs text-muted-foreground">
            {label} · {money(salary)} · Scheme: {scheme}
          </div>
        </div>
        <Badge variant={rep >= 60 ? "default" : rep >= 40 ? "secondary" : "outline"}>
          Rep {rep} ({repTier(rep)})
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="font-semibold text-slate-200">Coaching Impact</div>
        {rep >= 60 ? (
          <div className="text-green-400">+ Proven track record — players respond well to structured discipline</div>
        ) : rep >= 40 ? (
          <div className="text-yellow-400">~ Adequate experience but scheme adaptation may take time</div>
        ) : (
          <div className="text-red-400">- Limited resume; development upside but short-term risk</div>
        )}
      </div>
      <Button
        size="sm"
        onClick={onHire}
        disabled={alreadyHired}
      >
        {alreadyHired ? "Already Hired" : "Hire"}
      </Button>
    </div>
  );
}

export default function StaffManagement() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const [spreadSeasons, setSpreadSeasons] = useState<1 | 2>(2);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [showCoords, setShowCoords] = useState(true);
  const [showPosCoaches, setShowPosCoaches] = useState(true);
  const isMobile = useIsMobile();

  const rosterAvgAttrs = useMemo(() => {
    const players = getTeamRosterPlayers(teamId);
    const sums: Record<string, number> = {};
    let count = 0;
    for (const p of players) {
      count += 1;
      for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
        if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 99) {
          sums[k] = (sums[k] ?? 0) + v;
        }
      }
    }
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(sums)) out[k] = count ? v / count : 0;
    return out;
  }, [teamId]);

  // Real coordinator candidates from leagueDb
  const coordCandidates = useMemo(() => ({
    OC: state.staff.ocId ? [] : getCoordinatorFreeAgentsAll("OC"),
    DC: state.staff.dcId ? [] : getCoordinatorFreeAgentsAll("DC"),
    STC: state.staff.stcId ? [] : getCoordinatorFreeAgentsAll("STC"),
  }), [state.staff.ocId, state.staff.dcId, state.staff.stcId]);

  // Real position coach candidates from leagueDb
  const posCandidates = useMemo(() => {
    const result: Partial<Record<PositionCoachRole, PersonnelRow[]>> = {};
    for (const role of POS_COACH_ROLES) {
      const key = ROLE_TO_ASSISTANT_KEY[role];
      result[role] = state.assistantStaff[key] ? [] : getPositionCoachCandidatesAll(role);
    }
    return result;
  }, [state.assistantStaff]);

  const staffItems: StaffItem[] = [
    { label: "Offensive Coordinator", personId: state.staff.ocId },
    { label: "Defensive Coordinator", personId: state.staff.dcId },
    { label: "Special Teams Coordinator", personId: state.staff.stcId },
    { label: "Assistant Head Coach", personId: state.assistantStaff.assistantHcId },
    { label: "QB Coach", personId: state.assistantStaff.qbCoachId },
    { label: "OL Coach", personId: state.assistantStaff.olCoachId },
    { label: "RB Coach", personId: state.assistantStaff.rbCoachId },
    { label: "WR Coach", personId: state.assistantStaff.wrCoachId },
    { label: "DL Coach", personId: state.assistantStaff.dlCoachId },
    { label: "LB Coach", personId: state.assistantStaff.lbCoachId },
    { label: "DB Coach", personId: state.assistantStaff.dbCoachId },
  ];

  const rows = useMemo(() => {
    return staffItems
      .filter((s) => !!s.personId)
      .map((s) => {
        const pid = String(s.personId);
        const p = getPersonnelById(pid);
        const c = getPersonnelContract(pid);
        const salary = state.staffBudget.byPersonId[pid] ?? Number(c?.salaryY1 ?? 0);
        const remainingYears = c?.endSeason != null ? Math.max(0, Number(c.endSeason) - state.season) + 1 : 1;
        const total = buyoutTotal(salary, remainingYears, 0.6);
        const chunks = splitBuyout(total, spreadSeasons);
        return {
          ...s,
          pid,
          name: String(p?.fullName ?? "Coach"),
          rep: Number(p?.reputation ?? 0),
          avatarUrl: p?.avatarUrl,
          salary,
          remainingYears,
          total,
          chunks,
        };
      });
  }, [state.staffBudget.byPersonId, state.season, state.staff, state.assistantStaff, spreadSeasons]);

  const remainingBudget = state.staffBudget.total - state.staffBudget.used;
  const selectedStaff = rows.find((row) => row.pid === selectedStaffId) ?? null;

  const staffDetails = selectedStaff ? (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <Avatar entity={{ type: "personnel", id: selectedStaff.pid, name: selectedStaff.name, avatarUrl: selectedStaff.avatarUrl }} size={48} />
        <div>
          <div className="font-semibold">{selectedStaff.name}</div>
          <div className="text-sm text-muted-foreground">{selectedStaff.label}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-muted-foreground">Reputation</div><div className="text-right font-medium">{selectedStaff.rep}</div>
        <div className="text-muted-foreground">Salary</div><div className="text-right font-medium">{money(selectedStaff.salary)}</div>
        <div className="text-muted-foreground">Remaining</div><div className="text-right font-medium">{selectedStaff.remainingYears}y</div>
        <div className="text-muted-foreground">Buyout</div><div className="text-right font-medium">{money(selectedStaff.total)}</div>
      </div>
      <Button variant="outline" className="w-full min-h-11" onClick={() => setSelectedStaffId(null)}>Close</Button>
    </div>
  ) : null;

  const dueThisSeason = state.buyouts.bySeason[state.season] ?? 0;
  const dueNextSeason = state.buyouts.bySeason[state.season + 1] ?? 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Staff Management</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">Approval {state.owner.approval}</Badge>
            <Badge variant="outline">Cash {money(state.teamFinances.cash)}</Badge>
            <Badge variant="outline">Staff Budget {money(state.staffBudget.total)}</Badge>
            <Badge variant="outline">Used {money(state.staffBudget.used)}</Badge>
            <Badge variant="secondary">Remaining {money(remainingBudget)}</Badge>
            <Badge variant="outline">Buyouts Y{state.season} {money(dueThisSeason)}</Badge>
            <Badge variant="outline">Buyouts Y{state.season + 1} {money(dueNextSeason)}</Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="min-h-11" variant={spreadSeasons === 1 ? "default" : "secondary"} onClick={() => setSpreadSeasons(1)}>
              Buyout: 1Y
            </Button>
            <Button size="sm" className="min-h-11" variant={spreadSeasons === 2 ? "default" : "secondary"} onClick={() => setSpreadSeasons(2)}>
              Buyout: 2Y
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Coordinator Candidates ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Coordinator Candidates</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setShowCoords((v) => !v)}>
              {showCoords ? "Hide" : "Show"}
            </Button>
          </div>
        </CardHeader>
        {showCoords ? (
          <CardContent className="space-y-4 p-4">
            {(["OC", "DC", "STC"] as const).map((role) => {
              const candidates = coordCandidates[role];
              const alreadyHired = !!(role === "OC" ? state.staff.ocId : role === "DC" ? state.staff.dcId : state.staff.stcId);
              return (
                <div key={role}>
                  <div className="text-sm font-semibold text-slate-200 mb-2">
                    {COORD_LABELS[role]}{alreadyHired ? " ✓ Filled" : ""}
                  </div>
                  {alreadyHired ? null : candidates.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No candidates available in database.</div>
                  ) : (
                    <div className="space-y-2">
                      {candidates.slice(0, 4).map((person) => (
                        <CandidateCard
                          key={person.personId}
                          person={person}
                          label={COORD_LABELS[role]}
                          alreadyHired={alreadyHired}
                          onHire={() =>
                            dispatch({
                              type: "HIRE_STAFF",
                              payload: { role, personId: person.personId, salary: Math.max(500_000, Number(person.salary ?? 1_500_000)) },
                            })
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        ) : null}
      </Card>

      {/* ── Position Coach Candidates ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Position Coach Candidates</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setShowPosCoaches((v) => !v)}>
              {showPosCoaches ? "Hide" : "Show"}
            </Button>
          </div>
        </CardHeader>
        {showPosCoaches ? (
          <CardContent className="space-y-4 p-4">
            {POS_COACH_ROLES.map((role) => {
              const key = ROLE_TO_ASSISTANT_KEY[role];
              const alreadyHired = !!state.assistantStaff[key];
              const candidates = posCandidates[role] ?? [];
              const label = POS_COACH_LABELS[role] ?? role;
              return (
                <div key={role}>
                  <div className="text-sm font-semibold text-slate-200 mb-2">
                    {label}{alreadyHired ? " ✓ Filled" : ""}
                  </div>
                  {alreadyHired ? null : candidates.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No candidates available in database.</div>
                  ) : (
                    <div className="space-y-2">
                      {candidates.slice(0, 3).map((person) => (
                        <CandidateCard
                          key={person.personId}
                          person={person}
                          label={label}
                          alreadyHired={alreadyHired}
                          onHire={() =>
                            dispatch({
                              type: "HIRE_ASSISTANT",
                              payload: { role: key, personId: person.personId, salary: Math.max(300_000, Number(person.salary ?? 1_000_000)) },
                            })
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        ) : null}
      </Card>

      {/* ── Current Staff ── */}
      <Card>
        <CardHeader><CardTitle>Current Staff</CardTitle></CardHeader>
        <CardContent className="p-4 space-y-2">
          {rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">No staff hired yet.</div>
          ) : (
            rows.map((r) => (
              <div
                key={r.pid}
                onClick={() => navigate(`/coachs-office/staff/${r.pid}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/coachs-office/staff/${r.pid}`);
                  }
                }}
                role="button"
                tabIndex={0}
                className="w-full border rounded-md px-3 py-2 flex items-center justify-between gap-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <Avatar entity={{ type: "personnel", id: r.pid, name: r.name, avatarUrl: r.avatarUrl }} size={40} />
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {r.name} <span className="text-muted-foreground">— {r.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Rep {r.rep} · Salary {money(r.salary)} · Remaining {r.remainingYears}y · Buyout {money(r.total)} ({r.chunks.map(money).join(" + ")})
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="min-h-11" onClick={() => setSelectedStaffId(r.pid)}>Profile</Button>
                  <Button
                    size="sm" className="min-h-11"
                    variant="destructive"
                    onClick={(event) => {
                      event.stopPropagation();
                      dispatch({ type: "FIRE_STAFF", payload: { personId: r.pid, roleLabel: r.label, spreadSeasons } });
                    }}
                    disabled={spreadSeasons === 1 ? r.total > state.teamFinances.cash + 5_000_000 : (r.chunks[0] ?? 0) > state.teamFinances.cash + 5_000_000}
                  >
                    Fire
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {isMobile ? (
        <Sheet open={Boolean(selectedStaff)} onOpenChange={(open) => { if (!open) setSelectedStaffId(null); }}>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-0">
            <SheetHeader className="p-4 pb-0"><SheetTitle>Staff Profile</SheetTitle></SheetHeader>
            {staffDetails}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={Boolean(selectedStaff)} onOpenChange={(open) => { if (!open) setSelectedStaffId(null); }}>
          <DialogContent className="max-w-md p-0">
            <DialogHeader className="p-4 pb-0"><DialogTitle>Staff Profile</DialogTitle></DialogHeader>
            {staffDetails}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
