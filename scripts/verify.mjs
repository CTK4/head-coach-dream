#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const baseRef = process.env.LINT_CHANGED_BASE || "origin/main";
const BLOCKING_VERIFY_STEPS = [
  ["typecheck"],
  ["test:lint:changed"],
  ["lint:changed", "--", "--base", baseRef],
  ["build"],
  ["smoke"],
  ["check:determinism"],
  ["test"],
  ["test:ui"],
];

for (const [step, ...args] of BLOCKING_VERIFY_STEPS) {
  const result = spawnSync("npm", ["run", step, ...args], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const fullLintResult = spawnSync("npm", ["run", "lint"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (fullLintResult.status !== 0) {
  console.warn("[verify] WARNING: full-repo lint failed (non-blocking debt visibility).");
}

console.log("[verify] OK");
