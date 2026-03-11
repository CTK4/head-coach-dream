import { useMemo, useState } from "react";
import { getTeams } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { useNavigate } from "react-router-dom";
import { useTeamRatings } from "@/hooks/useTeamRatings";
import { ROUTES } from "@/routes/appRoutes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DIFFICULTY_PRESETS, REALISM_PRESETS, type DifficultyPresetId, type RealismPresetId } from "@/config/simTuning";
import { readSettings, writeSettings } from "@/lib/settings";

export default function FreePlaySetup() {
  const teams = useMemo(() => getTeams(), []);
  const [query, setQuery] = useState("");
  const { dispatch } = useGame();
  const [difficultyPreset, setDifficultyPreset] = useState<DifficultyPresetId>(() => readSettings().difficultyPreset ?? "STANDARD");
  const [realismPreset, setRealismPreset] = useState<RealismPresetId>(() => readSettings().realismPreset ?? "BALANCED");
  const navigate = useNavigate();
  const { index: ratingsIndex } = useTeamRatings();

  const rows = useMemo(() => {
    const filtered = teams.filter((t) => `${t.region} ${t.name}`.toLowerCase().includes(query.toLowerCase()));
    return filtered.sort((a, b) => {
      const ovrA = ratingsIndex[a.teamId]?.rosterRating;
      const ovrB = ratingsIndex[b.teamId]?.rosterRating;
      if (ovrA != null && ovrB != null && ovrA !== ovrB) return ovrB - ovrA;
      if (ovrA != null && ovrB == null) return -1;
      if (ovrA == null && ovrB != null) return 1;
      return `${a.region} ${a.name}`.localeCompare(`${b.region} ${b.name}`);
    });
  }, [teams, query, ratingsIndex]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <h2 className="text-2xl font-bold">Select Team</h2>
      <input
        className="w-full rounded border bg-background p-2"
        placeholder="Search city or team"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 p-4">
            <div className="text-sm font-semibold">Difficulty</div>
            <Select value={difficultyPreset} onValueChange={(value) => setDifficultyPreset(value as DifficultyPresetId)}>
              <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
              <SelectContent>
                {Object.values(DIFFICULTY_PRESETS).map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>{preset.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <div className="text-sm font-semibold">Simulation Realism</div>
            <Select value={realismPreset} onValueChange={(value) => setRealismPreset(value as RealismPresetId)}>
              <SelectTrigger><SelectValue placeholder="Select realism" /></SelectTrigger>
              <SelectContent>
                {Object.values(REALISM_PRESETS).map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>{preset.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {rows.map((team) => {
          const ratingRow = ratingsIndex[team.teamId];
          return (
            <Card key={team.teamId}>
              <CardContent className="space-y-2 p-4">
                <div className="font-bold">
                  {team.region} {team.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {ratingRow?.rosterRating != null ? `OVR ${ratingRow.rosterRating}` : "OVR —"} · Prestige {40 + (team.teamId.length % 60)}
                </div>
                <Button
                  size="sm"
                  data-test={`team-select-${team.teamId}`}
                  onClick={() => {
                    if (!window.confirm(`Start your career with ${team.name}?`)) return;
                    writeSettings({ ...readSettings(), difficultyPreset, realismPreset });
                    dispatch({
                      type: "INIT_FREE_PLAY_CAREER",
                      payload: {
                        teamId: team.teamId,
                        teamName: team.name,
                        simTuningSettings: {
                          difficultyPreset,
                          realismPreset,
                        },
                      },
                    });
                    navigate(ROUTES.hub);
                  }}
                >
                  Select
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
