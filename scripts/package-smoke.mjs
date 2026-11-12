import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const manager = process.argv[2] ?? 'npm';
if (!['npm', 'pnpm', 'yarn', 'bun'].includes(manager))
  throw new Error('Choose npm, pnpm, yarn or bun');
const directory = mkdtempSync(join(tmpdir(), `magnolia-${manager}-`));
const dependencies = {
  svelte: '^5.39.0',
  react: '19.1.0',
  'react-native': '0.81.5',
  '@types/react': '^19.1.0',
};
for (const name of ['tokens', 'svelte', 'react-native', 'starlight']) {
  const output = execFileSync(
    'npm',
    [
      'pack',
      '--workspace',
      `@highlanderrobotics/magnolia-${name}`,
      '--json',
      '--pack-destination',
      directory,
    ],
    { encoding: 'utf8' },
  );
  const [{ filename, files }] = JSON.parse(output);
  if (files.some((f) => /node_modules|\.env|test-results/.test(f.path)))
    throw new Error('Unexpected published file');
  dependencies[`@highlanderrobotics/magnolia-${name}`] =
    `file:${join(directory, filename)}`;
}
writeFileSync(
  join(directory, 'package.json'),
  JSON.stringify({
    name: 'magnolia-consumer-smoke',
    private: true,
    type: 'module',
    dependencies,
    ...(manager === 'pnpm'
      ? {
          pnpm: {
            overrides: {
              '@highlanderrobotics/magnolia-tokens':
                dependencies['@highlanderrobotics/magnolia-tokens'],
            },
          },
        }
      : {}),
    ...(manager === 'yarn'
      ? {
          resolutions: {
            '@highlanderrobotics/magnolia-tokens':
              dependencies['@highlanderrobotics/magnolia-tokens'],
          },
        }
      : {}),
    ...(manager === 'bun'
      ? {
          overrides: {
            '@highlanderrobotics/magnolia-tokens':
              dependencies['@highlanderrobotics/magnolia-tokens'],
          },
        }
      : {}),
  }),
);
const command =
  manager === 'npm'
    ? ['npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund']]
    : manager === 'pnpm'
      ? ['npx', ['--yes', 'pnpm@10.20.0', 'install', '--ignore-scripts']]
      : manager === 'yarn'
        ? ['npx', ['--yes', '@yarnpkg/cli-dist@4.10.3', 'install']]
        : ['bun', ['install', '--ignore-scripts']];
if (manager === 'yarn')
  writeFileSync(
    join(directory, '.yarnrc.yml'),
    'nodeLinker: node-modules\nenableScripts: false\n',
  );
execFileSync(command[0], command[1], { cwd: directory, stdio: 'inherit' });
const inspect = `import {tokens} from '@highlanderrobotics/magnolia-tokens'; import {readFileSync} from 'node:fs'; if(tokens.themes.dark.primary!=='#b59aff')throw Error('Bad tokens'); for(const path of ['@highlanderrobotics/magnolia-tokens/css','@highlanderrobotics/magnolia-starlight/theme.css']) if(!readFileSync(import.meta.resolve(path).replace('file://',''),'utf8')) throw Error('Missing CSS'); console.log('Packed token imports and CSS exports passed.');`;
writeFileSync(join(directory, 'smoke.mjs'), inspect);
execFileSync('node', ['smoke.mjs'], { cwd: directory, stdio: 'inherit' });
// Resolve published Svelte declarations and RN types from the isolated consumer.
writeFileSync(
  join(directory, 'types.ts'),
  `import {Button} from '@highlanderrobotics/magnolia-svelte'; import type {ButtonProps} from '@highlanderrobotics/magnolia-react-native'; const props:ButtonProps={children:'Save',onPress:async()=>{}}; void Button; void props;`,
);
execFileSync(
  resolve('node_modules/.bin/tsc'),
  [
    '--noEmit',
    '--strict',
    '--skipLibCheck',
    '--target',
    'es2022',
    '--module',
    'esnext',
    '--moduleResolution',
    'bundler',
    'types.ts',
  ],
  { cwd: directory, stdio: 'inherit' },
);
console.log(`${manager} packed consumer passed: ${directory}`);
