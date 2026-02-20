import type { Prospect } from "@/engine/offseasonData";
import type { PlayerIntel } from "@/engine/scoutingCapacity";

export function ProspectProfileModal({ open, onClose, prospect, intel, combine }: { open: boolean; onClose: () => void; prospect: Prospect | null; intel?: PlayerIntel; combine?: any }) {
  if (!open || !prospect) return null;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3"><div><div className="text-lg font-bold">{prospect.name}</div><div className="text-sm opacity-80">{prospect.pos}</div></div><button className="px-3 py-1 border border-slate-600 rounded" onClick={onClose}>Close</button></div>
        <div className="mt-3 text-sm">Medical: <b>{intel?.revealed?.medicalTier ?? "Unknown"}</b> · Character: <b>{intel?.revealed?.characterTier ?? "Unknown"}</b></div>
        {combine ? <div className="mt-2 text-sm">40 <b>{combine.forty}</b> ({combine.grades?.forty}) · RAS <b>{combine.ras}</b></div> : null}
      </div>
    </div>
  );
}
