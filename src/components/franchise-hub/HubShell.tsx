import type { ReactNode } from "react";
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

export function HubShell({ title = "FRANCHISE HUB", children, rightActions }: { title?: string; children: ReactNode; rightActions?: ReactNode }) {
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  const team = teamId ? getTeamById(teamId) : undefined;
  const pick = teamId ? computeFirstRoundPickNumber({ league: state.league, userTeamId: teamId }) : null;
  const cap = `$${(Math.max(0, state.finances.capSpace) / 1_000_000).toFixed(1)}M`;

  return (
    <section className={`relative p-2 md:p-4 ${HUB_BG} ${HUB_TEXTURE} ${HUB_VIGNETTE}`}>
      <div className={`mx-auto max-w-7xl p-4 md:p-6 ${HUB_FRAME}`}>
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            {team?.logoKey ? <img src={`/icons/${team.logoKey}.png`} alt={`${team.name} logo`} className="h-10 w-10 rounded-sm object-contain" /> : <div className="h-10 w-10" />}
            <h1 className="text-center text-2xl font-black tracking-[0.12em] text-slate-100">{title}</h1>
            <div className={`text-2xl font-bold ${HUB_TEXT_GOLD}`}>{state.season}</div>
          </div>
          <div className={HUB_DIVIDER} />
          <div className="flex items-center justify-between text-sm text-slate-100">
            <span>{getPhaseLabel(state)}</span>
            <span>Cap Room <span className={HUB_TEXT_GOLD}>{cap}</span></span>
            <span>Pick {pick ?? "—"}</span>
          </div>
          <div className={HUB_DIVIDER} />
          <FranchiseHubTabs tabs={stageTabs} />
        </header>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <main className="space-y-4">{rightActions ? <div className="flex justify-end">{rightActions}</div> : null}{children}</main>
          <ContextBar state={state} />
        </div>
      </div>
    </section>
  );
}
