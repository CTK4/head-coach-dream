import fs from "node:fs";
import path from "node:path";

const ROOTS = ["src/data", "src/rulesets"];
const BAD_TOKENS = ["NaN", "Infinity", "-Infinity"];
const BAD_MARKERS = ["<<<<<<<", ">>>>>>>", "=======", "diff --git", "@@ -"];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function validateJsonFile(file) {
  const raw = fs.readFileSync(file, "utf-8");
  for (const t of BAD_TOKENS) {
    if (raw.includes(t)) fail(`[validateJson] Illegal token "${t}" in ${file}`);
  }
  for (const m of BAD_MARKERS) {
    if (raw.includes(m)) fail(`[validateJson] Merge/diff marker "${m}" found in ${file}`);
  }
  try {
    JSON.parse(raw);
  } catch (e) {
    fail(`[validateJson] Failed to parse JSON: ${file}\n${e}`);
  }
}

function validateSourceMarkers(dir) {
  const files = walk(dir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf-8");
    for (const m of BAD_MARKERS) {
      if (raw.includes(m)) fail(`[validateJson] Marker "${m}" found in ${file}`);
    }
  }
}

for (const root of ROOTS) {
  const abs = path.resolve(process.cwd(), root);
  if (!fs.existsSync(abs)) continue;
  const files = walk(abs).filter((f) => f.endsWith(".json"));
  for (const file of files) validateJsonFile(file);
}

validateSourceMarkers(path.resolve(process.cwd(), "src"));
console.log("[validateJson] OK");
