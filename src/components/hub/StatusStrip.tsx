interface StatusItem {
  label: string;
  value: string;
}

interface StatusStripProps {
  items: StatusItem[];
}

const StatusStrip = ({ items }: StatusStripProps) => {
  return (
    <section className="rounded-xl border border-white/10 bg-slate-900/60 p-3 shadow-lg backdrop-blur-md">
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-3 text-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
              <p className="font-semibold text-slate-100">{item.value}</p>
            </div>
            {index < items.length - 1 ? <span className="text-cyan-300/70">•</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default StatusStrip;
