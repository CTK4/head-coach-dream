#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const VERIFY_STEPS = ["typecheck", "lint", "build", "test"];

for (const step of VERIFY_STEPS) {
  const result = spawnSync("npm", ["run", step], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("[verify] OK");
