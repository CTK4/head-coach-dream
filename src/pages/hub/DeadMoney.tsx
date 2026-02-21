import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { computeDeadMoneyLedger, computeLeagueDeadMoneySummary, type DeadMoneyEntry } from "@/engine/deadMoney";
import { getTeams } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

function money(v: number): string {
  if (v === 0) return "$0";
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 100_000_000 ? 0 : 1)}M`;
  return `${sign}$${Math.round(abs / 1_000).toLocaleString()}K`;
}

function pct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

const TYPE_LABEL: Record<string, string> = {
  CUT: "Cut",
  TRADE: "Trade",
  VOID: "Void",
};

const ACCEL_LABEL: Record<string, string> = {
  PRE_JUNE_1: "Pre–June 1",
  POST_JUNE_1: "Post–June 1",
  NONE: "—",
};

export default function DeadMoney() {
  const { state } = useGame();
  const userTeamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? "";

  const teams = useMemo(() => getTeams().filter((t) => t.isActive), []);
  const currentYear = state.season;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [viewMode, setViewMode] = useState<"team" | "league">("team");
  const [selectedTeamId, setSelectedTeamId] = useState<string>(userTeamId);
  const [drawerEntry, setDrawerEntry] = useState<DeadMoneyEntry | null>(null);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 1; y <= currentYear + 1; y++) years.push(y);
    return years;
  }, [currentYear]);

  const ledger = useMemo(
    () => computeDeadMoneyLedger(state, selectedTeamId || userTeamId, selectedYear),
    [state, selectedTeamId, userTeamId, selectedYear],
  );

  const leagueSummary = useMemo(
    () => computeLeagueDeadMoneySummary(state, selectedYear),
    [state, selectedYear],
  );

  const selectedTeam = useMemo(
    () => teams.find((t) => t.teamId === (selectedTeamId || userTeamId)),
    [teams, selectedTeamId, userTeamId],
  );

  const cap = Number(state.finances?.cap ?? 250_000_000);
  // For the user's own team, use aggregate finances.deadCapThisYear when no individual entries exist
  const displayDeadThis =
    (selectedTeamId === userTeamId || !selectedTeamId)
      ? Math.max(ledger.totalDeadCapThisYear, Number(state.finances?.deadCapThisYear ?? 0))
      : ledger.totalDeadCapThisYear;
  const displayDeadNext =
    (selectedTeamId === userTeamId || !selectedTeamId)
      ? Math.max(ledger.totalDeadCapNextYear, Number(state.finances?.deadCapNextYear ?? 0))
      : ledger.totalDeadCapNextYear;
  const displayCapPct = cap > 0 ? displayDeadThis / cap : 0;

  if (!userTeamId) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">No team loaded. Complete the hiring process first.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border rounded-xl">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg border flex items-center justify-center font-bold text-xs">
              {(selectedTeam?.abbrev ?? selectedTeam?.name ?? "TM").slice(0, 3).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-muted-foreground">{selectedTeam?.name ?? "Team"}</div>
              <div className="text-xl font-bold">DEAD MONEY</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Year filter */}
            {yearOptions.map((y) => (
              <Button
                key={y}
                size="sm"
                variant={selectedYear === y ? "default" : "outline"}
                onClick={() => setSelectedYear(y)}
              >
                {y}
              </Button>
            ))}
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <Button
              size="sm"
              variant={viewMode === "team" ? "default" : "outline"}
              onClick={() => { setViewMode("team"); setSelectedTeamId(userTeamId); }}
            >
              My Team
            </Button>
            <Button
              size="sm"
              variant={viewMode === "league" ? "default" : "outline"}
              onClick={() => setViewMode("league")}
            >
              League
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "team" ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Dead Cap {selectedYear}</div>
              <div className="text-lg font-bold tabular-nums">{money(displayDeadThis)}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">% of Cap</div>
              <div className="text-lg font-bold tabular-nums">{pct(displayCapPct)}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Players</div>
              <div className="text-lg font-bold tabular-nums">{ledger.playerCount}</div>
            </div>
          </div>

          {displayDeadNext > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-center justify-between">
              <span className="text-sm text-amber-400">Dead Cap Carrying to {selectedYear + 1}</span>
              <span className="text-sm font-semibold tabular-nums text-amber-400">{money(displayDeadNext)}</span>
            </div>
          )}

          {/* Entry list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dead Cap Entries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {ledger.entries.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  {displayDeadThis > 0
                    ? "Dead cap tracked in aggregate. No individual cut records for this year yet."
                    : "No dead cap entries for this year."}
                </div>
              ) : (
                <ScrollArea className="max-h-[60vh]">
                  <div className="divide-y">
                    {ledger.entries.map((entry) => (
                      <button
                        key={entry.transactionId}
                        className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                        onClick={() => setDrawerEntry(entry)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold truncate">{entry.playerName}</span>
                            <Badge variant="outline" className="text-xs">{entry.playerPos}</Badge>
                            <Badge variant="secondary" className="text-xs">{TYPE_LABEL[entry.transactionType] ?? entry.transactionType}</Badge>
                            {entry.accelerationType !== "NONE" && (
                              <Badge
                                variant={entry.accelerationType === "POST_JUNE_1" ? "destructive" : "outline"}
                                className="text-xs"
                              >
                                {ACCEL_LABEL[entry.accelerationType]}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Proration remaining: {money(entry.remainingProration)}
                            {entry.deadCapNextYear > 0 && (
                              <span className="ml-2 text-amber-400">· Next yr: {money(entry.deadCapNextYear)}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-semibold tabular-nums text-destructive shrink-0">
                          {money(entry.deadCapThisYear)}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Link to="/hub/cap-baseline">
              <Button variant="secondary" size="sm">Cap Baseline</Button>
            </Link>
            <Link to="/hub/roster-audit">
              <Button variant="secondary" size="sm">Roster Audit</Button>
            </Link>
          </div>
        </>
      ) : (
        /* League View */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">League Dead Money — {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[70vh]">
              <div className="divide-y">
                {leagueSummary.map((row) => (
                  <button
                    key={row.teamId}
                    className={`w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors ${row.isUserTeam ? "bg-primary/5" : ""}`}
                    onClick={() => {
                      if (row.isUserTeam) {
                        setSelectedTeamId(row.teamId);
                        setViewMode("team");
                      }
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs w-8 shrink-0 text-muted-foreground">{row.teamAbbrev}</span>
                        <span className="font-semibold truncate text-sm">{row.teamName}</span>
                        {row.isUserTeam && <Badge variant="default" className="text-xs">You</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {pct(row.capPct)} of cap · {row.playerCount} player{row.playerCount !== 1 ? "s" : ""}
                        {row.deadCapNextYear > 0 && <span className="ml-2 text-amber-400">· {money(row.deadCapNextYear)} next yr</span>}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold tabular-nums shrink-0 ${row.deadCapThisYear > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {money(row.deadCapThisYear)}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Entry Detail Drawer */}
      <Drawer open={!!drawerEntry} onOpenChange={(open) => !open && setDrawerEntry(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Dead Cap Detail</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-4 space-y-4">
              {!drawerEntry ? null : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-lg font-bold truncate">{drawerEntry.playerName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span>{drawerEntry.playerPos}</span>
                        <span>·</span>
                        <span>{TYPE_LABEL[drawerEntry.transactionType] ?? drawerEntry.transactionType}</span>
                        <span>·</span>
                        <span>{ACCEL_LABEL[drawerEntry.accelerationType]}</span>
                        <span>·</span>
                        <span>Season {drawerEntry.season}</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setDrawerEntry(null)}>Close</Button>
                  </div>

                  {/* Cap figures */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Dead Cap This Year</div>
                      <div className="text-lg font-bold text-destructive tabular-nums">{money(drawerEntry.deadCapThisYear)}</div>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Dead Cap Next Year</div>
                      <div className={`text-lg font-bold tabular-nums ${drawerEntry.deadCapNextYear > 0 ? "text-amber-400" : "text-muted-foreground"}`}>
                        {money(drawerEntry.deadCapNextYear)}
                      </div>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Proration Remaining</div>
                      <div className="text-base font-semibold tabular-nums">{money(drawerEntry.remainingProration)}</div>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Acceleration</div>
                      <div className="text-base font-semibold">{ACCEL_LABEL[drawerEntry.accelerationType]}</div>
                    </div>
                  </div>

                  {/* Notes / why it accelerated */}
                  {drawerEntry.notes && (
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground mb-1">Notes</div>
                      <div className="text-sm">{drawerEntry.notes}</div>
                    </div>
                  )}

                  {/* Original contract summary */}
                  {drawerEntry.contractSnapshot && (
                    <div className="rounded-xl border overflow-hidden">
                      <div className="p-3 text-sm font-semibold">Original Contract</div>
                      <Separator />
                      <div className="divide-y">
                        <div className="p-3 flex justify-between text-sm">
                          <span className="text-muted-foreground">Years</span>
                          <span>{drawerEntry.contractSnapshot.startSeason}–{drawerEntry.contractSnapshot.endSeason}</span>
                        </div>
                        <div className="p-3 flex justify-between text-sm">
                          <span className="text-muted-foreground">Signing Bonus</span>
                          <span className="tabular-nums">{money(drawerEntry.contractSnapshot.signingBonus)}</span>
                        </div>
                        <div className="p-3 flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Value</span>
                          <span className="tabular-nums">
                            {money(drawerEntry.contractSnapshot.salaries.reduce((a, b) => a + b, 0) + drawerEntry.contractSnapshot.signingBonus)}
                          </span>
                        </div>
                      </div>

                      {/* Cap ledger timeline */}
                      <Separator />
                      <div className="p-3 text-xs text-muted-foreground font-semibold">Cap Ledger by Season</div>
                      <div className="divide-y">
                        {drawerEntry.contractSnapshot.salaries.map((sal, i) => {
                          const yr = drawerEntry.contractSnapshot!.startSeason + i;
                          const years = drawerEntry.contractSnapshot!.salaries.length;
                          const prorationPerYear = drawerEntry.contractSnapshot!.signingBonus > 0
                            ? Math.round(drawerEntry.contractSnapshot!.signingBonus / years / 50_000) * 50_000
                            : 0;
                          const capHit = Math.round((sal + prorationPerYear) / 50_000) * 50_000;
                          const isPast = yr < drawerEntry.season;
                          return (
                            <div key={yr} className={`p-3 flex justify-between text-sm ${isPast ? "opacity-40" : ""}`}>
                              <span className="text-muted-foreground">
                                Season {yr}
                                {yr === drawerEntry.season && <span className="ml-1 text-xs text-primary">← cut</span>}
                              </span>
                              <div className="text-right tabular-nums">
                                <div>{money(capHit)}</div>
                                {prorationPerYear > 0 && (
                                  <div className="text-xs text-muted-foreground">{money(sal)} + {money(prorationPerYear)} bonus</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
