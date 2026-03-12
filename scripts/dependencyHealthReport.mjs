#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const lockfiles = [
  { name: "root", file: path.join(repoRoot, "package-lock.json") },
  { name: "mobile", file: path.join(repoRoot, "mobile", "package-lock.json") },
];

const criticalPackages = [
  "typescript",
  "vite",
  "vitest",
  "eslint",
  "@playwright/test",
  "@vitejs/plugin-react-swc",
  "react",
  "react-dom",
  "esbuild",
  "rollup",
  "string-width",
  "strip-ansi",
  "wrap-ansi",
];

const duplicateThreshold = Number.parseInt(process.env.DEPS_DUPLICATE_THRESHOLD ?? "1", 10);

function packageNameFromPath(packagePath, metadata) {
  if (metadata?.name) {
    return metadata.name;
  }

  const nodeModulesMarker = "node_modules/";
  const markerIndex = packagePath.lastIndexOf(nodeModulesMarker);
  if (markerIndex === -1) {
    return null;
  }

  return packagePath.slice(markerIndex + nodeModulesMarker.length);
}

function collectVersions(lockfile) {
  const parsed = JSON.parse(fs.readFileSync(lockfile, "utf8"));
  const versionsByPackage = new Map();

  for (const [packagePath, metadata] of Object.entries(parsed.packages ?? {})) {
    if (!metadata?.version || packagePath === "") {
      continue;
    }

    const packageName = packageNameFromPath(packagePath, metadata);
    if (!packageName) {
      continue;
    }

    if (!versionsByPackage.has(packageName)) {
      versionsByPackage.set(packageName, new Set());
    }

    versionsByPackage.get(packageName).add(metadata.version);
  }

  return versionsByPackage;
}

function summarizeWorkspace(lockfileMeta) {
  const versionsByPackage = collectVersions(lockfileMeta.file);
  const duplicateCritical = criticalPackages
    .map((packageName) => {
      const versions = versionsByPackage.get(packageName);
      if (!versions || versions.size <= duplicateThreshold) {
        return null;
      }

      return {
        packageName,
        versionCount: versions.size,
        versions: [...versions].sort(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.versionCount - a.versionCount || a.packageName.localeCompare(b.packageName));

  return {
    workspace: lockfileMeta.name,
    duplicateCritical,
    versionsByPackage,
  };
}

const reports = lockfiles.map(summarizeWorkspace);

let hasViolations = false;
console.log(`# Dependency health report`);
console.log(`Duplicate critical package threshold: > ${duplicateThreshold} distinct version(s)\n`);

for (const report of reports) {
  console.log(`## Workspace: ${report.workspace}`);
  if (report.duplicateCritical.length === 0) {
    console.log("No critical package duplication above threshold.\n");
    continue;
  }

  hasViolations = true;
  for (const duplicate of report.duplicateCritical) {
    console.log(
      `- ${duplicate.packageName}: ${duplicate.versionCount} versions (${duplicate.versions.join(", ")})`,
    );
  }
  console.log();
}

if (hasViolations) {
  console.error("Dependency health check failed: duplicated critical packages exceed threshold.");
  process.exit(1);
}

console.log("Dependency health check passed.");
