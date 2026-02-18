import { HudShell } from "@/lib/ui/HudShell";
import { PhaseRail } from "@/lib/ui/PhaseRail";
import { HubCards } from "@/lib/ui/HubCards";
import { mockHubState } from "@/lib/hub/mockHubState";

const Hub = () => {
  const hub = mockHubState();

  return (
    <HudShell
      title="Franchise Hub"
      yearLabel={`${hub.year}`}
      status={{
        record: hub.record,
        phase: hub.phase,
        capRoom: hub.capRoom,
        draftPick: hub.draftPick,
      }}
    >
      <PhaseRail />
      <HubCards hub={hub} />
    </HudShell>
  );
};

export default Hub;
