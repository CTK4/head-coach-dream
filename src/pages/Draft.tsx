import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame, getDraftClass } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SafeScrollArea from "@/components/SafeScrollArea";

type Row = Record<string, unknown>;

function num(v: unknown, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function s(v: unknown) {
  return String(v ?? "");
}
function posKey(v: unknown) {
  return String(v ?? "").toUpperCase();
}
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function confidence(rep: number, visited: boolean, worked: boolean) {
  const base = clamp(35 + rep * 0.5, 40, 85);
  return clamp(base + (visited ? 10 : 0) + (worked ? 6 : 0), 0, 99);
}

const Draft = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const board = useMemo(() => {
    const rows = (getDraftClass() as Row[]).slice();
    return rows
      .sort((a, b) => num(a["Rank"], 9999) - num(b["Rank"], 9999))
      .filter((r) => !state.draft.withdrawnBoardIds[String(r["Player ID"])])
      .slice(0, 120);
  }, [state.draft.withdrawnBoardIds]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    const rows = getDraftClass() as Row[];
    return rows.find((r) => String(r["Player ID"]) === selectedId) ?? null;
  }, [selectedId]);

  const picks = state.draft.picks;
  const visits = state.offseasonData.preDraft.visits;
  const workouts = state.offseasonData.preDraft.workouts;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Draft Execution</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">Your Picks</Badge>
            <Badge variant="outline">{picks.length}/7</Badge>
            <Badge variant="outline">Visits {Object.keys(visits).length}/30</Badge>
            <Badge variant="outline">Workouts {Object.keys(workouts).length}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/hub/offseason/pre-draft")}>Back</Button>
            <Button onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })} disabled={picks.length < 7}>Continue →</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Board</CardTitle></CardHeader>
          <CardContent>
            <SafeScrollArea className="pr-2" offset={300}>
              <div className="space-y-2">
                {board.map((r) => {
                  const id = String(r["Player ID"]);
                  const pos = posKey(r["POS"]);
                  const rep = num(r["DraftTier"], 60);
                  const visited = !!visits[id];
                  const worked = !!workouts[id];
                  const conf = confidence(rep, visited, worked);
                  return (
                    <button key={id} className={`w-full text-left border rounded-md px-3 py-2 flex items-center justify-between gap-3 ${selectedId === id ? "bg-secondary/50" : ""}`} onClick={() => setSelectedId(id)}>
                      <div className="min-w-0">
                        <div className="font-medium truncate">#{num(r["Rank"])} {s(r["Name"])} <span className="text-muted-foreground">({pos})</span></div>
                        <div className="text-xs text-muted-foreground">College {s(r["College"])} · 40 {s(r["40"])} · Vert {s(r["Vert"])}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline">Conf {conf}</Badge>
                        <Badge variant="secondary">Tier {rep}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SafeScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pick Card</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {selected ? (
              <>
                <div className="space-y-1">
                  <div className="text-xl font-bold">{s(selected["Name"])} <span className="text-muted-foreground">({posKey(selected["POS"])})</span></div>
                  <div className="text-sm text-muted-foreground">Rank #{num(selected["Rank"])} · College {s(selected["College"])}</div>
                </div>
                <Button onClick={() => dispatch({ type: "DRAFT_PICK", payload: { prospectId: String(selected["Player ID"]) } })} disabled={picks.length >= 7 || state.draft.withdrawnBoardIds[String(selected["Player ID"])]}>Draft Player</Button>
                <Card><CardContent className="p-4 text-sm">Picks: {picks.join(", ") || "None"}</CardContent></Card>
              </>
            ) : <div className="text-sm text-muted-foreground">Select a prospect from the board.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Draft;
