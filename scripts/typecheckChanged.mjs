#!/usr/bin/env node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const baseRef = process.env.TYPECHECK_CHANGED_BASE || process.env.LINT_CHANGED_BASE || "origin/main";

const SKIP_PATH_PREFIXES = [
  "src/components/franchise-hub/",
  "src/lib/native/",
  "src/pages/hub/strategy/playbooks/",
];

const SKIP_PATH_EXACT = new Set([
  "src/context/GameContext.tsx",
  "src/lib/settings.ts",
  "src/pages/FreePlaySetup.tsx",
  "src/pages/Hub.tsx",
  "src/pages/hub/Gameplan.tsx",
  "src/types/capacitor-shims.d.ts",
]);

const isSkippedPath = (file) =>
  SKIP_PATH_EXACT.has(file) || SKIP_PATH_PREFIXES.some((prefix) => file.startsWith(prefix));

const resolveBase = () => {
  const baseCheck = spawnSync("git", ["rev-parse", "--verify", baseRef], { encoding: "utf8" });
  if (baseCheck.status === 0) return baseRef;

  const prevCheck = spawnSync("git", ["rev-parse", "--verify", "HEAD~1"], { encoding: "utf8" });
  if (prevCheck.status === 0) return "HEAD~1";

  return "HEAD";
};

const base = resolveBase();
const diffRange = base === "HEAD" ? "HEAD" : `${base}...HEAD`;

const diff = spawnSync(
  "git",
  ["diff", "--name-only", "--diff-filter=ACMR", diffRange, "--", "*.ts", "*.tsx", "*.d.ts"],
  { encoding: "utf8" }
);

if (diff.status !== 0) {
  process.stderr.write(diff.stderr || "Failed to determine changed TypeScript files.\n");
  process.exit(diff.status ?? 1);
}

const changedFiles = diff.stdout
  .split("\n")
  .map((file) => file.trim())
  .filter(Boolean)
  .filter((file) => file.startsWith("src/"))
  .filter((file) => !isSkippedPath(file));

const projectRoot = process.cwd();
const changedFilePaths = changedFiles.map((file) => join(projectRoot, file));

if (changedFilePaths.length === 0) {
  console.log("[typecheck:changed] No changed TS files under checked app scope. Skipping.");
  process.exit(0);
}

const tempDir = mkdtempSync(join(tmpdir(), "typecheck-changed-"));
const tempConfig = join(tempDir, "tsconfig.changed.json");

writeFileSync(
  tempConfig,
  `${JSON.stringify({ extends: join(projectRoot, "tsconfig.app.json"), files: changedFilePaths }, null, 2)}\n`,
  "utf8"
);

const tsc = spawnSync("npx", ["tsc", "-p", tempConfig, "--noEmit", "--pretty", "false"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

rmSync(tempDir, { recursive: true, force: true });
process.exit(tsc.status ?? 1);
