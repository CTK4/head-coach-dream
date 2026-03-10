import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["src", "scripts"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".mjs"]);

const conflictMarkerRe = /^(<{7}|={7}|>{7})/;
const suspiciousDiffLineRe = /^\s[+-]\s{2,}(?:const|let|var|import|export|return|if|for|while|function|class|type|interface|<|\{)/;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) {
      continue;
    }

    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      yield* walk(fullPath);
      continue;
    }

    if (!EXTENSIONS.has(path.extname(fullPath))) {
      continue;
    }

    yield fullPath;
  }
}

const violations = [];

for (const relativeTarget of TARGET_DIRS) {
  const targetPath = path.join(ROOT, relativeTarget);

  try {
    if (!statSync(targetPath).isDirectory()) {
      continue;
    }
  } catch {
    continue;
  }

  for (const filePath of walk(targetPath)) {
    const contents = readFileSync(filePath, "utf8");
    const lines = contents.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (conflictMarkerRe.test(line)) {
        violations.push(`${path.relative(ROOT, filePath)}:${index + 1} unresolved merge conflict marker`);
        return;
      }

      if (suspiciousDiffLineRe.test(line)) {
        violations.push(`${path.relative(ROOT, filePath)}:${index + 1} suspicious pasted diff marker line`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error("[validateSourceArtifacts] Found suspicious source artifacts:\n");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("[validateSourceArtifacts] OK");
