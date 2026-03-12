#!/usr/bin/env node
/**
 * reportBundleChunks.mjs — prints a sorted table of JS chunk sizes after build.
 * Non-blocking in CI (continue-on-error: true). Exits non-zero only if the main
 * app chunk exceeds 2MB (vendor-* chunks are excluded from that check).
 */
import { readdirSync, statSync } from "fs";
import { join } from "path";

const DIST_ASSETS = join(process.cwd(), "dist", "assets");
const MAX_APP_CHUNK_BYTES = 2 * 1024 * 1024; // 2 MB

let files;
try {
  files = readdirSync(DIST_ASSETS).filter((f) => f.endsWith(".js"));
} catch {
  console.error("dist/assets not found — run npm run build first.");
  process.exit(1);
}

const rows = files
  .map((f) => {
    const size = statSync(join(DIST_ASSETS, f)).size;
    return { name: f, size };
  })
  .sort((a, b) => b.size - a.size);

const pad = (s, n) => s.length >= n ? s : s + " ".repeat(n - s.length);
const kb = (n) => (n / 1024).toFixed(1) + " KB";

console.log("\n── Bundle chunk sizes ─────────────────────────────────");
console.log(pad("Chunk", 55) + pad("Size", 12));
console.log("─".repeat(67));
for (const { name, size } of rows) {
  console.log(pad(name, 55) + pad(kb(size), 12));
}
console.log("─".repeat(67));
const totalKb = (rows.reduce((s, r) => s + r.size, 0) / 1024).toFixed(1);
console.log(pad("TOTAL", 55) + pad(totalKb + " KB", 12));
console.log("");

// Alert on oversized non-vendor app chunks
const oversized = rows.filter(
  ({ name, size }) => !name.startsWith("vendor-") && size > MAX_APP_CHUNK_BYTES,
);
if (oversized.length > 0) {
  console.error(
    `ERROR: ${oversized.length} app chunk(s) exceed ${MAX_APP_CHUNK_BYTES / 1024 / 1024}MB:`,
  );
  for (const { name, size } of oversized) {
    console.error(`  ${name}: ${kb(size)}`);
  }
  process.exit(1);
}
