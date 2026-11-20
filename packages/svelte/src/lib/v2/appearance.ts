import { getContext, setContext } from 'svelte';
type Appearance = {
  readonly mode: 'dark' | 'light';
  readonly density: 'comfortable' | 'compact';
};
const key = Symbol('Magnolia v2 appearance');
export function provideAppearance(value: Appearance) {
  setContext(key, value);
}
export function getAppearance(): Appearance {
  return (
    getContext<Appearance>(key) ?? { mode: 'dark', density: 'comfortable' }
  );
}
