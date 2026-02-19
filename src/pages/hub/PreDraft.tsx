import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame, getDraftClass } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function letter(n: number) {
  if (n >= 90) return "A";
  if (n >= 82) return "B";
  if (n >= 74) return "C";
  if (n >= 66) return "D";
  return "F";
}

export default function PreDraft() {
  const { state, dispatch } = useGame();
  const nav = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(
    () => (getDraftClass() as Row[]).slice().sort((a, b) => num(a["Rank"], 9999) - num(b["Rank"], 9999)),
    []
  );
  const board = useMemo(() => rows.slice(0, 180), [rows]);

  const visits = state.offseasonData.preDraft.visits;
  const workouts = state.offseasonData.preDraft.workouts;

  const visitsUsed = useMemo(() => Object.values(visits).filter(Boolean).length, [visits]);
  const workoutsUsed = useMemo(() => Object.values(workouts).filter(Boolean).length, [workouts]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return rows.find((r) => String(r["Player ID"]) === selectedId) ?? null;
  }, [rows, selectedId]);

  const workoutEligible = (pos: string) => ["QB", "WR", "EDGE", "CB", "S", "LB", "TE", "RB", "DL", "OL"].includes(posKey(pos));

  const toggleVisit = (id: string) => dispatch({ type: "PREDRAFT_TOGGLE_VISIT", payload: { prospectId: id } });
  const toggleWorkout = (id: string) => dispatch({ type: "PREDRAFT_TOGGLE_WORKOUT", payload: { prospectId: id } });

  const continueToDraft = () => {
    dispatch({ type: "ADVANCE_CAREER_STAGE" });
    nav("/hub/draft");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Pre-Draft Preparation</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Top-30 Visits {visitsUsed}/30</Badge>
            <Badge variant="outline">Workouts {workoutsUsed}</Badge>
            <Button variant="secondary" onClick={continueToDraft}>
              Continue →
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Visits reduce personality uncertainty. Workouts reduce development variance (especially QB/WR/EDGE).
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Board</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[650px] pr-2">
              <div className="space-y-2">
                {board.map((r) => {
                  const id = String(r["Player ID"]);
                  const pos = posKey(r["POS"]);
                  const visited = !!visits[id];
                  const worked = !!workouts[id];
                  const iq = num(r["Football_IQ"], 60);
                  const we = num(r["Work_Ethic"], 60);
                  const coach = num(r["Coachability"], 60);
                  const conf = clamp(45 + (visited ? 12 : 0) + (worked ? 8 : 0), 40, 95);

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
                          {s(r["College"])} · 40 {s(r["40"])} · Vert {s(r["Vert"])} · Conf {Math.round(conf)}
                        </div>
                        {(visited || worked) ? (
                          <div className="text-xs text-muted-foreground mt-1">
                            Traits: IQ {letter(iq)} · Work {letter(we)} · Coach {letter(coach)}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant={visited ? "default" : "outline"}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleVisit(id);
                          }}
                          disabled={!visited && visitsUsed >= 30}
                        >
                          {visited ? "Visited" : "Visit"}
                        </Button>
                        <Button
                          size="sm"
                          variant={worked ? "default" : "outline"}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWorkout(id);
                          }}
                          disabled={!workoutEligible(pos)}
                        >
                          {worked ? "Workout" : "Workout"}
                        </Button>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Visit / Workout Card</CardTitle></CardHeader>
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
                    <div className="text-muted-foreground text-xs">Top-30 Visit</div>
                    <div className="font-semibold mt-1">{!!visits[String(selected["Player ID"])] ? "Booked" : "Not booked"}</div>
                  </div>
                  <div className="border rounded-md p-3">
                    <div className="text-muted-foreground text-xs">Private Workout</div>
                    <div className="font-semibold mt-1">{!!workouts[String(selected["Player ID"])] ? "Booked" : "Not booked"}</div>
                  </div>
                </div>

                <div className="border rounded-md p-3 text-sm space-y-1">
                  <div className="text-muted-foreground text-xs">Reveal (if visited/worked)</div>
                  <div>Football IQ: {letter(num(selected["Football_IQ"], 60))}</div>
                  <div>Work Ethic: {letter(num(selected["Work_Ethic"], 60))}</div>
                  <div>Coachability: {letter(num(selected["Coachability"], 60))}</div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={!!visits[String(selected["Player ID"])] ? "default" : "outline"}
                    onClick={() => toggleVisit(String(selected["Player ID"]))}
                    disabled={!visits[String(selected["Player ID"])] && visitsUsed >= 30}
                  >
                    {visits[String(selected["Player ID"])] ? "Remove Visit" : "Add Visit"}
                  </Button>
                  <Button
                    variant={!!workouts[String(selected["Player ID"])] ? "default" : "outline"}
                    onClick={() => toggleWorkout(String(selected["Player ID"]))}
                    disabled={!workoutEligible(String(selected["POS"]))}
                  >
                    {workouts[String(selected["Player ID"])] ? "Remove Workout" : "Add Workout"}
                  </Button>
                </div>
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
