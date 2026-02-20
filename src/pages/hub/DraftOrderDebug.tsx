import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { computeFirstRoundOrderTeamIds, type DraftOrderInputs } from "@/components/franchise-hub/draftOrder";
import { computeStrengthOfScheduleNFL } from "@/engine/strengthOfSchedule";
import { playoffFinishRank } from "@/engine/postseasonOrder";

export default function DraftOrderDebug() {
  if (!import.meta.env.DEV) return <Navigate to="/hub" replace />;

  const { state } = useGame();
  const [showPlayoffHook, setShowPlayoffHook] = useState(true);
  const [recomputeTick, setRecomputeTick] = useState(0);

  const draftInput: DraftOrderInputs = useMemo(() => {
    const base: DraftOrderInputs = {
      league: state.league,
      userTeamId: state.acceptedOffer?.teamId ?? "",
      season: Number(state.season),
    };
    if (!showPlayoffHook) return base;

    const playoffFinishRankByTeamId = Object.fromEntries(
      Object.entries(state.league.postseason?.resultsByTeamId ?? {})
        .filter(([, result]) => result.madePlayoffs)
        .map(([teamId, result]) => [teamId, playoffFinishRank(result)])
    );

    return { ...base, postseason: { playoffFinishRankByTeamId } };
  }, [showPlayoffHook, state.acceptedOffer?.teamId, state.league, state.season, recomputeTick]);

  const order = useMemo(() => computeFirstRoundOrderTeamIds(draftInput), [draftInput]);

  return (
    <section className="mx-auto max-w-6xl space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Draft Order Debug</CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPlayoffHook}
                onChange={(e) => setShowPlayoffHook(e.target.checked)}
                disabled={!state.league.postseason || Object.keys(state.league.postseason.resultsByTeamId ?? {}).length === 0}
              />
              Show playoff hook
            </label>
            <Button variant="outline" size="sm" onClick={() => setRecomputeTick((v) => v + 1)}>
              Recompute
            </Button>
            <Link to="/hub" className="text-blue-300 underline">
              Back to Hub
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pick</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Win%</TableHead>
                <TableHead>SOS</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.map((teamId, index) => {
                const team = getTeamById(teamId);
                const standing = state.league.standings[teamId];
                const games = (standing?.w ?? 0) + (standing?.l ?? 0);
                const winPct = games === 0 ? 0 : (standing?.w ?? 0) / games;
                const sos = computeStrengthOfScheduleNFL(state.league, teamId);
                const playoffResult = state.league.postseason?.resultsByTeamId?.[teamId];
                const notes: string[] = [];
                if (playoffResult?.madePlayoffs) notes.push("playoff team");
                if (playoffResult?.isChampion) notes.push("champion");

                return (
                  <TableRow key={teamId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {team?.logoKey ? <img src={`/icons/${team.logoKey}.png`} alt={`${team.name} logo`} className="h-5 w-5" /> : null}
                        <span>{team ? `${team.region ?? ""} ${team.name}`.trim() : teamId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {standing?.w ?? 0}-{standing?.l ?? 0}
                    </TableCell>
                    <TableCell>{winPct.toFixed(3)}</TableCell>
                    <TableCell>{sos.toFixed(3)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {notes.length === 0 ? <Badge variant="secondary">—</Badge> : notes.map((note) => <Badge key={note}>{note}</Badge>)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
