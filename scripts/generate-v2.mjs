import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const source = JSON.parse(
  readFileSync(new URL('packages/tokens/v2/figma.json', root)),
);
const key = (name) => name.replaceAll('/', '-');
const round = (n) => Math.round(n * 1e6) / 1e6;
const color = (v) => {
  const hex = [v.r, v.g, v.b]
    .map((n) =>
      Math.round(n * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
  return v.a === undefined || v.a === 1
    ? `#${hex}`
    : `rgba(${[v.r, v.g, v.b].map((n) => Math.round(n * 255)).join(', ')}, ${round(v.a)})`;
};

export function generateV2(input) {
  const variables = new Map(input.variables.map((v) => [v.id, v]));
  const collections = new Map(input.collections.map((c) => [c.id, c]));
  if (variables.size !== input.variables.length)
    throw Error('Duplicate Figma variable ID');
  function value(id, modeName, trail = []) {
    if (trail.includes(id))
      throw Error(`Cyclic variable alias: ${[...trail, id].join(' -> ')}`);
    const variable = variables.get(id);
    if (!variable) throw Error(`Unknown variable alias: ${id}`);
    const collection = collections.get(variable.collection);
    if (!collection)
      throw Error(`Unknown variable collection: ${variable.collection}`);
    const modes = Object.entries(collection.modes);
    const mode =
      modes.find(([, name]) => name === modeName) ??
      (modes.length === 1 ? modes[0] : null);
    if (!mode) throw Error(`Missing ${modeName} mode on ${collection.name}`);
    const raw = variable.values[mode[0]];
    if (raw === undefined)
      throw Error(`Missing ${modeName} value on ${variable.name}`);
    return raw?.type === 'VARIABLE_ALIAS'
      ? value(raw.id, modeName, [...trail, id])
      : raw;
  }
  const resolved = {};
  const dtcg = {};
  const tokenPath = (v, modeName) => {
    const c = collections.get(v.collection);
    const mode =
      Object.keys(c.modes).length === 1 ? [] : [modeName.toLowerCase()];
    return [c.name.toLowerCase(), ...mode, ...v.name.split('/')];
  };
  function put(target, path, token) {
    const name = path.at(-1);
    let group = target;
    for (const segment of path.slice(0, -1)) group = group[segment] ??= {};
    if (group[name]) throw Error(`Duplicate token path ${path.join('.')}`);
    group[name] = token;
  }
  for (const collection of input.collections) {
    const modes = {};
    for (const [modeId, modeName] of Object.entries(collection.modes)) {
      const tokens = {};
      for (const v of input.variables.filter(
        (v) => v.collection === collection.id,
      )) {
        const raw = v.values[modeId];
        const resolvedValue = value(v.id, modeName);
        tokens[v.name] =
          v.type === 'COLOR' ? color(resolvedValue) : round(resolvedValue);
        const alias = raw?.type === 'VARIABLE_ALIAS';
        const target = alias ? variables.get(raw.id) : null;
        if (alias && !target) throw Error(`Unknown variable alias: ${raw.id}`);
        const tokenValue = alias
          ? `{${tokenPath(target, modeName).join('.')}}`
          : v.type === 'COLOR'
            ? {
                colorSpace: 'srgb',
                components: [raw.r, raw.g, raw.b].map(round),
                alpha: round(raw.a ?? 1),
              }
            : { value: round(raw), unit: 'px' };
        put(dtcg, tokenPath(v, modeName), {
          $type: v.type === 'COLOR' ? 'color' : 'dimension',
          $value: tokenValue,
          $extensions: { 'app.figma': { id: v.id } },
        });
      }
      modes[modeName.toLowerCase()] = tokens;
    }
    resolved[collection.name.toLowerCase()] =
      Object.keys(modes).length === 1 ? Object.values(modes)[0] : modes;
  }
  const head =
    '/* Generated from packages/tokens/v2/figma.json. Do not edit. */\n';
  const declarations = (values) =>
    Object.entries(values)
      .map(
        ([name, v]) =>
          `  --mg-v2-${key(name)}: ${typeof v === 'number' ? v + 'px' : v};`,
      )
      .join('\n');
  let css = head;
  css += `[data-magnolia-version="2"] {\n${declarations({ ...resolved.primitives, ...resolved.scale })}\n  --mg-v2-font-family: 'Roboto', system-ui, sans-serif;\n  --mg-v2-font-mono: 'Roboto Mono', monospace;\n}\n`;
  for (const [name, values] of Object.entries(resolved.color))
    css += `[data-magnolia-version="2"][data-magnolia-theme="${name}"] {\n${declarations(values)}\n  color-scheme: ${name};\n}\n`;
  css += `[data-magnolia-version="2"][data-magnolia-theme="system"] {\n${declarations(resolved.color.dark)}\n  color-scheme: dark;\n}\n@media (prefers-color-scheme: light) {\n[data-magnolia-version="2"][data-magnolia-theme="system"] {\n${declarations(resolved.color.light)}\n  color-scheme: light;\n}\n}\n`;
  for (const [name, values] of Object.entries(resolved.density))
    css += `[data-magnolia-version="2"][data-density="${name}"] {\n${declarations(values)}\n}\n`;
  let dart =
    "// Generated from packages/tokens/v2/figma.json. Do not edit.\n// Retain Flutter 3.35 compatibility before the material_ui package split.\n// ignore: deprecated_member_use\nimport 'package:flutter/material.dart';\n";
  const dartName = (s) => s[0].toUpperCase() + s.slice(1);
  for (const [mode] of Object.entries(resolved.color)) {
    const c = input.variables.filter(
      (v) =>
        v.collection === input.collections.find((c) => c.name === 'Color').id,
    );
    dart += `const magnoliaV2${dartName(mode)}Colors = <String, Color>{\n${c
      .map((v) => {
        const raw = value(v.id, dartName(mode));
        const bytes = [raw.a ?? 1, raw.r, raw.g, raw.b]
          .map((n) =>
            Math.round(n * 255)
              .toString(16)
              .padStart(2, '0'),
          )
          .join('');
        return `  '${v.name}': Color(0x${bytes}),`;
      })
      .join('\n')}\n};\n`;
  }
  for (const [mode, values] of Object.entries(resolved.density))
    dart += `const magnoliaV2${dartName(mode)}Density = <String, double>{\n${Object.entries(
      values,
    )
      .map(([k, v]) => `  '${k}': ${Number.isInteger(v) ? v + '.0' : v},`)
      .join('\n')}\n};\n`;
  dart += `const magnoliaV2Scale = <String, double>{\n${Object.entries(
    resolved.scale,
  )
    .map(([k, v]) => `  '${k}': ${Number.isInteger(v) ? v + '.0' : v},`)
    .join('\n')}\n};\n`;
  let starlight = head;
  for (const [mode, c] of Object.entries(resolved.color)) {
    const vars = {
      'accent-low': c['color/bg/accent-subtle'],
      accent: c['color/bg/accent-strong'],
      'accent-high': c['color/fg/accent'],
      white: c['color/fg/primary'],
      'gray-1': c['color/fg/primary'],
      'gray-2': c['color/fg/secondary'],
      'gray-3': c['color/fg/tertiary'],
      'gray-4': c['color/border/default'],
      'gray-5': c['color/bg/control'],
      'gray-6': c['color/bg/raised'],
      'gray-7': c['color/bg/base'],
      black: c['color/bg/base'],
      bg: c['color/bg/base'],
      'bg-nav': c['color/bg/base'],
      'bg-sidebar': c['color/bg/base'],
      text: c['color/fg/primary'],
      'text-accent': c['color/fg/accent'],
      hairline: c['color/border/subtle'],
      'hairline-light': c['color/border/subtle'],
      'bg-inline-code': c['color/bg/raised'],
    };
    starlight += `${mode === 'dark' ? ':root, ' : ''}:root[data-theme="${mode}"] {\n${Object.entries(
      vars,
    )
      .map(([k, v]) => `  --sl-color-${k}: ${v};`)
      .join(
        '\n',
      )}\n  --sl-font: 'Roboto', system-ui, sans-serif;\n  --sl-font-mono: 'Roboto Mono', monospace;\n}\n`;
  }
  return {
    'packages/tokens/v2/tokens.json': JSON.stringify(dtcg, null, 2) + '\n',
    'packages/tokens/v2/tokens.css': css,
    'packages/starlight/v2.css': starlight,
    'packages/tokens/src/v2.ts':
      head +
      'export const v2Tokens = ' +
      JSON.stringify(resolved, null, 2) +
      ' as const;\nexport type V2Theme = keyof typeof v2Tokens.color;\nexport type V2Density = keyof typeof v2Tokens.density;\nexport {contextHue, progressValue, sliderValue, initials, paginationRange, paginationPages, chartDomain, chartTicks, chartIndex, heatThresholds, heatLevel, validBoxPlot} from "./v2-utilities.js";\nexport {parseDate, dateObject, dateISO, localDateISO, addDays, addMonths, formatDate, monthGrid, parseTime, formatTime, quarterHours} from "./v2-temporal.js";\nexport type {Tone, ContextHue, ChartSeries, ChartDatum, ChartDomain, HeatLevel, HeatmapRow, BoxPlotDatum} from "./v2-utilities.js";\n',
    'packages/flutter/lib/src/v2_tokens.g.dart': dart,
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  for (const [path, content] of Object.entries(generateV2(source))) {
    const url = new URL(path, root);
    if (process.argv.includes('--check')) {
      if (readFileSync(url, 'utf8') !== content)
        throw Error(`Stale generated file: ${path}`);
    } else writeFileSync(url, content);
  }
}
