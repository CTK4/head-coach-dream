import { useMemo, useState } from "react";
import { getTeams } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { useNavigate } from "react-router-dom";

export default function FreePlaySetup() {
  const teams = useMemo(() => getTeams(), []);
  const [query, setQuery] = useState("");
  const { dispatch } = useGame();
  const navigate = useNavigate();
  const rows = teams.filter((t) => `${t.region} ${t.name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Select Team</h2>
      <input className="w-full rounded border bg-background p-2" placeholder="Search city or team" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="grid md:grid-cols-3 gap-3">
        {rows.map((team) => (
          <Card key={team.teamId}><CardContent className="p-4 space-y-2"><div className="font-bold">{team.region} {team.name}</div><div className="text-sm text-muted-foreground">OVR {70 + (team.teamId.length % 15)} · Prestige {40 + (team.teamId.length % 60)}</div><Button size="sm" onClick={() => { if (!window.confirm(`Start your career with ${team.name}?`)) return; dispatch({ type: 'ACCEPT_OFFER', payload: { teamId: team.teamId, teamName: team.name, ownerName: 'Owner', years: 4, salary: 4_000_000, autonomy: 70, patience: 60, strategy: 'steady_build', perks: [] } as any }); dispatch({ type: 'SET_PHASE', payload: 'HUB' }); navigate('/hub'); }}>Select</Button></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
