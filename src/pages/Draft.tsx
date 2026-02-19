import { useMemo, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useGame, getDraftClass } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import MedicalIcon from "/badges/Medical.svg";

type Row = Record<string, unknown>;

function num(v: unknown, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function s(v: unknown) {
  return String(v ?? "");
}
function posKey(v: unknown) {
  const p = String(v ?? "").toUpperCase();
  if (p === "HB") return "RB";
  if (["OLB", "ILB", "MLB"].includes(p)) return "LB";
  if (["FS", "SS"].includes(p)) return "S";
  if (p === "DT") return "DL";
  if (p === "DE") return "EDGE";
  if (["OT", "OG", "C", "OL"].includes(p)) return "OL";
  if (p === "DB") return "CB";
  return p || "UNK";
}
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

export default function Draft() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch({ type: "DRAFT_INIT" });
  }, [dispatch]);

  useEffect(() => {
    if (state.draft.completed) navigate("/hub/draft-results");
  }, [state.draft.completed, navigate]);

  const rows = useMemo(
    () => (getDraftClass() as Row[]).slice().sort((a, b) => num(a["Rank"], 9999) - num(b["Rank"], 9999)),
    []
  );

  const board = useMemo(
    () => rows.filter((r) => !state.draft.withdrawnBoardIds[String(r["Player ID"])]).slice(0, 140),
    [rows, state.draft.withdrawnBoardIds]
  );

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return rows.find((r) => String(r["Player ID"]) === selectedId) ?? null;
  }, [rows, selectedId]);

  const userTeamId = String(state.acceptedOffer?.teamId ?? "");
  const onClock = String(state.draft.onClockTeamId ?? "");
  const isUserOnClock = !!userTeamId && onClock === userTeamId;

  const teamsCount = state.draft.orderTeamIds.length || 32;
  const totalPicks = state.draft.totalRounds * teamsCount;
  const overall = state.draft.currentOverall;
  const round = Math.floor((overall - 1) / teamsCount) + 1;
  const pickInRound = ((overall - 1) % teamsCount) + 1;

  const myPicks = state.draft.leaguePicks.filter((p) => p.teamId === userTeamId);
  const reveals = state.offseasonData.preDraft.reveals;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Draft Execution</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Pick {overall}/{totalPicks}</Badge>
            <Badge variant="outline">R{round} · #{pickInRound}</Badge>
            <Badge variant={isUserOnClock ? "secondary" : "outline"}>{isUserOnClock ? "YOU ON CLOCK" : `On clock: ${onClock || "—"}`}</Badge>
            <Button variant="outline" onClick={() => navigate("/hub/pre-draft")}>Back</Button>
            <Button onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })} disabled={!state.draft.completed}>
              Continue →
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">Your Picks</Badge>
            <Badge variant="outline">{myPicks.length}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => dispatch({ type: "DRAFT_SIM_NEXT" })} disabled={state.draft.completed || isUserOnClock}>Sim Next</Button>
            <Button variant="secondary" onClick={() => dispatch({ type: "DRAFT_SIM_TO_USER" })} disabled={state.draft.completed || isUserOnClock}>Sim To My Pick</Button>
            <Button variant="secondary" onClick={() => dispatch({ type: "DRAFT_SIM_ALL" })} disabled={state.draft.completed}>Sim All</Button>
            <Button variant="outline" onClick={() => navigate("/hub/draft-results")} disabled={!state.draft.leaguePicks.length}>Results</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Available Board</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[650px] pr-2">
              <div className="space-y-2">
                {board.map((r) => {
                  const id = String(r["Player ID"]);
                  const pos = posKey(r["POS"]);
                  const rev = reveals[id];
                  return (
                    <button
                      key={id}
                      className={`w-full text-left border rounded-md px-3 py-2 flex items-center justify-between gap-3 ${selectedId === id ? "bg-secondary/50" : ""}`}
                      onClick={() => setSelectedId(id)}
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          #{num(r["Rank"])} {s(r["Name"])} <span className="text-muted-foreground">({pos})</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s(r["College"])} · 40 {s(r["40"])} · Vert {s(r["Vert"])}
                        </div>
                        {rev?.medicalLevel ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            <FlagChip className={chipColorForMedical(rev.medicalLevel)}><img src={MedicalIcon} className="h-3 w-3 opacity-90" alt="Medical" />{rev.medicalLevel}</FlagChip>
                            {rev.characterLevel ? <FlagChip className={chipColorForCharacter(rev.characterLevel)}>CHAR {rev.characterLevel}</FlagChip> : null}
                            {rev.symbols?.length ? <FlagChip className="bg-white/5 text-zinc-200 border-white/10">{rev.symbols.join(" ")}</FlagChip> : null}
                            {rev.footballTags?.includes("Gold: 1st") ? <FlagChip className="bg-yellow-500/15 text-yellow-100 border-yellow-500/20">Gold</FlagChip> : null}
                            {rev.footballTags?.includes("Purple: Elite Trait") ? <FlagChip className="bg-purple-500/15 text-purple-100 border-purple-500/20">Purple</FlagChip> : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline">Tier {num(r["DraftTier"], 60)}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pick Card</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {selected ? (
              <>
                <div className="space-y-1">
                  <div className="text-xl font-bold">
                    {s(selected["Name"])} <span className="text-muted-foreground">({posKey(selected["POS"])})</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rank #{num(selected["Rank"])} · {s(selected["College"])}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="border rounded-md p-3">
                    <div className="text-muted-foreground text-xs">IQ / Work</div>
                    <div className="font-semibold mt-1">{num(selected["Football_IQ"], 60)}/{num(selected["Work_Ethic"], 60)}</div>
                  </div>
                  <div className="border rounded-md p-3">
                    <div className="text-muted-foreground text-xs">Coachability / Volatility</div>
                    <div className="font-semibold mt-1">{num(selected["Coachability"], 60)}/{num(selected["Volatility"], 60)}</div>
                  </div>
                </div>

                {(() => {
                  const sid = selected ? String(selected["Player ID"]) : "";
                  const srev = sid ? reveals[sid] : undefined;
                  return srev?.medicalLevel ? (
                    <div className="flex flex-wrap gap-1">
                      <FlagChip className={chipColorForMedical(srev.medicalLevel)}><img src={MedicalIcon} className="h-3 w-3 opacity-90" alt="Medical" />Medical {srev.medicalLevel}</FlagChip>
                      {srev.characterLevel ? <FlagChip className={chipColorForCharacter(srev.characterLevel)}>Character {srev.characterLevel}</FlagChip> : null}
                      {srev.symbols?.length ? <FlagChip className="bg-white/5 text-zinc-200 border-white/10">{srev.symbols.join(" ")}</FlagChip> : null}
                      {srev.footballTags?.includes("Gold: 1st") ? <FlagChip className="bg-yellow-500/15 text-yellow-100 border-yellow-500/20">Gold</FlagChip> : null}
                      {srev.footballTags?.includes("Purple: Elite Trait") ? <FlagChip className="bg-purple-500/15 text-purple-100 border-purple-500/20">Purple</FlagChip> : null}
                    </div>
                  ) : null;
                })()}

                <Button
                  onClick={() => {
                    const pid = String(selected["Player ID"]);
                    const rev = reveals[pid];
                    if (rev?.characterLevel === "BLACK") {
                      const ok = window.confirm(
                        "Warning: This prospect is marked REMOVE FROM BOARD (Character BLACK).\n\nDraft anyway?"
                      );
                      if (!ok) return;
                    }
                    dispatch({ type: "DRAFT_PICK", payload: { prospectId: pid } });
                  }}
                  disabled={!isUserOnClock || state.draft.withdrawnBoardIds[String(selected["Player ID"])] || state.draft.completed}
                >
                  Draft Player
                </Button>

                <Card>
                  <CardContent className="p-4 text-sm space-y-2">
                    <div className="font-semibold">Your Pick Log</div>
                    <div className="text-muted-foreground">
                      {myPicks.length
                        ? myPicks
                            .slice()
                            .sort((a, b) => a.overall - b.overall)
                            .map((p) => `R${p.round}#${p.pickInRound} · ${p.prospectId}`)
                            .join(" · ")
                        : "None yet."}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Select a prospect from the board.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
