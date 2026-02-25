import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TeamStanding } from "@/engine/standings";

function lastFiveDots(lastFive: Array<"W" | "L" | "T">) { return lastFive.map((r, i) => <span key={`${r}-${i}`} className={`inline-block h-2.5 w-2.5 rounded-full ${r === "W" ? "bg-emerald-400" : r === "L" ? "bg-red-400" : "bg-slate-400"}`} />); }

type View = "DIV" | "CONF" | "LEAGUE";

export function StandingsTable() {
  const { state } = useGame();
  const [view, setView] = useState<View>("DIV");
  const standings = state.currentStandings ?? [];
  const userTeamId = state.acceptedOffer?.teamId;
  const grouped = useMemo(() => {
    const conf = new Map<string, typeof standings>();
    for (const s of standings) {
      const list = conf.get(s.conference) ?? [];
      list.push(s);
      conf.set(s.conference, list);
    }
    return conf;
  }, [standings]);

  const renderRows = (rows: TeamStanding[]) => rows.map((row, idx) => (
    <TableRow key={row.teamId} className={`${row.teamId === userTeamId ? "border-l-4 border-l-primary bg-secondary/30" : ""}`}>
      <TableCell>{idx + 1}</TableCell><TableCell>{row.teamName}</TableCell><TableCell>{row.wins}</TableCell><TableCell>{row.losses}</TableCell><TableCell>{row.ties}</TableCell><TableCell>{row.winPct.toFixed(3)}</TableCell><TableCell className="hidden sm:table-cell">{row.pointsFor}</TableCell><TableCell className="hidden sm:table-cell">{row.pointsAgainst}</TableCell><TableCell>{row.streak}</TableCell>
    </TableRow>
  ));

  return <div className="space-y-3"><Tabs value={view} onValueChange={(v) => setView(v as View)}><div className="overflow-x-auto pb-1"><TabsList className="min-w-max"><TabsTrigger value="DIV" className="min-h-11">Division</TabsTrigger><TabsTrigger value="CONF" className="min-h-11">Conference</TabsTrigger><TabsTrigger value="LEAGUE" className="min-h-11">League</TabsTrigger></TabsList></div></Tabs><div className="overflow-x-auto"><Table className="min-w-[680px]"><TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Team</TableHead><TableHead>W</TableHead><TableHead>L</TableHead><TableHead>T</TableHead><TableHead>PCT</TableHead><TableHead className="hidden sm:table-cell">PF</TableHead><TableHead className="hidden sm:table-cell">PA</TableHead><TableHead>Streak</TableHead></TableRow></TableHeader><TableBody>{view === "LEAGUE" ? renderRows(standings) : null}{view === "CONF" ? Array.from(grouped.entries()).flatMap(([conf, rows]) => [<TableRow key={`h-${conf}`}><TableCell colSpan={9} className="font-semibold">{conf}</TableCell></TableRow>, ...renderRows(rows)]) : null}{view === "DIV" ? Array.from(grouped.entries()).flatMap(([conf, rows]) => { const byDiv = new Map<string, typeof rows>(); for (const r of rows) { const list = byDiv.get(r.division) ?? []; list.push(r); byDiv.set(r.division, list); } return [<TableRow key={`c-${conf}`}><TableCell colSpan={9} className="font-semibold">{conf}</TableCell></TableRow>, ...Array.from(byDiv.entries()).flatMap(([div, divRows]) => [<TableRow key={div}><TableCell colSpan={9} className="text-muted-foreground">{div}</TableCell></TableRow>, ...renderRows(divRows)])]; }) : null}</TableBody></Table></div></div>;
}

export default function Standings() {
  return <Card><CardContent className="p-6"><h2 className="text-2xl font-bold mb-4">Standings</h2><StandingsTable /></CardContent></Card>;
}
