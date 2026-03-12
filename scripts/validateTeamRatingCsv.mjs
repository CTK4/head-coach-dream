import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TEAM_RATING_PATH = path.join(ROOT, "public", "Hall_of_Fame", "TeamRating.csv");
const REQUIRED_SCHEMA_VERSION = "1";
const SCHEMA_METADATA_KEY = "TeamRatingSchemaVersion";
const REQUIRED_COLUMNS = ["ugf teamid", "roster rating", "year founded", "w", "l", "t"];

function splitRow(line, delimiter) {
  if (delimiter === "\t") return line.split("\t").map((cell) => cell.trim());

  const cells = [];
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

const raw = readFileSync(TEAM_RATING_PATH, "utf8");
const lines = raw
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

if (lines.length < 2) {
  throw new Error("[validateTeamRatingCsv] TeamRating.csv is empty or missing required rows.");
}

const metadata = new Map();
const dataLines = lines.filter((line) => {
  if (!line.startsWith("#")) return true;
  const metadataMatch = line.match(/^#\s*([^:]+):\s*(.+)$/);
  if (metadataMatch) {
    metadata.set(metadataMatch[1].trim(), metadataMatch[2].trim());
  }
  return false;
});

const actualVersion = metadata.get(SCHEMA_METADATA_KEY);
if (actualVersion !== REQUIRED_SCHEMA_VERSION) {
  throw new Error(
    `[validateTeamRatingCsv] ${SCHEMA_METADATA_KEY} mismatch. Expected ${REQUIRED_SCHEMA_VERSION}, got ${actualVersion ?? "missing"}.`,
  );
}

if (dataLines.length < 2) {
  throw new Error("[validateTeamRatingCsv] TeamRating.csv is missing data rows.");
}

const delimiter = dataLines[0].includes("\t") ? "\t" : ",";
const headers = splitRow(dataLines[0], delimiter).map((header) => header.toLowerCase());
const missingColumns = REQUIRED_COLUMNS.filter((required) => !headers.includes(required));
if (missingColumns.length > 0) {
  throw new Error(`[validateTeamRatingCsv] Missing required columns: ${missingColumns.join(", ")}.`);
}

const headerIndex = new Map(headers.map((header, index) => [header, index]));

for (const [offset, line] of dataLines.slice(1).entries()) {
  const cells = splitRow(line, delimiter);
  const lineNumber = offset + 2;

  if (cells.length < headers.length) {
    throw new Error(`[validateTeamRatingCsv] Malformed row shape at data line ${lineNumber}.`);
  }

  const teamId = cells[headerIndex.get("ugf teamid")]?.trim();
  if (!teamId) {
    throw new Error(`[validateTeamRatingCsv] Missing UGF TeamID at data line ${lineNumber}.`);
  }

  for (const numericColumn of ["roster rating", "year founded", "w", "l", "t"]) {
    const value = cells[headerIndex.get(numericColumn)]?.trim();
    const numericValue = Number(value);
    if (value == null || value.length === 0 || !Number.isFinite(numericValue)) {
      throw new Error(`[validateTeamRatingCsv] Invalid numeric value in ${numericColumn} for ${teamId} at data line ${lineNumber}.`);
    }
  }
}

console.log("[validateTeamRatingCsv] OK");
