import fs from "node:fs";
import path from "node:path";

const filePath = path.resolve(process.cwd(), "src/data/leagueDB.json");

if (!fs.existsSync(filePath)) {
  console.error(`leagueDB.json not found at: ${filePath}`);
  process.exit(1);
}

const raw = fs.readFileSync(filePath, "utf-8");
const repaired = raw
  .replace(/\bNaN\b/g, "null")
  .replace(/\bInfinity\b/g, "null")
  .replace(/\b-Infinity\b/g, "null");

fs.writeFileSync(filePath, repaired, "utf-8");
console.log("Repaired leagueDB.json (NaN/Infinity -> null).");
