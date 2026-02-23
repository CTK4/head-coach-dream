import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function money(n: number): string {
  const v = Number(n || 0);
  if (v >= 1_000_000) return `$${Math.round(v / 100_000) / 10}M`;
  if (v >= 1_000) return `$${Math.round(v / 100) / 10}K`;
  return `$${v}`;
}

const Offers = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [openTeamId, setOpenTeamId] = useState<string | null>(null);
  const [draftYears, setDraftYears] = useState<number>(3);
  const [draftSalary, setDraftSalary] = useState<number>(2_000_000);
  const [draftAutonomy, setDraftAutonomy] = useState<number>(50);
  const [showCounter, setShowCounter] = useState<boolean>(false);

  const activeOffer = useMemo(
    () => (openTeamId ? state.offers.find((o) => o.teamId === openTeamId) ?? null : null),
    [openTeamId, state.offers],
  );

  const handleAccept = (offer: typeof state.offers[0]) => {
    dispatch({ type: "ACCEPT_OFFER", payload: offer });
  };

  const openNegotiate = (offer: typeof state.offers[0]) => {
    setOpenTeamId(offer.teamId);
    setDraftYears(offer.years);
    setDraftSalary(offer.salary);
    setDraftAutonomy(offer.autonomy);
    setShowCounter(false);
  };

  const commitNegotiate = () => {
    if (!activeOffer) return;
    dispatch({
      type: "NEGOTIATE_OFFER",
      payload: {
        teamId: activeOffer.teamId,
        years: clamp(draftYears, 1, 6),
        salary: clamp(draftSalary, Math.floor(activeOffer.salary * 0.8), Math.floor(activeOffer.salary * 1.2)),
        autonomy: clamp(draftAutonomy, 0, 100),
      },
    });
    setShowCounter(true);
  };

  const applyCounter = () => {
    if (!activeOffer?.negotiation?.counter) return;
    const c = activeOffer.negotiation.counter;
    setDraftYears(c.years);
    setDraftSalary(c.salary);
    setDraftAutonomy(c.autonomy);
    setShowCounter(false);
  };

  if (state.offers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-lg">No offers yet. Complete all interviews first.</p>
            <Button onClick={() => navigate("/onboarding/interviews")} className="mt-4">Back to Interviews</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Your Offers</h1>
        <p className="text-muted-foreground text-center mb-8">Choose a team to lead</p>
        <div className="grid gap-4">
          {state.offers.map((offer) => {
            const team = getTeamById(offer.teamId);
            return (
              <Card key={offer.teamId} className="hover:border-primary transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{team?.name ?? offer.teamId}</h2>
                      <p className="text-sm text-muted-foreground">{team?.city ?? team?.region ?? ""}</p>
                    </div>
                    <Badge variant="secondary">{offer.mediaNarrativeKey}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-muted-foreground">Years</div>
                      <div className="font-semibold">{offer.years}</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-muted-foreground">Salary</div>
                      <div className="font-semibold">{money(offer.salary)} / yr</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-muted-foreground">Autonomy</div>
                      <div className="font-semibold">{offer.autonomy}</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-muted-foreground">Patience</div>
                      <div className="font-semibold">{offer.patience}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => openNegotiate(offer)}>
                      Negotiate
                    </Button>
                    <Button className="flex-1" onClick={() => handleAccept(offer)}>
                      Accept Offer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!openTeamId} onOpenChange={(v) => !v && setOpenTeamId(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Negotiate Offer</DialogTitle>
          </DialogHeader>
          {activeOffer ? (
            <div className="space-y-5">
              <div className="text-sm text-muted-foreground">Counter proposals are not guaranteed. You’ll see an estimated success chance before submitting.</div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Contract Length</div>
                  <div className="text-sm">{draftYears} years</div>
                </div>
                <Slider
                  value={[draftYears]}
                  min={Math.max(1, activeOffer.years - 1)}
                  max={Math.min(6, activeOffer.years + 2)}
                  step={1}
                  onValueChange={(v) => setDraftYears(v[0] ?? activeOffer.years)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Salary</div>
                  <div className="text-sm">{money(draftSalary)} / yr</div>
                </div>
                <Slider
                  value={[draftSalary]}
                  min={Math.floor(activeOffer.salary * 0.8)}
                  max={Math.floor(activeOffer.salary * 1.2)}
                  step={50_000}
                  onValueChange={(v) => setDraftSalary(v[0] ?? activeOffer.salary)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Autonomy</div>
                  <div className="text-sm">{draftAutonomy}</div>
                </div>
                <Slider value={[draftAutonomy]} min={0} max={100} step={5} onValueChange={(v) => setDraftAutonomy(v[0] ?? 50)} />
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setOpenTeamId(null)}>
                  Close
                </Button>
                <Button className="flex-1" onClick={commitNegotiate}>
                  Submit Counter
                </Button>
              </div>
              {showCounter && activeOffer.negotiation ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Negotiation Result</div>
                    <Badge variant="outline">{activeOffer.negotiation.status}</Badge>
                  </div>
                  <div className="text-sm text-slate-200">{activeOffer.negotiation.message ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">Estimated chance: {Math.round((activeOffer.negotiation.lastChance ?? 0) * 100)}%</div>
                  {activeOffer.negotiation.counter ? (
                    <div className="mt-2 space-y-2">
                      <div className="text-sm font-semibold">Their Counter</div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="rounded-lg border border-white/10 bg-slate-950 p-2"><div className="text-xs text-muted-foreground">Years</div><div className="font-semibold">{activeOffer.negotiation.counter.years}</div></div>
                        <div className="rounded-lg border border-white/10 bg-slate-950 p-2"><div className="text-xs text-muted-foreground">Salary</div><div className="font-semibold">{money(activeOffer.negotiation.counter.salary)}</div></div>
                        <div className="rounded-lg border border-white/10 bg-slate-950 p-2"><div className="text-xs text-muted-foreground">Autonomy</div><div className="font-semibold">{activeOffer.negotiation.counter.autonomy}</div></div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={applyCounter}>Load Counter</Button>
                        <Button onClick={() => setOpenTeamId(null)} className="flex-1">Done</Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setOpenTeamId(null)} className="w-full mt-2">Done</Button>
                  )}
                </div>
              ) : null}

            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Offers;
