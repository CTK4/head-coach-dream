import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getPersonnelById, getPersonnelContract, getTeamRosterPlayers } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buyoutTotal, splitBuyout } from "@/engine/buyout";
import { Avatar } from "@/components/common/Avatar";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { COACH_TRAITS, type CoachProfile } from "@/data/coachTraits";
import { coachAttrModifier, coachFitScore } from "@/engine/coachImpact";

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

function pct(n: number) {
  return `${n >= 0 ? "+" : ""}${Math.round(n * 100)}%`;
}

type StaffItem = { label: string; personId?: string };

const CANDIDATE_ROLES: CoachProfile["role"][] = ["OC", "DC", "QB_COACH", "WR_COACH", "OL_COACH", "RB_COACH", "LB_COACH", "DB_COACH", "DL_COACH", "ST_COACH"];

export default function StaffManagement() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const [spreadSeasons, setSpreadSeasons] = useState<1 | 2>(2);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
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

  const candidateCoaches = useMemo<CoachProfile[]>(() => {
    return CANDIDATE_ROLES.map((role, idx) => ({
      coachId: `candidate_${role}_${idx}`,
      name: `${role.replace("_", " ")} Candidate ${idx + 1}`,
      role,
      traits: [COACH_TRAITS[idx % COACH_TRAITS.length], COACH_TRAITS[(idx + 5) % COACH_TRAITS.length]],
      tenureYears: 0,
      salary: 1_500_000 + idx * 250_000,
    }));
  }, []);

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

      <Card>
        <CardHeader>
          <CardTitle>Coach Candidates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {candidateCoaches.map((coach) => {
            const fit = coachFitScore(coach, rosterAvgAttrs);
            const fitClass = fit >= 70 ? "bg-green-100 text-green-800" : fit >= 40 ? "bg-yellow-100 text-yellow-900" : "bg-red-100 text-red-800";
            return (
              <div key={coach.coachId} className="rounded-md border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{coach.name}</div>
                    <div className="text-xs text-muted-foreground">{coach.role} · {money(coach.salary)}</div>
                  </div>
                  <Badge className={fitClass}>Fit {fit}</Badge>
                </div>

                {coach.traits.map((trait) => {
                  const boosted = Object.keys(trait.affinityMap).filter((k) => trait.affinityMap[k] === 1);
                  const neglected = Object.keys(trait.affinityMap).filter((k) => trait.affinityMap[k] === -1);
                  return (
                    <div key={trait.id} className="rounded border p-2">
                      <div className="text-sm font-medium">{trait.label}</div>
                      <div className="text-xs text-muted-foreground mb-2">{trait.description}</div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="font-semibold mb-1">Boosted Attributes</div>
                          {boosted.map((attr) => (
                            <div key={attr} className="flex justify-between"><span>{attr}</span><span>{pct(coachAttrModifier(coach, attr))}</span></div>
                          ))}
                        </div>
                        <div>
                          <div className="font-semibold mb-1">Neglected Attributes</div>
                          {neglected.map((attr) => (
                            <div key={attr} className="flex justify-between"><span>{attr}</span><span>{pct(coachAttrModifier(coach, attr))}</span></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button
                  size="sm"
                  onClick={() => dispatch({ type: "HIRE_COACH", payload: { coach } })}
                  disabled={state.staffRoster.coaches.some((existing) => existing.role === coach.role)}
                >
                  Hire Coach
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          {rows.map((r) => (
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
          ))}
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
