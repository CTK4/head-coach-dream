import { getPlayers, getTeamById } from "@/data/leagueDb";
import type { Injury } from "@/engine/injuryTypes";
import type { AIGameResult, LeagueStatLeaders } from "@/engine/leagueSim";
import type { NewsCategory, NewsItem } from "@/types/news";

type NewsContext = { week: number; season: number; userTeamId?: string };
export type TransactionLike = { id: string; type: "CUT" | "TRADE" | "VOID" | string; playerId: string; playerName: string; fromTeamId: string; toTeamId?: string; week?: number; season: number };

function mkId(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `NEWS_${(h >>> 0).toString(36)}`;
}

function makeNews(context: NewsContext, category: NewsCategory, headline: string, teamIds: string[], opts?: { body?: string; playerIds?: string[]; isUserTeam?: boolean; idSeed?: string }): NewsItem {
  const seed = opts?.idSeed ?? `${context.season}|${context.week}|${category}|${headline}|${teamIds.join(",")}`;
  return {
    id: mkId(seed),
    week: context.week,
    season: context.season,
    category,
    headline,
    body: opts?.body,
    teamIds,
    playerIds: opts?.playerIds,
    isUserTeam: Boolean(opts?.isUserTeam),
  };
}

export function generateGameResultNews(results: AIGameResult[], context: NewsContext): NewsItem[] {
  if (!results.length) return [];
  const marquee = results.reduce((best, g) => (g.homeScore + g.awayScore > best.homeScore + best.awayScore ? g : best), results[0]);

  return results.map((g) => {
    const homeName = getTeamById(g.homeTeamId)?.name ?? g.homeTeamId;
    const awayName = getTeamById(g.awayTeamId)?.name ?? g.awayTeamId;
    const homeWon = g.homeScore >= g.awayScore;
    const winner = homeWon ? homeName : awayName;
    const loser = homeWon ? awayName : homeName;
    const isUserTeam = g.homeTeamId === context.userTeamId || g.awayTeamId === context.userTeamId;
    const withBody = isUserTeam || g.gameId === marquee.gameId;
    const body = withBody
      ? `${winner} controlled key moments in a Week ${context.week} matchup. Final: ${homeName} ${g.homeScore}, ${awayName} ${g.awayScore}.`
      : undefined;

    return makeNews(context, "GAME_RESULT", `${winner} defeats ${loser} ${Math.max(g.homeScore, g.awayScore)}-${Math.min(g.homeScore, g.awayScore)} in Week ${context.week}`, [g.homeTeamId, g.awayTeamId], {
      body,
      isUserTeam,
      idSeed: `${g.gameId}|GAME_RESULT|${context.season}|${context.week}`,
    });
  });
}

export function generateInjuryNews(injuries: Injury[], context: NewsContext): NewsItem[] {
  const source = injuries.length ? injuries : [];
  if (!source.length) {
    const players = getPlayers().slice(0, 4);
    return players.slice(0, 2 + Math.floor(Math.random() * 3)).map((p, idx) => {
      const teamId = String((p as any).teamId ?? "FA");
      const teamName = getTeamById(teamId)?.name ?? teamId;
      const duration = 1 + Math.floor(Math.random() * 3);
      return makeNews(context, "INJURY", `${String((p as any).fullName ?? "Player")}, ${String((p as any).pos ?? "UNK")}, ${teamName} — ${duration} week(s) with a minor strain`, [teamId], {
        playerIds: [String((p as any).playerId)],
        isUserTeam: teamId === context.userTeamId,
        idSeed: `${context.season}|${context.week}|injury-fallback|${idx}|${String((p as any).playerId)}`,
      });
    });
  }

  return source.slice(0, 4).map((inj) => {
    const pl = getPlayers().find((p) => String((p as any).playerId) === String(inj.playerId));
    const teamName = getTeamById(inj.teamId)?.name ?? inj.teamId;
    const duration = inj.expectedReturnWeek ? Math.max(1, inj.expectedReturnWeek - context.week) : 1;
    return makeNews(context, "INJURY", `${String(pl?.fullName ?? "Player")}, ${String(pl?.pos ?? "UNK")}, ${teamName} — ${duration} week(s) with ${inj.injuryType}`, [inj.teamId], {
      playerIds: [inj.playerId],
      isUserTeam: inj.teamId === context.userTeamId,
      idSeed: `${inj.id}|INJURY|${context.season}|${context.week}`,
    });
  });
}

