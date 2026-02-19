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

    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setIsMobile(mq.matches);

    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, [breakpointPx]);

  return isMobile;
}

export function FranchiseHubTabs({ tabs }: FranchiseHubTabsProps) {
  const location = useLocation();
  const isMobile = useIsMobile(768);
  const navRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const activeTab = useMemo(() => {
    const path = location.pathname;
    return tabs.find((t) => path === t.to || path.startsWith(`${t.to}/`)) ?? null;
  }, [location.pathname, tabs]);

  useEffect(() => {
    if (!isMobile) return;
    if (!activeTab) return;

    const el = tabRefs.current[activeTab.to];
    const container = navRef.current;
    if (!el || !container) return;

    const elRect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();

    const outLeft = elRect.left < cRect.left;
    const outRight = elRect.right > cRect.right;
    if (!outLeft && !outRight) return;

    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTab, isMobile]);

  return (
    <>
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}
      </style>

      <nav
        ref={(n) => {
          navRef.current = n;
        }}
        className="hide-scrollbar flex gap-1 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ WebkitOverflowScrolling: "touch" }}
        aria-label="Franchise hub stages"
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
              `${hubTheme.tabBase} shrink-0 snap-start min-w-[78px] sm:min-w-[96px] ${
                isActive ? hubTheme.tabActive : hubTheme.tabInactive
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
