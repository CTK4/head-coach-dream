import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, X } from "lucide-react";
import { useGame } from "@/context/GameContext";
import {
  buildCapProjection,
  DEFAULT_BASE_CAP,
  MIN_ROSTER_ESTIMATE,
  type YearProjection,
} from "@/engine/capProjection";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { getPlayers } from "@/data/leagueDb";

// ─── helpers ────────────────────────────────────────────────────────────────

function money(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 100_000_000)
    return `${sign}$${(abs / 1_000_000).toFixed(0)}M`;
  return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
}

// ─── Extension line-item type ────────────────────────────────────────────────

type Extension = {
  id: string;
  label: string;
  capHit: number;
  /** Which year offsets [Y, Y+1, Y+2] should include this */
  years: [boolean, boolean, boolean];
};

// Tiny deterministic id helper — avoids Math.random
function makeId(prefix: string, n: number) {
  return `${prefix}_${n}`;
}

// ─── Summary card strip ──────────────────────────────────────────────────────

function SummaryCards({ proj }: { proj: YearProjection }) {
  const cards = [
    {
      label: "Projected Cap",
      value: proj.projectedCap,
      variant: "default" as const,
    },
    { label: "Commitments", value: -proj.commitments, variant: "default" as const },
    { label: "Dead Money", value: -proj.deadMoney, variant: "default" as const },
    {
      label: "Effective Space",
      value: proj.effectiveSpace,
      variant: proj.effectiveSpace < 0 ? ("destructive" as const) : ("default" as const),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-white/10 bg-slate-900 p-3">
          <div className="text-xs text-slate-400 mb-1">{c.label}</div>
          <div
            className={`text-base font-bold tabular-nums leading-none ${
              c.value < 0 ? "text-red-400" : "text-slate-100"
            }`}
          >
            {money(c.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Top hits list ───────────────────────────────────────────────────────────

function TopHitsList({
  proj,
  onSelectPlayer,
}: {
  proj: YearProjection;
  onSelectPlayer: (playerId: string) => void;
}) {
  if (proj.topHits.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-400 text-center">
        No committed contracts for {proj.year}.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 overflow-hidden">
      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Top Cap Hits — {proj.year}
      </div>
      <Separator className="bg-white/10" />
      <div className="divide-y divide-white/5">
        {proj.topHits.map((r, i) => (
          <button
            key={r.playerId}
            className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors"
            onClick={() => onSelectPlayer(r.playerId)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs text-slate-500 w-4 shrink-0 tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-100 truncate">
                  {r.name}
                </div>
                <div className="text-xs text-slate-400">
                  {r.pos} · {r.yearsRemaining > 0 ? `${r.yearsRemaining}yr left` : "expiring"}
                </div>
              </div>
            </div>
            <div className="text-sm font-bold tabular-nums text-slate-100 shrink-0">
              {money(r.capHit)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Player detail drawer ────────────────────────────────────────────────────

function PlayerDrawer({
  playerId,
  currentYear,
  onClose,
}: {
  playerId: string | null;
  currentYear: number;
  onClose: () => void;
}) {
  const { state } = useGame();

  const player = useMemo(() => {
    if (!playerId) return null;
    const p: any = getPlayers().find(
      (x: any) => String(x.playerId) === String(playerId),
    );
    const s = getContractSummaryForPlayer(state, playerId);
    return { p, s };
  }, [playerId, state]);

  return (
    <Drawer open={!!playerId} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-slate-950 border-white/10">
        <DrawerHeader>
          <DrawerTitle className="text-slate-100">Contract Detail</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 pb-8">
          {!player ? (
            <div className="text-sm text-slate-400">No player selected.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-bold text-slate-100 truncate">
                    {String(player.p?.fullName ?? "Unknown")}
                  </div>
                  <div className="text-sm text-slate-400">
                    {String(player.p?.pos ?? "UNK")} ·{" "}
                    {player.s
                      ? `${player.s.startSeason}–${player.s.endSeason}`
                      : "—"}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/hub/player/${playerId}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Profile
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>

              {player.s ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/10 bg-slate-900 p-3">
                      <div className="text-xs text-slate-400">APY</div>
                      <div className="text-base font-bold text-slate-100 tabular-nums">
                        {money(player.s.apy ?? 0)}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900 p-3">
                      <div className="text-xs text-slate-400">Years Left</div>
                      <div className="text-base font-bold text-slate-100 tabular-nums">
                        {player.s.yearsRemaining}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-slate-900 overflow-hidden">
                    <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Cap by Season
                    </div>
                    <Separator className="bg-white/10" />
                    <ScrollArea className="max-h-44">
                      <div className="divide-y divide-white/5">
                        {Object.entries(player.s.capHitBySeason ?? {})
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([yr, hit]) => (
                            <div
                              key={yr}
                              className={`px-4 py-2 flex items-center justify-between ${
                                Number(yr) === currentYear
                                  ? "bg-white/5"
                                  : ""
                              }`}
                            >
                              <span className="text-sm text-slate-300">
                                {yr}
                                {Number(yr) === currentYear && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-[10px] py-0"
                                  >
                                    now
                                  </Badge>
                                )}
                              </span>
                              <span className="text-sm font-semibold text-slate-100 tabular-nums">
                                {money(Number(hit ?? 0))}
                              </span>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-400">No contract on file.</div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Extensions panel ────────────────────────────────────────────────────────

function ExtensionRow({
  ext,
  onRemove,
}: {
  ext: Extension;
  onRemove: () => void;
}) {
  const appliesTo = ["Y", "Y+1", "Y+2"]
    .filter((_, i) => ext.years[i])
    .join(", ");

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-white/5 last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-100 truncate">
          {ext.label || "Unnamed extension"}
        </div>
        <div className="text-xs text-slate-400">
          {money(ext.capHit)} · {appliesTo}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 rounded-full p-1 hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors"
        aria-label="Remove extension"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddExtensionForm({
  onAdd,
  idCounter,
}: {
  onAdd: (ext: Extension) => void;
  idCounter: number;
}) {
  const [label, setLabel] = useState("");
  const [capHitStr, setCapHitStr] = useState("");
  const [years, setYears] = useState<[boolean, boolean, boolean]>([
    true, true, false,
  ]);

  function handleAdd() {
    const millions = parseFloat(capHitStr.replace(/[^0-9.]/g, "")) || 0;
    // Convert millions to dollars, then round to nearest $50k
    const capHit = Math.round((millions * 1_000_000) / 50_000) * 50_000;
    if (!label.trim() || capHit <= 0) return;
    onAdd({
      id: makeId("ext", idCounter),
      label: label.trim(),
      capHit,
      years,
    });
    setLabel("");
    setCapHitStr("");
    setYears([true, true, false]);
  }

  const yearLabels: ["Y", "Y+1", "Y+2"] = ["Y", "Y+1", "Y+2"];

  return (
    <div className="p-4 space-y-3 bg-slate-900/60 rounded-xl border border-white/10">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        Add Expected Extension
      </div>
      <input
        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Player / description"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        maxLength={60}
      />
      <input
        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Cap hit (millions, e.g. 32.5)"
        value={capHitStr}
        onChange={(e) => setCapHitStr(e.target.value)}
        inputMode="decimal"
      />
      <div className="flex items-center gap-3">
        {yearLabels.map((lbl, i) => (
          <label key={lbl} className="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={years[i]}
              onChange={(e) => {
                const next: [boolean, boolean, boolean] = [...years] as [boolean, boolean, boolean];
                next[i] = e.target.checked;
                setYears(next);
              }}
              className="rounded border-white/20"
            />
            {lbl}
          </label>
        ))}
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleAdd}
        className="w-full gap-2"
        disabled={!label.trim() || !capHitStr}
      >
        <PlusCircle className="h-4 w-4" />
        Add Line Item
      </Button>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CapProjection() {
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId;

  const baseSeason = Number(state.season ?? 2026);
  const yearKeys = [String(baseSeason), String(baseSeason + 1), String(baseSeason + 2)];

  const [activeYear, setActiveYear] = useState(yearKeys[0]);
  const [includeMinRoster, setIncludeMinRoster] = useState(false);
  const [includeExtensions, setIncludeExtensions] = useState(false);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [extIdCounter, setExtIdCounter] = useState(0);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const projections = useMemo<YearProjection[]>(() => {
    if (!teamId) return [];
    return buildCapProjection(state, teamId, {
      includeMinRoster,
      extensions: includeExtensions ? extensions : [],
    });
  }, [state, teamId, includeMinRoster, includeExtensions, extensions]);

  if (!teamId) {
    return (
      <div>
        <ScreenHeader title="CAP PROJECTION" backPath="/contracts" />
        <div className="p-4 text-sm text-slate-400">No team assigned yet.</div>
      </div>
    );
  }

  function addExtension(ext: Extension) {
    setExtensions((prev) => [...prev, ext]);
    setExtIdCounter((n) => n + 1);
  }

  function removeExtension(id: string) {
    setExtensions((prev) => prev.filter((e) => e.id !== id));
  }

  const activeProj = projections.find((p) => String(p.year) === activeYear);

  return (
    <div className="flex flex-col min-h-0">
      <ScreenHeader
        title="CAP PROJECTION"
        subtitle={`${baseSeason}–${baseSeason + 2} · 3-Year Horizon`}
        backPath="/contracts"
      />

      <div className="p-4 space-y-4">
        {/* ── Toggles ── */}
        <div className="rounded-xl border border-white/10 bg-slate-900 divide-y divide-white/5">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-100">
                Min roster / practice squad
              </div>
              <div className="text-xs text-slate-400">
                +{money(MIN_ROSTER_ESTIMATE)} burden per year
              </div>
            </div>
            <Switch
              checked={includeMinRoster}
              onCheckedChange={setIncludeMinRoster}
            />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-100">
                Include expected extensions
              </div>
              <div className="text-xs text-slate-400">
                Manual line items added below
              </div>
            </div>
            <Switch
              checked={includeExtensions}
              onCheckedChange={setIncludeExtensions}
            />
          </div>
        </div>

        {/* ── Extensions list + add form ── */}
        {includeExtensions && (
          <div className="rounded-xl border border-white/10 bg-slate-900 overflow-hidden">
            {extensions.length > 0 && (
              <div className="divide-y divide-white/5">
                {extensions.map((ext) => (
                  <ExtensionRow
                    key={ext.id}
                    ext={ext}
                    onRemove={() => removeExtension(ext.id)}
                  />
                ))}
              </div>
            )}
            <div className="p-4">
              <AddExtensionForm onAdd={addExtension} idCounter={extIdCounter} />
            </div>
          </div>
        )}

        {/* ── Year tabs ── */}
        {projections.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-slate-900 p-6 text-center text-sm text-slate-400">
            Loading projection data…
          </div>
        ) : (
          <Tabs value={activeYear} onValueChange={setActiveYear}>
            <TabsList className="grid grid-cols-3 w-full bg-slate-900 border border-white/10">
              {yearKeys.map((yr) => (
                <TabsTrigger
                  key={yr}
                  value={yr}
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400"
                >
                  {yr}
                </TabsTrigger>
              ))}
            </TabsList>

            {projections.map((proj) => (
              <TabsContent
                key={proj.year}
                value={String(proj.year)}
                className="mt-4 space-y-4"
              >
                <SummaryCards proj={proj} />

                {/* ── Dead money note ── */}
                {proj.deadMoney > 0 && (
                  <Card className="bg-slate-900 border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-300">
                        Dead Cap — {proj.year}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Accelerated / cut dead money
                        </span>
                        <span className="text-sm font-bold text-red-400 tabular-nums">
                          {money(proj.deadMoney)}
                        </span>
                      </div>
                      {proj.year === baseSeason + 1 && (
                        <div className="mt-1 text-xs text-slate-500">
                          Includes dead money from current-year post-June 1
                          designations carried forward.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <TopHitsList
                  proj={proj}
                  onSelectPlayer={setSelectedPlayerId}
                />

                {/* ── Legend ── */}
                <div className="text-xs text-slate-500 px-1 space-y-0.5">
                  <div>
                    Projected cap = ${(proj.projectedCap / 1_000_000).toFixed(0)}M
                    (base {money(Number(state.finances?.cap ?? DEFAULT_BASE_CAP))} ×
                    6.5%/yr growth).
                  </div>
                  <div>
                    Commitments include all players with a cap hit in {proj.year}.
                  </div>
                  {includeMinRoster && (
                    <div>
                      Min-roster / practice-squad burden:{" "}
                      {money(MIN_ROSTER_ESTIMATE)} (estimate).
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* ── Back link ── */}
        <div className="flex gap-2 pt-1">
          <Link to="/contracts/summary">
            <Button variant="ghost" size="sm" className="text-slate-400">
              ← Cap Summary
            </Button>
          </Link>
          <Link to="/hub/cap-baseline">
            <Button variant="ghost" size="sm" className="text-slate-400">
              Cap Baseline
            </Button>
          </Link>
        </div>
      </div>

      <PlayerDrawer
        playerId={selectedPlayerId}
        currentYear={Number(activeYear)}
        onClose={() => setSelectedPlayerId(null)}
      />
    </div>
  );
}