export function generateTransactionNews(transactions: TransactionLike[], context: NewsContext): NewsItem[] {
  return transactions.map((t) => {
    const teamIds = [t.fromTeamId, t.toTeamId].filter(Boolean) as string[];
    const isUserTeam = Boolean(context.userTeamId && teamIds.includes(context.userTeamId));
    const category: NewsCategory = t.type === "TRADE" ? "TRADE" : t.type === "CUT" ? "RELEASE" : "SIGNING";
    const toName = t.toTeamId ? getTeamById(t.toTeamId)?.name ?? t.toTeamId : "free agency";
    const fromName = getTeamById(t.fromTeamId)?.name ?? t.fromTeamId;
    const headline =
      t.type === "TRADE"
        ? `${t.playerName} traded from ${fromName} to ${toName}`
        : t.type === "CUT"
          ? `${fromName} releases ${t.playerName}`
          : `${t.playerName} signs with ${toName}`;

    return makeNews(context, category, headline, teamIds, {
      playerIds: [t.playerId],
      isUserTeam,
      idSeed: `${t.id}|${category}|${context.season}|${context.week}`,
    });
  });
}

export function generateRetirementNews(retirees: Array<{ playerId: string; fullName?: string; name?: string; pos?: string; age?: number; teamId?: string }>, context: NewsContext): NewsItem[] {
  return retirees.map((r, idx) => {
    const playerName = String(r.fullName ?? r.name ?? "Veteran");
    const pos = String(r.pos ?? "Player");
    const age = Number(r.age ?? 0);
    const teamIds = r.teamId ? [String(r.teamId)] : [];
    return makeNews(context, "RETIREMENT", `${pos} ${playerName}, ${age}, announces retirement`, teamIds, {
      body: `${playerName} announces retirement during the ${context.season} offseason.`,
      playerIds: [String(r.playerId)],
      isUserTeam: Boolean(context.userTeamId && teamIds.includes(context.userTeamId)),
      idSeed: `${context.season}|retire|${idx}|${r.playerId}`,
    });
  });
}

export function generateMilestoneNews(weekStats: LeagueStatLeaders, context: NewsContext): NewsItem[] {
  const out: NewsItem[] = [];
  for (const p of weekStats.passingYards) {
    if (p.value >= 3000) out.push(makeNews(context, "MILESTONE", `${p.playerName} surpasses 3,000 passing yards`, [p.teamId], { isUserTeam: p.teamId === context.userTeamId, idSeed: `${context.season}|${context.week}|pass|${p.playerName}|${p.value}` }));
  }
  for (const p of weekStats.rushingYards) {
    if (p.value >= 1000) out.push(makeNews(context, "MILESTONE", `${p.playerName} eclipses 1,000 rushing yards`, [p.teamId], { isUserTeam: p.teamId === context.userTeamId, idSeed: `${context.season}|${context.week}|rush|${p.playerName}|${p.value}` }));
  }
  for (const p of weekStats.sacks) {
    if (p.value >= 10) out.push(makeNews(context, "MILESTONE", `${p.playerName} reaches double-digit sacks`, [p.teamId], { isUserTeam: p.teamId === context.userTeamId, idSeed: `${context.season}|${context.week}|sack|${p.playerName}|${p.value}` }));
  }
  return out;
}

export function appendNewsHistory(history: NewsItem[], incoming: NewsItem[], max = 500): NewsItem[] {
  const merged = [...incoming, ...history];
  const dedup = new Map<string, NewsItem>();
  for (const item of merged) if (!dedup.has(item.id)) dedup.set(item.id, item);
  return Array.from(dedup.values()).slice(0, max);
}
