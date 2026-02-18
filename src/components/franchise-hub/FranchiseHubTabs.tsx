import { NavLink } from "react-router-dom";
import { hubTheme } from "@/components/franchise-hub/theme";

type HubTab = {
  label: string;
  to: string;
};

type FranchiseHubTabsProps = {
  tabs: HubTab[];
};

export function FranchiseHubTabs({ tabs }: FranchiseHubTabsProps) {
  return (
    <nav className="grid grid-cols-5 gap-1" aria-label="Franchise hub stages">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          aria-label={`Open ${tab.label}`}
          className={({ isActive }) => `${hubTheme.tabBase} ${isActive ? hubTheme.tabActive : hubTheme.tabInactive}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
