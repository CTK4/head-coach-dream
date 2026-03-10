import { hubTheme } from "@/components/franchise-hub/theme";

type FranchiseHubHeaderProps = {
  season: number;
  logoSrc: string;
  logoAlt: string;
};

export function FranchiseHubHeader({ season, logoSrc, logoAlt }: FranchiseHubHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <img src={logoSrc} alt={logoAlt} className="h-12 w-12 rounded-sm object-contain" />
        <h1 className={`text-3xl font-black tracking-[0.12em] text-slate-100 ${hubTheme.hubTitle}`}>FRANCHISE HUB</h1>
        <div className={`text-3xl font-bold ${hubTheme.goldText}`}>{season}</div>
      </div>
      <div className={hubTheme.metallicDivider} />
    </header>
  );
}
