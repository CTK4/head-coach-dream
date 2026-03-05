import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';

const sourcePath = new URL('../src/engine/gameSim.ts', import.meta.url);
const source = readFileSync(sourcePath, 'utf8');

try {
  transformSync(source, { loader: 'ts', format: 'esm', sourcemap: false });
  console.log('[validateGameSimSyntax] OK');
} catch (error) {
  console.error('[validateGameSimSyntax] FAILED');
  throw error;
}
