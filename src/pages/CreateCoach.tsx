import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { getLeagueCities, getTeams } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COACH_AGES = Array.from({ length: 24 }, (_, index) => String(32 + index));

const LEAGUE_CITIES = getLeagueCities();

function findHometownTeamId(hometown: string): string | undefined {
  return getTeams().find((team) => team.region === hometown)?.teamId;
}

const CreateCoach = () => {
  const { state, dispatch } = useGame();
  const [name, setName] = useState(state.coach.name);
  const [ageTier, setAgeTier] = useState(state.coach.ageTier || COACH_AGES[0]);
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
      },
    });
    dispatch({ type: "SET_PHASE", payload: "BACKGROUND" });
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
            <Label htmlFor="age-tier">Age</Label>
            <Select value={ageTier} onValueChange={setAgeTier}>
              <SelectTrigger id="age-tier" className="bg-secondary">
                <SelectValue placeholder="Select age" />
              </SelectTrigger>
              <SelectContent>
                {COACH_AGES.map((age) => (
                  <SelectItem key={age} value={age}>{age}</SelectItem>
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
