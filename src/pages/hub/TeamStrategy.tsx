import { useGame } from "@/context/GameContext";
import { GM_MODE_LABELS, safeLabel } from "@/lib/displayLabels";

const COPY = {
  REBUILD: "Tearing it down. Draft capital is everything. Young players get extended opportunity.",
  RELOAD: "Bridge year. Selective acquisition. Balance youth with veterans.",
  CONTEND: "Win now. Veterans prioritized. Draft picks are chips.",
} as const;

export default function TeamStrategy() {
  const { state, dispatch } = useGame();
  const mode = state.strategy.gmMode;
  return (
    <div className="p-4 md:p-8 space-y-3">
      <h1 className="text-xl font-bold">Team Strategy</h1>
      <div className="rounded border p-4">
        <p className="font-semibold">{GM_MODE_LABELS[mode] ?? safeLabel(mode)}</p>
        <p className="text-sm text-muted-foreground">{COPY[mode]}</p>
      </div>
      <div className="flex gap-2">{(["REBUILD","RELOAD","CONTEND"] as const).map((m) => <button key={m} onClick={() => dispatch({ type: "SET_GM_MODE", payload: { gmMode: m } })} className="px-3 py-2 border rounded">{GM_MODE_LABELS[m] ?? safeLabel(m)}</button>)}</div>
      <ul className="text-sm list-disc ml-5">
        <li>Draft AI weights vary by mode.</li>
        <li>FA deal appetite changes by mode.</li>
        <li>Trade posture shifts based on competitive window.</li>
      </ul>
    </div>
  );
}
