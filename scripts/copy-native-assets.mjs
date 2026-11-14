import { cpSync, mkdirSync } from 'node:fs';
const dist = new URL('../packages/react-native/dist/assets/', import.meta.url);
mkdirSync(dist, { recursive: true });
cpSync(
  new URL('../packages/react-native/src/assets/v2', import.meta.url),
  new URL('v2', dist),
  { recursive: true },
);
