import { execFileSync } from 'node:child_process';
for (const name of ['tokens', 'svelte', 'react-native', 'starlight'])
  execFileSync('npx', ['publint', `packages/${name}`], { stdio: 'inherit' });
// Are the Types Wrong evaluates JS/TS entries; CSS is a bundler asset, not a Node module.
execFileSync(
  'npx',
  [
    'attw',
    '--pack',
    'packages/tokens',
    '--profile',
    'esm-only',
    '--entrypoints',
    '.',
    './tokens.json',
  ],
  { stdio: 'inherit' },
);
execFileSync(
  'npx',
  ['attw', '--pack', 'packages/react-native', '--profile', 'esm-only'],
  { stdio: 'inherit' },
);
// Svelte declarations resolve through the published consumer fixture, since attw cannot load .svelte modules.
