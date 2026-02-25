import { getPositionLabel } from "@/lib/displayLabels";
import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getEffectivePlayer, normalizePos, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import {
  buildCapTable,
  computeCutProjection,
  getRestructureEligibility,
  maxRestructureAmount,
} from "@/engine/contractMath";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

function fmt(n: number) {
  const m = n / 1_000_000;
  if (m >= 10) return `$${Math.round(m)}M`;
  return `$${(Math.round(m * 10) / 10).toFixed(1)}M`;
}

export default function PlayerContractScreen() {
  const { state, dispatch } = useGame();
  const { playerId = "" } = useParams();
  const navigate = useNavigate();
  const [postJune1, setPostJune1] = useState(false);

  const player = useMemo(() => getEffectivePlayer(state, playerId), [state, playerId]);
  const contract = useMemo(() => getContractSummaryForPlayer(state, playerId), [state, playerId]);
  const capTable = useMemo(() => buildCapTable(state, playerId, 5), [state, playerId]);
  const cutProj = useMemo(
    () => computeCutProjection(state, playerId, postJune1),
    [state, playerId, postJune1],
  );
  const restructureElig = useMemo(
    () => getRestructureEligibility(state, playerId),
    [state, playerId],
  );
  const maxRestructure = useMemo(
    () => maxRestructureAmount(state, playerId),
    [state, playerId],
  );
  const guaranteedAtSigning = useMemo(
    () => state.playerContractOverrides[playerId]?.guaranteedAtSigning,
    [state, playerId],
  );

  if (!player) {
    return (
      <div>
        <ScreenHeader title="CONTRACT" showBack />
        <div className="p-6 text-center text-muted-foreground">Player not found.</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div>
        <ScreenHeader title="CONTRACT" subtitle={String(player.fullName ?? "Player")} showBack />
        <div className="p-6 text-center text-muted-foreground">No contract on file.</div>
      </div>
    );
  }

  const name = String(player.fullName ?? "Player");
  const pos = normalizePos(String(player.pos ?? "UNK"));
  const isExpiring = contract.yearsRemaining === 1;
  const isUfa = contract.yearsRemaining <= 0;
  const capSpace = state.finances.capSpace;

  const handleRestructure = () => {
    if (!restructureElig.eligible || maxRestructure <= 0) return;
    dispatch({ type: "CONTRACT_RESTRUCTURE_APPLY", payload: { playerId, amount: maxRestructure } });
  };

  const handleRelease = () => {
    dispatch({ type: "CUT_PLAYER", payload: { playerId } });
    navigate(-1);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pb-24">
      <ScreenHeader
        title="CONTRACT BREAKDOWN"
        showBack
        subtitle={`${name} · ${getPositionLabel(pos)}`}
        rightAction={
          <div className="flex gap-1 flex-wrap justify-end">
            {isUfa && (
              <Badge variant="destructive" className="text-xs">
                UFA
              </Badge>
            )}
            {!isUfa && isExpiring && (
              <Badge variant="secondary" className="text-xs">
                Expiring
              </Badge>
            )}
            {!isExpiring && !isUfa && (
              <Badge
                variant="outline"
                className="text-xs border-emerald-500/40 text-emerald-300"
              >
                Ext Eligible
              </Badge>
            )}
          </div>
        }
      />

      {/* Cap Space Banner */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-white/10 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Team Cap Space</span>
        <span className={`font-semibold ${capSpace < 0 ? "text-red-400" : "text-emerald-400"}`}>
          {fmt(capSpace)}
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Section 1: Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="rounded-xl border-white/10 bg-white/[0.04]">
            <CardContent className="p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">APY</div>
              <div className="text-base font-bold text-emerald-300">{fmt(contract.apy)}</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-white/10 bg-white/[0.04]">
            <CardContent className="p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Guaranteed</div>
              <div className="text-base font-bold">
                {fmt(guaranteedAtSigning ?? contract.signingBonus)}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-white/10 bg-white/[0.04]">
            <CardContent className="p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Yrs Left</div>
              <div className="text-base font-bold">{contract.yearsRemaining}</div>
            </CardContent>
          </Card>
        </div>

        {/* Contract detail rows */}
        <Card className="rounded-xl border-white/10 bg-white/[0.04]">
          <CardContent className="p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Value</span>
              <span className="font-semibold">{fmt(contract.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Signing Bonus</span>
              <span className="font-semibold">{fmt(contract.signingBonus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Proration / Year</span>
              <span className="font-semibold">{fmt(contract.prorationPerYear)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">This Year Cap Hit</span>
              <span className="font-semibold">{fmt(contract.capHit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dead Cap (if cut now)</span>
              <span className="font-semibold text-red-400">{fmt(contract.deadCapIfCutNow)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Year-by-Year Table */}
        <Card className="rounded-xl border-white/10 bg-white/[0.04]">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm tracking-wide">YEAR-BY-YEAR</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/[0.06]">
              <div className="grid grid-cols-4 px-3 py-2 text-xs text-muted-foreground">
                <span>Season</span>
                <span className="text-right">Base</span>
                <span className="text-right">Bonus</span>
                <span className="text-right font-semibold">Cap Hit</span>
              </div>
              {capTable.rows.map((row) => (
                <div
                  key={row.season}
                  className={`grid grid-cols-4 px-3 py-2 text-sm ${row.season === state.season ? "bg-white/[0.06]" : ""}`}
                >
                  <span
                    className={
                      row.season === state.season
                        ? "font-bold text-emerald-300"
                        : "text-muted-foreground"
                    }
                  >
                    {row.season}
                    {row.season === state.season ? " ★" : ""}
                  </span>
                  <span className="text-right">
                    {row.salary > 0 ? fmt(row.salary) : "—"}
                  </span>
                  <span className="text-right">
                    {row.bonus > 0 ? fmt(row.bonus) : "—"}
                  </span>
                  <span className="text-right font-semibold">
                    {row.capHit > 0 ? fmt(row.capHit) : "—"}
                  </span>
                </div>
              ))}
              {capTable.rows.length === 0 && (
                <div className="px-3 py-4 text-sm text-center text-muted-foreground">
                  No cap data available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Cut / Trade Impact Panel */}
        <Card className="rounded-xl border-white/10 bg-white/[0.04]">
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm tracking-wide">WHAT IF CUT?</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Pre June 1</span>
                <Switch checked={postJune1} onCheckedChange={setPostJune1} />
                <span>Post June 1</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dead Cap (This Year)</span>
              <span className="font-semibold text-red-400">{fmt(cutProj.deadThisYear)}</span>
            </div>
            {postJune1 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dead Cap (Next Year)</span>
                <span className="font-semibold text-orange-400">{fmt(cutProj.deadNextYear)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cap Savings (This Year)</span>
              <span
                className={`font-semibold ${cutProj.savingsThisYear >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {fmt(cutProj.savingsThisYear)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cap Space After Cut</span>
              <span className="font-semibold">
                {fmt(capSpace + cutProj.savingsThisYear)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Sheet Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-white/10 px-4 py-3 flex gap-2 backdrop-blur-md">
        <Button
          variant="outline"
          className="flex-1 rounded-xl border-white/15 text-xs"
          disabled
          title="Extend: coming soon"
        >
          Extend
        </Button>
        <Button
          variant="outline"
          className={`flex-1 rounded-xl text-xs ${
            restructureElig.eligible
              ? "border-blue-500/40 text-white hover:bg-blue-500/10"
              : "border-white/15"
          }`}
          disabled={!restructureElig.eligible}
          onClick={handleRestructure}
          title={
            restructureElig.eligible
              ? `Restructure up to ${fmt(maxRestructure)}`
              : restructureElig.reasons.join("; ")
          }
        >
          Restructure
        </Button>
        <Button
          variant="destructive"
          className="flex-1 rounded-xl text-xs"
          onClick={handleRelease}
        >
          Release
        </Button>
      </div>
    </div>
  );
}
