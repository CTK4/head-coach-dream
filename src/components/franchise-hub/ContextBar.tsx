import { Link } from "react-router-dom";
import { getTeamById } from "@/data/leagueDb";
import type { GameState } from "@/context/GameContext";
import { getPhaseLabel } from "@/components/franchise-hub/offseasonLabel";
import { computeFirstRoundPickNumber } from "@/components/franchise-hub/draftOrder";
import { HubPanel } from "@/components/franchise-hub/HubPanel";
import { HUB_PILL } from "@/components/franchise-hub/theme";
import { computeStreak, getLastGameForTeam, getNextGameForTeam } from "@/components/franchise-hub/userTeamSchedule";
import { isRegularSeason } from "@/components/franchise-hub/seasonStatus";

export function ContextBar({ state }: { state: GameState }) {
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;
  const team = getTeamById(teamId);
  const standing = state.league.standings[teamId];
  const pick = computeFirstRoundPickNumber({ league: state.league, userTeamId: teamId });
  const cap = `$${(Math.max(0, state.finances.capSpace) / 1_000_000).toFixed(1)}M`;
  const quickLinks = [
    ["Hire Staff", "/hub/assistant-hiring"],
    ["Roster", "/hub/roster"],
    ["Finances", "/hub/finances"],
    ["Pre-Draft", "/hub/pre-draft"],
    ["Draft", "/hub/draft"],
    ["League News", "/hub/league-news"],
  ] as const;
  const notifications = [{ label: "Hire Staff", count: 1 }, { label: "League News", count: state.hub.news.length }].filter((n) => n.count > 0);

  const last = getLastGameForTeam(state.league, teamId);
  const next = getNextGameForTeam(state, state.league, teamId);
  const streak = computeStreak(state.league, teamId);
  const isReg = isRegularSeason(state);
  const opp = next ? getTeamById(next.opponentId) : null;

  const formatTeam = (id: string) => {
    const t = getTeamById(id);
    return t?.abbrev ?? t?.name ?? id;
  };
  const lastText = last ? `${last.week ? `Wk ${last.week} • ` : ""}${last.result} ${last.teamScore}–${last.opponentScore} ${last.isHome ? "vs" : "@"} ${formatTeam(last.opponentId)}` : "—";
  const nextText = next ? `${next.week ? `Wk ${next.week} • ` : ""}${next.isHome ? "vs" : "@"} ${formatTeam(next.opponentId)}` : "—";

  return (
    <aside className="hidden lg:block lg:sticky lg:top-6 space-y-3">
      <HubPanel title="TEAM">
        <div className="flex items-center gap-3">
          {team?.logoKey ? <img src={`/icons/${team.logoKey}.png`} alt={`${team.name} logo`} className="h-9 w-9" /> : null}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-100">{team?.region} {team?.name}</div>
            <div className="text-xs text-slate-300">{state.season} • {standing ? `${standing.w}-${standing.l}` : "—"}</div>
          </div>
        </div>
      </HubPanel>
      <HubPanel title="STATUS">
        <div className="space-y-2 text-xs text-slate-200">
          <div>Cap Room: <span className="font-semibold">{cap}</span></div>
          <div>Pick: <span className="font-semibold">{pick ?? "—"}</span></div>
          <div>Phase: <span className="font-semibold">{getPhaseLabel(state)}</span></div>
        </div>
      </HubPanel>
      {isReg ? (
        <HubPanel title="SCHEDULE">
          <div className="space-y-2 text-xs text-slate-200">
            <div aria-label="Last game result" title={lastText}>Last: {lastText}</div>
            <div className="flex items-center justify-between gap-2" aria-label="Next opponent" title={nextText}>
              <span className="truncate">Next: {nextText}</span>
              {next ? <span className={HUB_PILL} aria-label="Next opponent home or away">{next.isHome ? "HOME" : "AWAY"}</span> : null}
            </div>
            <div aria-label="Team streak" title={streak ? `${streak.kind}${streak.count}` : "—"}>Streak: {streak ? `${streak.kind}${streak.count}` : "—"}</div>
            {next && opp?.logoKey ? <img src={`/icons/${opp.logoKey}.png`} alt={`${formatTeam(next.opponentId)} logo`} className="h-4 w-4" /> : null}
          </div>
        </HubPanel>
      ) : null}
      <HubPanel title="QUICK ACTIONS">
        <div className="space-y-2">
          {quickLinks.map(([label, to]) => (
            <Link key={to} to={to} className="block rounded border border-slate-300/20 bg-slate-900/60 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800/80">{label}</Link>
          ))}
          {import.meta.env.DEV ? <Link to="/hub/draft-order-debug" className="block rounded border border-slate-300/20 bg-slate-900/60 px-2 py-1 text-xs text-slate-100">Draft Debug</Link> : null}
        </div>
      </HubPanel>
      {notifications.length ? <HubPanel title="NOTIFICATIONS"><div className="space-y-1">{notifications.map((n) => <div key={n.label} className="flex justify-between rounded border border-slate-300/15 px-2 py-1 text-xs"><span>{n.label}</span><span>{n.count}</span></div>)}</div></HubPanel> : null}
    </aside>
  );
}
