import { useState } from "react";
import { useGame } from "@/context/GameContext";

export default function OwnerRelations() {
  const { state } = useGame();
  const [open, setOpen] = useState(false);
  const hs = state.hotSeatStatus;
  const tone = hs.level === "CRITICAL" ? "border-red-500 animate-pulse" : hs.level === "HOT" ? "border-orange-500" : hs.level === "WARM" ? "border-yellow-500" : "border-green-500";
  return (
    <div className="p-4 md:p-8">
      <div className={`rounded border p-4 space-y-2 ${tone}`}>
        <h2 className="text-lg font-semibold">Job Security</h2>
        <div className="h-3 rounded bg-muted overflow-hidden"><div className="h-3 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" style={{ width: `${hs.score}%` }} /></div>
        <p className="text-sm">{hs.level} · {hs.primaryDriver}</p>
        <button className="text-xs underline" onClick={() => setOpen((v) => !v)}>Why?</button>
        {open ? <ul className="text-xs space-y-1">{hs.factors.map((f) => <li key={f.label} className="flex justify-between"><span>{f.label}</span><span>{f.contribution > 0 ? `+${f.contribution}` : f.contribution}</span></li>)}</ul> : null}
      </div>
    </div>
  );
}
