import test from "node:test";
import assert from "node:assert/strict";

import { getLintableChangedFiles, isLintablePath, normalizeGitPathList } from "./lintChangedFilesLib.mjs";

test("normalizeGitPathList parses null-delimited output", () => {
  const parsed = normalizeGitPathList("src/app.ts\0README.md\0\0");
  assert.deepEqual(parsed, ["src/app.ts", "README.md"]);
});

test("normalizeGitPathList preserves leading/trailing path spaces", () => {
  const parsed = normalizeGitPathList(" src/leading-space.ts\0src/trailing-space.ts \0");
  assert.deepEqual(parsed, [" src/leading-space.ts", "src/trailing-space.ts "]);
});

test("isLintablePath allows JS/TS and module variants", () => {
  assert.equal(isLintablePath("src/main.ts"), true);
  assert.equal(isLintablePath("src/main.tsx"), true);
  assert.equal(isLintablePath("scripts/check.JS"), true);
  assert.equal(isLintablePath("src/component.JSX"), true);
  assert.equal(isLintablePath("scripts/lintChangedFiles.mjs"), true);
  assert.equal(isLintablePath("scripts/build.cjs"), true);
  assert.equal(isLintablePath("src/types.mts"), true);
  assert.equal(isLintablePath("src/types.cts"), true);
  assert.equal(isLintablePath("docs/guide.md"), false);
});

test("getLintableChangedFiles filters non-lintable files and handles empty sets", () => {
  const lintable = getLintableChangedFiles(["src/main.tsx", "README.md", "scripts/verify.mjs"]);
  assert.deepEqual(lintable, ["src/main.tsx", "scripts/verify.mjs"]);
  assert.deepEqual(getLintableChangedFiles([]), []);
});
