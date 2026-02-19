import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import MedicalIcon from "/badges/Medical.svg";

function chipColorForMedical(level: string) {
  if (level === "GREEN") return "bg-emerald-500/20 text-emerald-200 border-emerald-500/25";
  if (level === "YELLOW") return "bg-yellow-500/20 text-yellow-200 border-yellow-500/25";
  if (level === "ORANGE") return "bg-orange-500/20 text-orange-200 border-orange-500/25";
  if (level === "RED") return "bg-red-500/20 text-red-200 border-red-500/25";
  return "bg-zinc-200/10 text-zinc-200 border-zinc-200/20";
}
function chipColorForCharacter(level: string) {
  if (level === "BLUE") return "bg-blue-500/20 text-blue-200 border-blue-500/25";
  if (level === "GREEN") return "bg-emerald-500/20 text-emerald-200 border-emerald-500/25";
  if (level === "YELLOW") return "bg-yellow-500/20 text-yellow-200 border-yellow-500/25";
  if (level === "ORANGE") return "bg-orange-500/20 text-orange-200 border-orange-500/25";
  if (level === "RED") return "bg-red-500/20 text-red-200 border-red-500/25";
  return "bg-zinc-200/10 text-zinc-200 border-zinc-200/20";
}
function FlagChip({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 border rounded-md px-2 py-0.5 text-[11px] ${className}`}>{children}</span>;
}

export default function DraftResults() {
  const { state, dispatch } = useGame();
  const nav = useNavigate();

  const userTeamId = String(state.acceptedOffer?.teamId ?? "");
  const reveals = state.offseasonData.preDraft.reveals;

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
            <Button onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })} disabled={!state.draft.completed}>Continue →</Button>
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
                  const rev = reveals[p.prospectId];
                  return (
                    <div key={p.overall} className="border rounded-md p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          R{p.round} #{p.pickInRound} · {r?.name ?? p.prospectId} <span className="text-muted-foreground">({r?.pos ?? "UNK"})</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Scout: OVR {r?.scoutOvr ?? "—"} · DEV {r?.scoutDev ?? "—"} · Conf {r?.scoutConf ?? "—"}
                        </div>
                        {rev ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {rev.medicalLevel ? <FlagChip className={chipColorForMedical(rev.medicalLevel)}><img src={MedicalIcon} className="h-3 w-3 opacity-90" alt="Medical" />{rev.medicalLevel}</FlagChip> : null}
                            {rev.characterLevel ? <FlagChip className={chipColorForCharacter(rev.characterLevel)}>CHAR {rev.characterLevel}</FlagChip> : null}
                            {rev.symbols?.length ? <FlagChip className="bg-white/5 text-zinc-200 border-white/10">{rev.symbols.join(" ")}</FlagChip> : null}
                            {rev.footballTags?.includes("Gold: 1st") ? <FlagChip className="bg-yellow-500/15 text-yellow-100 border-yellow-500/20">Gold</FlagChip> : null}
                            {rev.footballTags?.includes("Purple: Elite Trait") ? <FlagChip className="bg-purple-500/15 text-purple-100 border-purple-500/20">Purple</FlagChip> : null}
                          </div>
                        ) : null}
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
                        <div className="font-semibold">{teamId} {teamId === userTeamId ? <span className="text-muted-foreground">(You)</span> : null}</div>
                        <Badge variant="outline">{picks.length}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        {picks.map((p) => {
                          const r = rookById[p.rookiePlayerId];
                          return (
                            <div key={p.overall} className="flex items-center justify-between gap-2">
                              <div className="min-w-0 truncate">R{p.round}#{p.pickInRound} · {r?.name ?? p.prospectId} <span className="text-muted-foreground">({r?.pos ?? "UNK"})</span></div>
                              <div className="text-muted-foreground text-xs shrink-0">OVR {r?.scoutOvr ?? "—"} · Conf {r?.scoutConf ?? "—"}</div>
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
