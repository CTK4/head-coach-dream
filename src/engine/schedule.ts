export type GameType = "PRESEASON" | "REGULAR_SEASON" | "PLAYOFFS";

export type Matchup = {
  homeTeamId: string;
  awayTeamId: string;
};

export type WeekSchedule = {
  week: number;
  gameType: GameType;
  matchups: Matchup[];
};

export type LeagueSchedule = {
  preseasonWeeks: WeekSchedule[];
  regularSeasonWeeks: WeekSchedule[];
};

export const PRESEASON_WEEKS = 3;
export const REGULAR_SEASON_WEEKS = 17;

function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let localSeed = seed >>> 0;

  const random = () => {
    localSeed += 0x6d2b79f5;
    let x = Math.imul(localSeed ^ (localSeed >>> 15), 1 | localSeed);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out;
}

function pairTeamsForWeek(teamIds: string[], week: number): Matchup[] {
  const rotating = [...teamIds];
  if (rotating.length % 2 !== 0) {
    rotating.push("BYE");
  }

  for (let i = 0; i < week - 1; i += 1) {
    const fixed = rotating[0];
    const rest = rotating.slice(1);
    rest.unshift(rest.pop() as string);
    rotating.splice(0, rotating.length, fixed, ...rest);
  }

  const matchups: Matchup[] = [];
  const half = rotating.length / 2;

  for (let i = 0; i < half; i += 1) {
    const a = rotating[i];
    const b = rotating[rotating.length - 1 - i];
    if (a === "BYE" || b === "BYE") continue;

    matchups.push(
      week % 2 === 0
        ? { homeTeamId: b, awayTeamId: a }
        : { homeTeamId: a, awayTeamId: b }
    );
  }

  return matchups;
}

export function generateLeagueSchedule(teamIds: string[], seed = Date.now()): LeagueSchedule {
  const activeTeamIds = teamIds.filter(Boolean);

  const preseasonWeeks: WeekSchedule[] = [];
  for (let week = 1; week <= PRESEASON_WEEKS; week += 1) {
    const shuffled = shuffle(activeTeamIds, seed + week * 11);
    const matchups: Matchup[] = [];
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      const homeFirst = week % 2 === 1;
      matchups.push(
        homeFirst
          ? { homeTeamId: shuffled[i], awayTeamId: shuffled[i + 1] }
          : { homeTeamId: shuffled[i + 1], awayTeamId: shuffled[i] }
      );
    }
    preseasonWeeks.push({ week, gameType: "PRESEASON", matchups });
  }

  const regularSeasonWeeks: WeekSchedule[] = [];
  for (let week = 1; week <= REGULAR_SEASON_WEEKS; week += 1) {
    regularSeasonWeeks.push({
      week,
      gameType: "REGULAR_SEASON",
      matchups: pairTeamsForWeek(activeTeamIds, week),
    });
  }

  return { preseasonWeeks, regularSeasonWeeks };
}

export function getTeamMatchup(weekSchedule: WeekSchedule, teamId: string): Matchup | null {
  return (
    weekSchedule.matchups.find(
      (matchup) => matchup.homeTeamId === teamId || matchup.awayTeamId === teamId
    ) ?? null
  );
}
