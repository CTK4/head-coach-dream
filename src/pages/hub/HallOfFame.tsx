import { useMemo, useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { getSeasons } from "@/engine/leagueHistory/loader";

const POSITION_FILTERS = ["All", "QB", "RB", "WR/TE", "OL", "DL", "LB", "DB", "K/P", "Other"] as const;
type PositionFilter = (typeof POSITION_FILTERS)[number];
type AwardFilter = "All" | "Iron Crown MVP" | "Regular Season MVP";

type MvpHallEntry = {
  key: string;
  player: string;
  position: string;
  team: string;
  season: number;
  award: "Iron Crown MVP" | "Regular Season MVP";
};

function mapPositionGroup(position: string): PositionFilter {
  const upper = position.toUpperCase();
  if (upper === "QB") return "QB";
  if (upper === "RB") return "RB";
  if (["WR", "TE", "SE"].includes(upper)) return "WR/TE";
  if (upper === "OL") return "OL";
  if (["DE", "DT", "EDGE", "E"].includes(upper)) return "DL";
  if (["LB", "ILB", "MLB", "OLB"].includes(upper)) return "LB";
  if (["CB", "S", "SS", "FS", "DB"].includes(upper)) return "DB";
  if (["K", "P"].includes(upper)) return "K/P";
  return "Other";
}

function getMvpHallEntries(): MvpHallEntry[] {
  const seasons = getSeasons();
  const entries: MvpHallEntry[] = [];

  for (const season of seasons) {
    if (season.ironCrownMvp) {
      entries.push({
        key: `${season.season}-iron-${season.ironCrownMvp.player}`,
        player: season.ironCrownMvp.player,
        position: season.ironCrownMvp.position,
        team: season.ironCrownMvp.team,
        season: season.season,
        award: "Iron Crown MVP",
      });
    }

    if (season.regularSeasonMvp) {
      entries.push({
        key: `${season.season}-regular-${season.regularSeasonMvp.player}`,
        player: season.regularSeasonMvp.player,
        position: season.regularSeasonMvp.position,
        team: season.regularSeasonMvp.team,
        season: season.season,
        award: "Regular Season MVP",
      });
    }
  }

  return entries.sort((a, b) => {
    if (b.season !== a.season) {
      return b.season - a.season;
    }
    return a.player.localeCompare(b.player);
  });
}

export default function HallOfFame() {
  const { state } = useGame();
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("All");
  const [awardFilter, setAwardFilter] = useState<AwardFilter>("All");
  const [teamLegendsOnly, setTeamLegendsOnly] = useState(false);

  const userTeamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId;
  const userTeamName = userTeamId ? getTeamById(String(userTeamId))?.name ?? "" : "";
  const showTeamLegendToggle = Boolean(userTeamName);

  const mvpHallEntries = useMemo(() => getMvpHallEntries(), []);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return mvpHallEntries.filter((entry) => {
      if (teamLegendsOnly && userTeamName && entry.team !== userTeamName) {
        return false;
      }

      if (awardFilter !== "All" && entry.award !== awardFilter) {
        return false;
      }

      if (positionFilter !== "All" && mapPositionGroup(entry.position) !== positionFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${entry.player} ${entry.team} ${entry.award}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [awardFilter, mvpHallEntries, positionFilter, query, teamLegendsOnly, userTeamName]);

  return (
    <div className="space-y-4">
      <ScreenHeader title="MVP Hall of Fame" showBack />

      <Card>
        <CardHeader>
          <CardTitle>League MVP Archives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search player, team, or award" value={query} onChange={(event) => setQuery(event.target.value)} />

          <div className="flex flex-wrap gap-2">
            {(["All", "Iron Crown MVP", "Regular Season MVP"] as const).map((filter) => (
              <Button
                key={filter}
                type="button"
                size="sm"
                variant={awardFilter === filter ? "default" : "outline"}
                onClick={() => setAwardFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {POSITION_FILTERS.map((pill) => (
              <Button
                key={pill}
                type="button"
                size="sm"
                variant={positionFilter === pill ? "default" : "outline"}
                onClick={() => setPositionFilter(pill)}
              >
                {pill}
              </Button>
            ))}
          </div>

          {showTeamLegendToggle ? (
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label htmlFor="mvp-team-legends-toggle">Team Legends</Label>
              <Switch id="mvp-team-legends-toggle" checked={teamLegendsOnly} onCheckedChange={setTeamLegendsOnly} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{filteredEntries.length} MVP honorees found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {filteredEntries.map((entry) => (
            <div key={entry.key} className="rounded-md border px-3 py-2">
              <p className="font-semibold">{entry.player}</p>
              <p className="text-muted-foreground">
                {entry.position} • {entry.team}
              </p>
              <p className="text-muted-foreground">
                {entry.award} • Season {entry.season}
              </p>
            </div>
          ))}

          {filteredEntries.length === 0 ? (
            <p className="text-muted-foreground">
              No MVP Hall of Fame entries are available for the current filters. Try clearing filters, switching award type, or searching another team/player.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
