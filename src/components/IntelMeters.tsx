import { intelLabel, type PlayerIntel } from "@/engine/scoutingCapacity";

export function IntelMeters({ intel }: { intel?: PlayerIntel }) {
  const c = intel?.clarity ?? { TALENT: 0, MED: 0, CHAR: 0, FIT: 0 };
  const Chip = ({ label, v }: { label: string; v: number }) => {
    const tag = intelLabel(v);
    const cls =
      tag === "Verified"
        ? "bg-emerald-600/20 text-emerald-200 border-emerald-500/40"
        : tag === "Partial"
          ? "bg-amber-600/20 text-amber-200 border-amber-500/40"
          : "bg-slate-600/20 text-slate-200 border-slate-500/40";
    return <div className={`px-2 py-1 border rounded text-xs flex items-center gap-2 ${cls}`}><span>{label}</span><span className="font-semibold">{tag}</span></div>;
  };
  return <div className="flex flex-wrap gap-2"><Chip label="TALENT" v={c.TALENT} /><Chip label="MED" v={c.MED} /><Chip label="CHAR" v={c.CHAR} /><Chip label="FIT" v={c.FIT} /></div>;
}
