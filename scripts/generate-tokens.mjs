import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
export function resolveTokens(source) {
  function visit(value, trail = []) {
    if (typeof value === 'string' && /^\{.*\}$/.test(value)) {
      const path = value.slice(1, -1);
      if (trail.includes(path))
        throw new Error(`Cyclic alias: ${[...trail, path].join(' -> ')}`);
      const target = path.split('.').reduce((node, key) => node?.[key], source);
      if (target === undefined) throw new Error(`Unknown alias: ${path}`);
      return visit(target, [...trail, path]);
    }
    if (Array.isArray(value)) return value.map((v) => visit(v, trail));
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, visit(v, trail)]),
      );
    return value;
  }
  return visit(source);
}
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
export function generate(source) {
  const t = resolveTokens(source);
  const header =
    '/* Generated from packages/tokens/tokens.json. Do not edit. */\n';
  const declarations = (obj) =>
    Object.entries(obj)
      .map(([k, v]) => `  --mg-${kebab(k)}: ${v};`)
      .join('\n');
  const legacy = {
    'victory-purple': 'primary',
    'victory-purple-hover': 'primaryHover',
    'victory-purple-faded': 'primaryDisabled',
    'on-victory-purple-faded': 'disabledText',
    'light-gray': 'secondary',
    'light-gray-hover': 'secondaryHover',
    'light-gray-faded': 'secondaryDisabled',
    'on-light-gray-faded': 'disabledText',
    'secondary-container': 'surface',
    'secondary-container-faded': 'disabledSurface',
    background: 'background',
    'on-background': 'onBackground',
    body: 'muted',
    placeholder: 'placeholder',
    danger: 'danger',
    'danger-hover': 'dangerHover',
    'danger-faded': 'disabledSurface',
    'on-danger-faded': 'disabledText',
  };
  const aliases = Object.entries(legacy)
    .map(([k, v]) => `  --${k}: var(--mg-${kebab(v)});`)
    .join('\n');
  const mode = (name) =>
    declarations({ ...t.themes[name], ...t.frc[name] }) +
    '\n' +
    aliases +
    '\n  color-scheme: ' +
    name +
    ';';
  let css =
    header +
    `:root, [data-magnolia-theme="system"], [data-magnolia-theme="light"], .color-scheme-light {\n${mode('light')}\n}\n`;
  css += `@media (prefers-color-scheme: dark) { :root:not([data-magnolia-theme="light"]):not([data-theme="light"]), [data-magnolia-theme="system"] {\n${mode('dark')}\n} }\n`;
  css += `[data-magnolia-theme="dark"], .color-scheme-dark {\n${mode('dark')}\n}\n`;
  for (const [group, values] of Object.entries({
    spacing: t.spacing,
    radius: t.radius,
    motion: t.motion,
  }))
    css += `:root {\n${declarations(Object.fromEntries(Object.entries(values).map(([k, v]) => [group + '-' + k, v + (group === 'motion' ? 'ms' : 'px')])))}\n}\n`;
  for (const [name, d] of Object.entries(t.density))
    css += `${name === 'comfortable' ? ':root, ' : ''}[data-density="${name}"] {\n${declarations(Object.fromEntries(Object.entries(d).map(([k, v]) => ['control-' + k, v + 'px'])))}\n}\n`;
  css += `:root { --mg-font-family: '${t.typography.family}', system-ui, sans-serif; --mg-line-height: ${t.typography.lineHeight}; }\n@media (prefers-reduced-motion: reduce) { :root { --mg-motion-fast: 0ms; --mg-motion-normal: 0ms; --mg-motion-slow: 0ms; } }\n`;
  let starlight = header;
  for (const m of ['dark', 'light']) {
    const c = t.themes[m];
    const dark = m === 'dark';
    const vars = {
      'accent-low': t.material[m].primaryContainer,
      accent: c.primary,
      'accent-high': c.primary,
      white: c.onBackground,
      'gray-1': c.onBackground,
      'gray-2': c.muted,
      'gray-3': c.outline,
      'gray-4': c.outline,
      'gray-5': c.secondary,
      'gray-6': c.surface,
      'gray-7': c.background,
      black: c.background,
      bg: c.background,
      'bg-nav': c.background,
      'bg-sidebar': c.background,
      text: c.onBackground,
      'text-accent': c.primary,
      hairline: c.outline,
      'hairline-light': c.secondary,
      'bg-inline-code': c.surface,
    };
    starlight += `${dark ? ':root, ' : ''}:root[data-theme="${m}"] {\n${Object.entries(
      vars,
    )
      .map(([k, v]) => `  --sl-color-${k}: ${v};`)
      .join(
        '\n',
      )}\n  --sl-font: '${t.typography.family}', system-ui, sans-serif;\n  --sl-line-height: ${t.typography.lineHeight};\n}\n`;
  }
  let dart =
    "// Generated from packages/tokens/tokens.json. Do not edit.\n// Keep compatibility with Flutter 3.35 before the material_ui split.\n// ignore: deprecated_member_use\nimport 'package:flutter/material.dart';\n";
  for (const m of ['light', 'dark']) {
    dart += `const magnolia${m[0].toUpperCase() + m.slice(1)}ColorScheme = ColorScheme(\n  brightness: Brightness.${m},\n${Object.entries(
      t.material[m],
    )
      .map(([k, v]) => `  ${k}: Color(0xff${v.slice(1)}),`)
      .join('\n')}\n);\n`;
    dart += `const magnolia${m[0].toUpperCase() + m.slice(1)}Frc = <String, Color>{\n${Object.entries(
      t.frc[m],
    )
      .map(([k, v]) => `  '${k}': Color(0xff${v.slice(1)}),`)
      .join('\n')}\n};\n`;
  }
  dart += `const magnoliaFontFamily = '${t.typography.family}';\n`;
  for (const [group, values] of Object.entries({
    spacing: t.spacing,
    radius: t.radius,
    motion: t.motion,
  }))
    for (const [k, v] of Object.entries(values))
      dart += `const double magnolia${group[0].toUpperCase() + group.slice(1)}${k[0].toUpperCase() + k.slice(1)} = ${Number.isInteger(v) ? v + '.0' : v};\n`;
  for (const [name, d] of Object.entries(t.density))
    dart += `const magnolia${name[0].toUpperCase() + name.slice(1)}Density = <String, double>{${Object.entries(
      d,
    )
      .map(([k, v]) => `'${k}': ${v}.0`)
      .join(', ')}};\n`;
  return {
    'packages/tokens/src/generated.ts':
      header +
      'export const tokens = ' +
      JSON.stringify(t, null, 2) +
      ' as const;\nexport type ThemeMode = keyof typeof tokens.themes;\nexport type Density = keyof typeof tokens.density;\n',
    'packages/tokens/tokens.css': css,
    'packages/starlight/theme.css': starlight,
    'packages/flutter/lib/src/tokens.g.dart': dart,
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const source = JSON.parse(
    readFileSync(new URL('../packages/tokens/tokens.json', import.meta.url)),
  );
  const { default: Ajv } = await import('ajv/dist/2020.js');
  const ajv = new Ajv({ strict: true });
  const validate = ajv.compile(
    JSON.parse(
      readFileSync(new URL('../packages/tokens/schema.json', import.meta.url)),
    ),
  );
  if (!validate(source)) throw new Error(ajv.errorsText(validate.errors));
  for (const [path, content] of Object.entries(generate(source))) {
    const url = new URL('../' + path, import.meta.url);
    if (process.argv.includes('--check')) {
      if (readFileSync(url, 'utf8') !== content)
        throw new Error(`Stale generated file: ${path}`);
    } else writeFileSync(url, content);
  }
}
