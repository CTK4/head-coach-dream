import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getLeagueCities, getTeams } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AGE_TIERS = ["32-35", "36-39", "40-43", "44-47", "48-51", "52-55"] as const;

const LEAGUE_CITIES = getLeagueCities();

function computeRepBaseline(ageTier: string): number {
  const tierIndex = AGE_TIERS.indexOf(ageTier as (typeof AGE_TIERS)[number]);
  return 50 + Math.max(0, tierIndex) * 4;
}

function computeOwnerPerceptionMod(ageTier: string): number {
  const tierIndex = AGE_TIERS.indexOf(ageTier as (typeof AGE_TIERS)[number]);
  return 3 - Math.max(0, tierIndex);
}

function computeMediaToneSeed(ageTier: string, hometown: string): number {
  return (ageTier + hometown).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 100;
}

function computeHometownPressureEligible(hometown: string): boolean {
  return getTeams().some((team) => team.region === hometown);
}

function findHometownTeamId(hometown: string): string | undefined {
  return getTeams().find((team) => team.region === hometown)?.teamId;
}

const CreateCoach = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [name, setName] = useState(state.coach.name);
  const [ageTier, setAgeTier] = useState(state.coach.ageTier || AGE_TIERS[0]);
  const [hometown, setHometown] = useState(state.coach.hometown);

  const handleContinue = () => {
    if (!name.trim() || !hometown) return;

    const hometownTeamId = findHometownTeamId(hometown);
    dispatch({
      type: "SET_COACH",
      payload: {
        name: name.trim(),
        hometown,
        ageTier,
        hometownTeamId,
        repBaseline: computeRepBaseline(ageTier),
        ownerPerceptionMod: computeOwnerPerceptionMod(ageTier),
        mediaToneSeed: computeMediaToneSeed(ageTier, hometown),
        hometownPressureEligible: computeHometownPressureEligible(hometown),
      },
    });
    dispatch({ type: "SET_PHASE", payload: "BACKGROUND" });
    navigate("/background");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Your Coach</CardTitle>
          <p className="text-sm text-muted-foreground text-center">Build your coaching identity</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Coach Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age-tier">Age Tier</Label>
            <Select value={ageTier} onValueChange={setAgeTier}>
              <SelectTrigger id="age-tier" className="bg-secondary">
                <SelectValue placeholder="Select age tier" />
              </SelectTrigger>
              <SelectContent>
                {AGE_TIERS.map((tier) => (
                  <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hometown">Hometown</Label>
            <Select value={hometown} onValueChange={setHometown}>
              <SelectTrigger id="hometown" className="bg-secondary">
                <SelectValue placeholder="Select hometown" />
              </SelectTrigger>
              <SelectContent>
                {LEAGUE_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleContinue} disabled={!name.trim() || !hometown} className="w-full mt-4">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCoach;
