import { BarChart3, DollarSign, Home, Shield } from "lucide-react";

interface BottomNavItem {
  id: string;
  label: string;
  icon: "home" | "team" | "stats" | "finances";
  badge?: number;
}

interface BottomNavProps {
  items: BottomNavItem[];
  activeItem: string;
}

const iconMap = {
  home: Home,
  team: Shield,
  stats: BarChart3,
  finances: DollarSign,
} as const;

const BottomNav = ({ items, activeItem }: BottomNavProps) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/90 px-2 pb-3 pt-2 backdrop-blur-xl">
      <ul className="mx-auto grid w-full max-w-3xl grid-cols-4 gap-2">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = item.id === activeItem;

          return (
            <li key={item.id}>
              <button
                type="button"
                className={[
                  "relative flex w-full flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-semibold transition",
                  isActive
                    ? "border-cyan-300/60 bg-blue-500/20 text-cyan-100 shadow-[0_0_16px_rgba(56,189,248,0.35)]"
                    : "border-transparent bg-slate-900/60 text-slate-300 hover:border-cyan-300/30 hover:text-cyan-100",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
