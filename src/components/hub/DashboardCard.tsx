import { Button } from "@/components/ui/button";

interface CardMetaItem {
  label: string;
  value: string;
}

interface DashboardCardProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  meta: CardMetaItem[];
  cta: string;
  backgroundClass: string;
  featured?: boolean;
}

const DashboardCard = ({ eyebrow, title, subtitle, meta, cta, backgroundClass, featured = false }: DashboardCardProps) => {
  return (
    <article
      className={[
        "relative overflow-hidden rounded-xl border border-white/15 bg-slate-900/80 shadow-xl backdrop-blur-sm",
        featured ? "ring-1 ring-cyan-300/50" : "",
      ].join(" ")}
    >
      <div className={["h-40 w-full bg-cover bg-center", backgroundClass].join(" ")} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/5" />

      <div className="relative z-10 flex h-full flex-col p-4">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">{eyebrow}</p>
        ) : null}
        <h3 className="mt-1 text-3xl font-black uppercase tracking-[0.06em] text-slate-50">{title}</h3>
        <p className="mt-2 max-w-[28ch] text-base text-slate-200/90">{subtitle}</p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {meta.map((item) => (
            <div key={item.label} className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
              <p className="text-sm font-bold text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>

        <Button className="mt-4 w-full border border-cyan-300/50 bg-blue-600/80 font-extrabold uppercase tracking-[0.06em] text-slate-100 hover:bg-blue-500">
          {cta}
        </Button>
      </div>
    </article>
  );
};

export default DashboardCard;
