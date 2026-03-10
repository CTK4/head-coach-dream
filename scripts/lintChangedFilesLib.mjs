const LINTABLE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".mts", ".cts"]);

export function normalizeGitPathList(rawOutput) {
  if (!rawOutput) {
    return [];
  }

  return rawOutput
    .split("\0")
    .filter(Boolean);
}

export function isLintablePath(filePath) {
  const lower = filePath.toLowerCase();
  for (const extension of LINTABLE_EXTENSIONS) {
    if (lower.endsWith(extension)) {
      return true;
    }
  }

  return false;
}

export function getLintableChangedFiles(paths) {
  return paths.filter((filePath) => isLintablePath(filePath));
}
