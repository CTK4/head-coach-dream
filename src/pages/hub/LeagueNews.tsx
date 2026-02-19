import { ScrollArea } from "@/components/ui/scroll-area";
import { useGame } from "@/context/GameContext";
import { HubPanel } from "@/components/franchise-hub/HubPanel";
import { HubEmptyState } from "@/components/franchise-hub/states/HubEmptyState";

export default function LeagueNews() {
  const { state } = useGame();

  return (
    <HubPanel title="LEAGUE NEWS">
      <ScrollArea className="h-[65vh] pr-3" aria-label="League news list">
        <ul className="space-y-3">
          {state.hub.news.map((news, index) => (
            <li key={`${news}-${index}`} className="rounded-md border border-border/50 bg-background/40 p-3 text-sm text-foreground/90">
              {news}
            </li>
          ))}
          {state.hub.news.length === 0 ? (
            <li>
              <HubEmptyState title="No headlines yet" description="The wire is quiet this week." action={{ label: "Back to Hub", to: "/hub" }} />
            </li>
          ) : null}
        </ul>
      </ScrollArea>
    </HubPanel>
  );
}
