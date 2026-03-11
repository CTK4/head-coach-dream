import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPositionLabel } from "@/lib/displayLabels";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { getUserTeamId } from "@/lib/userTeam";

export default function CutDowns() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const decisions = state.offseasonData.cutDowns.decisions;

  const teamId = getUserTeamId(state) ?? state.acceptedOffer?.teamId ?? "";

  const roster = useMemo(() => {
    if (!teamId) return [];
    return getEffectivePlayersByTeam(state, String(teamId))
      .slice()
      .sort((a: any, b: any) => {
        const posOrder = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "K", "P"];
        const pa = posOrder.indexOf(String(a.pos ?? "").toUpperCase());
        const pb = posOrder.indexOf(String(b.pos ?? "").toUpperCase());
        if (pa !== pb) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
        return Number(b.overall ?? b.ovr ?? 0) - Number(a.overall ?? a.ovr ?? 0);
      });
  }, [state, teamId]);

  const keptCount = useMemo(() => {
    const cut = new Set(
      Object.entries(decisions)
        .filter(([, d]) => d.keep === false)
        .map(([id]) => id),
    );
    return roster.filter((p: any) => !cut.has(String(p.playerId))).length;
  }, [roster, decisions]);

  const toggle = (id: string) => dispatch({ type: "CUT_TOGGLE", payload: { playerId: id } });

  const completeStep = () => {
    // Apply staged cuts to the ledger before marking the step complete.
    const cutIds = Object.entries(decisions)
      .filter(([, d]) => d.keep === false)
      .map(([id]) => id);
    for (const playerId of cutIds) {
      dispatch({
        type: "CUT_APPLY",
        payload: { teamId: String(teamId), playerId, designation: "PRE_JUNE_1" },
      });
    }
    dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "CUT_DOWNS" } });
  };

  const enterWeek1 = () => {
    if (!state.offseason.stepsComplete.CUT_DOWNS) return;
    navigate("/hub/regular-season");
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xl font-bold">Final Cut Downs</div>
            <div className="text-sm text-muted-foreground">Cut to 53 — toggle players below.</div>
          </div>
          <Badge variant="outline">Step 9</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Roster size: <span className="font-medium">{keptCount}</span> / 53
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={completeStep} disabled={keptCount !== 53}>
              Complete Step
            </Button>
            <Button onClick={enterWeek1} disabled={!state.offseason.stepsComplete.CUT_DOWNS || keptCount !== 53}>
              Enter Week 1 →
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Roster</div>
            <Badge variant="outline">{roster.length}</Badge>
          </div>
          <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
            {roster.map((p: any) => {
              const pid = String(p.playerId);
              const keep = decisions[pid]?.keep !== false;
              return (
                <div key={pid} className="border rounded-md px-3 py-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {p.name ?? p.fullName ?? "Player"}{" "}
                      <span className="text-muted-foreground">({getPositionLabel(String(p.pos ?? ""))})</span>
                    </div>
                    <div className="text-xs text-muted-foreground">OVR {Number(p.overall ?? p.ovr ?? 0)}</div>
                  </div>
                  <Button size="sm" variant={keep ? "outline" : "default"} onClick={() => toggle(pid)}>
                    {keep ? "Cut" : "Keep"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}