import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getEffectivePlayersByTeam, normalizePos } from "@/engine/rosterOverlay";
import { tradeReturnEv } from "@/engine/marketModel";

type PosTab = "ALL" | "QB" | "RB" | "WR" | "TE" | "DL" | "EDGE" | "LB" | "CB" | "S";
const TABS: PosTab[] = ["ALL", "QB", "RB", "WR", "TE", "DL", "EDGE", "LB", "CB", "S"];

function tabMatch(tab: PosTab, pos: string) {
  if (tab === "ALL") return true;
  return normalizePos(pos) === tab;
}

export default function TradeHub() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const [tab, setTab] = useState<PosTab>("ALL");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    return getEffectivePlayersByTeam(state, teamId)
      .map((p: any) => ({
        id: String(p.playerId),
        name: String(p.fullName),
        pos: String(p.pos ?? "UNK"),
        age: Number(p.age ?? 0),
        ovr: Number(p.overall ?? 0),
        ev: tradeReturnEv(String(p.pos ?? "UNK"), Number(p.overall ?? 0), Number(p.age ?? 0), 0),
      }))
      .filter((p) => tabMatch(tab, p.pos))
      .filter((p) => (q.trim() ? p.name.toLowerCase().includes(q.trim().toLowerCase()) : true))
      .sort((a, b) => b.ovr - a.ovr)
      .slice(0, 140);
  }, [state, teamId, tab, q]);

  const focus = openId ? list.find((p) => p.id === openId) ?? null : null;

  const offers = useMemo(() => {
    if (!focus) return [];
    const tiers = ["1st–2nd", "2nd–3rd", "3rd–4th", "4th–5th", "6th–7th", "No value"];
    const idx = Math.max(0, tiers.indexOf(focus.ev));
    const mk = (k: number) => `AI_TEAM_${String(((state.saveSeed + k * 97) % 30) + 1).padStart(2, "0")}`;
    const out = [
      { teamId: mk(1), pick: tiers[Math.max(0, idx - 1)], note: "Aggressive buyer" },
      { teamId: mk(2), pick: tiers[idx], note: "Market offer" },
      { teamId: mk(3), pick: tiers[Math.min(tiers.length - 1, idx + 1)], note: "Lowball" },
    ];
    return out;
  }, [focus, state.saveSeed]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-black/30">
      <div className="sticky top-0 z-20 bg-background/70 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-extrabold tracking-widest">TRADES</div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })}>
              Continue
            </Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm font-semibold overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative pb-2 whitespace-nowrap transition ${tab === t ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                  {tab === t ? <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-emerald-400 rounded-full" /> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players..." className="rounded-2xl bg-white/5 border-white/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-3">
        <ScrollArea className="h-[calc(100vh-220px)] pr-2">
          <div className="space-y-3">
            {list.map((p) => (
              <Card key={p.id} className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-base">
                        <button onClick={() => navigate(`/hub/player/${p.id}`)} className="hover:underline text-left">
                          {p.name}
                        </button>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {p.age} | {normalizePos(p.pos)} · OVR {p.ovr}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="rounded-xl border-white/15 bg-white/5">
                          EV {p.ev}
                        </Badge>
                      </div>
                    </div>

                    <Button onClick={() => setOpenId(p.id)} className="rounded-xl px-4 bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold">
                      Shop
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{focus ? `Shop: ${focus.name}` : "Shop Player"}</DialogTitle>
          </DialogHeader>

          {!focus ? null : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline">EV {focus.ev}</Badge>
                <Badge variant="outline">
                  {normalizePos(focus.pos)} · OVR {focus.ovr}
                </Badge>
              </div>

              <div className="space-y-2">
                {offers.map((o) => (
                  <div key={o.teamId} className="rounded-xl border p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{o.teamId}</div>
                      <div className="text-xs text-muted-foreground">
                        Return: {o.pick} · {o.note}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
                      onClick={() => {
                        dispatch({ type: "TRADE_ACCEPT", payload: { playerId: focus.id, toTeamId: o.teamId, valueTier: o.pick } });
                        setOpenId(null);
                      }}
                    >
                      Accept
                    </Button>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                Trades update roster + cap immediately. Draft pick return is tracked as a simple “capital” note for now.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
