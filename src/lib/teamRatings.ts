import { getTeams } from "@/data/leagueDb";

export type TeamRatingRowRaw = {
  ugfTeamId: string;
  rosterRating?: number;
  yearFounded?: number;
  w?: number;
  l?: number;
  t?: number;
};

export type TeamRatingResolved = TeamRatingRowRaw & { teamId: string };

export type TeamRatingsIndex = Record<string, TeamRatingResolved>;

let teamRatingsPromise: Promise<TeamRatingsIndex> | null = null;

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseIntSafe(value: string | undefined): number | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function splitRow(line: string, delimiter: string): string[] {
  if (delimiter === "\t") return line.split("\t").map((cell) => cell.trim());

  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseTeamRatings(text: string): TeamRatingRowRaw[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const delimiter = trimmed.includes("\t") ? "\t" : ",";
  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitRow(lines[0], delimiter).map((h) => h.trim().toLowerCase());
  const headerIndex = new Map(headers.map((header, index) => [header, index]));

  const getCell = (cells: string[], key: string): string | undefined => {
    const index = headerIndex.get(key);
    return index == null ? undefined : cells[index];
  };

  const rows: TeamRatingRowRaw[] = [];
  for (const line of lines.slice(1)) {
    const cells = splitRow(line, delimiter);
    const ugfTeamId = getCell(cells, "ugf teamid")?.trim() ?? "";
    if (!ugfTeamId) continue;

    rows.push({
      ugfTeamId,
      rosterRating: parseIntSafe(getCell(cells, "roster rating")),
      yearFounded: parseIntSafe(getCell(cells, "year founded")),
      w: parseIntSafe(getCell(cells, "w")),
      l: parseIntSafe(getCell(cells, "l")),
      t: parseIntSafe(getCell(cells, "t")),
    });
  }

  return rows;
}

function buildTeamNameIndex(): Record<string, string> {
  const byName: Record<string, string> = {};
  for (const team of getTeams()) {
    const fullName = `${team.region ?? ""} ${team.name ?? ""}`.trim();
    const keys = [team.name, fullName].filter((value): value is string => Boolean(value?.trim()));
    for (const key of keys) {
      byName[normalize(key)] = team.teamId;
    }
  }
  return byName;
}

async function loadTeamRatingsIndex(): Promise<TeamRatingsIndex> {
  try {
    const response = await fetch("/Hall_of_Fame/TeamRating.csv");
    if (!response.ok) {
      if (import.meta.env.DEV) {
        console.warn(`[teamRatings] Failed to fetch TeamRating.csv: ${response.status}`);
      }
      return {};
    }

    const rawRows = parseTeamRatings(await response.text());
    const nameToId = buildTeamNameIndex();
    const index: TeamRatingsIndex = {};

    for (const row of rawRows) {
      const resolvedTeamId = nameToId[normalize(row.ugfTeamId)];
      if (!resolvedTeamId) {
        if (import.meta.env.DEV) {
          console.warn(`[teamRatings] Could not resolve team from CSV row: ${row.ugfTeamId}`);
        }
        continue;
      }

      index[resolvedTeamId] = { ...row, teamId: resolvedTeamId };
    }

    return index;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[teamRatings] Error loading TeamRating.csv", error);
    }
    return {};
  }
}

export async function getTeamRatingsIndex(): Promise<TeamRatingsIndex> {
  if (!teamRatingsPromise) {
    teamRatingsPromise = loadTeamRatingsIndex();
  }
  return teamRatingsPromise;
}

export function formatOverallRecordWLT(row: { w?: number; l?: number; t?: number }): string {
  return `${row.w ?? 0}–${row.l ?? 0}–${row.t ?? 0}`;
}

