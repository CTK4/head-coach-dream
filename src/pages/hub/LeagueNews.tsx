import { ScrollArea } from "@/components/ui/scroll-area";
import { useGame } from "@/context/GameContext";

export default function LeagueNews() {
  const { state } = useGame();

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-4 text-2xl font-semibold">League News</h2>
      <ScrollArea className="h-[65vh] pr-3" aria-label="League news list">
        <ul className="space-y-3">
          {state.hub.news.map((news, index) => (
            <li key={`${news}-${index}`} className="rounded-md border border-border/50 bg-background/40 p-3 text-sm text-foreground/90">
              {news}
            </li>
          ))}
          {state.hub.news.length === 0 ? <li className="text-muted-foreground">No headlines yet.</li> : null}
        </ul>
      </ScrollArea>
    </div>
  );
}
