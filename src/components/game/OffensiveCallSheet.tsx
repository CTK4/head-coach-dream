import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import type { PlayType } from "@/engine/gameSim";
import { evaluatePlayConcepts } from "@/engine/gameSim";
import { filterEligiblePlayConcepts, getOffensePlaybookConcepts, hasDefensePlaybook } from "@/engine/playbooks/playbookCatalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface OffensiveCallSheetProps {
  open: boolean;
  onClose: () => void;
}

type TabKey = "ALL" | "RUN" | "PASS" | "SPECIAL";

const tabKeys: TabKey[] = ["ALL", "RUN", "PASS", "SPECIAL"];

function playCategory(playType: PlayType): TabKey {
  if (playType === "PUNT" || playType === "FG" || playType === "SPIKE" || playType === "KNEEL") return "SPECIAL";
  if (playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER") return "RUN";
  return "PASS";
}

export default function OffensiveCallSheet({ open, onClose }: OffensiveCallSheetProps) {
  const { state, dispatch } = useGame();
  const g = state.game;
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [selectedPlay, setSelectedPlay] = useState<PlayType | null>(null);

  const offensePlaybookId = state.playbooks?.offensePlaybookId;
  const defensePlaybookId = state.playbooks?.defensePlaybookId;
  const pendingCall = g.pendingOffensiveCall;
  const aggression = pendingCall?.aggression ?? g.aggression;
  const tempo = pendingCall?.tempo ?? g.tempo;
  const personnelPackage = pendingCall?.personnelPackage ?? g.currentPersonnelPackage ?? "11";

  const rankedPlays = useMemo(() => {
    if (!offensePlaybookId || !defensePlaybookId || !hasDefensePlaybook(defensePlaybookId)) return [];
    const concepts = getOffensePlaybookConcepts(offensePlaybookId);
    const legal = filterEligiblePlayConcepts(
      concepts,
      { down: g.down, distance: g.distance, ballOn: g.ballOn, quarter: Number(g.clock.quarter), clockSec: g.clock.timeRemainingSec },
      concepts[0]?.formation ?? "SHOTGUN",
    );
    const playTypes = Array.from(new Set(legal.map((concept) => concept.playType)));
    if (!playTypes.length) return [];
    return evaluatePlayConcepts(g, playTypes, { aggression, tempo, personnelPackage, look: g.defLook })
      .sort((a, b) => b.score - a.score)
      .slice(0, 24);
  }, [offensePlaybookId, defensePlaybookId, g, aggression, tempo, personnelPackage]);

  const tabs = useMemo(() => {
    const available = new Set<TabKey>(["ALL"]);
    rankedPlays.forEach((play) => available.add(playCategory(play.playType)));
    return tabKeys.filter((tab) => available.has(tab));
  }, [rankedPlays]);

  const visiblePlays = useMemo(() => {
    const filtered = activeTab === "ALL" ? rankedPlays : rankedPlays.filter((play) => playCategory(play.playType) === activeTab);
    return filtered.slice(0, 6);
  }, [activeTab, rankedPlays]);

  const selected = visiblePlays.find((play) => play.playType === selectedPlay) ?? rankedPlays.find((play) => play.playType === selectedPlay) ?? null;

  const callPlay = () => {
    if (!selected) return;
    dispatch({ type: "SET_PENDING_OFFENSIVE_CALL", payload: { playType: selected.playType, personnelPackage, aggression, tempo } });
    dispatch({ type: "RESOLVE_PLAY", payload: { playType: selected.playType, personnelPackage, aggression, tempo } });
    setSelectedPlay(null);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-2xl border-white/10 bg-slate-900 text-slate-100 p-4">
        <div className="space-y-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-300">Offensive Play Call</div>
            <div className="text-sm text-muted-foreground">{g.down}st & {g.distance} · Ball on {g.ballOn}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Button key={tab} size="sm" variant={activeTab === tab ? "default" : "outline"} onClick={() => setActiveTab(tab)}>{tab === "ALL" ? "All Plays" : tab}</Button>
            ))}
          </div>

          <div className="space-y-2">
            {visiblePlays.map((play) => {
              const selectedCard = selectedPlay === play.playType;
              return (
                <button
                  key={play.playType}
                  onClick={() => setSelectedPlay(play.playType)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${selectedCard ? "border-blue-300/45 bg-blue-950/30" : "border-white/10 bg-slate-900/40 hover:border-white/20"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-100">{play.playType.replace(/_/g, " ")}</span>
                    <Badge variant="outline" className="text-[10px]">Fit {Math.round(play.score * 100)}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Expected yards: {play.yards.low}/{play.yards.median}/{play.yards.high}</div>
                </button>
              );
            })}
          </div>

          <Button className="w-full bg-blue-700 hover:bg-blue-600" disabled={!selected} onClick={callPlay}>Call Play</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
