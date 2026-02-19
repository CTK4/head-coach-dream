import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTeamById } from "@/data/leagueDb";
import { useGame } from "@/context/GameContext";
import { FranchiseHubTabs } from "@/components/franchise-hub/FranchiseHubTabs";
import { computeFirstRoundPickNumber } from "@/components/franchise-hub/draftOrder";
import { getPhaseLabel } from "@/components/franchise-hub/offseasonLabel";
import { ContextBar } from "@/components/franchise-hub/ContextBar";
import { HUB_BG, HUB_DIVIDER, HUB_FRAME, HUB_TEXT_GOLD, HUB_TEXTURE, HUB_VIGNETTE } from "@/components/franchise-hub/theme";

const warnedLogoKeys = new Set<string>();
const LAST_HUB_ROUTE_KEY = "hcd:lastHubRoute";

const stageTabs = [
  { label: "HIRE STAFF", to: "/hub/assistant-hiring" },
  { label: "ROSTER REVIEW", to: "/hub/roster-audit" },
  { label: "COMBINE", to: "/hub/combine" },
  { label: "PRE-DRAFT", to: "/hub/pre-draft" },
  { label: "DRAFT", to: "/hub/draft" },
];

function resolveUserTeamId(state: any): string | undefined {
  return state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? state.profile?.teamId ?? state.coach?.teamId;
}

function buildLogoCandidates(logoKey: string): { triedPaths: string[]; expectedFiles: string[] } {
  const expectedFiles = [
    `${logoKey}@3x.avif`,
    `${logoKey}@2x.avif`,
    `${logoKey}.avif`,
    `${logoKey}@3x.webp`,
    `${logoKey}@2x.webp`,
    `${logoKey}.webp`,
    `${logoKey}@3x.png`,
    `${logoKey}@2x.png`,
    `${logoKey}.png`,
  ];

  const key = encodeURIComponent(logoKey);
  const triedPaths = [
    `/icons/${key}@3x.avif`,
    `/icons/${key}@2x.avif`,
    `/icons/${key}.avif`,
    `/icons/${key}@3x.webp`,
    `/icons/${key}@2x.webp`,
    `/icons/${key}.webp`,
    `/icons/${key}@3x.png`,
    `/icons/${key}@2x.png`,
    `/icons/${key}.png`,
  ];

  return { triedPaths, expectedFiles };
}

