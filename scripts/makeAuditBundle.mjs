#!/usr/bin/env node
import { readdir, mkdir, rm } from "node:fs/promises";
import { join, posix, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const outputDir = join(root, "dist", "audit-bundles");

const BUNDLE_MANIFEST = {
  "00": {
    description: "Critical build and audit data inputs",
    includes: ["index.html", "src/data/**", "public/Hall_of_Fame/**"],
    excludes: []
  },
  "01": {
    description: "Critical inputs plus audit scripts/config used to verify data wiring",
    includes: [
      "index.html",
      "src/data/**",
      "public/Hall_of_Fame/**",
      "package.json",
      "vite.config.ts",
      "scripts/smokeTest.mjs",
      "scripts/generateLeagueHistoryFromCsv.mjs",
      "scripts/validateJson.mjs",
      "scripts/validateSourceArtifacts.mjs"
    ],
    excludes: []
  },
  "02": {
    description: "Application source plus required public data; excludes heavy optional avatars",
    includes: ["index.html", "src/**", "scripts/**", "public/**", "package.json", "tsconfig*.json", "vite.config.ts"],
    excludes: ["public/avatars/**"]
  },
  "03": {
    description: "Source + tests + docs with optional heavy avatars excluded",
    includes: ["index.html", "src/**", "tests/**", "scripts/**", "docs/**", "public/**", "*.json", "*.ts", "*.js"],
    excludes: ["public/avatars/**"]
  },
  "04": {
    description: "Repository snapshot without generated outputs and dependency folders",
    includes: ["**"],
    excludes: ["node_modules/**", ".git/**", "dist/**", "public/avatars/**"]
  },
  "05": {
    description: "Repository snapshot including avatar assets",
    includes: ["**"],
    excludes: ["node_modules/**", ".git/**", "dist/**"]
  },
  "06": {
    description: "Data + systems + reducers focused engineering audit bundle",
    includes: ["index.html", "src/data/**", "src/systems/**", "src/context/**", "scripts/**", "public/Hall_of_Fame/**", "docs/**"],
    excludes: []
  },
  "07": {
    description: "QA + runbook audit bundle",
    includes: ["README.md", "RUNBOOK.md", "docs/**", "tests/**", "playwright.config.ts", "scripts/**"],
    excludes: []
  },
  "08": {
    description: "Deterministic full repository capture for forensic audits",
    includes: ["**"],
    excludes: ["node_modules/**", ".git/**", "dist/**"]
  }
};

const ALWAYS_EXCLUDE = ["node_modules/**", ".git/**", "dist/audit-bundles/**"];

function toPosixPath(pathValue) {
  return pathValue.split("\\").join("/");
}

function globToRegExp(globPattern) {
  const escaped = globPattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "::DOUBLE_STAR::")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, "[^/]")
    .replace(/::DOUBLE_STAR::/g, ".*");
  return new RegExp(`^${escaped}$`);
}

function isMatch(filePath, patterns) {
  return patterns.some((pattern) => globToRegExp(pattern).test(filePath));
}

async function walkFiles(currentDir, collected = []) {
  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = join(currentDir, entry.name);
    const relativePath = toPosixPath(relative(root, absolutePath));

    if (entry.isDirectory()) {
      if (relativePath === ".git" || relativePath === "node_modules") {
        continue;
      }
      await walkFiles(absolutePath, collected);
      continue;
    }

    if (entry.isFile()) {
      collected.push(relativePath);
    }
  }

  return collected;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let bundle;

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--bundle") {
      bundle = args[i + 1];
      i += 1;
    }
  }

  if (!bundle) {
    throw new Error("Missing required --bundle argument (expected 00-08)");
  }

  const normalized = String(bundle).padStart(2, "0");
  if (!BUNDLE_MANIFEST[normalized]) {
    throw new Error(`Unsupported bundle '${bundle}'. Expected one of: ${Object.keys(BUNDLE_MANIFEST).join(", ")}`);
  }

  return normalized;
}

async function createZip(bundleId, fileList) {
  await mkdir(outputDir, { recursive: true });
  const outputName = `${bundleId}.zip`;
  const outputPath = join(outputDir, outputName);
  const outputRelative = toPosixPath(relative(root, outputPath));
  await rm(outputPath, { force: true });

  await new Promise((resolve, reject) => {
    const child = spawn("zip", ["-X", "-q", outputRelative, "-@"], { cwd: root, stdio: ["pipe", "inherit", "inherit"] });

    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`zip exited with code ${code}`));
    });

    child.stdin.end(`${fileList.join("\n")}\n`);
  });

  return outputRelative;
}

async function run() {
  const bundleId = parseArgs();
  const manifest = BUNDLE_MANIFEST[bundleId];

  const allFiles = await walkFiles(root);
  const excludes = [...ALWAYS_EXCLUDE, ...manifest.excludes];
  const selectedFiles = allFiles
    .filter((filePath) => isMatch(filePath, manifest.includes))
    .filter((filePath) => !isMatch(filePath, excludes))
    .sort((left, right) => left.localeCompare(right));

  if (selectedFiles.length === 0) {
    throw new Error(`Bundle ${bundleId} resolved to an empty file set.`);
  }

  const outputRelative = await createZip(bundleId, selectedFiles);
  console.log(`[audit-bundle] Created ${outputRelative}`);
  console.log(`[audit-bundle] Bundle ${bundleId}: ${manifest.description}`);
  console.log(`[audit-bundle] Files: ${selectedFiles.length}`);
}

run().catch((error) => {
  console.error(`[audit-bundle] FAIL ${error.message}`);
  process.exitCode = 1;
});
