import { getPositionLabel } from "@/lib/displayLabels";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import {
  getEffectivePlayer,
  getDepthSlotLabel,
  normalizePos,
  getContractSummaryForPlayer,
} from "@/engine/rosterOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { computeHOFm } from "@/engine/hofMonitor";
import { resolveQbArchetypeTag, getQbArchetypeBadge } from "@/engine/qb/qbArchetype";
import { getQbSchemeFitMultiplier, getQbSchemeFitSignal } from "@/engine/qb/qbSchemeFit";
import { BADGE_DEFINITIONS } from "@/engine/badges/engine";
import { UNICORN_DEFINITIONS } from "@/engine/unicorns/engine";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ContractMarketInfoTrigger } from "@/components/explainability/ContractMarketInfoTrigger";

function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
function money(n: number) {
  return `$${(n / 1_000_000).toFixed(1)}M`;
}
function moneyShort(n: number) {
  const m = n / 1_000_000;
  return m >= 10 ? `$${Math.round(m)}M` : `$${Math.round(m * 10) / 10}M`;
}

export default function PlayerProfile() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const { playerId = "" } = useParams();

  const [offerOpen, setOfferOpen] = useState(false);
  const [years, setYears] = useState(2);
  const [aav, setAav] = useState(8_000_000);

  const p = useMemo(
    () => getEffectivePlayer(state, playerId),
    [state, playerId],
  );
  if (!p) return <div className="p-6">Player not found.</div>;

  const name = String(p.fullName ?? "Player");
  const pos = normalizePos(String(p.pos ?? "UNK"));
  const posLabel = getPositionLabel(pos);
  const age = Number(p.age ?? 0);
  const ovr = clamp100(Number(p.overall ?? 0));
  const teamId = String(p.teamId ?? "");
  const isFA =
    !teamId ||
    teamId.toUpperCase() === "FREE_AGENT" ||
    String(p.status ?? "").toUpperCase() === "FREE_AGENT";
  const depth = getDepthSlotLabel(state, playerId);
  const contract = getContractSummaryForPlayer(state, playerId);
  const qbTag = pos === "QB" ? resolveQbArchetypeTag(p as any) : undefined;
  const qbBadge = qbTag ? getQbArchetypeBadge(qbTag) : undefined;
  const offenseSchemeId = state.scheme?.offense?.schemeId as any;
  const qbFitMult = qbTag ? getQbSchemeFitMultiplier(qbTag, offenseSchemeId) : 1;
  const qbFitSignal = qbTag ? getQbSchemeFitSignal(qbFitMult) : undefined;


  const careerStats = state.playerCareerStatsById?.[playerId] as any;
  const careerSeasons = careerStats?.seasons ?? [];
  const hof = computeHOFm({ pos, overall: ovr, careerStats, accolades: state.playerAccolades?.[playerId] as any });

  const offers = state.freeAgency.offersByPlayerId[playerId] ?? [];
  const hasUserOffer = offers.some((o) => o.isUser && o.status !== "WITHDRAWN");
  const anyPending = offers.some((o) => o.status === "PENDING");
  const pendingUser = offers.find((o) => o.isUser && o.status === "PENDING");
  const accepted = offers.find((o) => o.status === "ACCEPTED");
  const capIllegal = state.finances.capSpace < 0;


  const playerBadges = state.playerBadges?.[playerId] ?? [];
  const playerUnicorn = state.playerUnicorns?.[playerId];

  const telemetryTeamTimeline = useMemo(() => {
    const bySeason = state.historicalTelemetry?.bySeason ?? {};
    const rows = Object.entries(bySeason).map(([seasonKey, seasonAgg]) => {
      const season = Number(seasonKey);
      const teamAgg = seasonAgg?.byTeamId?.[teamId];
      return {
        season,
        games: Number(teamAgg?.games ?? 0),
        passYards: Number(teamAgg?.totals?.passYards ?? 0),
        rushYards: Number(teamAgg?.totals?.rushYards ?? 0),
      };
    }).filter((row) => row.games > 0 || row.passYards > 0 || row.rushYards > 0).sort((a,b) => b.season - a.season);

    const currentTeamAgg = state.telemetry?.seasonAgg?.byTeamId?.[teamId];
    if (currentTeamAgg) {
      rows.unshift({
        season: Number(state.season),
        games: Number(currentTeamAgg.games ?? 0),
        passYards: Number(currentTeamAgg.totals?.passYards ?? 0),
        rushYards: Number(currentTeamAgg.totals?.rushYards ?? 0),
      });
    }
    return rows;
  }, [state.historicalTelemetry?.bySeason, state.telemetry?.seasonAgg?.byTeamId, state.season, teamId]);

  const badgeTimeline = useMemo(
    () => [...playerBadges].sort((a, b) => Number(b.awardedSeason ?? 0) - Number(a.awardedSeason ?? 0)),
    [playerBadges],
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-black/40">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <PlayerAvatar
                playerId={playerId}
                name={name}
                pos={posLabel}
                size="lg"
                className="border-white/15"
              />

              <div className="min-w-0 flex-1">
                <div className="text-xl font-extrabold tracking-wide truncate">
                  {name}
                </div>
                <div className="text-sm text-muted-foreground">{posLabel}</div>
                <div className="text-sm text-muted-foreground">Age {age}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-sm">
                  {depth ? (
                    <Badge
                      variant="outline"
                      className="rounded-xl border-white/15 bg-white/5"
                    >
                      Depth: {depth}
                    </Badge>
                  ) : null}
                  <Badge
                    variant="outline"
                    className="rounded-xl border-white/15 bg-white/5"
                  >
                    {isFA ? "Free Agent" : `Team: ${teamId}`}
                  </Badge>

                  {qbBadge ? (
                    <Badge variant="outline" title={qbBadge.tooltip} className="rounded-xl border-white/15 bg-white/5">
                      {qbBadge.label}
                    </Badge>
                  ) : null}
                  {qbFitSignal ? (
                    <Badge variant="outline" className="rounded-xl border-white/15 bg-white/5">
                      Scheme Fit: {qbFitSignal}
                    </Badge>
                  ) : null}


                {playerUnicorn ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="rounded-xl border border-fuchsia-300/60 bg-fuchsia-500/20 text-fuchsia-100">🦄 Unicorn</Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="font-semibold">{UNICORN_DEFINITIONS.find((d) => d.id === playerUnicorn.archetypeId)?.name ?? playerUnicorn.archetypeId}</div>
                      <div className="mt-1 text-[11px]">Confidence {Math.round(playerUnicorn.confidence * 100)}% • Discovered {playerUnicorn.discoveredSeason}</div>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
                {playerBadges.length > 0 ? (
                  <TooltipProvider>
                    {playerBadges.map((badge) => {
                      const definition = BADGE_DEFINITIONS.find((d) => d.id === badge.badgeId);
                      if (!definition) return null;
                      return (
                        <Tooltip key={`${badge.badgeId}-${badge.awardedSeason}`}>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="rounded-xl border-white/15 bg-white/5"
                            >
                              {definition.name}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="text-xs font-semibold">{definition.name}</div>
                            <div className="text-xs text-muted-foreground">{definition.description}</div>
                            <div className="mt-1 text-[11px]">{definition.rarity} • Awarded {badge.awardedSeason}</div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                ) : null}
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-2 text-center">
                  <div className="text-3xl font-extrabold text-emerald-300">
                    {ovr}
                  </div>
                  <div className="text-xs font-bold tracking-widest text-emerald-200/90">
                    OVR
                  </div>
                </div>

                {isFA ? (
                  <Button
                    className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
                    onClick={() => setOfferOpen(true)}
                  >
                    {hasUserOffer ? "View Offers" : "Make Offer"}
                  </Button>
                ) : null}


                {import.meta.env.DEV && qbTag ? (
                  <select
                    className="rounded border bg-background px-2 py-1 text-xs"
                    value={String((p as any).qbArchetypeManualOverride ?? "")}
                    onChange={(e) => dispatch({ type: "SET_PLAYER_ATTR_OVERRIDE", payload: { playerId, patch: { qbArchetypeManualOverride: (e.target.value || undefined) as any } } })}
                  >
                    <option value="">Auto Archetype</option>
                    <option value="POCKET_PURE">Pocket Pure</option>
                    <option value="DUAL_THREAT">Dual Threat</option>
                    <option value="SCRAMBLER">Scrambler</option>
                    <option value="GAME_MANAGER">Game Manager</option>
                    <option value="IMPROVISER">Improviser</option>
                  </select>
                ) : null}
                <Button
                  variant="secondary"
                  className="rounded-xl"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 space-y-4">
          <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
            <CardContent className="p-4">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Career Stats <span>{careerSeasons.length} seasons</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Season</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>GP</TableHead>
                        <TableHead>Pass Yds</TableHead>
                        <TableHead>Rush Yds</TableHead>
                        <TableHead>Rec Yds</TableHead>
                        <TableHead>Sacks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {careerSeasons.map((ss, idx) => (
                        <TableRow key={`${ss.season}-${idx}`}>
                          <TableCell>{ss.season}</TableCell>
                          <TableCell>{ss.teamId}</TableCell>
                          <TableCell>{ss.gamesPlayed}</TableCell>
                          <TableCell>{ss.passingYards ?? 0}</TableCell>
                          <TableCell>{ss.rushingYards ?? 0}</TableCell>
                          <TableCell>{ss.receivingYards ?? 0}</TableCell>
                          <TableCell>{ss.sacks ?? 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>


          <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base tracking-wide">HISTORICAL TELEMETRY</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">Team-season context from retained telemetry history.</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Season</TableHead>
                    <TableHead>Games</TableHead>
                    <TableHead>Pass Yds</TableHead>
                    <TableHead>Rush Yds</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {telemetryTeamTimeline.slice(0, 10).map((row) => (
                    <TableRow key={`telemetry-${row.season}`}>
                      <TableCell>{row.season}</TableCell>
                      <TableCell>{row.games}</TableCell>
                      <TableCell>{row.passYards}</TableCell>
                      <TableCell>{row.rushYards}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="pt-2">
                <div className="text-sm font-semibold mb-2">Badges Timeline</div>
                <div className="flex flex-wrap gap-2">
                  {badgeTimeline.length === 0 ? <span className="text-xs text-muted-foreground">No badges earned yet.</span> : badgeTimeline.map((badge) => (
                    <Badge key={`${badge.badgeId}-${badge.awardedSeason}-timeline`} variant="outline" className="rounded-xl border-white/15 bg-white/5">
                      {BADGE_DEFINITIONS.find((d) => d.id === badge.badgeId)?.name ?? badge.badgeId} · {badge.awardedSeason}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
            <CardHeader className="pb-2"><CardTitle className="text-base tracking-wide">HALL OF FAME MONITOR</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {!hof ? <div className="text-muted-foreground">HOF Monitor unlocks after 3 seasons.</div> : <>
                <div className="flex items-center justify-between"><Badge className={hof.tier === "LOCK" ? "bg-yellow-400 text-black" : hof.tier === "STRONG" ? "bg-blue-600 text-white" : hof.tier === "BORDERLINE" ? "bg-yellow-200 text-black" : hof.tier === "LONGSHOT" ? "bg-slate-500 text-slate-100" : "bg-secondary text-muted-foreground"}>{hof.tier}</Badge><div className="text-2xl font-black">{hof.score}</div></div>
                <div className="text-muted-foreground">{hof.label}</div>
                <div className="h-2 rounded bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (hof.score / 150) * 100)}%` }} /></div>
                <Collapsible>
                  <CollapsibleTrigger asChild><Button variant="outline" className="w-full justify-between">Score Breakdown <span>▼</span></Button></CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 space-y-1">{hof.breakdown.map((f) => <div key={f.label} className="flex justify-between"><span>{f.label}</span><span>+{f.value}</span></div>)}<div className="border-t pt-1 flex justify-between font-semibold"><span>Total</span><span>{hof.score}</span></div></CollapsibleContent>
                </Collapsible>
              </>}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base tracking-wide">
                CONTRACT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Years Remaining</span>
                <span className="font-semibold">
                  {contract ? contract.yearsRemaining : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cap Hit</span>
                <span className="font-semibold">
                  {contract ? money(contract.capHit) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-semibold">
                  {contract ? money(contract.total) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signing Bonus</span>
                <span className="font-semibold">
                  {contract ? money(contract.signingBonus) : "—"}
                </span>
              </div>
              {contract ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl border-white/15 text-xs mt-2"
                  onClick={() => navigate(`/contracts/player/${playerId}`)}
                >
                  View Full Contract
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-t-2xl sm:max-w-lg sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>{hasUserOffer ? "Offers" : "Make Offer"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              {accepted ? <Badge variant="secondary">Signed</Badge> : null}
              {anyPending ? <Badge variant="outline">Pending</Badge> : null}
              {capIllegal ? (
                <Badge variant="destructive">Cap Illegal</Badge>
              ) : null}
            </div>

            {!accepted ? (
              <Card className="rounded-2xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-1">
                    <div className="font-semibold">Make Offer</div>
                    <ContractMarketInfoTrigger className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">
                        Years
                      </div>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">
                        AAV
                      </div>
                      <Input
                        type="number"
                        step={50000}
                        min={750000}
                        value={aav}
                        onChange={(e) => setAav(Number(e.target.value))}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={capIllegal}
                      className="rounded-xl flex-1 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
                      onClick={() =>
                        dispatch({
                          type: "FA_SUBMIT_OFFER",
                          payload: { playerId },
                        })
                      }
                    >
                      Submit Offer
                    </Button>
                    {pendingUser ? (
                      <Button
                        variant="secondary"
                        className="rounded-xl"
                        onClick={() =>
                          dispatch({
                            type: "FA_WITHDRAW_OFFER",
                            payload: { playerId, offerId: pendingUser.offerId },
                          })
                        }
                      >
                        Withdraw
                      </Button>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cap Space: {moneyShort(state.finances.capSpace)} · Cash:{" "}
                    {moneyShort(state.finances.cash)}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="rounded-2xl">
              <CardContent className="p-4 space-y-2">
                <div className="font-semibold">Offer List</div>
                <div className="space-y-2">
                  {offers.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No offers yet.
                    </div>
                  ) : (
                    offers
                      .slice()
                      .sort((a, b) => b.aav - a.aav)
                      .map((o) => (
                        <div
                          key={o.offerId}
                          className="border rounded-xl p-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {o.isUser ? "Your Offer" : o.teamId}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {o.years}y · {moneyShort(o.aav)} · {o.status}{o.decisionReason ? ` · ${o.decisionReason}` : ""}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                className="rounded-xl"
                onClick={() => setOfferOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
