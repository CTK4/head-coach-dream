import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Button } from "@/components/ui/button";
import { confirmAutoAdvance } from "@/lib/autoAdvanceConfirm";
import { HUB_CARD } from "@/components/franchise-hub/theme";
import { HubTile } from "@/components/franchise-hub/HubTile";
import { HUB_TILE_IMAGES } from "@/components/franchise-hub/tileImages";
import {
  stageLabel,
  stageToRoute,
  nextCareerStage,
} from "@/components/franchise-hub/stageRouting";
import type { CareerStage } from "@/types/careerStage";
import { shouldConfirmAutoAdvance } from "@/lib/autoAdvanceConfirm";
import { useUserSettings } from "@/hooks/useUserSettings";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPhaseEyebrow(
  stage: CareerStage,
  regularSeasonWeek: number,
  preseasonWeek: number,
): string {
  switch (stage) {
    case "REGULAR_SEASON":
      return `WEEK ${regularSeasonWeek} · REGULAR SEASON`;
    case "PLAYOFFS":
      return "PLAYOFFS";
    case "PRESEASON":
      return `WEEK ${preseasonWeek} · PRESEASON`;
    case "OFFSEASON_HUB":
      return "OFFSEASON";
    case "RESIGN":
      return "OFFSEASON · RE-SIGNING";
    case "FREE_AGENCY":
      return "OFFSEASON · FREE AGENCY";
    case "DRAFT":
      return "OFFSEASON · DRAFT";
    case "TRAINING_CAMP":
      return "TRAINING CAMP";
    case "CUTDOWNS":
      return "OFFSEASON · CUT DOWNS";
    default:
      return "OFFSEASON";
  }
}

function getCtaLabel(
  stage: CareerStage,
  regularSeasonWeek: number,
  preseasonWeek: number,
): string {
  switch (stage) {
    case "REGULAR_SEASON":
      return `Game Plan — Week ${regularSeasonWeek}`;
    case "PLAYOFFS":
      return "Game Plan — Playoffs";
    case "PRESEASON":
      return `Preseason — Week ${preseasonWeek}`;
    case "OFFSEASON_HUB":
      return "Begin Offseason";
    default:
      return `Continue — ${stageLabel(stage)}`;
  }
}

// ─── Zone 2 card ─────────────────────────────────────────────────────────────

type Zone2CardDef = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  cta: string;
  route: string;
  borderClass?: string;
  dimmed?: boolean;
};

