import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCOPES = ["src/engine", "src/context", "src/lib/migrations"];

const FORBIDDEN = [
  { label: "Math.random", regex: /\bMath\.random\s*\(/g },
  { label: "Date.now", regex: /\bDate\.now\s*\(/g },
  { label: "new Date", regex: /\bnew\s+Date\s*\(/g },
];

const ALLOWLIST = [
  {
    file: "src/context/GameContext.tsx",
    regex: /\bDate\.now\s*\(/g,
    note: "save-seed migration bootstrap",
  },
  {
    file: "src/context/GameContext.tsx",
    regex: /Math\.random\(\)/g,
    note: "comment-only reference to randomness policy",
  },
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      out.push(...walk(full));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) continue;
    if (entry.name.includes(".test.")) continue;
    out.push(full);
  }
  return out;
}

function lineOf(text, idx) {
  return text.slice(0, idx).split("\n").length;
}

const violations = [];

for (const scope of SCOPES) {
  const abs = path.join(ROOT, scope);
  if (!fs.existsSync(abs)) continue;
  for (const file of walk(abs)) {
    const rel = path.relative(ROOT, file).replaceAll(path.sep, "/");
    const src = fs.readFileSync(file, "utf8");

    for (const rule of FORBIDDEN) {
      rule.regex.lastIndex = 0;
      let match;
      while ((match = rule.regex.exec(src))) {
        const isAllowed = ALLOWLIST.some((allow) => {
          if (allow.file !== rel) return false;
          allow.regex.lastIndex = 0;
          let allowMatch;
          while ((allowMatch = allow.regex.exec(src))) {
            if (allowMatch.index === match.index) return true;
          }
          return false;
        });
        if (isAllowed) continue;
        violations.push(`${rel}:${lineOf(src, match.index)} -> ${rule.label}`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Determinism tripwire failed. Forbidden non-deterministic calls detected:\n");
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}

console.log("Determinism tripwire passed.");
