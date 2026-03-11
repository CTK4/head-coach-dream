import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DefensiveCall } from "@/engine/defense/defensiveCalls";

type Props = {
  open: boolean;
  situation: { down: number; distance: number; yardLine: number; quarter: number; clockSec: number };
  onConfirm: (call: DefensiveCall | "AUTO") => void;
};

function fmtClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function downOrdinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

const CALL_LABELS = new Map<string, string>([
  [JSON.stringify({ kind: "SHELL", shell: "COVER_2", press: false }), "Cover 2"],
  [JSON.stringify({ kind: "SHELL", shell: "COVER_3", press: false }), "Cover 3"],
  [JSON.stringify({ kind: "SHELL", shell: "QUARTERS", press: false }), "Quarters"],
  [JSON.stringify({ kind: "SHELL", shell: "MAN", press: true }), "Man Press"],
  [JSON.stringify({ kind: "PRESSURE", pressure: "SIM", blitzRate: 1 }), "Sim"],
  [JSON.stringify({ kind: "PRESSURE", pressure: "BLITZ", blitzRate: 2 }), "Blitz"],
  [JSON.stringify({ kind: "RUN_FIT", box: "LIGHT", containEdge: false }), "Light box"],
  [JSON.stringify({ kind: "RUN_FIT", box: "NORMAL", containEdge: false }), "Normal box"],
  [JSON.stringify({ kind: "RUN_FIT", box: "HEAVY", containEdge: true }), "Heavy box"],
  [JSON.stringify({ kind: "SPECIAL", tag: "SPY_QB" }), "Spy QB"],
  [JSON.stringify({ kind: "SPECIAL", tag: "BRACKET_STAR" }), "Bracket Star"],
  [JSON.stringify({ kind: "SPECIAL", tag: "PREVENT" }), "Prevent"],
]);

function selectedCallLabel(call: DefensiveCall): string {
  return CALL_LABELS.get(JSON.stringify(call)) ?? call.kind;
}

export default function DefensiveCallDrawer({ open, situation, onConfirm }: Props) {
  const [selected, setSelected] = useState<DefensiveCall | null>(null);
  const header = useMemo(
    () => `${downOrdinal(situation.down)} & ${situation.distance} • Ball on ${situation.yardLine} • ${fmtClock(situation.clockSec)} Q${situation.quarter}`,
    [situation],
  );

  const pick = (call: DefensiveCall) => setSelected(call);

  return (
    <BottomSheet open={open} onOpenChange={() => undefined}>
      <div className="space-y-3 pb-4">
        <p className="text-sm font-semibold">Defensive Play Call</p>
        <p className="text-xs text-muted-foreground">{header}</p>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "SHELL", shell: "COVER_2", press: false })}>Cover 2</Button>
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "SHELL", shell: "COVER_3", press: false })}>Cover 3</Button>
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "SHELL", shell: "QUARTERS", press: false })}>Quarters</Button>
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "SHELL", shell: "MAN", press: true })}>Man Press</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "PRESSURE", pressure: "SIM", blitzRate: 1 })}>Sim</Button>
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "PRESSURE", pressure: "BLITZ", blitzRate: 2 })}>Blitz</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "RUN_FIT", box: "LIGHT", containEdge: false })}>Light box</Button>
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "RUN_FIT", box: "NORMAL", containEdge: false })}>Normal box</Button>
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "RUN_FIT", box: "HEAVY", containEdge: true })}>Heavy box</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "SPECIAL", tag: "SPY_QB" })}>Spy QB</Button>
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "SPECIAL", tag: "BRACKET_STAR" })}>Bracket Star</Button>
          <Button size="sm" variant="outline" onClick={() => pick({ kind: "SPECIAL", tag: "PREVENT" })}>Prevent</Button>
        </div>

        {selected ? <Badge variant="secondary">Selected: {selectedCallLabel(selected)}</Badge> : null}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => onConfirm("AUTO")}>Auto</Button>
          <Button disabled={!selected} onClick={() => selected && onConfirm(selected)}>Confirm Call</Button>
        </div>
      </div>
    </BottomSheet>
  );
}
