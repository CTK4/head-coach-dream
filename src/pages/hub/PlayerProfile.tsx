import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getEffectivePlayer, getDepthSlotLabel, normalizePos, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  const p = useMemo(() => getEffectivePlayer(state, playerId), [state, playerId]);
  if (!p) return <div className="p-6">Player not found.</div>;

  const name = String(p.fullName ?? "Player");
  const pos = normalizePos(String(p.pos ?? "UNK"));
  const age = Number(p.age ?? 0);
  const ovr = clamp100(Number(p.overall ?? 0));
  const portraitUrl = String(p.portraitUrl ?? "");
  const teamId = String(p.teamId ?? "");
  const isFA = !teamId || teamId.toUpperCase() === "FREE_AGENT" || String(p.status ?? "").toUpperCase() === "FREE_AGENT";
  const depth = getDepthSlotLabel(state, playerId);
  const contract = getContractSummaryForPlayer(state, playerId);

  const careerStats = state.playerCareerStatsById?.[playerId];

  const offers = state.freeAgency.offersByPlayerId[playerId] ?? [];
  const hasUserOffer = offers.some((o) => o.isUser && o.status !== "WITHDRAWN");
  const anyPending = offers.some((o) => o.status === "PENDING");
  const pendingUser = offers.find((o) => o.isUser && o.status === "PENDING");
  const accepted = offers.find((o) => o.status === "ACCEPTED");
  const capIllegal = state.finances.capSpace < 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-black/40">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center">
                {portraitUrl ? <img src={portraitUrl} alt={name} className="h-full w-full object-cover" /> : <div className="text-xs text-muted-foreground">IMG</div>}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xl font-extrabold tracking-wide truncate">{name}</div>
                <div className="text-sm text-muted-foreground">{pos}</div>
                <div className="text-sm text-muted-foreground">Age {age}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-sm">
                  {depth ? (
                    <Badge variant="outline" className="rounded-xl border-white/15 bg-white/5">
                      Depth: {depth}
                    </Badge>
                  ) : null}
                  <Badge variant="outline" className="rounded-xl border-white/15 bg-white/5">
                    {isFA ? "Free Agent" : `Team: ${teamId}`}
                  </Badge>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-2 text-center">
                  <div className="text-3xl font-extrabold text-emerald-300">{ovr}</div>
                  <div className="text-xs font-bold tracking-widest text-emerald-200/90">OVR</div>
                </div>

                {isFA ? (
                  <Button className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold" onClick={() => setOfferOpen(true)}>
                    {hasUserOffer ? "View Offers" : "Make Offer"}
                  </Button>
                ) : null}

                <Button variant="secondary" className="rounded-xl" onClick={() => navigate(-1)}>
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
                  <Button variant="outline" className="w-full justify-between">Career Stats <span>{(careerStats?.seasons ?? []).length} seasons</span></Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <Table>
                    <TableHeader><TableRow><TableHead>Season</TableHead><TableHead>Team</TableHead><TableHead>GP</TableHead><TableHead>Pass Yds</TableHead><TableHead>Rush Yds</TableHead><TableHead>Rec Yds</TableHead><TableHead>Sacks</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(careerStats?.seasons ?? []).map((ss, idx) => (
                        <TableRow key={`${ss.season}-${idx}`}>
                          <TableCell>{ss.season}</TableCell><TableCell>{ss.teamId}</TableCell><TableCell>{ss.gamesPlayed}</TableCell><TableCell>{ss.passingYards ?? 0}</TableCell><TableCell>{ss.rushingYards ?? 0}</TableCell><TableCell>{ss.receivingYards ?? 0}</TableCell><TableCell>{ss.sacks ?? 0}</TableCell>
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
              <CardTitle className="text-base tracking-wide">CONTRACT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Years Remaining</span>
                <span className="font-semibold">{contract ? contract.yearsRemaining : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cap Hit</span>
                <span className="font-semibold">{contract ? money(contract.capHit) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-semibold">{contract ? money(contract.total) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signing Bonus</span>
                <span className="font-semibold">{contract ? money(contract.signingBonus) : "—"}</span>
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
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{hasUserOffer ? "Offers" : "Make Offer"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              {accepted ? <Badge variant="secondary">Signed</Badge> : null}
              {anyPending ? <Badge variant="outline">Pending</Badge> : null}
              {capIllegal ? <Badge variant="destructive">Cap Illegal</Badge> : null}
            </div>

            {!accepted ? (
              <Card className="rounded-2xl">
                <CardContent className="p-4 space-y-3">
                  <div className="font-semibold">Make Offer</div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Years</div>
                      <Input type="number" min={1} max={5} value={years} onChange={(e) => setYears(Number(e.target.value))} className="rounded-xl" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">AAV</div>
                      <Input type="number" step={50000} min={750000} value={aav} onChange={(e) => setAav(Number(e.target.value))} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={capIllegal}
                      className="rounded-xl flex-1 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
                      onClick={() => dispatch({ type: "FA_SUBMIT_OFFER", payload: { playerId } })}
                    >
                      Submit Offer
                    </Button>
                    {pendingUser ? (
                      <Button variant="secondary" className="rounded-xl" onClick={() => dispatch({ type: "FA_WITHDRAW_OFFER", payload: { playerId, offerId: pendingUser.offerId } })}>
                        Withdraw
                      </Button>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cap Space: {moneyShort(state.finances.capSpace)} · Cash: {moneyShort(state.finances.cash)}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="rounded-2xl">
              <CardContent className="p-4 space-y-2">
                <div className="font-semibold">Offer List</div>
                <div className="space-y-2">
                  {offers.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No offers yet.</div>
                  ) : (
                    offers
                      .slice()
                      .sort((a, b) => b.aav - a.aav)
                      .map((o) => (
                        <div key={o.offerId} className="border rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{o.isUser ? "Your Offer" : o.teamId}</div>
                            <div className="text-xs text-muted-foreground">
                              {o.years}y · {moneyShort(o.aav)} · {o.status}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="secondary" className="rounded-xl" onClick={() => setOfferOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
