import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { getPlayerById } from "@/data/leagueDb";
import { HubPanel } from "@/components/franchise-hub/HubPanel";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

/** Estimated market APY per overall rating point for overpay calculation */
const MARKET_APY_PER_OVR_POINT = 300_000;

type SigningRow = {
  playerId: string;
  name: string;
  pos: string;
  ovr: number;
  years: number;
  aav: number;
  teamId: string;
  isUser: boolean;
};

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function FreeAgencyRecap() {
  const { state } = useGame();
  const userTeamId = String(state.acceptedOffer?.teamId ?? state.userTeamId ?? "");

  const signings = useMemo<SigningRow[]>(() => {
    const rows: SigningRow[] = [];
    for (const [playerId, sig] of Object.entries(state.freeAgency.signingsByPlayerId)) {
      const player = getPlayerById(playerId);
      rows.push({
        playerId,
        name: player?.fullName ?? playerId,
        pos: String(player?.pos ?? "UNK").toUpperCase(),
        ovr: Number(player?.overall ?? 0),
        years: sig.years,
        aav: sig.aav,
        teamId: sig.teamId,
        isUser: sig.teamId === userTeamId,
      });
    }
    return rows.sort((a, b) => b.aav - a.aav);
  }, [state.freeAgency.signingsByPlayerId, userTeamId]);

  const mySignings = useMemo(() => signings.filter((s) => s.isUser), [signings]);
  const leagueTop = useMemo(() => signings.slice(0, 10), [signings]);

  const bestBargains = useMemo(() => {
    return signings
      .filter((s) => s.ovr >= 70)
      .map((s) => ({ ...s, valuePerOvr: s.ovr > 0 ? s.aav / s.ovr : Infinity }))
      .sort((a, b) => a.valuePerOvr - b.valuePerOvr)
      .slice(0, 5);
  }, [signings]);

  const biggestOverpays = useMemo(() => {
    const marketApyPerOvr = MARKET_APY_PER_OVR_POINT;
    return signings
      .map((s) => ({ ...s, delta: s.aav - s.ovr * marketApyPerOvr }))
      .filter((s) => s.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 5);
  }, [signings]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-wide">FREE AGENCY RECAP</h1>
        <p className="text-sm text-slate-400 mt-1">Season {state.season} offseason summary</p>
      </div>

      {/* My Signings */}
      <HubPanel title="MY SIGNINGS">
        <ScrollArea className="max-h-64">
          {mySignings.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No signings this offseason.</p>
          ) : (
            <div className="space-y-2">
              {mySignings.map((s) => (
                <div key={s.playerId} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2">
                  <div>
                    <span className="font-semibold">{s.name}</span>
                    <span className="ml-2 text-xs text-slate-400">{s.pos} · OVR {s.ovr}</span>
                  </div>
                  <div className="text-right text-sm">
                    <span className="font-medium">{formatMoney(s.aav)}/yr</span>
                    <span className="ml-2 text-slate-400">{s.years}y</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </HubPanel>

      {/* League Top Contracts */}
      <HubPanel title="LEAGUE TOP CONTRACTS">
        <ScrollArea className="max-h-56">
          <div className="space-y-2">
            {leagueTop.map((s, i) => (
              <div key={s.playerId} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs w-4">{i + 1}.</span>
                  <div>
                    <span className="font-semibold">{s.name}</span>
                    <span className="ml-2 text-xs text-slate-400">{s.pos} · OVR {s.ovr}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{formatMoney(s.aav)}/yr</span>
                  {s.isUser && <Badge variant="outline" className="text-xs">Your Team</Badge>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </HubPanel>

      {/* Best Bargains */}
      <HubPanel title="BEST BARGAINS">
        <ScrollArea className="max-h-48">
          <div className="space-y-2">
            {bestBargains.map((s) => (
              <div key={s.playerId} className="flex items-center justify-between rounded-lg bg-emerald-900/30 border border-emerald-700/30 px-3 py-2">
                <div>
                  <span className="font-semibold">{s.name}</span>
                  <span className="ml-2 text-xs text-slate-400">{s.pos} · OVR {s.ovr}</span>
                </div>
                <div className="text-sm text-emerald-300">{formatMoney(s.aav)}/yr</div>
              </div>
            ))}
            {bestBargains.length === 0 && <p className="text-sm text-slate-400 py-2">No bargains found.</p>}
          </div>
        </ScrollArea>
      </HubPanel>

      {/* Biggest Overpays */}
      <HubPanel title="BIGGEST OVERPAYS">
        <ScrollArea className="max-h-48">
          <div className="space-y-2">
            {biggestOverpays.map((s) => (
              <div key={s.playerId} className="flex items-center justify-between rounded-lg bg-red-900/20 border border-red-700/30 px-3 py-2">
                <div>
                  <span className="font-semibold">{s.name}</span>
                  <span className="ml-2 text-xs text-slate-400">{s.pos} · OVR {s.ovr}</span>
                </div>
                <div className="text-sm text-red-300">+{formatMoney(s.delta)} over market</div>
              </div>
            ))}
            {biggestOverpays.length === 0 && <p className="text-sm text-slate-400 py-2">No overpays found.</p>}
          </div>
        </ScrollArea>
      </HubPanel>
    </div>
  );
}
