#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const csvDir = path.join(ROOT, "public", "Hall_of_Fame");
const backupDir = path.join(ROOT, "public", "Hall_of_Fame.__tmp_backup__");

function restoreCsvDir() {
  if (fs.existsSync(backupDir) && !fs.existsSync(csvDir)) {
    fs.renameSync(backupDir, csvDir);
  }
}

if (fs.existsSync(backupDir)) {
  fs.rmSync(backupDir, { recursive: true, force: true });
}

try {
  if (fs.existsSync(csvDir)) {
    fs.renameSync(csvDir, backupDir);
  }

  const result = spawnSync("npm", ["run", "prebuild"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  console.log("[smoke:prebuild:no-csv] OK");
} finally {
  restoreCsvDir();
}
