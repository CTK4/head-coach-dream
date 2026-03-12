import { spawnSync } from 'node:child_process';

const stages = [
  {
    name: 'stage-1-strict-null-checks',
    config: 'tsconfig.strict-nullchecks.json',
    description: 'strictNullChecks gate'
  },
  {
    name: 'stage-2-no-implicit-any',
    config: 'tsconfig.no-implicit-any.json',
    description: 'noImplicitAny gate'
  },
  {
    name: 'stage-3-full-strict',
    config: 'tsconfig.strict.full.json',
    description: 'full strict gate'
  }
];

for (const stage of stages) {
  console.log(`\n[${stage.name}] Running ${stage.description} with ${stage.config}`);

  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['tsc', '-p', stage.config, '--noEmit', '--pretty', 'false'],
    { stdio: 'inherit' }
  );

  if (result.status !== 0) {
    console.error(`\n[${stage.name}] Failed. Strictness regression detected for ${stage.config}.`);
    process.exit(result.status ?? 1);
  }

  console.log(`[${stage.name}] Passed.`);
}

console.log('\nAll strictness stages are green.');
