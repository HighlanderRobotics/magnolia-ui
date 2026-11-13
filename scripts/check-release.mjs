import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';

const readJSON = (path) => JSON.parse(readFileSync(path, 'utf8'));
const names = ['tokens', 'svelte', 'react-native', 'starlight'];
const packages = names.map((name) => ({
  directory: `packages/${name}`,
  manifest: readJSON(`packages/${name}/package.json`),
}));
const versions = new Map(
  packages.map(({ manifest }) => [manifest.name, manifest.version]),
);
const pending = readdirSync('.changeset').filter(
  (name) => name.endsWith('.md') && name !== 'README.md',
);
assert.equal(
  pending.length,
  0,
  'Run npm run version-packages before publishing pending Changesets',
);

console.log('| Package | Version | Packed files |');
console.log('| --- | --- | --- |');
for (const { directory, manifest } of packages) {
  assert.equal(manifest.private ?? false, false, `${manifest.name} is private`);
  assert.equal(manifest.publishConfig.access, 'public');
  assert.equal(manifest.publishConfig.registry, 'https://registry.npmjs.org/');
  assert.equal(
    manifest.repository.url,
    'git+https://github.com/HighlanderRobotics/magnolia-ui.git',
  );
  assert.equal(manifest.repository.directory, directory);
  for (const [name, version] of Object.entries(manifest.dependencies ?? {})) {
    if (versions.has(name))
      assert.equal(
        version,
        versions.get(name),
        `${manifest.name} has a mismatched ${name} version`,
      );
  }
  const [packed] = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], {
      cwd: directory,
      encoding: 'utf8',
    }),
  );
  const files = new Set(packed.files.map(({ path }) => path));
  for (const required of ['README.md', 'CHANGELOG.md', 'package.json']) {
    assert.ok(files.has(required), `${manifest.name} is missing ${required}`);
  }
  assert.ok(
    readFileSync(`${directory}/CHANGELOG.md`, 'utf8').includes(
      `## ${manifest.version}`,
    ),
    'Missing version changelog',
  );
  if (manifest.name.endsWith('magnolia-svelte')) {
    assert.ok(
      files.has('dist/figma-assets.css'),
      'Missing Figma asset stylesheet',
    );
    for (const { file } of readJSON('docs/figma-assets.json').assets) {
      assert.ok(
        files.has(`dist/assets/figma/${file}`),
        `Missing packed Figma asset ${file}`,
      );
    }
  }
  console.log(`| ${manifest.name} | ${manifest.version} | ${files.size} |`);
}
