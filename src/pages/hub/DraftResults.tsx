import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DraftResults() {
  const { state, dispatch } = useGame();
  const nav = useNavigate();

  const userTeamId = String(state.acceptedOffer?.teamId ?? "");

  const byTeam = useMemo(() => {
    const map: Record<string, typeof state.draft.leaguePicks> = {};
    for (const p of state.draft.leaguePicks) {
      (map[p.teamId] ??= []).push(p);
    }
    for (const k of Object.keys(map)) map[k].sort((a, b) => a.overall - b.overall);
    return map;
  }, [state.draft.leaguePicks]);

  const rookById = useMemo(() => {
    const m: Record<string, any> = {};
    for (const r of state.rookies) m[String(r.playerId)] = r;
    return m;
  }, [state.rookies]);

  const my = byTeam[userTeamId] ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Draft Results</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Picks {state.draft.leaguePicks.length}</Badge>
            <Button variant="outline" onClick={() => nav("/hub/draft")}>Back</Button>
            <Button
              onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })}
              disabled={!state.draft.completed}
            >
              Continue →
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Displayed OVR/DEV on rookies is your current scouting estimate (confidence-based).
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Your Draft Class</CardTitle></CardHeader>
          <CardContent>
            {my.length ? (
              <div className="space-y-2">
                {my.map((p) => {
                  const r = rookById[p.rookiePlayerId];
                  return (
                    <div key={p.overall} className="border rounded-md p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          R{p.round} #{p.pickInRound} · {r?.name ?? p.prospectId} <span className="text-muted-foreground">({r?.pos ?? "UNK"})</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Scout: OVR {r?.scoutOvr ?? "—"} · DEV {r?.scoutDev ?? "—"} · Conf {r?.scoutConf ?? "—"}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Badge variant="outline">Pick {p.overall}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No picks yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>League Draft</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[650px] pr-2">
              <div className="space-y-2">
                {Object.entries(byTeam)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([teamId, picks]) => (
                    <div key={teamId} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">
                          {teamId} {teamId === userTeamId ? <span className="text-muted-foreground">(You)</span> : null}
                        </div>
                        <Badge variant="outline">{picks.length}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        {picks.map((p) => {
                          const r = rookById[p.rookiePlayerId];
                          return (
                            <div key={p.overall} className="flex items-center justify-between gap-2">
                              <div className="min-w-0 truncate">
                                R{p.round}#{p.pickInRound} · {r?.name ?? p.prospectId} <span className="text-muted-foreground">({r?.pos ?? "UNK"})</span>
                              </div>
                              <div className="text-muted-foreground text-xs shrink-0">
                                OVR {r?.scoutOvr ?? "—"} · Conf {r?.scoutConf ?? "—"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
