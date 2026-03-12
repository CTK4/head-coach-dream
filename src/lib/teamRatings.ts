import { getTeams } from "@/data/leagueDb";

const TEAM_RATING_SCHEMA_VERSION = "1";
const TEAM_RATING_SCHEMA_METADATA_KEY = "TeamRatingSchemaVersion";
const TEAM_RATING_REQUIRED_COLUMNS = ["ugf teamid", "roster rating", "year founded", "w", "l", "t"] as const;
const TEAM_RATING_LOAD_FAILURE_MESSAGE = "Team ratings are temporarily unavailable. Please verify Hall_of_Fame/TeamRating.csv schema/version and retry.";

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

class TeamRatingsParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TeamRatingsParseError";
  }
}

let teamRatingsPromise: Promise<TeamRatingsIndex> | null = null;

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseNumberSafe(value: string | undefined): number | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
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
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    throw new TeamRatingsParseError("Team ratings data is empty or missing a header row.");
  }

  const metadata = new Map<string, string>();
  const dataLines = lines.filter((line) => {
    if (!line.startsWith("#")) return true;
    const metadataMatch = line.match(/^#\s*([^:]+):\s*(.+)$/);
    if (metadataMatch) {
      metadata.set(metadataMatch[1].trim(), metadataMatch[2].trim());
    }
    return false;
  });

  const foundVersion = metadata.get(TEAM_RATING_SCHEMA_METADATA_KEY);
  if (foundVersion !== TEAM_RATING_SCHEMA_VERSION) {
    throw new TeamRatingsParseError(
      `Team ratings schema version mismatch. Expected ${TEAM_RATING_SCHEMA_VERSION}, got ${foundVersion ?? "missing"}.`,
    );
  }

  if (dataLines.length < 2) {
    throw new TeamRatingsParseError("Team ratings CSV is missing data rows.");
  }

  const delimiter = dataLines[0].includes("\t") ? "\t" : ",";
  const headers = splitRow(dataLines[0], delimiter).map((h) => h.trim().toLowerCase());
  const missingHeaders = TEAM_RATING_REQUIRED_COLUMNS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new TeamRatingsParseError(`Team ratings CSV is missing required columns: ${missingHeaders.join(", ")}.`);
  }

  const headerIndex = new Map(headers.map((header, index) => [header, index]));

  const getCell = (cells: string[], key: string): string | undefined => {
    const index = headerIndex.get(key);
    return index == null ? undefined : cells[index];
  };

  const rows: TeamRatingRowRaw[] = [];
  for (const line of dataLines.slice(1)) {
    const cells = splitRow(line, delimiter);

    if (cells.length < headers.length) {
      throw new TeamRatingsParseError("Team ratings CSV has malformed row shape.");
    }

    const ugfTeamId = getCell(cells, "ugf teamid")?.trim() ?? "";
    if (!ugfTeamId) {
      throw new TeamRatingsParseError("Team ratings CSV has a row with missing UGF TeamID.");
    }

    const rosterRating = parseNumberSafe(getCell(cells, "roster rating"));
    const yearFounded = parseNumberSafe(getCell(cells, "year founded"));
    const w = parseNumberSafe(getCell(cells, "w"));
    const l = parseNumberSafe(getCell(cells, "l"));
    const t = parseNumberSafe(getCell(cells, "t"));

    if ([rosterRating, yearFounded, w, l, t].some((value) => value == null)) {
      throw new TeamRatingsParseError(`Team ratings CSV has invalid numeric values for ${ugfTeamId}.`);
    }

    rows.push({ ugfTeamId, rosterRating, yearFounded, w, l, t });
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
  const response = await fetch("/Hall_of_Fame/TeamRating.csv");
  if (!response.ok) {
    throw new TeamRatingsParseError(`Team ratings fetch failed with status ${response.status}.`);
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
}

export async function getTeamRatingsIndex(): Promise<TeamRatingsIndex> {
  if (!teamRatingsPromise) {
    teamRatingsPromise = loadTeamRatingsIndex().catch((error: unknown) => {
      if (import.meta.env.DEV) {
        console.warn("[teamRatings] Error loading TeamRating.csv", error);
      }
      const userSafeMessage =
        error instanceof TeamRatingsParseError ? `${TEAM_RATING_LOAD_FAILURE_MESSAGE} (${error.message})` : TEAM_RATING_LOAD_FAILURE_MESSAGE;
      throw new Error(userSafeMessage);
    });
  }
  return teamRatingsPromise;
}

export function formatOverallRecordWLT(row: { w?: number; l?: number; t?: number }): string {
  return `${row.w ?? 0}–${row.l ?? 0}–${row.t ?? 0}`;
}
