#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const baseRef = process.env.LINT_CHANGED_BASE || "origin/main";
const BLOCKING_VERIFY_STEPS = [
  ["toolchain:check"],
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

const fullLintResult = spawnSync("npm", ["run", "lint:report"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (fullLintResult.status !== 0) {
  console.warn("[verify] WARNING: full-repo lint failed (non-blocking debt visibility).");
}

const lintPolicyResult = spawnSync("npm", ["run", "lint:policy"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (lintPolicyResult.status !== 0) {
  process.exit(lintPolicyResult.status ?? 1);
}

console.log("[verify] OK");
