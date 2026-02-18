import { Link, useLocation } from "react-router-dom";
import { routePath } from "@/lib/routes/appRoutes";

function NavItem({ href, label, icon, badge }: { href: string; label: string; icon: string; badge?: number }) {
  const { pathname } = useLocation();
  const active = pathname === href;

  return (
    <Link
      to={href}
      className={[
        "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs",
        active ? "bg-slate-900/70 text-slate-100" : "text-slate-300",
      ].join(" ")}
    >
      <div className="text-lg leading-none">{icon}</div>
      <div className="font-semibold">{label}</div>
      {badge && badge > 0 ? (
        <div className="absolute right-5 top-1 grid h-5 w-5 place-items-center rounded-full bg-red-600 text-[10px] font-bold">{badge}</div>
      ) : null}
    </Link>
  );
}

export function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-md gap-2 px-3 py-2">
        <NavItem href={routePath("hub")} label="Home" icon="🏠" />
        <NavItem href={routePath("team")} label="My Team" icon="🪖" badge={2} />
        <NavItem href={routePath("stats")} label="Stats" icon="📊" badge={3} />
        <NavItem href={routePath("finances")} label="Finances" icon="💲" />
      </div>
    </div>
  );
}
