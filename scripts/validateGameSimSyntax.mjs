import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';

const filesToValidate = [
  '../src/engine/gameSim.ts',
  '../src/lib/migrations/saveSchema.ts',
];

for (const relativePath of filesToValidate) {
  const sourcePath = new URL(relativePath, import.meta.url);
  const source = readFileSync(sourcePath, 'utf8');

  try {
    transformSync(source, { loader: 'ts', format: 'esm', sourcemap: false });
  } catch (error) {
    console.error(`[validateGameSimSyntax] FAILED (${relativePath})`);
    throw error;
  }
}

console.log('[validateGameSimSyntax] OK');
