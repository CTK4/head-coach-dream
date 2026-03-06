import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildCareerLeaderboards } from "@/engine/telemetry/analytics";

export default function AnalyticsPage() {
  const { state } = useGame();

  const leaderboards = useMemo(
    () => buildCareerLeaderboards({
      currentSeason: state.season,
      currentSeasonAgg: state.telemetry?.seasonAgg,
      historicalBySeason: state.historicalTelemetry?.bySeason,
    }),
    [state.season, state.telemetry?.seasonAgg, state.historicalTelemetry?.bySeason],
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
        <CardHeader>
          <CardTitle>Analytics Hub (Stub)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Career leaderboards combine retained historical telemetry with current season in-progress data.
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
        <CardHeader>
          <CardTitle>Career Team Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Games</TableHead>
                <TableHead>Pass Yds</TableHead>
                <TableHead>Rush Yds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboards.slice(0, 20).map((row) => (
                <TableRow key={row.teamId}>
                  <TableCell>{row.teamId}</TableCell>
                  <TableCell>{row.games}</TableCell>
                  <TableCell>{row.passYards}</TableCell>
                  <TableCell>{row.rushYards}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
