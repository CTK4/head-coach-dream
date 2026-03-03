import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const REQUIRED_PATHS_BY_BUNDLE = {
  "00": [
    "index.html",
    "src/data/leagueDb.ts",
    "src/data/leagueDB.json",
    "public/Hall_of_Fame/*.csv",
  ],
  "01": [
    "index.html",
    "src/data/leagueDb.ts",
    "src/data/leagueDB.json",
    "public/Hall_of_Fame/*.csv",
  ],
};

function parseArgs(argv) {
  const parsed = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }

    const [key, inlineValue] = arg.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      parsed[key] = inlineValue;
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      parsed[key] = next;
      i += 1;
      continue;
    }

    parsed[key] = "true";
  }

  return parsed;
}

function usageAndExit(message) {
  if (message) {
    console.error(`[verifyAuditBundle] ${message}`);
  }

  console.error("Usage: node scripts/verifyAuditBundle.mjs --bundle <bundle-id> --path <bundle-zip-or-dir>");
  process.exit(1);
}

function normalizeEntry(entryPath) {
  return entryPath.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");
}

function listDirectoryEntries(rootDir) {
  const entries = [];

  function walk(relativeDir = "") {
    const absoluteDir = path.join(rootDir, relativeDir);

    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(relativePath);
      } else {
        entries.push(normalizeEntry(relativePath));
      }
    }
  }

  walk();
  return entries;
}

function listZipEntries(zipFilePath) {
  const output = execFileSync("unzip", ["-Z1", zipFilePath], { encoding: "utf8" });
  return output
    .split(/\r?\n/)
    .map((line) => normalizeEntry(line.trim()))
    .filter(Boolean)
    .filter((entry) => !entry.endsWith("/"));
}

function hasExactPath(entries, requiredPath) {
  return entries.some((entry) => entry === requiredPath || entry.endsWith(`/${requiredPath}`));
}

function wildcardToRegex(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*");
  return new RegExp(`(?:^|/)${escaped}$`);
}

function verifyEntries(entries, requiredPaths) {
  const missing = [];

  for (const requiredPath of requiredPaths) {
    if (requiredPath.includes("*")) {
      const regex = wildcardToRegex(requiredPath);
      if (!entries.some((entry) => regex.test(entry))) {
        missing.push(requiredPath);
      }
      continue;
    }

    if (!hasExactPath(entries, requiredPath)) {
      missing.push(requiredPath);
    }
  }

  return missing;
}

const args = parseArgs(process.argv.slice(2));
const bundle = args.bundle;
const targetPath = args.path;

if (!bundle) {
  usageAndExit("Missing --bundle");
}

if (!targetPath) {
  usageAndExit("Missing --path");
}

const requiredPaths = REQUIRED_PATHS_BY_BUNDLE[bundle];
if (!requiredPaths) {
  usageAndExit(`Unsupported bundle '${bundle}'. Supported bundles: ${Object.keys(REQUIRED_PATHS_BY_BUNDLE).join(", ")}`);
}

if (!existsSync(targetPath)) {
  usageAndExit(`Target path does not exist: ${targetPath}`);
}

const stats = statSync(targetPath);
let entries;

try {
  if (stats.isDirectory()) {
    entries = listDirectoryEntries(targetPath);
  } else {
    entries = listZipEntries(targetPath);
  }
} catch (error) {
  const details = error instanceof Error ? error.message : String(error);
  console.error(`[verifyAuditBundle] Unable to read bundle entries from '${targetPath}': ${details}`);
  process.exit(1);
}

const missingPaths = verifyEntries(entries, requiredPaths);

if (missingPaths.length > 0) {
  console.error(`[verifyAuditBundle] Bundle ${bundle} failed verification for '${targetPath}'. Missing required paths:`);
  for (const missingPath of missingPaths) {
    console.error(`- ${missingPath}`);
  }
  process.exit(1);
}

console.log(`[verifyAuditBundle] Bundle ${bundle} OK (${targetPath})`);
