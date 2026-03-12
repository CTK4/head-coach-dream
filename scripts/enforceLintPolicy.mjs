#!/usr/bin/env node
import { readFileSync } from "node:fs";

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read JSON at ${path}: ${error.message}`);
  }
}

function parseArgs(argv) {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const [key, inlineValue] = token.split("=", 2);
    if (inlineValue !== undefined) {
      args.set(key, inlineValue);
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args.set(key, next);
      i += 1;
    } else {
      args.set(key, "true");
    }
  }

  return args;
}

function collectCounts(reportEntries) {
  return reportEntries.reduce(
    (counts, entry) => {
      counts.errors += Number(entry.errorCount ?? 0);
      counts.warnings += Number(entry.warningCount ?? 0);
      counts.total += Number(entry.errorCount ?? 0) + Number(entry.warningCount ?? 0);
      return counts;
    },
    { errors: 0, warnings: 0, total: 0 },
  );
}

const args = parseArgs(process.argv.slice(2));
const reportPath = args.get("--report") ?? ".lint/eslint-report.json";
const baselinePath = args.get("--baseline") ?? "config/lint-baseline.json";

const report = readJson(reportPath);
const baseline = readJson(baselinePath);
const current = collectCounts(report);

const checks = ["errors", "warnings", "total"];
const regressions = checks.filter((key) => current[key] > Number(baseline[key] ?? 0));

console.log(`[lint-policy] baseline=${baselinePath} report=${reportPath}`);
console.log(
  `[lint-policy] current: errors=${current.errors}, warnings=${current.warnings}, total=${current.total}`,
);
console.log(
  `[lint-policy] baseline: errors=${baseline.errors}, warnings=${baseline.warnings}, total=${baseline.total}`,
);

if (regressions.length > 0) {
  console.error(`[lint-policy] FAILED: new lint debt detected in ${regressions.join(", ")}.`);
  process.exit(1);
}

if (current.total === 0) {
  console.log(
    "[lint-policy] ✅ Baseline fully remediated. Safe to remove continue-on-error from full lint CI step.",
  );
} else {
  console.log("[lint-policy] ✅ No new lint violations above baseline.");
}
