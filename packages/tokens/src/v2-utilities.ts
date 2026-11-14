export type Tone =
  'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type ContextHue = 'accent' | 'teal' | 'amber' | 'green' | 'blue';
/** Stable across web/native clients. No context is mapped to a danger/red wash. */
export function contextHue(id: string): ContextHue {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++)
    hash = Math.imul(hash ^ id.charCodeAt(i), 16777619) >>> 0;
  return (['accent', 'teal', 'amber', 'green', 'blue'] as const)[hash % 5];
}
export function progressValue(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value)
    ? undefined
    : Math.max(0, Math.min(100, value));
}
export function initials(name: string): string {
  const words = name.normalize('NFC').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  return (
    words.length > 1
      ? Array.from(words[0])[0] + Array.from(words.at(-1)!)[0]
      : Array.from(words[0]).slice(0, 2).join('')
  ).toUpperCase();
}
