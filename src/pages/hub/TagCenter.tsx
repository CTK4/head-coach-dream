import { useMemo, useState } from "react";
import { useGame, type TagType } from "@/context/GameContext";
import { getContracts, getPlayers } from "@/data/leagueDb";
import { normalizePos, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { projectedMarketApy } from "@/engine/marketModel";
import { resolveTagCost, posTagGroup } from "@/engine/tagValues";
import { LockedPhaseCard } from "@/components/hub/LockedPhaseCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function money(n: number) {
  const m = n / 1_000_000;
  const abs = Math.abs(m);
  const s = abs >= 10 ? `${Math.round(m)}M` : `${(Math.round(m * 10) / 10).toFixed(1)}M`;
  return `$${s}`;
}

function round50k(v: number) {
  return Math.round(v / 50_000) * 50_000;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function leverageMeter(ovr: number, pos: string, age: number) {
  const p = normalizePos(pos);
  const premium = new Set(["QB", "EDGE", "WR", "CB"]);
  const o = clamp01((ovr - 70) / 22);
  const a = clamp01((30 - age) / 8);
  const b = premium.has(p) ? 0.12 : 0;
  return Math.round(clamp01(0.18 + o * 0.55 + a * 0.25 + b) * 100);
}

/** Negotiation deadline week (sim) – tagging side must reach a deal by this week. */
const NEGOTIATION_DEADLINE_WEEK = 8;

export default function TagCenter() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId ?? (state as any).userTeamId;

  // Phase gate: no team yet
  if (!teamId) {
    return (
      <LockedPhaseCard
        title="TAG CENTER"
        message="No team selected yet."
        nextAvailable="After accepting an offer."
      />
    );
  }

  const isWindowOpen = state.careerStage === "RESIGN";
  const applied = state.offseasonData.tagCenter.applied;

  // Phase gate: window closed and no tag applied
  if (!isWindowOpen && !applied) {
    return (
      <LockedPhaseCard
        title="TAG CENTER"
        message="The franchise tag window is closed."
        nextAvailable="Retention Window (Phase 2 – Re-sign stage)"
      />
    );
  }

  const availableCap = state.finances.capSpace;
  const decisions = state.offseasonData.resigning.decisions;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [tagTypeTab, setTagTypeTab] = useState<"non" | "ex" | "trans">("non");

  const hasOfferFor = (playerId: string) => decisions?.[playerId]?.action === "RESIGN";

  const eligible = useMemo(() => {
    const contracts = getContracts();
    const ps = getPlayers();

    return ps
      .filter(
        (p: any) =>
          String((state as any).playerTeamOverrides?.[String(p.playerId)] ?? p.teamId) === String(teamId),
      )
      .map((p: any) => {
        const c = contracts.find((x: any) => x.contractId === p.contractId);
        const end = Number(c?.endSeason ?? state.season);
        return { p, end };
      })
      .filter((r) => r.end <= state.season)
      .map(({ p }) => {
        const id = String(p.playerId);
        const ovr = Number(p.overall ?? 0);
        const age = Number(p.age ?? 26);
        const pos = normalizePos(String(p.pos ?? "UNK"));
        const marketApy = projectedMarketApy(pos, ovr, age);

        const s = getContractSummaryForPlayer(state, id);
        const priorSeason = state.season - 1;
        const priorSalary = round50k(Number(s?.capHitBySeason?.[priorSeason] ?? 0));

        const { non, ex, trans } = resolveTagCost(pos, marketApy, priorSalary);

        const leverage = leverageMeter(ovr, pos, age);
        const compPickRisk = ovr >= 84 ? "High" : ovr >= 78 ? "Med" : "Low";

        return {
          id,
          name: String(p.fullName),
          pos,
          tagGroup: posTagGroup(pos),
          age,
          ovr,
          marketApy,
          priorSalary,
          non,
          ex,
          trans,
          leverage,
          compPickRisk,
        };
      })
      .sort((a, b) => b.ovr - a.ovr);
  }, [state, teamId, decisions]);

  const focus = useMemo(
    () => eligible.find((e) => e.id === focusId) ?? null,
    [eligible, focusId],
  );

  const tagsRemaining = applied ? 0 : 1;

  const canApply = (playerId: string, cost: number) => {
    if (!isWindowOpen) return false;
    if (applied) return false;
    if (hasOfferFor(playerId)) return false;
    if (availableCap - cost < 0) return false;
    return true;
  };

  const apply = (playerId: string, type: TagType, cost: number) => {
    dispatch({ type: "TAG_APPLY", payload: { playerId, type, cost } });
    setDrawerOpen(false);
  };

  const openDrawer = (id: string) => {
    setFocusId(id);
    setTagTypeTab("non");
    setDrawerOpen(true);
  };

  // Tagged player data for pinned card
  const taggedPlayer = useMemo(() => {
    if (!applied) return null;
    const p: any = getPlayers().find((x: any) => String(x.playerId) === String(applied.playerId));
    if (!p) return null;
    const pos = normalizePos(String(p.pos ?? "UNK"));
    const ovr = Number(p.overall ?? 0);
    const age = Number(p.age ?? 26);
    return {
      name: String(p.fullName),
      pos,
      tagGroup: posTagGroup(pos),
      ovr,
      age,
    };
  }, [applied]);

  // Negotiation timeline
  const negoWeekStart = applied?.appliedWeek ?? 0;
  const negoProgress = Math.min(
    100,
    Math.round(((negoWeekStart) / NEGOTIATION_DEADLINE_WEEK) * 100),
  );
  const weeksLeft = Math.max(0, NEGOTIATION_DEADLINE_WEEK - negoWeekStart);

  const tagLabel: Record<TagType, string> = {
    FRANCHISE_NON_EX: "Franchise (Non-Ex)",
    FRANCHISE_EX: "Franchise (Exclusive)",
    TRANSITION: "Transition",
  };

  return (
    <div className="space-y-3 pb-6">
      {/* Sticky status header */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 rounded-xl border border-border bg-background/90 px-4 py-2.5 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2">
          <Badge variant={isWindowOpen ? "default" : "secondary"}>
            Tag Window: {isWindowOpen ? "OPEN" : "CLOSED"}
          </Badge>
          <span className="text-sm font-semibold">
            Tags Remaining: {tagsRemaining}
          </span>
        </div>
        {applied ? (
          <Button
            size="sm"
            variant="destructive"
            disabled={!isWindowOpen}
            onClick={() => dispatch({ type: "TAG_REMOVE" })}
          >
            Remove Tag
          </Button>
        ) : null}
      </div>

      {/* Tagged player pinned card */}
      {applied && taggedPlayer ? (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge>{tagLabel[applied.type]}</Badge>
              <span className="font-bold">{taggedPlayer.name}</span>
              <span className="text-muted-foreground font-normal text-sm">
                ({taggedPlayer.pos} · {taggedPlayer.tagGroup})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <div className="text-xs text-muted-foreground">OVR</div>
                <div className="font-bold">{taggedPlayer.ovr}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cap Hit</div>
                <div className="font-bold text-primary">{money(applied.cost)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cap After</div>
                <div className={`font-bold ${availableCap < 0 ? "text-destructive" : ""}`}>
                  {money(availableCap)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Negotiation section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Negotiation Timeline</span>
                <Badge variant="outline" className="text-xs">
                  Week {negoWeekStart} → Deadline Wk {NEGOTIATION_DEADLINE_WEEK}
                </Badge>
              </div>
              <Progress value={negoProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tagged</span>
                <span>{weeksLeft} week{weeksLeft !== 1 ? "s" : ""} to negotiate</span>
                <span>Deadline</span>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                {/* TODO: extension flow — wire to extension system when available */}
                Extension talks: <span className="text-foreground font-medium">Open</span>
                <span className="mx-1">·</span>
                <span className="italic text-xs">TODO: extension flow</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Eligible players list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Eligible Players
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (expiring contracts)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {eligible.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No expiring players eligible for franchise tagging.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {eligible.map((e) => {
                const isTagged = applied?.playerId === e.id;
                const hasPendingOffer = hasOfferFor(e.id);
                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold truncate">{e.name}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {e.pos}
                        </Badge>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {e.tagGroup}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Age {e.age} · OVR {e.ovr} · Market {money(e.marketApy)}/yr · Non-Ex est.{" "}
                        {money(e.non)}/yr
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {isTagged ? (
                        <Badge>Tagged</Badge>
                      ) : hasPendingOffer ? (
                        <Badge variant="secondary">Offer Out</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!isWindowOpen || !!applied}
                          onClick={() => openDrawer(e.id)}
                        >
                          Tag
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation bottom sheet */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="pb-2">
            <SheetTitle>
              Apply Tag
              {focus ? ` — ${focus.name} (${focus.pos})` : ""}
            </SheetTitle>
          </SheetHeader>

          {focus ? (
            <div className="space-y-4 pt-2">
              {/* Player summary */}
              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="font-semibold">{focus.name}</span>
                  <Badge variant="outline">{focus.pos}</Badge>
                  <span className="text-muted-foreground">{focus.tagGroup}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>OVR {focus.ovr}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>Age {focus.age}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Market APY {money(focus.marketApy)} · Cap space available {money(availableCap)}
                </div>
                {hasOfferFor(focus.id) ? (
                  <div className="text-xs text-destructive">
                    Active re-sign offer pending — clear it in Re-sign or Audit to tag.
                  </div>
                ) : null}
              </div>

              {/* Leverage */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Negotiation Leverage</span>
                  <span>{focus.leverage}/100</span>
                </div>
                <Progress value={focus.leverage} className="h-1.5" />
              </div>

              {/* Tag type buttons */}
              <div className="flex gap-2">
                {(["non", "ex", "trans"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTagTypeTab(t)}
                    className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition ${
                      tagTypeTab === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {t === "non" ? "Non-Ex" : t === "ex" ? "Exclusive" : "Transition"}
                  </button>
                ))}
              </div>

              {/* Selected tag details */}
              {(() => {
                const costMap = { non: focus.non, ex: focus.ex, trans: focus.trans };
                const typeMap: Record<"non" | "ex" | "trans", TagType> = {
                  non: "FRANCHISE_NON_EX",
                  ex: "FRANCHISE_EX",
                  trans: "TRANSITION",
                };
                const cost = costMap[tagTypeTab];
                const type = typeMap[tagTypeTab];
                const capAfter = availableCap - cost;
                const blocked = !canApply(focus.id, cost);
                return (
                  <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Tag Cost (1-yr)</div>
                        <div className="font-bold">{money(cost)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Cap After Tag</div>
                        <div className={`font-bold ${capAfter < 0 ? "text-destructive" : ""}`}>
                          {money(capAfter)}
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="text-xs text-muted-foreground">
                      Cap reservation: {money(cost)} counts against active-roster cap (Top 51 if
                      applicable). Comp pick risk: {focus.compPickRisk}.
                    </div>
                    {capAfter < 0 ? (
                      <div className="text-xs text-destructive font-medium">
                        Blocked: exceeds available cap space.
                      </div>
                    ) : null}
                    {hasOfferFor(focus.id) ? (
                      <div className="text-xs text-destructive font-medium">
                        Blocked: active re-sign offer exists.
                      </div>
                    ) : null}
                    <Button
                      className="w-full"
                      disabled={blocked}
                      onClick={() => apply(focus.id, type, cost)}
                    >
                      Confirm — Apply{" "}
                      {type === "FRANCHISE_NON_EX"
                        ? "Franchise Tag"
                        : type === "FRANCHISE_EX"
                          ? "Exclusive Franchise Tag"
                          : "Transition Tag"}
                    </Button>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No player selected.
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
