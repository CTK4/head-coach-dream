import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/context/GameContext";
import type { NewsCategory } from "@/types/news";
import { StandingsTable } from "@/pages/hub/Standings";

const PAGE_SIZE = 30;
const filterToCategories: Record<string, NewsCategory[] | null> = { ALL: null, "MY TEAM": null, TRADES: ["TRADE", "SIGNING", "RELEASE"], INJURIES: ["INJURY"], SCORES: ["GAME_RESULT"], MILESTONES: ["MILESTONE", "AWARD"] };
const categoryIcon: Record<NewsCategory, string> = { GAME_RESULT: "🏈", INJURY: "🩺", TRADE: "🔁", SIGNING: "✍️", RELEASE: "📄", RETIREMENT: "🏁", AWARD: "🏆", MILESTONE: "📈", RUMOR: "🗞️", COACHING: "🎧" };

export default function LeagueNews() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<"NEWS" | "STANDINGS" | "STAT_LEADERS">("NEWS");
  const [filter, setFilter] = useState<keyof typeof filterToCategories>("ALL");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);

  useEffect(() => { dispatch({ type: "HUB_MARK_NEWS_READ" }); }, [dispatch, tab]);

  const allNews = useMemo(() => [...(state.newsHistory ?? [])], [state.newsHistory]);
  const filtered = useMemo(() => allNews.filter((item) => { const cats = filterToCategories[filter]; if (filter === "MY TEAM" && !item.isUserTeam) return false; if (cats && !cats.includes(item.category)) return false; return true; }).sort((a, b) => (b.season - a.season) || (b.week - a.week)), [allNews, filter]);
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const leaders = state.leagueStatLeaders;
  const leaderCats = [
    { id: "Passing", primary: leaders.passingYards ?? [], secondary: "yds" },
    { id: "Rushing", primary: leaders.rushingYards ?? [], secondary: "yds" },
    { id: "Receiving", primary: leaders.receivingYards ?? [], secondary: "yds" },
    { id: "Sacks", primary: leaders.sacks ?? [], secondary: "sacks" },
  ];

  return <Card><CardHeader className="space-y-3"><div className="flex items-center justify-between"><CardTitle>League News</CardTitle><Badge variant="outline">Week {state.hub.regularSeasonWeek}</Badge></div><div className="flex gap-2"><Button size="sm" variant={tab === "NEWS" ? "default" : "outline"} onClick={() => setTab("NEWS")}>NEWS</Button><Button size="sm" variant={tab === "STANDINGS" ? "default" : "outline"} onClick={() => setTab("STANDINGS")}>STANDINGS</Button><Button size="sm" variant={tab === "STAT_LEADERS" ? "default" : "outline"} onClick={() => setTab("STAT_LEADERS")}>STAT LEADERS</Button></div>{tab === "NEWS" ? <div className="flex flex-wrap gap-2">{Object.keys(filterToCategories).map((pill) => <Button key={pill} variant={filter === pill ? "default" : "outline"} size="sm" onClick={() => { setFilter(pill as keyof typeof filterToCategories); setPage(1); }}>{pill}</Button>)}</div> : null}</CardHeader><CardContent className="space-y-3">{tab === "NEWS" ? <>{visible.map((item) => <div key={item.id} className={`rounded-md border p-3 ${item.isUserTeam ? "border-l-4 border-l-primary" : ""}`}><button type="button" className="w-full text-left" onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}><div className="flex items-center justify-between gap-3"><div className="font-semibold"><span className="mr-2">{categoryIcon[item.category]}</span>{item.headline}</div><Badge variant="secondary">W{item.week}</Badge></div></button>{expanded[item.id] && item.body ? <p className="mt-2 text-sm text-muted-foreground">{item.body}</p> : null}</div>)}{filtered.length > visible.length ? <Button variant="outline" onClick={() => setPage((p) => p + 1)}>Load more</Button> : null}</> : null}{tab === "STANDINGS" ? <StandingsTable /> : null}{tab === "STAT_LEADERS" ? <div className="space-y-4">{leaderCats.map((cat) => <div key={cat.id}><div className="font-semibold mb-2">{cat.id}</div>{cat.primary.slice(0, 10).map((row, i) => <div key={`${cat.id}-${row.playerName}-${i}`} className={`grid grid-cols-12 gap-2 rounded border p-2 text-sm ${row.teamId === state.acceptedOffer?.teamId ? "border-primary/70" : ""}`}><div>{i + 1}</div><div className="col-span-5">{row.playerName}</div><div>{row.teamId}</div><div className="col-span-4 text-right">{row.value} {cat.secondary}</div></div>)}{!cat.primary.length ? <div className="text-sm text-muted-foreground">No data yet.</div> : null}</div>)}</div> : null}</CardContent></Card>;
}
