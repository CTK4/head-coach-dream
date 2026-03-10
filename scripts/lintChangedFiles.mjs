#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { getLintableChangedFiles, normalizeGitPathList } from "./lintChangedFilesLib.mjs";

function resolveBaseRef(argv) {
  const baseFlagIndex = argv.indexOf("--base");
  if (baseFlagIndex >= 0) {
    return argv[baseFlagIndex + 1];
  }

  return process.env.LINT_CHANGED_BASE || "origin/main";
}

function runCommand(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
}

const baseRef = resolveBaseRef(process.argv.slice(2));

if (!baseRef) {
  console.error("[lint:changed] Missing base ref. Pass --base <ref> or set LINT_CHANGED_BASE.");
  process.exit(1);
}

const diffRange = `${baseRef}...HEAD`;
const diffResult = runCommand("git", ["diff", "--name-only", "--diff-filter=ACMRTUXB", "-z", diffRange]);

if (diffResult.status !== 0) {
  console.error(`[lint:changed] Unable to compute changed files for '${diffRange}'.`);
  if (diffResult.stderr) {
    console.error(diffResult.stderr.trim());
  }
  process.exit(diffResult.status ?? 1);
}

const changedFiles = normalizeGitPathList(diffResult.stdout ?? "");
const lintableFiles = getLintableChangedFiles(changedFiles);

if (lintableFiles.length === 0) {
  console.log(`[lint:changed] No changed lintable JS/TS files found for '${diffRange}'. Skipping ESLint.`);
  process.exit(0);
}

console.log(`[lint:changed] Linting ${lintableFiles.length} changed file(s) against '${diffRange}'.`);
const lintResult = runCommand("npm", ["exec", "eslint", "--", ...lintableFiles]);

if (lintResult.stdout) {
  process.stdout.write(lintResult.stdout);
}

if (lintResult.stderr) {
  process.stderr.write(lintResult.stderr);
}

process.exit(lintResult.status ?? 1);
