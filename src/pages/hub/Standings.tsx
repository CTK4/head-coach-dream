import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TeamStanding } from "@/engine/standings";

function lastFiveDots(lastFive: Array<"W" | "L" | "T">) {
  return lastFive.map((r, i) => (
    <span key={`${r}-${i}`} className={`inline-block h-2.5 w-2.5 rounded-full ${r === "W" ? "bg-emerald-400" : r === "L" ? "bg-red-400" : "bg-slate-400"}`} />
  ));
}

type View = "DIV" | "CONF" | "LEAGUE" | "RESULTS";

type PlayoffFlag = "IN" | "BUBBLE" | "OUT";

function computePlayoffMap(standings: TeamStanding[]) {
  const map: Record<string, PlayoffFlag> = {};
  const byConf = new Map<string, TeamStanding[]>();
  for (const t of standings) {
    const list = byConf.get(t.conference) ?? [];
    list.push(t);
    byConf.set(t.conference, list);
  }

  for (const [, confTeams] of byConf) {
    const byDiv = new Map<string, TeamStanding[]>();
    for (const t of confTeams) {
      const list = byDiv.get(t.division) ?? [];
      list.push(t);
      byDiv.set(t.division, list);
    }

    const divisionWinners = new Set<string>();
    for (const [, divTeams] of byDiv) {
      const leader = divTeams.slice().sort((a, b) => b.winPct - a.winPct || (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst))[0];
      if (leader) divisionWinners.add(leader.teamId);
    }

    const nonWinners = confTeams.filter((t) => !divisionWinners.has(t.teamId)).sort((a, b) => b.winPct - a.winPct || (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst));
    const wildCards = new Set(nonWinners.slice(0, 3).map((t) => t.teamId));
    const linePct = nonWinners[2]?.winPct ?? nonWinners[nonWinners.length - 1]?.winPct ?? 0;

    for (const t of confTeams) {
      if (divisionWinners.has(t.teamId) || wildCards.has(t.teamId)) map[t.teamId] = "IN";
      else if (linePct - t.winPct <= 0.125) map[t.teamId] = "BUBBLE";
      else map[t.teamId] = "OUT";
    }
  }
  return map;
}

export default function Standings() {
  const { state } = useGame();
  const [view, setView] = useState<View>("DIV");

  const standings = state.currentStandings ?? [];
  const userTeamId = state.acceptedOffer?.teamId;
  const playoffFlags = useMemo(() => computePlayoffMap(standings), [standings]);

  const grouped = useMemo(() => {
    const conf = new Map<string, typeof standings>();
    for (const s of standings) {
      const list = conf.get(s.conference) ?? [];
      list.push(s);
      conf.set(s.conference, list);
    }
    return conf;
  }, [standings]);

  const bubbleNote = useMemo(() => {
    if (!userTeamId || playoffFlags[userTeamId] !== "BUBBLE") return null;
    const user = standings.find((s) => s.teamId === userTeamId);
    if (!user) return null;
    const confTeams = standings.filter((s) => s.conference === user.conference).sort((a, b) => b.winPct - a.winPct);
    const wildLine = confTeams[6];
    if (!wildLine) return null;
    const rival = confTeams.find((t) => t.teamId !== userTeamId && t.winPct >= wildLine.winPct)?.teamName ?? "rival";
    const magic = Math.max(1, 18 - user.wins - wildLine.losses);
    return `Magic number: ${magic} wins or ${rival} losses to clinch wild card`;
  }, [playoffFlags, standings, userTeamId]);

  const renderRows = (rows: typeof standings) =>
    rows.map((row, idx) => {
      const flag = playoffFlags[row.teamId] ?? "OUT";
      const border = flag === "IN" ? "border-l-4 border-l-emerald-500" : flag === "BUBBLE" ? "border-l-4 border-l-yellow-500" : "";
      const label = flag === "IN" ? "In" : flag === "BUBBLE" ? "On the bubble" : "Out";
      return (
        <TableRow key={row.teamId} className={`${border} ${row.teamId === userTeamId ? "bg-secondary/70" : ""}`}>
          <TableCell>{idx + 1}</TableCell>
          <TableCell>{row.teamName}</TableCell>
          <TableCell>{row.wins}-{row.losses}-{row.ties}</TableCell>
          <TableCell>{row.winPct.toFixed(3)}</TableCell>
          <TableCell>{row.pointsFor}</TableCell>
          <TableCell>{row.pointsAgainst}</TableCell>
          <TableCell>{row.streak}</TableCell>
          <TableCell><div className="flex items-center gap-1">{lastFiveDots(row.lastFive)}</div></TableCell>
          <TableCell>{label}</TableCell>
        </TableRow>
      );
    });

  const currentWeekResult = state.weeklyResults.find((w) => w.week === state.hub.regularSeasonWeek) ?? state.weeklyResults[state.hub.regularSeasonWeek - 1];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Standings</h2>
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList>
            <TabsTrigger value="DIV">Division</TabsTrigger>
            <TabsTrigger value="CONF">Conference</TabsTrigger>
            <TabsTrigger value="LEAGUE">League</TabsTrigger>
            <TabsTrigger value="RESULTS">Results</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "RESULTS" ? (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Week {state.hub.regularSeasonWeek} scores</div>
            {(currentWeekResult?.allGameResults ?? []).map((g) => (
              <div key={g.gameId} className="rounded-md border p-3 text-sm">
                <span className="font-semibold">{g.awayTeamId}</span> {g.awayScore} @ <span className="font-semibold">{g.homeTeamId}</span> {g.homeScore}
              </div>
            ))}
            {!currentWeekResult?.allGameResults?.length ? <div className="text-sm text-muted-foreground">No results available for this week yet.</div> : null}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead><TableHead>Team</TableHead><TableHead>W-L-T</TableHead><TableHead>Win%</TableHead><TableHead>PF</TableHead><TableHead>PA</TableHead><TableHead>Streak</TableHead><TableHead>Last 5</TableHead><TableHead>Playoff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {view === "LEAGUE" ? renderRows(standings) : null}
                {view === "CONF"
                  ? Array.from(grouped.entries()).flatMap(([conf, rows]) => [
                      <TableRow key={`h-${conf}`}><TableCell colSpan={9} className="font-semibold">{conf}</TableCell></TableRow>,
                      ...renderRows(rows),
                    ])
                  : null}
                {view === "DIV"
                  ? Array.from(grouped.entries()).flatMap(([conf, rows]) => {
                      const byDiv = new Map<string, typeof rows>();
                      for (const r of rows) {
                        const list = byDiv.get(r.division) ?? [];
                        list.push(r);
                        byDiv.set(r.division, list);
                      }
                      return [
                        <TableRow key={`ch-${conf}`}><TableCell colSpan={9} className="font-semibold">{conf}</TableCell></TableRow>,
                        ...Array.from(byDiv.entries()).flatMap(([div, divRows]) => [
                          <TableRow key={`d-${div}`}><TableCell colSpan={9} className="text-muted-foreground">{div}</TableCell></TableRow>,
                          ...renderRows(divRows),
                        ]),
                      ];
                    })
                  : null}
              </TableBody>
            </Table>
            <div className="pt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Playoff Picture</h3>
              {bubbleNote ? <p className="mt-1 text-sm">{bubbleNote}</p> : <p className="mt-1 text-sm text-muted-foreground">Teams marked In, On the bubble, or Out in the table.</p>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
