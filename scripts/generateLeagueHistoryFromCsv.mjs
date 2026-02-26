import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "public", "Hall_of_Fame");
const OUTPUT_DIR = path.join(ROOT, "src", "data", "league_history");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "ugf_league_history_v1.json");

const FILES = {
  championshipsByTeam: "Championships by Team.csv",
  hallOfFame: "Hall of Fame.csv",
  ironCrownChampions: "Iron Crown Champions.csv",
  ironCrownMvp: "Iron Crown MVP.csv",
  regularSeasonMvp: "MVP.csv",
};

function parseCsv(raw) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    const next = raw[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(cell);
      if (row.some((value) => String(value).trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => String(value).trim().length > 0)) {
    rows.push(row);
  }

  if (rows.length === 0) {
    return [];
  }

  const header = rows[0].map((value) => normalizeHeader(value));
  const output = [];

  for (let i = 1; i < rows.length; i += 1) {
    const values = rows[i];
    const item = {};
    for (let col = 0; col < header.length; col += 1) {
      item[header[col]] = String(values[col] ?? "").trim();
    }
    output.push(item);
  }

  return output;
}

function normalizeHeader(value) {
  return String(value ?? "")
    .replace(/\uFEFF/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function readCsv(fileName) {
  const filePath = path.join(SOURCE_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  return parseCsv(raw);
}

function toMvpEntry(row, playerKey, teamKey, positionKey) {
  if (!row) return null;
  const player = String(row[playerKey] ?? "").trim();
  const team = String(row[teamKey] ?? "").trim();
  const position = String(row[positionKey] ?? "").trim();

  if (!player || !team || !position) {
    return null;
  }

  return { player, team, position };
}

function run() {
  const championsRows = readCsv(FILES.ironCrownChampions);
  const ironCrownMvpRows = readCsv(FILES.ironCrownMvp);
  const regularSeasonMvpRows = readCsv(FILES.regularSeasonMvp);
  const hallOfFameRows = readCsv(FILES.hallOfFame);
  const championshipsByTeamRows = readCsv(FILES.championshipsByTeam);

  const seasons = championsRows.map((row, index) => {
    const season = Number.parseInt(String(row["season"] ?? "").trim(), 10);
    const champion = String(row["iron crown champion"] ?? "").trim();
    const runnerUp = String(row["iron crown runner-up"] ?? "").trim();

    return {
      season,
      champion,
      runnerUp,
      ironCrownMvp: toMvpEntry(
        ironCrownMvpRows[index],
        "iron crown mvp (calder rowan trophy) - player",
        "iron crown mvp team",
        "iron crown mvp position",
      ),
      regularSeasonMvp: toMvpEntry(
        regularSeasonMvpRows[index],
        "regular season mvp - player",
        "regular season mvp team",
        "regular season mvp position",
      ),
    };
  }).filter((entry) => Number.isFinite(entry.season) && entry.champion && entry.runnerUp);

  const hallOfFame = hallOfFameRows
    .map((row) => ({
      player: String(row["hall of fame inductees (ugf legends)"] ?? "").trim(),
      position: String(row["position"] ?? "").trim(),
      team: String(row["team"] ?? "").trim(),
      classYear: Number.parseInt(String(row["class"] ?? "").trim(), 10),
    }))
    .filter((entry) => entry.player && entry.position && entry.team && Number.isFinite(entry.classYear));

  const championshipsByTeam = championshipsByTeamRows
    .map((row) => ({
      team: String(row["team"] ?? "").trim(),
      titles: Number.parseInt(String(row["championship total"] ?? "").trim(), 10),
      runnerUps: null,
    }))
    .filter((entry) => entry.team && Number.isFinite(entry.titles))
    .map(({ runnerUps, ...rest }) => rest);

  const payload = {
    version: "1.0.0",
    system_id: "UGF_LEAGUE_HISTORY_V1",
    seasons,
    hallOfFame,
    championshipsByTeam,
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`[gen:league-history] Wrote ${path.relative(ROOT, OUTPUT_PATH)} (${seasons.length} seasons)`);
}

run();
