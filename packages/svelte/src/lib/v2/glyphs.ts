import optionCheck from './assets/option-check.svg';
import asset0 from './assets/error.svg';
import asset1 from './assets/spinner-dark.svg';
import asset2 from './assets/check.svg';
import asset3 from './assets/mixed.svg';
import asset4 from './assets/check-compact.svg';
import asset5 from './assets/chip-check.svg';
import asset6 from './assets/chip-check-compact.svg';
import asset7 from './assets/search.svg';
import asset8 from './assets/clear.svg';
import asset9 from './assets/chevron-down.svg';
import asset10 from './assets/ellipsis.svg';
import asset11 from './assets/modifier.svg';
import asset12 from './assets/switch-track.svg';
import asset13 from './assets/switch-track-compact.svg';
import asset14 from './assets/switch-thumb.svg';
import asset15 from './assets/switch-thumb-compact.svg';
import asset16 from './assets/radio-box.svg';
import asset17 from './assets/radio-box-compact.svg';
import asset18 from './assets/radio-dot.svg';
import asset19 from './assets/radio-dot-compact.svg';
export const glyphs = {
  'option-check': { src: optionCheck, width: 16.0, height: 16.0 },
  error: { src: asset0, width: 12.0, height: 12.0 },
  'spinner-dark': { src: asset1, width: 20.0, height: 20.0 },
  check: { src: asset2, width: 12.0, height: 12.0 },
  mixed: { src: asset3, width: 12.0, height: 12.0 },
  'check-compact': { src: asset4, width: 10.0, height: 10.0 },
  'chip-check': { src: asset5, width: 14.0, height: 14.0 },
  'chip-check-compact': { src: asset6, width: 12.0, height: 12.0 },
  search: { src: asset7, width: 16.0, height: 16.0 },
  clear: { src: asset8, width: 16.0, height: 16.0 },
  'chevron-down': { src: asset9, width: 16.0, height: 16.0 },
  ellipsis: { src: asset10, width: 20.0, height: 20.0 },
  modifier: { src: asset11, width: 10.575, height: 9.65 },
  'switch-track': { src: asset12, width: 44.0, height: 24.0 },
  'switch-track-compact': { src: asset13, width: 32.0, height: 20.0 },
  'switch-thumb': { src: asset14, width: 20.0, height: 20.0 },
  'switch-thumb-compact': { src: asset15, width: 16.0, height: 16.0 },
  'radio-box': { src: asset16, width: 20.0, height: 20.0 },
  'radio-box-compact': { src: asset17, width: 16.0, height: 16.0 },
  'radio-dot': { src: asset18, width: 7.0, height: 7.0 },
  'radio-dot-compact': { src: asset19, width: 5.6, height: 5.6 },
} as const;
export type GlyphName = keyof typeof glyphs;
