import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getPersonnelById, getPersonnelContract } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buyoutTotal, splitBuyout } from "@/engine/buyout";
import { Avatar } from "@/components/common/Avatar";

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

type StaffItem = { label: string; personId?: string };

export default function StaffManagement() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const [spreadSeasons, setSpreadSeasons] = useState<1 | 2>(2);

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
            <Button size="sm" variant={spreadSeasons === 1 ? "default" : "secondary"} onClick={() => setSpreadSeasons(1)}>
              Buyout: 1Y
            </Button>
            <Button size="sm" variant={spreadSeasons === 2 ? "default" : "secondary"} onClick={() => setSpreadSeasons(2)}>
              Buyout: 2Y
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          {rows.map((r) => (
            <div key={r.pid} className="border rounded-md px-3 py-2 flex items-center justify-between gap-3">
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
              <Button
                size="sm"
                variant="destructive"
                onClick={() => dispatch({ type: "FIRE_STAFF", payload: { personId: r.pid, roleLabel: r.label, spreadSeasons } })}
                disabled={spreadSeasons === 1 ? r.total > state.teamFinances.cash + 5_000_000 : (r.chunks[0] ?? 0) > state.teamFinances.cash + 5_000_000}
              >
                Fire
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
