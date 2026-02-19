import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { hubTheme } from "@/components/franchise-hub/theme";

type HubTab = {
  label: string;
  to: string;
};

type FranchiseHubTabsProps = {
  tabs: HubTab[];
};

function useIsMobile(breakpointPx = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const handleChange = () => setIsMobile(media.matches);

    handleChange();
    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, [breakpointPx]);

  return isMobile;
}

export function FranchiseHubTabs({ tabs }: FranchiseHubTabsProps) {
  const location = useLocation();
  const navRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const isMobile = useIsMobile(768);

  const activeTab = useMemo(
    () => tabs.find((tab) => location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`)) ?? null,
    [location.pathname, tabs],
  );

  useEffect(() => {
    if (!isMobile || !activeTab) return;

    const navEl = navRef.current;
    const activeEl = tabRefs.current[activeTab.to];

    if (!navEl || !activeEl) return;

    const navRect = navEl.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    const outOfView = activeRect.left < navRect.left || activeRect.right > navRect.right;

    if (!outOfView) return;

    activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTab, isMobile, location.pathname]);

  return (
    <>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <nav
        ref={navRef}
        className="hide-scrollbar flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory scroll-smooth"
        aria-label="Franchise hub stages"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            aria-label={`Open ${tab.label}`}
            ref={(el) => {
              tabRefs.current[tab.to] = el;
            }}
            className={({ isActive }) =>
              `${hubTheme.tabBase} ${isActive ? hubTheme.tabActive : hubTheme.tabInactive} shrink-0 snap-start min-w-[78px] sm:min-w-[96px]`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
