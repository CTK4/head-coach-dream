import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/context/GameContext";
import type { NewsCategory } from "@/types/news";

const PAGE_SIZE = 30;

const filterToCategories: Record<string, NewsCategory[] | null> = {
  ALL: null,
  "MY TEAM": null,
  TRADES: ["TRADE", "SIGNING", "RELEASE"],
  INJURIES: ["INJURY"],
  SCORES: ["GAME_RESULT"],
  MILESTONES: ["MILESTONE", "AWARD"],
};

const categoryIcon: Record<NewsCategory, string> = {
  GAME_RESULT: "🏈",
  INJURY: "🩺",
  TRADE: "🔁",
  SIGNING: "✍️",
  RELEASE: "📄",
  RETIREMENT: "🏁",
  AWARD: "🏆",
  MILESTONE: "📈",
  RUMOR: "🗞️",
  COACHING: "🎧",
};

export default function LeagueNews() {
  const { state } = useGame();
  const [filter, setFilter] = useState<keyof typeof filterToCategories>("ALL");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);

  const allNews = useMemo(() => [...(state.newsHistory ?? [])], [state.newsHistory]);

  const filtered = useMemo(() => {
    const cats = filterToCategories[filter];
    const rows = allNews.filter((item) => {
      if (filter === "MY TEAM" && !item.isUserTeam) return false;
      if (cats && !cats.includes(item.category)) return false;
      return true;
    });
    return rows.sort((a, b) => (b.season - a.season) || (b.week - a.week));
  }, [allNews, filter]);

  const visible = filtered.slice(0, page * PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>League News</CardTitle>
          <Badge variant="outline">Week {state.hub.regularSeasonWeek}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(filterToCategories).map((pill) => (
            <Button
              key={pill}
              variant={filter === pill ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilter(pill as keyof typeof filterToCategories);
                setPage(1);
              }}
            >
              {pill}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.map((item) => (
          <div
            key={item.id}
            className={`rounded-md border p-3 ${item.isUserTeam ? "border-l-4 border-l-primary" : ""}`}
          >
            <button type="button" className="w-full text-left" onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">
                  <span className="mr-2">{categoryIcon[item.category]}</span>
                  {item.headline}
                </div>
                <Badge variant="secondary">W{item.week}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {item.teamIds.map((teamId) => (
                  <Badge key={`${item.id}-${teamId}`} variant="outline" className="text-[10px]">
                    {teamId}
                  </Badge>
                ))}
              </div>
            </button>
            {expanded[item.id] && item.body ? <p className="mt-2 text-sm text-muted-foreground">{item.body}</p> : null}
          </div>
        ))}

        {!visible.length ? <div className="text-sm text-muted-foreground">No news items match this filter yet.</div> : null}

        {filtered.length > visible.length ? (
          <div className="pt-2">
            <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
              Load more
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
