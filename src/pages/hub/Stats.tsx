import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function StatsPage() {
  const { state } = useGame();
  const [tab, setTab] = useState<"LEADERS" | "RECORDS">("LEADERS");
  const leaders = state.leagueStatLeaders;
  const records = state.leagueRecords;

  const LeaderTable = ({ title, rows }: { title: string; rows: Array<{ playerName: string; teamId: string; value: number }> }) => (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto"><Table className="min-w-[520px]">
          <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Player</TableHead><TableHead>Team</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.slice(0, 10).map((r, i) => <TableRow key={`${r.playerName}-${i}`}><TableCell>{i + 1}</TableCell><TableCell>{r.playerName}</TableCell><TableCell>{r.teamId}</TableCell><TableCell className="text-right">{r.value}</TableCell></TableRow>)}
          </TableBody>
        </Table></div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4"><Tabs value={tab} onValueChange={(v) => setTab(v as any)}><div className="overflow-x-auto pb-1"><TabsList className="min-w-max"><TabsTrigger value="LEADERS" className="min-h-11">League Leaders</TabsTrigger><TabsTrigger value="RECORDS" className="min-h-11">Career Records</TabsTrigger></TabsList></div></Tabs></CardContent></Card>
      {tab === "LEADERS" ? (
        <div className="grid gap-4">
          <LeaderTable title="Passing Yards" rows={leaders.passingYards ?? []} />
          <LeaderTable title="Rushing Yards" rows={leaders.rushingYards ?? []} />
          <LeaderTable title="Receiving Yards" rows={leaders.receivingYards ?? []} />
          <LeaderTable title="Sacks" rows={leaders.sacks ?? []} />
        </div>
      ) : (
        <Card>
          <CardHeader><CardTitle>Career Records Trophy Case</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>Single-Season Passing Yards: <b>{records.singleSeasonPassingYards.playerName}</b> — {records.singleSeasonPassingYards.value} ({records.singleSeasonPassingYards.season})</div>
            <div>Single-Season Rushing Yards: <b>{records.singleSeasonRushingYards.playerName}</b> — {records.singleSeasonRushingYards.value} ({records.singleSeasonRushingYards.season})</div>
            <div>Single-Season TDs: <b>{records.singleSeasonTDs.playerName}</b> — {records.singleSeasonTDs.value} ({records.singleSeasonTDs.season})</div>
            <div>Single-Season Sacks: <b>{records.singleSeasonSacks.playerName}</b> — {records.singleSeasonSacks.value} ({records.singleSeasonSacks.season})</div>
            <div>Coach Most Wins: <b>{records.coachMostWins.coachName}</b> — {records.coachMostWins.value}</div>
            <div>Coach Most Championships: <b>{records.coachMostChampionships.coachName}</b> — {records.coachMostChampionships.value}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
