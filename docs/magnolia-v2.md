# Magnolia v2 source

The authoritative v2 design is [Magnolia v2 — Copy](https://www.figma.com/design/cXx2mM66UtpxNVbResHxq3/Magnolia-v2--Copy-?node-id=2-225). The source was read through Figma MCP on November 14, 2026. Work is tracked in [LVT-380](https://linear.app/highlander-robotics/issue/LVT-380). The original file was inaccessible; this copy supersedes that reference for v2.

## Tokens

`packages/tokens/v2/figma.json` preserves all 577 variable definitions, their original IDs, aliases and collection modes:

| Collection | Variables | Modes                |
| ---------- | --------: | -------------------- |
| Primitives |       203 | Value                |
| Scale      |        26 | Value                |
| Color      |       160 | Dark, Light          |
| Density    |       188 | Comfortable, Compact |

`npm run generate` emits DTCG JSON (925 mode-specific tokens), scoped CSS custom properties, typed TypeScript values and Dart maps. It rejects missing aliases, cycles, duplicate paths and incomplete modes. `npm run generate:check` detects stale generated outputs. The Figma snapshot is the input; generated outputs are never hand edited.

V2 entry points are explicit; the current package entry points and published versions retain their existing behavior. Import `@highlanderrobotics/magnolia-tokens/v2`, `/v2/css` or `/v2/tokens.json`. All new CSS is scoped to `data-magnolia-version="2"`; it does not rewrite application `:root` colors.

## Core components

```svelte
<script lang="ts">
  import {
    MagnoliaUIRoot,
    Button,
    TextField,
    Tabs,
    SegmentedControl,
    Card,
    Stat,
  } from '@highlanderrobotics/magnolia-svelte/v2';
  let name = $state('');
</script>

<MagnoliaUIRoot theme="dark" density="comfortable">
  <TextField label="Name" bind:value={name} helper="Visible to your team" />
  <Button onclick={() => console.log(name)}>Save changes</Button>
</MagnoliaUIRoot>
```

Applications load Roboto 400/500 and, for code, Roboto Mono 400. The gallery self-hosts those fonts through Fontsource; components do not fetch fonts or inject network requests. Dark is the v2 default. `theme="system"` opts into the device preference.

| Component        | Public contract                                                                                                         | Figma reference |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------- |
| Button           | `variant`: primary/secondary/tertiary/danger; `size`: large/medium; `icon` snippet; `loading`; native button attributes | 43:148          |
| TextField        | required visible `label`; bindable `value`; `helper`; `error`; native input attributes                                  | 44:209          |
| Tabs             | `label`, `items`, bindable `value`, content snippet receiving the selected value                                        | 54:87           |
| SegmentedControl | Same selection/content contract as Tabs; recessed track and raised selected segment                                     | 47:586          |
| Card             | optional `title`, `description`, `action` snippet; content snippet and section attributes                               | 50:555          |
| Stat             | `label`, `value`, `unit`, large/medium `size`, `emphasis`, `loading`; null is missing data                              | 49:142          |

| Additional control | Public contract                                                                        | Figma reference |
| ------------------ | -------------------------------------------------------------------------------------- | --------------- |
| Checkbox           | `label`, bindable `checked` and `indeterminate`, `error`, native input props           | 47:464          |
| Radio              | `label`, `value`, bindable `group`, `error`, native radio group name/props             | 47:512          |
| Switch             | `label`, bindable `checked`, native input props                                        | 47:545          |
| Chip               | `label`, bindable `selected`, cancellable `onclick`, native button props               | 47:629          |
| IconButton         | required accessible `label`, optional `icon` snippet, Button variants/loading          | 43:212          |
| Kbd                | `key`, `modifier`, cap/field `variant`, visual `disabled` state                        | 336:4807        |
| SearchField        | required accessible `label`, bindable `value`, optional `shortcut`, native input props | 46:402          |
| TextArea           | `label`, bindable `value`, `characterLimit`, `helper`/`error`, native textarea props   | 44:242          |
| Select             | `label`, `items`, bindable `value`, placeholder/required/name/disabled/helper/error    | 44:278          |

Buttons retain label width and their accessible name while loading, block duplicate activation, and expose busy state. Tabs reuse the tested roving-focus behavior, skip disabled items, support RTL arrows and link each tab to its panel. Error helpers are associated with inputs. Missing stat values never become zero.

Choices preserve native keyboard/form semantics, including mixed checkbox state and form resets. Select supports arrow/Home/End navigation, typeahead, Escape, disabled options, required validation, and a native form value. TextArea grows up to six lines, then scrolls; its character limit participates in native form validation. Search clear retains focus and emits the input event. Compact SVG variants are used where supplied by Figma; the mixed glyph and ellipsis scale proportionally with their bound icon sizes. Dark selected chips use the source's purple-200 foreground; light uses semantic fg/accent to retain contrast.

Original Figma SVGs and their hashes/dimensions are recorded in `v2-assets.json`. Masks preserve their silhouettes while inheriting semantic foreground colors in both themes. Switch tracks/thumbs and radio boxes/dots remain separate original layers so colors and position can respond to state. No temporary Figma asset URLs remain at runtime.

`npm run generate:v2-assets` compiles those unchanged SVGs into 3× PNGs for native Image, retaining their original point dimensions. The rasterizer is pinned, generated images are packaged with the native library, and tests verify their dimensions and source hashes. Consumers need no SVG transformer or additional runtime dependency.

Run `npm run gallery -- --port 4180` and open [the v2 preview](http://127.0.0.1:4180/v2). It uses production components with interactive state and links to each design reference. Run `npm run test:v2` for the focused browser checks. The normal browser suite also includes these checks.

## Native adapters

React Native exports the core components from `@highlanderrobotics/magnolia-react-native/v2`. Wrap them in `MagnoliaProvider` with `mode`, `density`, and the application's registered Roboto `fontFamily`. Tabs use controlled `value`/`onValueChange`; text fields retain native `TextInput` props. Native buttons and fields preserve at least 44-point activation height in both densities. Loading uses the platform activity indicator, and native focus/assistive technology behavior remains platform owned.

Starlight exposes the generated semantic color mapping at `@highlanderrobotics/magnolia-starlight/v2.css`. Add it to Starlight's `customCss` and load Roboto in the application; it follows Starlight's `data-theme` attribute. The existing `theme.css` export keeps its previous mapping.

Flutter exposes `package:magnolia_ui/magnolia_v2.dart`, `MagnoliaV2Theme.dark/light(compact: ...)`, and a `MagnoliaV2` theme extension containing every semantic color and density value. This is a Material adapter, not a claim that every Material control is a pixel-exact v2 component. The old `magnolia_ui.dart` API remains available.

## Display components

NumberField (103:1453) adds right-aligned numeric entry, a quiet unit suffix and native min/max/step validation. Its value is a bindable number or undefined; clearing never coerces to zero. Native uses string `value`/`onChangeText` so transient decimals remain editable, with a decimal keyboard and the unit in its accessibility hint. Stepper (44:393) counts whole numbers, disables at each bound and participates in web form reset. Link (77:1179) provides inline/quiet variants, disabled behavior and an external indicator. SelectableCard (109:1634) is a native radio input over the whole card on web, with `group`/`value` selection and form reset; React Native uses controlled `selected`/`onValueChange`. Its meta text uses secondary foreground for readable contrast on selected surfaces.

Both Svelte and React Native export Badge (49:32), StatusIndicator (49:57), Avatar (49:79), AvatarGroup (94:1116), Trend (49:125), ProgressBar (49:214), ProgressRing (78:1520), Spinner (50:473), Skeleton (50:460), Divider, CardHeader (50:220), EmptyState (50:453), Banner (50:210), ListItem (50:441), and AmbientWash (131:1172).

Progress accepts finite percentages, clamps to 0–100, and treats undefined/nonfinite values as indeterminate rather than zero. Small/large rings retain the source's 24/96 px geometry. The original opaque full-ring asset supplies the track silhouette; the semantic track token owns opacity exactly once in both themes. Live progress geometry is data-driven. Web animations honor reduced motion; native Spinner honors the platform reduced-motion preference, while native Skeleton and indeterminate progress remain static placeholders.

Avatars support names, dynamic photos with initials fallback, and original person icons at 24/28/32/40 px. AvatarGroup shows a configurable count and a remaining-count avatar, preserving the rendered source's 6 px overlap and 1.5 px surface rings. Trend exposes direction, sign and sentiment independently; a decrease can mean improvement. Banners support semantic tones, optional actions and dismissal. List rows preserve selected, unread and disabled states. AmbientWash uses the original 390×400 fade behind a page header/context, with deterministic context hues shared across clients; give its parent a positioning/stacking context. It is decorative and never a status indicator.

## Source discrepancies and remaining coverage

FileField (77:1216) exports a bindable web `files` array plus an optional `onFiles` callback, accepted-format/size validation, drag/drop, native form values and reset. Updating the array after removing an Attachment also updates the native file input. React Native FileField exposes `onBrowse`; applications supply their camera/library/document picker and validation so the library adds no runtime picker dependency. Attachment (103:1501) renders controlled uploading/done/failed/image states, progress, dynamic thumbnails and independent retry/remove callbacks. Steps (103:1565) takes labels plus a zero-based current index, announces each stage and scrolls on narrow screens without hiding stages.

Resolved Figma variables and component renders govern implementation when prose differs. The current compact title/lg binding is 28/36 even though the Typography prose says 24/32. The rendered SegmentedControl has a subtle edge and a 3 px inset despite its older description saying no border/2 px. The Card section renders `bg/raised`, while Principles describes page-colored cards. These source discrepancies have not been edited in Figma.

Selected list rows use the primary foreground for description/meta text: Figma's secondary/tertiary text on the rendered selected surface fails AA contrast (4.48:1 and 3.19:1). Other list states retain the source tokens. AvatarGroup follows the rendered 6 px overlap/1.5 px rings rather than the older 8 px/2 px prose.

The full token source and the controls above are implemented. Date/Time inputs, Combo/MultiSelect, Slider, data/charts, and the remaining navigation/overlays still require v2 implementation and parity checks. Existing v1 controls do not count as v2 coverage. LVT-380 stays In Progress; no v1.0 or v2 release is implied, and Lovat dependencies remain unchanged.
