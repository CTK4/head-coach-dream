import { Shield } from "lucide-react";

interface HeaderBarProps {
  title: string;
  season: number;
  teamLogo?: string;
}

const HeaderBar = ({ title, season, teamLogo }: HeaderBarProps) => {
  return (
    <header className="rounded-2xl border border-white/15 bg-slate-900/60 px-4 py-3 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/30 bg-slate-950/70 shadow-[0_0_18px_rgba(56,189,248,0.2)]">
          {teamLogo ? (
            <img src={teamLogo} alt="Team logo" className="h-8 w-8 object-contain" />
          ) : (
            <Shield className="h-5 w-5 text-cyan-300" />
          )}
        </div>
        <h1 className="text-center text-2xl font-black uppercase tracking-[0.1em] text-slate-50 sm:text-3xl">{title}</h1>
        <div className="rounded-lg border border-amber-300/30 bg-amber-100/5 px-3 py-1 text-lg font-extrabold tracking-wide text-amber-200">
          {season}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
