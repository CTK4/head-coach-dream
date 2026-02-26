import { useMemo, useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { getHallOfFame, getMvpBySeason, getSeasons } from "@/engine/leagueHistory/loader";

const POSITION_FILTERS = ["All", "QB", "RB", "WR/TE", "OL", "DL", "LB", "DB", "K/P", "Other"] as const;

type PositionFilter = (typeof POSITION_FILTERS)[number];

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

export default function LeagueHistory() {
  const { state } = useGame();
  const seasons = useMemo(() => getSeasons(), []);
  const hallOfFame = useMemo(() => getHallOfFame(), []);

  const [tab, setTab] = useState("champions");
  const [selectedSeason, setSelectedSeason] = useState<number>(seasons[0]?.season ?? 0);
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("All");
  const [teamLegendsOnly, setTeamLegendsOnly] = useState(false);

  const userTeamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? state.profile?.teamId ?? state.coach?.teamId;
  const userTeamName = userTeamId ? getTeamById(String(userTeamId))?.name ?? "" : "";
  const showTeamLegendToggle = Boolean(userTeamName);

  const mvpForSeason = useMemo(() => getMvpBySeason(selectedSeason), [selectedSeason]);

  const filteredHallOfFame = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return hallOfFame.filter((entry) => {
      if (teamLegendsOnly && userTeamName && entry.team !== userTeamName) {
        return false;
      }

      if (positionFilter !== "All" && mapPositionGroup(entry.position) !== positionFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${entry.player} ${entry.team}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [hallOfFame, positionFilter, query, teamLegendsOnly, userTeamName]);

  const groupedHallOfFame = useMemo(() => {
    const groups = new Map<number, typeof filteredHallOfFame>();

    for (const entry of filteredHallOfFame) {
      const list = groups.get(entry.classYear) ?? [];
      list.push(entry);
      groups.set(entry.classYear, list);
    }

    return [...groups.entries()].sort((a, b) => b[0] - a[0]);
  }, [filteredHallOfFame]);

  return (
    <div className="space-y-4">
      <ScreenHeader title="League History" showBack />

      <Tabs value={tab} onValueChange={setTab} className="space-y-4 px-2 pb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="champions">CHAMPIONS</TabsTrigger>
          <TabsTrigger value="mvps">MVPS</TabsTrigger>
          <TabsTrigger value="hof">HALL OF FAME</TabsTrigger>
        </TabsList>

        <TabsContent value="champions" className="space-y-3">
          {seasons.map((seasonEntry) => (
            <Card key={seasonEntry.season}>
              <CardHeader>
                <CardTitle>{seasonEntry.season}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-semibold">Champion: {seasonEntry.champion}</p>
                <p className="text-muted-foreground">Runner-Up: {seasonEntry.runnerUp}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mvps" className="space-y-3">
          <Card>
            <CardContent className="pt-6">
              <Select value={String(selectedSeason)} onValueChange={(value) => setSelectedSeason(Number.parseInt(value, 10))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((seasonEntry) => (
                    <SelectItem key={seasonEntry.season} value={String(seasonEntry.season)}>
                      {seasonEntry.season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Iron Crown MVP (Calder Rowan Trophy)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {mvpForSeason.ironCrownMvp ? (
                <div className="space-y-1">
                  <p className="font-semibold">{mvpForSeason.ironCrownMvp.player}</p>
                  <p className="text-muted-foreground">{mvpForSeason.ironCrownMvp.team}</p>
                  <p className="text-muted-foreground">{mvpForSeason.ironCrownMvp.position}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Not available for this season</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regular Season MVP</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {mvpForSeason.regularSeasonMvp ? (
                <div className="space-y-1">
                  <p className="font-semibold">{mvpForSeason.regularSeasonMvp.player}</p>
                  <p className="text-muted-foreground">{mvpForSeason.regularSeasonMvp.team}</p>
                  <p className="text-muted-foreground">{mvpForSeason.regularSeasonMvp.position}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Not available for this season</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hof" className="space-y-3">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Input placeholder="Search player or team" value={query} onChange={(event) => setQuery(event.target.value)} />

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
                  <Label htmlFor="team-legends-toggle">Team Legends</Label>
                  <Switch id="team-legends-toggle" checked={teamLegendsOnly} onCheckedChange={setTeamLegendsOnly} />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {groupedHallOfFame.map(([classYear, inductees]) => (
              <Card key={classYear}>
                <CardHeader>
                  <CardTitle>Class of {classYear}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {inductees.map((entry) => (
                    <p key={`${classYear}-${entry.player}`}>
                      <span className="font-semibold">{entry.player}</span> • {entry.position} • <span className="text-muted-foreground">{entry.team}</span>
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
            {groupedHallOfFame.length === 0 ? <p className="px-1 text-sm text-muted-foreground">No inductees found.</p> : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
