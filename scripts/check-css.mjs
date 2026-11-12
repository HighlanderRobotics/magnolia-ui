import { readFileSync, readdirSync } from 'node:fs';
const roots = ['packages/svelte/src/lib', 'packages/tokens'];
const css = roots
  .flatMap((dir) =>
    readdirSync(dir)
      .filter((f) => /\.(css|svelte)$/.test(f))
      .map((f) => readFileSync(`${dir}/${f}`, 'utf8')),
  )
  .join('\n');
const definitions = new Set(
  [...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]),
);
const missing = [
  ...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1])),
].filter((v) => !definitions.has(v));
if (missing.length)
  throw new Error(`Undefined CSS tokens: ${missing.join(', ')}`);
console.log('All component CSS variables have definitions.');
