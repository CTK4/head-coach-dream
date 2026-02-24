import { NavLink } from "react-router-dom";
import { hubTheme } from "@/components/franchise-hub/theme";

type HubTab = { label: string; to: string };
type FranchiseHubTabsProps = { tabs: HubTab[] };

export function FranchiseHubTabs({ tabs }: FranchiseHubTabsProps) {
  return (
    <nav className="grid min-w-0 grid-cols-5 gap-1 overflow-hidden" aria-label="Franchise hub stages">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          aria-label={`Open ${tab.label}`}
          className={({ isActive }) => `${hubTheme.tabBase} ${isActive ? hubTheme.tabActive : hubTheme.tabInactive} min-w-0`}
        >
          <span className="block truncate">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
