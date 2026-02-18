import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { FranchiseHubHeader } from "@/components/franchise-hub/FranchiseHubHeader";
import { FranchiseHubInfoRow } from "@/components/franchise-hub/FranchiseHubInfoRow";
import { FranchiseHubTabs } from "@/components/franchise-hub/FranchiseHubTabs";
import { HubTile } from "@/components/franchise-hub/HubTile";
import { AdvancePhaseBar } from "@/components/franchise-hub/AdvancePhaseBar";
import { computeOverallPickNumber } from "@/components/franchise-hub/draftOrder";
import { hubTheme } from "@/components/franchise-hub/theme";
import { nextStageForNavigate, stageLabel, stageToRoute } from "@/components/franchise-hub/stageRouting";

const stageTabs = [
  { label: "HIRE STAFF", to: "/hub/assistant-hiring" },
  { label: "ROSTER REVIEW", to: "/hub/roster-audit" },
  { label: "COMBINE", to: "/hub/combine" },
  { label: "PRE-DRAFT", to: "/hub/pre-draft" },
  { label: "DRAFT", to: "/hub/draft" },
];

const Hub = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const teamId = state.acceptedOffer?.teamId;
  const team = teamId ? getTeamById(teamId) : undefined;

  const capRoomLabel = useMemo(() => {
    const capRoom = Math.max(0, state.finances.capSpace);
    return `$${(capRoom / 1_000_000).toFixed(1)}M`;
  }, [state.finances.capSpace]);

  const overallPick = useMemo(() => {
    if (!teamId) return null;
    return computeOverallPickNumber(state.league, teamId);
  }, [state.league, teamId]);

  if (!teamId || !team) {
    return (
      <div className="rounded-lg border border-slate-200/20 bg-slate-900/80 p-6 text-center text-slate-100">
        No team assigned. Please complete the hiring process.
      </div>
    );
  }

  const logoAlt = `${team.region ?? ""} ${team.name} logo`.trim();
  const nextStage = nextStageForNavigate(state.careerStage);

  const tiles = [
    { title: "HIRE STAFF", subtitle: "3 Positions Open", cta: "DECISION NEEDED", to: "/hub/assistant-hiring", badgeCount: 1 },
    { title: "FRANCHISE STRATEGY", subtitle: "Build the blueprint", cta: "PLAN FUTURE", to: "/hub/staff-management", badgeCount: 1 },
    { title: "SCOUTING", subtitle: "Update your board", cta: "BEGIN SCOUTING", to: "/hub/pre-draft", badgeCount: 2 },
    { title: "ROSTER", subtitle: "Depth and roles", cta: "MANAGE TEAM", to: "/hub/roster", badgeCount: 1 },
    { title: "CONTRACTS & CAP MANAGEMENT", subtitle: "Financial outlook", cta: "VIEW FINANCES", to: "/hub/finances", badgeCount: 1 },
    {
      title: "LEAGUE NEWS",
      subtitle: "Headlines around the league",
      cta: "VIEW HEADLINES",
      to: "/hub/league-news",
      badgeCount: Math.max(1, Math.min(9, state.hub.news.length)),
      notificationCount: Math.min(9, state.hub.news.length),
    },
  ];

  return (
    <section className={`relative p-2 md:p-4 ${hubTheme.pageBackground} ${hubTheme.pageTexture} ${hubTheme.pageVignette}`}>
      <div className={`mx-auto max-w-5xl p-4 md:p-6 ${hubTheme.frame}`}>
        <FranchiseHubHeader season={state.season} logoSrc={`/icons/${team.logoKey}.png`} logoAlt={logoAlt} />

        <div className="mt-3 space-y-4">
          <FranchiseHubInfoRow state={state} capRoomLabel={capRoomLabel} pickNumber={overallPick} />
          <FranchiseHubTabs tabs={stageTabs} />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {tiles.map((tile) => (
              <HubTile key={tile.title} {...tile} />
            ))}
          </div>

          <AdvancePhaseBar
            nextLabel={stageLabel(nextStage)}
            onAdvance={() => {
              dispatch({ type: "ADVANCE_CAREER_STAGE" });
              navigate(stageToRoute(nextStage));
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hub;
