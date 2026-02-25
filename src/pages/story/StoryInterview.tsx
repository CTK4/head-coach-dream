import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";

const interviews = [
  { id: "MILWAUKEE_NORTHSHORE", name: "Milwaukee Northshore", city: "Milwaukee, WI", gm: "Derek Halvorsen", tone: "Professional, measured", strategy: "steady_build", offer: { years: 4, salary: 6_000_000, autonomy: 68, patience: 64 } },
  { id: "ATLANTA_APEX", name: "Atlanta", city: "Atlanta, GA", gm: "Monica Reeves", tone: "High expectations, fast results", strategy: "win_now", offer: { years: 3, salary: 8_000_000, autonomy: 58, patience: 45 } },
  { id: "BIRMINGHAM_VULCANS", name: "Birmingham", city: "Birmingham, AL", gm: "Carter Boone", tone: "Visionary, long-term thinking", strategy: "youth_movement", offer: { years: 5, salary: 5_000_000, autonomy: 80, patience: 78 } },
] as const;

export default function StoryInterview() {
  const { dispatch } = useGame();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [received, setReceived] = useState<typeof interviews>([] as unknown as typeof interviews);

  const current = interviews[idx];
  const done = idx >= interviews.length;
  const available = useMemo(() => received, [received]);

  if (done) {
    return (
      <div className="mx-auto max-w-4xl p-6 space-y-4">
        <h2 className="text-2xl font-bold">Franchise Selection</h2>
        {available.map((fr) => (
          <Card key={fr.id}><CardContent className="p-4 flex items-center justify-between"><div><div className="font-bold">{fr.name}</div><div className="text-sm">{fr.offer.years}yr / ${(fr.offer.salary / 1_000_000).toFixed(1)}M · Autonomy {fr.offer.autonomy} · Patience {fr.offer.patience}</div></div><Button onClick={() => { dispatch({ type: 'ACCEPT_OFFER', payload: { teamId: fr.id, teamName: fr.name, ownerName: fr.gm, years: fr.offer.years, salary: fr.offer.salary, autonomy: fr.offer.autonomy, patience: fr.offer.patience, strategy: fr.strategy, perks: [] } as any }); dispatch({ type: 'SET_PHASE', payload: 'HUB' }); navigate('/hub'); }}>Confirm Selection</Button></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <Card>
        <CardHeader><CardTitle>{current.name} · {current.city}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>GM: {current.gm}. Interview tone: {current.tone}.</p>
          <div className="text-sm text-muted-foreground">Q1: How would you establish culture? · Q2: How do you handle pressure? · Q3: Your year-one plan?</div>
          <Card className="bg-muted/30"><CardContent className="p-3">Offer: {current.offer.years}yr / ${(current.offer.salary / 1_000_000).toFixed(1)}M per year · Autonomy {current.offer.autonomy} · Patience {current.offer.patience}</CardContent></Card>
          <div className="flex gap-2">
            <Button onClick={() => { setReceived((r) => [...r, current] as any); setIdx((v) => v + 1); }}>Accept for now</Button>
            <Button variant="outline" onClick={() => setIdx((v) => v + 1)}>Decline</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