function TeamLogo({
  logoKey,
  teamId,
  teamName,
  pathname,
  alt,
}: {
  logoKey?: string;
  teamId?: string;
  teamName?: string;
  pathname?: string;
  alt: string;
}) {
  const [attemptIndex, setAttemptIndex] = useState(0);

  const { triedPaths, expectedFiles } = useMemo(() => {
    if (!logoKey) return { triedPaths: [], expectedFiles: [] };
    return buildLogoCandidates(logoKey);
  }, [logoKey]);

  const sources = useMemo(() => {
    const base = [...triedPaths];
    base.push("/placeholder.svg");
    return base;
  }, [triedPaths]);

  useEffect(() => {
    setAttemptIndex(0);
  }, [logoKey]);

  const currentSrc = sources[attemptIndex];
  const exhausted = Boolean(logoKey) && attemptIndex >= sources.length - 1;

  if (!logoKey || !currentSrc || (exhausted && currentSrc === "/placeholder.svg")) {
    if (import.meta.env.DEV && logoKey && !warnedLogoKeys.has(logoKey)) {
      warnedLogoKeys.add(logoKey);
      const tId = teamId ?? "—";
      const tName = teamName ?? "—";
      const path = pathname ?? "—";
      const tried = triedPaths.join(", ");
      const expected = expectedFiles.map((f) => ` - ${f}`).join("\n");
      // eslint-disable-next-line no-console
      console.warn(
        `[TeamLogo] Missing icon assets\n` +
          `route="${path}" teamId="${tId}" team="${tName}" logoKey="${logoKey}"\n` +
          `tried: ${tried}\n` +
          `expected files (place in public/icons):\n${expected}`
      );
    }

    return (
      <div className="h-10 w-10 rounded-sm border border-slate-300/15 bg-slate-950/30" aria-label="Team logo placeholder" />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className="h-10 w-10 rounded-sm border border-slate-300/15 bg-slate-950/20 object-contain"
      loading="eager"
      decoding="async"
      onError={() => setAttemptIndex((i) => Math.min(i + 1, sources.length - 1))}
    />
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        "inline-flex h-8 items-center justify-center gap-2 rounded-md border border-slate-300/15",
        "bg-slate-950/30 px-2 text-xs font-semibold tracking-[0.12em] text-slate-100",
        "hover:bg-slate-950/45 active:scale-[0.98] transition",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function safeGetLastHubRoute(): string | null {
  try {
    const v = sessionStorage.getItem(LAST_HUB_ROUTE_KEY);
    if (!v) return null;
    if (!v.startsWith("/hub")) return null;
    return v;
  } catch {
    return null;
  }
}

function safeSetLastHubRoute(pathname: string) {
  try {
    if (!pathname.startsWith("/hub")) return;
    sessionStorage.setItem(LAST_HUB_ROUTE_KEY, pathname);
  } catch {
    // ignore
  }
}

export function HubShell({
  title = "FRANCHISE HUB",
  children,
  rightActions,
}: {
  title?: string;
  children: ReactNode;
  rightActions?: ReactNode;
}) {
  const { state } = useGame();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    safeSetLastHubRoute(location.pathname);
  }, [location.pathname]);

  const teamId = resolveUserTeamId(state);
  const team = teamId ? getTeamById(teamId) : undefined;

  const pick = teamId ? computeFirstRoundPickNumber({ league: state.league, userTeamId: teamId }) : null;
  const capValue = `$${(Math.max(0, state.finances.capSpace) / 1_000_000).toFixed(1)}M`;
  const phase = getPhaseLabel(state);

  const fullName = [team?.city, team?.name].filter(Boolean).join(" ").trim();
  const teamName = team?.abbrev ?? (fullName.length ? fullName : undefined);

  const showBack = location.pathname !== "/hub";

  function goBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate("/hub");
  }

  function goHome() {
    const last = safeGetLastHubRoute();
    if (last && last !== location.pathname) navigate(last);
    else navigate("/hub");
  }

  return (
    <section className={`relative p-2 md:p-4 ${HUB_BG}`}>
      <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_TEXTURE}`} aria-hidden="true" />
      <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_VIGNETTE}`} aria-hidden="true" />

      <div className={`relative z-10 mx-auto max-w-7xl p-4 md:p-6 ${HUB_FRAME}`}>
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <TeamLogo
              logoKey={team?.logoKey}
              teamId={teamId}
              teamName={teamName}
              pathname={location?.pathname}
              alt={`${teamName ?? "Team"} logo`}
            />
            <h1 className="text-center text-2xl font-black tracking-[0.12em] text-slate-100">{title}</h1>
            <div className={`text-2xl font-bold ${HUB_TEXT_GOLD}`}>{state.season}</div>
          </div>

          <div className={HUB_DIVIDER} />

          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                {showBack ? (
                  <IconButton label="Back" onClick={goBack}>
                    <span aria-hidden="true">←</span>
                    <span className="hidden sm:inline">BACK</span>
                  </IconButton>
                ) : (
                  <div className="h-8 w-[1px]" aria-hidden="true" />
                )}

                <IconButton label="Home" onClick={goHome}>
                  <span aria-hidden="true">⌂</span>
                  <span className="hidden sm:inline">HUB</span>
                </IconButton>
              </div>

              <span className="text-xs text-slate-100/80 md:text-sm">{phase}</span>
            </div>

            <div className="text-center leading-tight">
              <div className="text-xs tracking-[0.12em] text-slate-100/70">Cap Room</div>
              <div className="text-sm font-bold">
                <span className={HUB_TEXT_GOLD}>{capValue}</span>
              </div>
            </div>

            <div className="text-right leading-tight">
              <div className="text-xs tracking-[0.12em] text-slate-100/70">Pick</div>
              <div className="text-sm font-semibold text-slate-100">{pick ?? "—"}</div>
            </div>
          </div>

          <div className={HUB_DIVIDER} />

          <FranchiseHubTabs tabs={stageTabs} />
        </header>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <main className="space-y-4">
            {rightActions ? <div className="flex justify-end">{rightActions}</div> : null}
            {children}
          </main>

          <ContextBar state={state} />
        </div>
      </div>
    </section>
  );
}
