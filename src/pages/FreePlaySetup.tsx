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
import { readSettingsSync, writeSettings } from "@/lib/settings";

export default function FreePlaySetup() {
  const teams = useMemo(() => getTeams(), []);
  const [query, setQuery] = useState("");
  const { dispatch } = useGame();
  const [difficultyPreset, setDifficultyPreset] = useState<DifficultyPresetId>(() => readSettingsSync().difficultyPreset ?? "STANDARD");
  const [realismPreset, setRealismPreset] = useState<RealismPresetId>(() => readSettingsSync().realismPreset ?? "BALANCED");
  const navigate = useNavigate();
  const { index: ratingsIndex, error: teamRatingsError } = useTeamRatings();

  const rows = useMemo(() => {
    const filtered = teams.filter((t) => `${t.region} ${t.name}`.toLowerCase().includes(query.toLowerCase()));
    return filtered.sort((a, b) => {
      const ovrA = ratingsIndex[a.teamId]?.rosterRating;
      const ovrB = ratingsIndex[b.teamId]?.rosterRating;
      if (ovrA != null && ovrB != null && ovrA !== ovrB) return ovrB - ovrA;
      if (ovrA != null && ovrB == null) return -1;
      if (ovrA == null && ovrB != null) return 1;
      return `${a.name}`.localeCompare(`${b.name}`);
    });
  }, [teams, query, ratingsIndex]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <h2 className="text-2xl font-bold">Select Team</h2>
      <input
        className="w-full rounded border bg-background p-2"
        placeholder="Search team"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {teamRatingsError ? (
        <div className="rounded border border-amber-500/40 bg-amber-500/10 p-2 text-sm text-amber-200">
          {teamRatingsError}
        </div>
      ) : null}
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
              <CardContent className="p-4">
                <div className="flex min-h-28 items-stretch justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    <div className="min-w-0 text-left font-bold">{team.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {ratingRow?.rosterRating != null ? `OVR ${ratingRow.rosterRating}` : "OVR --"}
                    </div>
                    <Button
                      size="sm"
                      className="w-fit"
                      data-test={`team-select-${team.teamId}`}
                      onClick={() => {
                        if (!window.confirm(`Start your career with ${team.name}?`)) return;
                        writeSettings({ ...readSettingsSync(), difficultyPreset, realismPreset });
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
                  </div>
                  <div className="flex w-24 shrink-0 items-center justify-center">
                    {team.logoKey ? (
                      <img
                        src={`/icons/${team.logoKey}.png`}
                        alt={`${team.name} logo`}
                        className="h-20 w-20 shrink-0 rounded-sm object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-20 w-20 shrink-0 rounded-sm border border-slate-300/15 bg-slate-950/30" aria-label="Team logo placeholder" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
