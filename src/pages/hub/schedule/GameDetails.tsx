import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { parseGameKey, scoreForGame, teamName } from "@/pages/hub/schedule/scheduleUtils";

export default function GameDetails() {
  const { state } = useGame();
  const { gameKey } = useParams();
  if (!gameKey) return null;
  const parsed = parseGameKey(decodeURIComponent(gameKey));
  const score = scoreForGame(state, decodeURIComponent(gameKey));
  const box = useMemo(() => (state.gameHistory ?? []).find((g) => g.week === parsed.week && g.home.teamId === parsed.homeTeamId && g.away.teamId === parsed.awayTeamId), [state.gameHistory, parsed.week, parsed.homeTeamId, parsed.awayTeamId]);
  return <Card><CardContent className="p-4 space-y-2"><h2 className="text-lg font-semibold">{teamName(parsed.awayTeamId)} @ {teamName(parsed.homeTeamId)}</h2><div className="text-sm">Week {parsed.week} · {parsed.gameType}</div>{score ? <div className="text-base">Final: {score.awayScore} - {score.homeScore}</div> : <div className="text-sm text-muted-foreground">Game not played yet.</div>}{box ? <div className="text-sm text-muted-foreground">Box: Pass Yds {box.home.passYards}-{box.away.passYards} · Rush Yds {box.home.rushYards}-{box.away.rushYards}</div> : null}</CardContent></Card>;
}
