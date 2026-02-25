import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getContractSummaryForPlayer, getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { getPhaseKey, isReSignAllowed } from "@/engine/phase";
import { LockedPhaseCard } from "@/components/hub/LockedPhaseCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { getPositionLabel } from "@/lib/displayLabels";

function resolveUserTeamId(state: any): string | undefined {
  return state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? state.profile?.teamId ?? state.coach?.teamId;
}

function money(n: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "$0.00M";
  return `$${(v / 1_000_000).toFixed(2)}M`;
}

function expectedApyFromOvr(ovr: number): number {
  if (ovr >= 92) return 18_000_000;
  if (ovr >= 88) return 14_000_000;
  if (ovr >= 84) return 10_000_000;
  if (ovr >= 80) return 7_000_000;
  if (ovr >= 75) return 4_500_000;
  if (ovr >= 70) return 3_000_000;
  return 1_600_000;
}

export default function ReSignPage() {
  const { state, dispatch } = useGame();
  const userTeamId = resolveUserTeamId(state);
  const ok = isReSignAllowed(state);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [years, setYears] = useState(2);
  const [salaryPct, setSalaryPct] = useState(100);
  const [bonusOn, setBonusOn] = useState(false);

  if (!userTeamId) return <LockedPhaseCard title="RE-SIGN" message="No team selected yet." nextAvailable="After accepting an offer." />;
  if (!ok) {
    const phase = getPhaseKey(state);
    return <LockedPhaseCard title="RE-SIGN" message="Re-signing is unavailable in the current phase." nextAvailable={phase === "REGULAR_SEASON_WEEK" ? "Retention Window" : "PHASE_2_RETENTION"} />;
  }

  const expiring = useMemo(() => {
    const roster = getEffectivePlayersByTeam(state, String(userTeamId));
    return roster
      .map((p: any) => {
        const summary = getContractSummaryForPlayer(state, String(p.playerId));
        const endSeason = summary?.endSeason ?? null;
        const ovr = Number(p.overall ?? p.ovr ?? 60);
        return {
          playerId: String(p.playerId),
          name: String(p.fullName ?? p.name ?? "Player"),
          pos: String(p.pos ?? "UNK"),
          age: p.age != null ? Number(p.age) : null,
          ovr,
          endSeason,
          isExpiring: endSeason === Number(state.season),
        };
      })
      .filter((x) => x.isExpiring)
      .sort((a, b) => b.ovr - a.ovr);
  }, [state, userTeamId]);

  const selected = useMemo(() => expiring.find((p) => p.playerId === selectedId) ?? null, [expiring, selectedId]);
  const expectedApy = selected ? expectedApyFromOvr(selected.ovr) : 0;
  const offeredApy = Math.round((expectedApy * salaryPct) / 100);
  const signingBonus = bonusOn ? Math.round(offeredApy * 0.35) : 0;
  const guaranteedAtSigning = bonusOn ? Math.round(offeredApy * 0.55) : Math.round(offeredApy * 0.35);

  function offer() {
    if (!selected) return;
    dispatch({
      type: "RESIGN_SUBMIT_OFFER",
      payload: {
        playerId: selected.playerId,
        offer: { years, apy: offeredApy, guaranteesPct: guaranteedAtSigning / Math.max(1, offeredApy * years), discountPct: 0, createdFrom: "RESIGN_SCREEN" },
      },
    });
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      <Card className="border-slate-300/15 bg-slate-950/35"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="space-y-1"><div className="text-2xl font-bold text-slate-100">Re-Sign Window</div><div className="text-sm text-slate-200/70">Extend expiring contracts before the offseason opens.</div></div><Badge variant="secondary">{expiring.length} Expiring</Badge></CardContent></Card>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="min-w-0 border-slate-300/15 bg-slate-950/35"><CardContent className="min-w-0 space-y-3 p-4"><div className="flex items-center justify-between gap-2"><div className="text-sm font-semibold text-slate-100">Expiring Players</div><Badge variant="outline">{expiring.length}</Badge></div><Separator className="bg-slate-300/15" /><div className="max-h-[560px] space-y-2 overflow-y-auto overflow-x-hidden pr-1">{expiring.length === 0 ? <div className="text-sm text-slate-200/70">No expiring contracts found.</div> : expiring.map((p) => (<button key={p.playerId} type="button" className={`w-full rounded-lg border p-3 text-left transition ${p.playerId === selectedId ? "border-emerald-400/50 bg-emerald-900/20" : "border-slate-300/15 bg-slate-950/20 hover:bg-slate-950/35"}`} onClick={() => { setSelectedId(p.playerId); setYears(2); setSalaryPct(100); setBonusOn(false); }}><div className="flex items-center justify-between gap-2"><div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-100">{p.name} <span className="text-slate-200/70">({getPositionLabel(p.pos)})</span></div><div className="truncate text-xs text-slate-200/70">OVR {p.ovr} • Age {p.age ?? "—"} • Ends {p.endSeason}</div></div><Badge variant="outline">{p.ovr}</Badge></div></button>))}</div></CardContent></Card>
        <Card className="min-w-0 border-slate-300/15 bg-slate-950/35"><CardContent className="space-y-4 p-4"><div className="text-sm font-semibold text-slate-100">Offer Extension</div><Separator className="bg-slate-300/15" />{!selected ? <div className="text-sm text-slate-200/70">Select a player to begin negotiations.</div> : <div className="space-y-4"><div className="rounded-lg border border-slate-300/15 bg-slate-950/20 p-3"><div className="text-sm font-semibold text-slate-100">{selected.name}</div><div className="text-xs text-slate-200/70">OVR {selected.ovr} • {selected.pos}</div><div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-200/80"><div>Market APY</div><div className="text-right font-semibold text-slate-100">{money(expectedApy)}</div><div>Offer APY</div><div className="text-right font-semibold text-slate-100">{money(offeredApy)}</div><div>Signing Bonus</div><div className="text-right font-semibold text-slate-100">{money(signingBonus)}</div><div>Guaranteed</div><div className="text-right font-semibold text-slate-100">{money(guaranteedAtSigning)}</div></div></div><div className="space-y-2"><div className="text-xs text-slate-200/70">Years: {years}</div><Slider value={[years]} min={1} max={4} step={1} onValueChange={(v) => setYears(v[0] ?? 2)} /></div><div className="space-y-2"><div className="text-xs text-slate-200/70">Salary: {salaryPct}% of market</div><Slider value={[salaryPct]} min={80} max={140} step={5} onValueChange={(v) => setSalaryPct(v[0] ?? 100)} /></div><div className="flex items-center justify-between rounded-lg border border-slate-300/15 bg-slate-950/20 p-3"><div className="text-sm text-slate-100">Include Signing Bonus</div><button type="button" className={`h-6 w-12 rounded-full border border-slate-300/15 ${bonusOn ? "bg-emerald-600/60" : "bg-slate-950/30"}`} onClick={() => setBonusOn((x) => !x)} aria-label="Toggle signing bonus"><div className={`h-5 w-5 rounded-full bg-slate-100 transition ${bonusOn ? "translate-x-6" : "translate-x-1"}`} /></button></div><Button className="w-full" onClick={offer}>Submit Offer</Button><div className="text-xs text-slate-200/60">MVP: acceptance is market-based. Tag mechanics live in Tag Center.</div></div>}</CardContent></Card>
      </div>
    </div>
  );
}