function Zone2Card({
  eyebrow,
  title,
  subtitle,
  cta,
  route,
  borderClass = "border-blue-400/60",
  dimmed = false,
}: Zone2CardDef) {
  const navigate = useNavigate();
  return (
    <div
      className={`${HUB_CARD} p-4 border-l-2 ${borderClass} rounded-lg ${dimmed ? "opacity-60" : ""}`}
    >
      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        {eyebrow}
      </div>
      <div className="font-semibold text-slate-100 text-sm">{title}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="mt-3 w-full"
        onClick={() => navigate(route)}
      >
        {cta}
      </Button>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function HubMissionControl() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const settings = useUserSettings();
  const [zone3Open, setZone3Open] = useState(false);
  const [confirmAdvanceOpen, setConfirmAdvanceOpen] = useState(false);
  const settings = useUserSettings();

  const { careerStage, coach, hub, currentStandings, userTeamId, staff, firing } =
    state;

  // ── Team record lookup ────────────────────────────────────────────────────
  const teamRecord = userTeamId
    ? currentStandings.find((s) => s.teamId === userTeamId)
    : undefined;
  const teamName = teamRecord?.teamName ?? coach.name ?? "Your Team";
  const teamLine = teamRecord
    ? `${teamName} · ${teamRecord.wins}–${teamRecord.losses}`
    : teamName;

  // ── Phase eyebrow ─────────────────────────────────────────────────────────
  const eyebrow = getPhaseEyebrow(
    careerStage,
    hub.regularSeasonWeek,
    hub.preseasonWeek,
  );

  // ── Alerts ────────────────────────────────────────────────────────────────
  const offseasonStages: ReadonlyArray<CareerStage> = [
    "OFFSEASON_HUB",
    "ASSISTANT_HIRING",
    "STAFF_CONSTRUCTION",
    "ROSTER_REVIEW",
    "RESIGN",
    "COMBINE",
    "TAMPERING",
    "FREE_AGENCY",
    "PRE_DRAFT",
    "DRAFT",
    "TRAINING_CAMP",
    "PRESEASON",
    "CUTDOWNS",
  ];
  const missingCoordinator =
    offseasonStages.includes(careerStage) &&
    (!staff.ocId || !staff.dcId || !staff.stcId);
  const firingAlert = (firing?.pWeekly ?? 0) > 0.3;

  // ── Primary CTA ───────────────────────────────────────────────────────────
  const ctaLabel = getCtaLabel(
    careerStage,
    hub.regularSeasonWeek,
    hub.preseasonWeek,
  );

  function handlePrimaryCta() {
    switch (careerStage) {
      case "REGULAR_SEASON":
        navigate("/hub/gameplan");
        break;
      case "PLAYOFFS":
        navigate("/hub/gameplan");
        break;
      case "PRESEASON":
        navigate("/hub/preseason");
        break;
      case "OFFSEASON_HUB":
        if (shouldConfirmAutoAdvance(settings)) {
          setConfirmAdvanceOpen(true);
          return;
        }
        dispatch({ type: "ADVANCE_CAREER_STAGE" });
        navigate(stageToRoute("ASSISTANT_HIRING"));
        break;
      default: {
        const route = stageToRoute(careerStage);
        navigate(route !== "/hub" ? route : "/hub");
      }
    }
  }

  // ── Zone 2 cards ──────────────────────────────────────────────────────────
  function buildZone2Cards(): Zone2CardDef[] {
    switch (careerStage) {
      case "REGULAR_SEASON":
        return [
          {
            eyebrow: "THIS WEEK",
            title: "Game Plan",
            subtitle: "Set your scheme and focus before kickoff",
            cta: "Open Gameplan",
            route: "/hub/gameplan",
          },
          {
            eyebrow: "ROSTER",
            title: "Depth Chart",
            subtitle: "Review your starters",
            cta: "View Depth Chart",
            route: "/roster/depth-chart",
          },
          {
            eyebrow: "STAFF",
            title: "Owner Relations",
            subtitle: "Track staff trust and owner confidence",
            cta: "Open",
            route: "/hub/owner-relations",
          },
          {
            eyebrow: "OWNER",
            title: "Firing Meter",
            subtitle: "Monitor your job security",
            cta: "View",
            route: "/hub/firing-meter",
          },
        ];

      case "PLAYOFFS":
        return [
          {
            eyebrow: "THIS WEEK",
            title: "Game Plan",
            subtitle: "Prepare your playoff scheme",
            cta: "Open Gameplan",
            route: "/hub/gameplan",
          },
          {
            eyebrow: "BRACKET",
            title: "Playoff Bracket",
            subtitle: "Track the playoff picture",
            cta: "View Bracket",
            route: "/hub/playoffs/bracket",
          },
          {
            eyebrow: "ROSTER",
            title: "Depth Chart",
            subtitle: "Review your starters",
            cta: "View Depth Chart",
            route: "/roster/depth-chart",
          },
          {
            eyebrow: "STAFF",
            title: "Owner Relations",
            subtitle: "Track owner confidence",
            cta: "Open",
            route: "/hub/owner-relations",
          },
        ];

      case "PRESEASON":
        return [
          {
            eyebrow: "THIS WEEK",
            title: `Preseason — Week ${hub.preseasonWeek}`,
            subtitle: "Evaluate your roster in game action",
            cta: "Go to Preseason",
            route: "/hub/preseason",
          },
          {
            eyebrow: "ROSTER",
            title: "Depth Chart",
            subtitle: "Review your starters",
            cta: "View Depth Chart",
            route: "/roster/depth-chart",
          },
          {
            eyebrow: "ROSTER",
            title: "Roster Audit",
            subtitle: "Evaluate your current roster",
            cta: "Open Audit",
            route: "/hub/roster-audit",
          },
        ];

      case "OFFSEASON_HUB": {
        const cards: Zone2CardDef[] = [];
        if (missingCoordinator) {
          cards.push({
            eyebrow: "STAFF",
            title: "Hire Coordinators",
            subtitle: "OC · DC · STC vacancy — fill before the season",
            cta: "Hire Now",
            route: "/hub/coordinator-hiring",
          });
        }
        cards.push(
          {
            eyebrow: "SALARY CAP",
            title: "Cap Baseline",
            subtitle: "Review cap space before free agency",
            cta: "View Cap",
            route: "/hub/cap-baseline",
          },
          {
            eyebrow: "ROSTER",
            title: "Roster Audit",
            subtitle: "Evaluate your current roster",
            cta: "Open Audit",
            route: "/hub/roster-audit",
          },
          {
            eyebrow: "OWNER",
            title: "Owner Relations",
            subtitle: "Review expectations and job security",
            cta: "Open",
            route: "/hub/owner-relations",
          },
        );
        return cards.slice(0, 4);
      }

      default: {
        // All other offseason steps
        const currentStepLabel = stageLabel(careerStage);
        const currentRoute = stageToRoute(careerStage);
        const nextStage = nextCareerStage(careerStage);
        const hasNext = nextStage !== careerStage;

        const cards: Zone2CardDef[] = [
          {
            eyebrow: "CURRENT STEP",
            title: currentStepLabel,
            subtitle: "Active offseason phase",
            cta: `Go to ${currentStepLabel}`,
            route: currentRoute,
            borderClass: "border-blue-400/60",
          },
        ];

        if (hasNext) {
          cards.push({
            eyebrow: "UP NEXT",
            title: stageLabel(nextStage),
            subtitle: "Coming up next",
            cta: `Preview`,
            route: "/hub",
            borderClass: "border-white/10",
            dimmed: true,
          });
        }

        cards.push(
          {
            eyebrow: "SALARY CAP",
            title: "Cap Baseline",
            subtitle: "Review cap space",
            cta: "View Cap",
            route: "/hub/cap-baseline",
          },
          {
            eyebrow: "ROSTER",
            title: "Roster Audit",
            subtitle: "Review your full roster",
            cta: "Open Audit",
            route: "/hub/roster-audit",
          },
        );

        return cards.slice(0, 4);
      }
    }
  }

  const zone2Cards = buildZone2Cards();

  // ── Zone 3 tiles ──────────────────────────────────────────────────────────
  const zone3Tiles = [
    { title: "Stats", to: "/hub/stats", imageUrl: HUB_TILE_IMAGES.strategy },
    { title: "League News", to: "/news", imageUrl: HUB_TILE_IMAGES.news },
    {
      title: "League History",
      to: "/hub/league-history",
      imageUrl: HUB_TILE_IMAGES.hall_of_fame,
    },
    {
      title: "Hall of Fame",
      to: "/hub/hall-of-fame",
      imageUrl: HUB_TILE_IMAGES.hall_of_fame,
    },
    {
      title: "Draft Results",
      to: "/hub/draft-results",
      imageUrl: HUB_TILE_IMAGES.scouting,
    },
    {
      title: "Activity Log",
      to: "/hub/activity",
      imageUrl: HUB_TILE_IMAGES.news,
    },
    {
      title: "Dead Money",
      to: "/hub/dead-money",
      imageUrl: HUB_TILE_IMAGES.contracts,
    },
    {
      title: "Analytics",
      to: "/hub/analytics",
      imageUrl: HUB_TILE_IMAGES.strategy,
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* ── Zone 1: Mission Control ───────────────────────────────────────── */}
      <div className={`${HUB_CARD} p-5 border border-white/10`}>
        <div className="text-xs text-amber-300 tracking-widest uppercase mb-1">
          {eyebrow}
        </div>
        <div className="text-xl font-black text-slate-100 mb-3">{teamLine}</div>

        {missingCoordinator && (
          <div className="border-l-2 border-orange-500/40 pl-3 py-1 mb-2">
            <span className="text-xs text-orange-300">
              Coordinator vacancy — hire before the season begins
            </span>
          </div>
        )}
        {firingAlert && (
          <div className="border-l-2 border-red-500/40 pl-3 py-1 mb-2">
            <span className="text-xs text-red-300">
              Owner patience is running out
            </span>
          </div>
        )}

        <Button className="w-full mt-1" onClick={handlePrimaryCta}>
          {ctaLabel}
        </Button>
      </div>

      <AlertDialog open={confirmAdvanceOpen} onOpenChange={setConfirmAdvanceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Advance to assistant hiring?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move your career stage into offseason assistant hiring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmAdvanceOpen(false);
                dispatch({ type: "ADVANCE_CAREER_STAGE" });
                navigate(stageToRoute("ASSISTANT_HIRING"));
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Zone 2: This Week's Work ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {zone2Cards.map((card) => (
          <Zone2Card key={`${card.route}-${card.title}`} {...card} />
        ))}
      </div>

      {/* ── Zone 3: League & History ──────────────────────────────────────── */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-between text-muted-foreground"
          onClick={() => setZone3Open((prev) => !prev)}
          aria-expanded={zone3Open}
        >
          <span className="text-xs uppercase tracking-widest">
            League &amp; History
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${zone3Open ? "rotate-180" : ""}`}
          />
        </Button>
        <div
          className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${
            zone3Open ? "max-h-[800px]" : "max-h-0"
          }`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
            {zone3Tiles.map((tile) => (
              <HubTile
                key={tile.to}
                title={tile.title}
                to={tile.to}
                imageUrl={tile.imageUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
