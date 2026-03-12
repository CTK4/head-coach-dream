#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptsDir, '..');

const WORKSPACE_POLICY = {
  root: {
    path: resolve(rootDir, 'package.json'),
    engines: {
      node: '>=22.17.0 <23',
      npm: '>=10.9.2 <11',
    },
    packageManager: 'npm@10.9.2',
    devDependencies: {
      typescript: '5.8.3',
      '@eslint/js': '9.32.0',
      eslint: '9.32.0',
      'typescript-eslint': '8.38.0',
    },
  },
  mobile: {
    path: resolve(rootDir, 'mobile/package.json'),
    engines: {
      node: '>=22.17.0 <23',
      npm: '>=10.9.2 <11',
    },
    devDependencies: {
      typescript: '^5.8.3',
    },
  },
};

const mismatches = [];

for (const [name, policy] of Object.entries(WORKSPACE_POLICY)) {
  const pkg = JSON.parse(readFileSync(policy.path, 'utf8'));

  for (const [engineName, expected] of Object.entries(policy.engines ?? {})) {
    const actual = pkg.engines?.[engineName];
    if (actual !== expected) {
      mismatches.push(`${name}: engines.${engineName} expected ${expected}, received ${actual ?? '<missing>'}`);
    }
  }

  if (policy.packageManager && pkg.packageManager !== policy.packageManager) {
    mismatches.push(
      `${name}: packageManager expected ${policy.packageManager}, received ${pkg.packageManager ?? '<missing>'}`,
    );
  }

  for (const [dep, expected] of Object.entries(policy.devDependencies ?? {})) {
    const actual = pkg.devDependencies?.[dep];
    if (actual !== expected) {
      mismatches.push(`${name}: devDependency ${dep} expected ${expected}, received ${actual ?? '<missing>'}`);
    }
  }
}

if (mismatches.length > 0) {
  console.error('[toolchain-drift] Workspace toolchain drift detected:');
  for (const mismatch of mismatches) {
    console.error(`- ${mismatch}`);
  }
  process.exit(1);
}

console.log('[toolchain-drift] OK');
