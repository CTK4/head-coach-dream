#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const TOP_LEVEL_DIR = ".";
const DOC_FILES = ["README.md", "RUNBOOK.md", "tools/legacy/README.md"];
const EXECUTABLE_EXTENSIONS = new Set([".py", ".sh", ".bash", ".ps1"]);
const EXCLUDED_TOP_LEVEL_FILES = new Set(["vite.config.ts", "tailwind.config.ts", "postcss.config.js", "eslint.config.js"]);

const docCorpus = DOC_FILES.flatMap((file) => {
  try {
    return [readFileSync(file, "utf8")];
  } catch {
    return [];
  }
}).join("\n");

const rootFiles = readdirSync(TOP_LEVEL_DIR)
  .filter((entry) => statSync(join(TOP_LEVEL_DIR, entry)).isFile());

const topLevelExecutables = rootFiles.filter((file) => {
  if (EXCLUDED_TOP_LEVEL_FILES.has(file)) {
    return false;
  }

  if (EXECUTABLE_EXTENSIONS.has(extname(file))) {
    return true;
  }

  try {
    const contentStart = readFileSync(file, "utf8").slice(0, 120);
    return contentStart.startsWith("#!");
  } catch {
    return false;
  }
});

const orphaned = topLevelExecutables.filter((file) => !docCorpus.includes(file));

if (orphaned.length > 0) {
  console.error("[check:repo-hygiene] Undocumented top-level executable files found:");
  for (const file of orphaned) {
    console.error(`- ${file}`);
  }
  console.error("Document each file in README.md, RUNBOOK.md, or tools/legacy/README.md.");
  process.exit(1);
}

console.log("[check:repo-hygiene] OK");
