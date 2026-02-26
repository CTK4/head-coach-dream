import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { getLeagueCities, getTeamById, getTeams } from "@/data/leagueDb";
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
  const lockedTeamId = state.storySetup?.teamLocked ? state.storySetup.teamId : undefined;
  const lockedTeam = lockedTeamId ? getTeamById(lockedTeamId) : undefined;
  const [name, setName] = useState(state.coach.name);
  const [ageTier, setAgeTier] = useState(state.coach.ageTier || COACH_AGES[0]);
  const [hometown, setHometown] = useState(state.coach.hometown || String(lockedTeam?.region ?? ""));

  const handleContinue = () => {
    if (!name.trim() || !hometown) return;

    const hometownTeamId = lockedTeamId ?? findHometownTeamId(hometown);
    dispatch({
      type: "SET_COACH",
      payload: {
        name: name.trim(),
        hometown: lockedTeam?.region ?? hometown,
        ageTier,
        hometownTeamId,
      },
    });
    dispatch({ type: "SET_PHASE", payload: lockedTeamId ? "COORD_HIRING" : "BACKGROUND" });
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
            <Select
              value={lockedTeam ? String(lockedTeam.region ?? "") : hometown}
              onValueChange={setHometown}
              disabled={Boolean(lockedTeam)}
            >
              <SelectTrigger
                data-test="hometown-select"
                id="hometown"
                className="bg-secondary"
              >
                <SelectValue placeholder={lockedTeam ? `Locked: ${lockedTeam.name}` : "Select hometown"} />
              </SelectTrigger>
              <SelectContent>
                {LEAGUE_CITIES.map((city) => (
                  <SelectItem data-test={`hometown-option-${city}`} key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lockedTeam ? <p className="text-xs text-muted-foreground">Story Mode locked team: {lockedTeam.region} {lockedTeam.name}</p> : null}
          </div>
          <Button data-test="create-coach-continue" onClick={handleContinue} disabled={!name.trim() || !hometown} className="w-full mt-4">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCoach;
