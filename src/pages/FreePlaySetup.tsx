import { useMemo, useState } from "react";
import { getTeams } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { useNavigate } from "react-router-dom";
import { useTeamRatings } from "@/hooks/useTeamRatings";

export default function FreePlaySetup() {
  const teams = useMemo(() => getTeams(), []);
  const [query, setQuery] = useState("");
  const { dispatch } = useGame();
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
                    dispatch({
                      type: "ACCEPT_OFFER",
                      payload: {
                        teamId: team.teamId,
                        teamName: team.name,
                        ownerName: "Owner",
                        years: 4,
                        salary: 4_000_000,
                        autonomy: 70,
                        patience: 60,
                        strategy: "steady_build",
                        perks: [],
                      } as any,
                    });
                    dispatch({ type: "SET_CAREER_STAGE", payload: "REGULAR_SEASON" });
                    dispatch({ type: "SET_PHASE", payload: "HUB" });
                    navigate("/hub");
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
