# Token API v1

`packages/tokens/tokens.json` is the canonical source. Its JSON Schema validates structure, numeric bounds and color/alias formats. The generator rejects unknown and cyclic aliases; generation is deterministic and contains no timestamps or platform paths. Tests verify cross-theme key parity, AA text contrast, input boundaries, density targets and regeneration.

The token groups are `palette` (primitives), `themes` (semantic control colors), `material` (native Material color roles), `frc` (optional alliance extension), `spacing`, `radius`, `typography`, `density` and `motion`. An alias such as `{palette.dark-victory-purple}` resolves before any platform output is generated. Material roles intentionally preserve Dashboard’s existing generated values; they do not replace native Material semantics with web surface assumptions.

Web colors use `--mg-primary`, `--mg-on-primary`, `--mg-surface`, `--mg-background`, `--mg-on-background`, `--mg-muted`, `--mg-error-text`, `--mg-outline` and `--mg-focus`. Semantic error text is separate from danger-button fill so both have readable contrast. Legacy `--victory-purple`, `--light-gray`, `--background`, `--secondary-container` and associated state aliases remain defined, including the previously missing `--secondary-container-faded`.

Use `data-magnolia-theme="light|dark|system"` for web themes. The legacy `.color-scheme-light` and `.color-scheme-dark` classes remain aliases. Explicit subtree themes override inherited values. Nested `DensityProvider` elements reset all density properties together. `spacious` maps to `comfortable`; compact and comfortable have 44px and 48px minimum web targets. Native controls retain at least 48px targets in both densities. Reduced-motion media queries set transition tokens to zero; native controls use immediate state changes and platform-native animation behavior.

```css
/* Application customization, after importing Magnolia styles. */
.brand-region {
  --mg-primary: #350868;
  --mg-on-primary: #ffffff;
  --mg-primary-hover: #5a3b7d;
  --mg-focus: #350868;
}
```

Keep background/foreground pairs together and rerun contrast checks when customizing. Disabled controls are excluded from contrast requirements but still carry native disabled semantics.

TypeScript consumers use `tokens.themes[mode]`, `tokens.density[density]` and `tokens.frc[mode]`. Flutter uses generated `magnoliaLightColorScheme`, `magnoliaDarkColorScheme`, spacing/radius/motion/density constants and `MagnoliaFrc`. Starlight CSS is generated directly from the same semantic/material values; it includes distinct light/dark palettes without changing Starlight routing or search.

Token-key removals or role meaning changes require a major package release. Additive tokens are minor changes; corrections preserving the contract are patches. Do not infer that equal numeric values make two semantic roles interchangeable.
