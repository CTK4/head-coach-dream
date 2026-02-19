import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getTeamById } from "@/data/leagueDb";
import { useGame } from "@/context/GameContext";
import { FranchiseHubTabs } from "@/components/franchise-hub/FranchiseHubTabs";
import { computeFirstRoundPickNumber } from "@/components/franchise-hub/draftOrder";
import { getPhaseLabel } from "@/components/franchise-hub/offseasonLabel";
import { ContextBar } from "@/components/franchise-hub/ContextBar";
import { HUB_BG, HUB_DIVIDER, HUB_FRAME, HUB_TEXT_GOLD, HUB_TEXTURE, HUB_VIGNETTE } from "@/components/franchise-hub/theme";

const stageTabs = [
  { label: "HIRE STAFF", to: "/hub/assistant-hiring" },
  { label: "ROSTER REVIEW", to: "/hub/roster-audit" },
  { label: "COMBINE", to: "/hub/combine" },
  { label: "PRE-DRAFT", to: "/hub/pre-draft" },
  { label: "DRAFT", to: "/hub/draft" },
];

const warnedLogoKeys = new Set<string>();

function resolveUserTeamId(state: any): string | undefined {
  return state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? state.coach?.hometownTeamId;
}

function buildLogoSources(key: string): string[] {
  const variants = ["@3x", "@2x", ""];
  const extensions = ["avif", "webp", "png"];
  return extensions.flatMap((ext) => variants.map((variant) => `/icons/${key}${variant}.${ext}`));
}

function buildExpectedFilenames(logoKey: string): string[] {
  const variants = ["@3x", "@2x", ""];
  const extensions = ["avif", "webp", "png"];
  return extensions.flatMap((ext) => variants.map((variant) => `${logoKey}${variant}.${ext}`));
}

function TeamLogo({
  logoKey,
  alt,
  teamId,
  teamName,
  pathname,
}: {
  logoKey?: string;
  alt: string;
  teamId?: string;
  teamName?: string;
  pathname?: string;
}) {
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [placeholderBroken, setPlaceholderBroken] = useState(false);

  const encodedKey = useMemo(() => (logoKey ? encodeURIComponent(logoKey) : undefined), [logoKey]);
  const iconSources = useMemo(() => (encodedKey ? buildLogoSources(encodedKey) : []), [encodedKey]);
  const sources = useMemo(() => [...iconSources, "/placeholder.svg"], [iconSources]);
  const expectedFiles = useMemo(() => (logoKey ? buildExpectedFilenames(logoKey) : []), [logoKey]);

  useEffect(() => {
    setAttemptIndex(0);
    setPlaceholderBroken(false);
  }, [logoKey]);

  const src = sources[Math.min(attemptIndex, sources.length - 1)] ?? "/placeholder.svg";
  const atLastSource = attemptIndex >= sources.length - 1;

  if (atLastSource && placeholderBroken) {
    if (import.meta.env.DEV && logoKey && !warnedLogoKeys.has(logoKey)) {
      warnedLogoKeys.add(logoKey);
      console.warn(
        `[TeamLogo] Missing icon assets\n` +
          `route="${pathname ?? "—"}" teamId="${teamId ?? "—"}" team="${teamName ?? "—"}" logoKey="${logoKey}"\n` +
          `tried: ${iconSources.join(", ")}\n` +
          `expected files (place in public/icons):\n${expectedFiles.map((file) => ` - ${file}`).join("\n")}`,
      );
    }
  }

  if (placeholderBroken && atLastSource) {
    return <div className="h-10 w-10 rounded-sm border border-slate-300/15 bg-slate-950/30" aria-label="Team logo placeholder" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 rounded-sm border border-slate-300/15 bg-slate-950/20 object-contain"
      onError={() => {
        if (atLastSource) {
          setPlaceholderBroken(true);
          return;
        }
        setAttemptIndex((index) => Math.min(index + 1, sources.length - 1));
      }}
      loading="eager"
      decoding="async"
    />
  );
}

export function HubShell({ title = "FRANCHISE HUB", children, rightActions }: { title?: string; children: ReactNode; rightActions?: ReactNode }) {
  const { state } = useGame();
  const location = useLocation();

  const teamId = resolveUserTeamId(state);
  const team = teamId ? getTeamById(teamId) : undefined;
  const teamName = `${team?.city ?? ""} ${team?.name ?? ""}`.trim() || team?.abbrev;

  const pick = teamId ? computeFirstRoundPickNumber({ league: state.league, userTeamId: teamId }) : null;
  const cap = `$${(Math.max(0, state.finances.capSpace) / 1_000_000).toFixed(1)}M`;

  return (
    <section className={`relative p-2 md:p-4 ${HUB_BG} ${HUB_TEXTURE} ${HUB_VIGNETTE}`}>
      <div className={`mx-auto max-w-7xl p-4 md:p-6 ${HUB_FRAME}`}>
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <TeamLogo
              logoKey={team?.logoKey}
              alt={`${team?.city ?? ""} ${team?.name ?? "Team"} logo`.trim()}
              teamId={teamId}
              teamName={teamName}
              pathname={location?.pathname ?? "—"}
            />
            <h1 className="text-center text-2xl font-black tracking-[0.12em] text-slate-100">{title}</h1>
            <div className={`text-2xl font-bold ${HUB_TEXT_GOLD}`}>{state.season}</div>
          </div>

          <div className={HUB_DIVIDER} />

          <div className="flex items-center justify-between text-sm text-slate-100">
            <span className="truncate">{getPhaseLabel(state)}</span>
            <span className="truncate">
              Cap Room <span className={HUB_TEXT_GOLD}>{cap}</span>
            </span>
            <span className="truncate">Pick {pick ?? "—"}</span>
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
