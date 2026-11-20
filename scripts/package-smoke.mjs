import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
const manager = process.argv[2] ?? 'npm';
if (!['npm', 'pnpm', 'yarn', 'bun'].includes(manager))
  throw new Error('Choose npm, pnpm, yarn or bun');
const source = process.argv[3] ?? 'packed';
if (!['packed', 'registry'].includes(source))
  throw new Error('Choose packed or registry package source');
const directory = mkdtempSync(join(tmpdir(), `magnolia-${manager}-`));
const dependencies = {
  svelte: '^5.39.0',
  react: '19.1.0',
  'react-native': '0.81.5',
  '@types/react': '^19.1.0',
};
for (const name of ['tokens', 'svelte', 'react-native', 'starlight']) {
  if (source === 'registry') {
    const manifest = JSON.parse(
      readFileSync(`packages/${name}/package.json`, 'utf8'),
    );
    dependencies[manifest.name] = manifest.version;
    continue;
  }
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
    ...(source === 'packed' && manager === 'pnpm'
      ? {
          pnpm: {
            overrides: {
              '@highlanderrobotics/magnolia-tokens':
                dependencies['@highlanderrobotics/magnolia-tokens'],
            },
          },
        }
      : {}),
    ...(source === 'packed' && manager === 'yarn'
      ? {
          resolutions: {
            '@highlanderrobotics/magnolia-tokens':
              dependencies['@highlanderrobotics/magnolia-tokens'],
          },
        }
      : {}),
    ...(source === 'packed' && manager === 'bun'
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
    'nodeLinker: node-modules\nenableScripts: false\nenableImmutableInstalls: false\n',
  );
execFileSync(command[0], command[1], { cwd: directory, stdio: 'inherit' });
// A fresh fixture must create its lock first; the second install verifies immutability.
if (manager === 'yarn')
  execFileSync(command[0], [...command[1], '--immutable'], {
    cwd: directory,
    stdio: 'inherit',
  });
const inspect = `
import { tokens } from '@highlanderrobotics/magnolia-tokens';
import { v2Tokens } from '@highlanderrobotics/magnolia-tokens/v2';
import { readFileSync } from 'node:fs';
if (tokens.themes.dark.primary !== '#b59aff') throw Error('Bad tokens');
if (!v2Tokens.color.dark['color/bg/canvas']) throw Error('Missing v2 tokens');
for (const path of [
  '@highlanderrobotics/magnolia-tokens/css',
  '@highlanderrobotics/magnolia-tokens/v2/css',
  '@highlanderrobotics/magnolia-starlight/theme.css',
  '@highlanderrobotics/magnolia-starlight/v2.css',
]) {
  if (!readFileSync(new URL(import.meta.resolve(path)), 'utf8')) throw Error('Missing CSS: ' + path);
}
console.log('Token imports and CSS exports passed.');
`;
writeFileSync(join(directory, 'smoke.mjs'), inspect);
execFileSync('node', ['smoke.mjs'], { cwd: directory, stdio: 'inherit' });
// Resolve published Svelte declarations and RN types from the isolated consumer.
writeFileSync(
  join(directory, 'types.ts'),
  `import { Button } from '@highlanderrobotics/magnolia-svelte';
import type { ButtonProps } from '@highlanderrobotics/magnolia-react-native';
import { ErrorSummary } from '@highlanderrobotics/magnolia-svelte/v2';
import type { TextFieldProps } from '@highlanderrobotics/magnolia-react-native/v2';
import type { TextInput } from 'react-native';
const props: ButtonProps = { children: 'Save', onPress: async () => {} };
const field: TextFieldProps = { label: 'Name', ref: (input: TextInput | null) => { input?.focus(); } };
void Button; void ErrorSummary; void props; void field;
`,
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
writeFileSync(
  join(directory, 'Report.svelte'),
  `<script>
  import { MagnoliaUIRoot, FormSection, TextField, ErrorSummary, Button } from '@highlanderrobotics/magnolia-svelte/v2';
</script>
<MagnoliaUIRoot theme="light" density="compact">
  <form>
    <ErrorSummary errors={[{ id: 'name', label: 'Name', message: 'Enter a name' }]} />
    <FormSection title="Report details">
      <TextField id="name" label="Name" error="Enter a name" />
      <Button type="submit">Save report</Button>
    </FormSection>
  </form>
</MagnoliaUIRoot>
`,
);
const server = await createServer({
  root: directory,
  configFile: false,
  plugins: [svelte()],
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
});
try {
  const { render } = await server.ssrLoadModule('svelte/server');
  const { default: Report } = await server.ssrLoadModule('/Report.svelte');
  const { body } = render(Report);
  assert.match(body, /data-magnolia-version="2"/);
  assert.match(body, /href="#name"/);
  assert.match(body, /aria-errormessage=/);
  assert.match(body, /Save report/);
} finally {
  await server.close();
}
console.log(`${manager} ${source} consumer passed: ${directory}`);
