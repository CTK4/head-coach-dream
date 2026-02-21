import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTeamById } from "@/data/leagueDb";
import { useGame } from "@/context/GameContext";
import { computeUserOwnedFirstRoundPicks } from "@/components/franchise-hub/draftOrder";
import { getPhaseLabel } from "@/components/franchise-hub/offseasonLabel";
import { HUB_BG, HUB_DIVIDER, HUB_FRAME, HUB_TEXT_GOLD, HUB_TEXTURE, HUB_VIGNETTE } from "@/components/franchise-hub/theme";
import { UtilityIcon } from "@/components/franchise-hub/UtilityIcon";
import { computeCapLedger } from "@/engine/capLedger";

// Helper functions extracted from HubShell
const OFFSEASON_CAREER_STAGES = new Set(["HIRE_STAFF", "ROSTER_REVIEW", "COMBINE", "PRE_DRAFT", "DRAFT", "OFFSEASON"]);
const SETTINGS_KEY = "hcd:settings";
const warnedLogoKeys = new Set<string>();

function resolveUserTeamId(state: any): string | undefined {
  return state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? state.profile?.teamId ?? state.coach?.teamId;
}

function readUseTop51Setting(): boolean {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { useTop51CapRule?: boolean };
    return Boolean(parsed.useTop51CapRule);
  } catch {
    return false;
  }
}

function isOffseasonState(state: any): boolean {
  return OFFSEASON_CAREER_STAGES.has(String(state?.careerStage ?? "").toUpperCase());
}

function formatMoneyM(n: number) {
  const m = n / 1_000_000;
  const abs = Math.abs(m);
  const v = abs >= 100 ? m.toFixed(0) : m.toFixed(1);
  return `$${v}M`;
}

function buildLogoCandidates(logoKey: string): { triedPaths: string[]; expectedFiles: string[] } {
  const expectedFiles = [
    `${logoKey}@3x.avif`, `${logoKey}@2x.avif`, `${logoKey}.avif`,
    `${logoKey}@3x.webp`, `${logoKey}@2x.webp`, `${logoKey}.webp`,
    `${logoKey}@3x.png`, `${logoKey}@2x.png`, `${logoKey}.png`,
  ];
  const key = encodeURIComponent(logoKey);
  const triedPaths = [
    `/icons/${key}@3x.avif`, `/icons/${key}@2x.avif`, `/icons/${key}.avif`,
    `/icons/${key}@3x.webp`, `/icons/${key}@2x.webp`, `/icons/${key}.webp`,
    `/icons/${key}@3x.png`, `/icons/${key}@2x.png`, `/icons/${key}.png`,
  ];
  return { triedPaths, expectedFiles };
}

function TeamLogo({ logoKey, teamId, teamName, pathname, alt }: { logoKey?: string; teamId?: string; teamName?: string; pathname?: string; alt: string; }) {
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

  useEffect(() => setAttemptIndex(0), [logoKey]);

  const currentSrc = sources[attemptIndex];
  const exhausted = Boolean(logoKey) && attemptIndex >= sources.length - 1;

  if (!logoKey || !currentSrc || (exhausted && currentSrc === "/placeholder.svg")) {
    if (import.meta.env.DEV && logoKey && !warnedLogoKeys.has(logoKey)) {
      warnedLogoKeys.add(logoKey);
      // Warning logic omitted for brevity
    }
    return <div className="h-10 w-10 rounded-sm border border-slate-300/15 bg-slate-950/30" aria-label="Team logo placeholder" />;
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

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode; }) {
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

export function FranchiseHeader({ title = "FRANCHISE HUB", backPath }: { title?: string, backPath?: string }) {
  const { state } = useGame();
  const location = useLocation();
  const navigate = useNavigate();

  const teamId = resolveUserTeamId(state);
  const team = teamId ? getTeamById(teamId) : undefined;

  const ownedPicks = teamId
    ? computeUserOwnedFirstRoundPicks({
        league: state.league,
        userTeamId: String(teamId),
        season: Number(state.season),
        pickOwnerByKey: (state as any).draftPickOwnerByKey,
      })
    : [];
  const pickDisplay = ownedPicks.length ? ownedPicks.join(", ") : "—";

  const capRoom = useMemo(() => {
    if (!teamId) return state.finances?.capSpace ?? 0;
    try {
      const wantsTop51 = readUseTop51Setting();
      const applyTop51 = wantsTop51 && isOffseasonState(state);
      return computeCapLedger(state as any, String(teamId), { useTop51: applyTop51 }).capSpace;
    } catch {
      return state.finances?.capSpace ?? 0;
    }
  }, [state, teamId]);

  const capValue = formatMoneyM(capRoom);
  const phase = getPhaseLabel(state);

  // Fix for build error: access city safely if it exists, otherwise fallback
  const fullName = [
    (team as any)?.city || "",
    team?.name
  ].filter(Boolean).join(" ").trim();
  const teamName = team?.abbrev ?? (fullName.length ? fullName : undefined);

  function goBack() {
    if (backPath) navigate(backPath);
    else navigate(-1);
  }

  return (
    <header className="space-y-3 pb-4">
      <div className="flex items-center justify-between gap-3">
        <TeamLogo
          logoKey={team?.logoKey}
          teamId={teamId}
          teamName={teamName}
          pathname={location?.pathname}
          alt={`${teamName ?? "Team"} logo`}
        />
        <div className="flex flex-col items-center">
             <h1 className="text-center text-xl font-black tracking-[0.12em] text-slate-100 uppercase">{title}</h1>
             <div className={`text-xs font-bold ${HUB_TEXT_GOLD}`}>{state.season} Season • Pick #{pickDisplay.split(',')[0]}</div>
        </div>
        
        <div className="text-right leading-tight">
             <div className="text-[10px] tracking-[0.12em] text-slate-100/70">Cap Space</div>
             <div className={`text-sm font-bold ${HUB_TEXT_GOLD}`}>{capValue}</div>
        </div>
      </div>

      <div className={HUB_DIVIDER} />
      
      {/* Sub-header controls if needed, e.g. back button on sub-pages */}
      {location.pathname !== "/hub" && (
          <div className="flex items-center gap-2">
            <IconButton label="Back" onClick={goBack}>
                <span aria-hidden="true">←</span>
                <span className="hidden sm:inline">BACK</span>
            </IconButton>
          </div>
      )}
    </header>
  );
}
