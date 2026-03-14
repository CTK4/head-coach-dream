import { HubMissionControl } from "@/components/hub/HubMissionControl";
import { useGame } from "@/context/GameContext";
import { FranchiseHeader } from "@/components/franchise-hub/FranchiseHeader";
import { HUB_BG, HUB_TEXTURE, HUB_VIGNETTE, HUB_FRAME } from "@/components/franchise-hub/theme";
import SeasonAwards from "@/pages/SeasonAwards";

export default function Hub() {
  const { state } = useGame();

  if (state.careerStage === "SEASON_AWARDS") {
    return <SeasonAwards />;
  }

  return (
    <div data-test="hub-root" className={`relative min-h-full overflow-x-hidden p-2 md:p-4 ${HUB_BG}`}>
      <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_TEXTURE}`} aria-hidden="true" />
      <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_VIGNETTE}`} aria-hidden="true" />

      <div className={`relative z-10 mx-auto max-w-7xl space-y-6 p-4 md:p-6 ${HUB_FRAME}`}>
        <FranchiseHeader />

        <HubMissionControl />
      </div>
    </div>
  );
}
