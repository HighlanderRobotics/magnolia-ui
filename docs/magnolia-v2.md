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

Buttons retain label width and their accessible name while loading, block duplicate activation, and expose busy state. Tabs reuse the tested roving-focus behavior, skip disabled items, support RTL arrows and link each tab to its panel. Error helpers are associated with inputs. Missing stat values never become zero.

The two original Figma SVGs and their hashes/dimensions are recorded in `v2-assets.json`. Masks preserve the original 20×20 spinner and 12×12 error glyph while inheriting semantic foreground colors in both themes. No temporary Figma asset URLs remain at runtime.

Run `npm run gallery -- --port 4180` and open [the v2 preview](http://127.0.0.1:4180/v2). It uses production components with interactive state and links to each design reference. Run `npm run test:v2` for the focused browser checks. The normal browser suite also includes these checks.

## Native adapters

React Native exports the core components from `@highlanderrobotics/magnolia-react-native/v2`. Wrap them in `MagnoliaProvider` with `mode`, `density`, and the application's registered Roboto `fontFamily`. Tabs use controlled `value`/`onValueChange`; text fields retain native `TextInput` props. Native buttons and fields preserve at least 44-point activation height in both densities. Loading uses the platform activity indicator, and native focus/assistive technology behavior remains platform owned.

Starlight exposes the generated semantic color mapping at `@highlanderrobotics/magnolia-starlight/v2.css`. Add it to Starlight's `customCss` and load Roboto in the application; it follows Starlight's `data-theme` attribute. The existing `theme.css` export keeps its previous mapping.

Flutter exposes `package:magnolia_ui/magnolia_v2.dart`, `MagnoliaV2Theme.dark/light(compact: ...)`, and a `MagnoliaV2` theme extension containing every semantic color and density value. This is a Material adapter, not a claim that every Material control is a pixel-exact v2 component. The old `magnolia_ui.dart` API remains available.

## Source discrepancies and remaining coverage

Resolved Figma variables and component renders govern implementation when prose differs. The current compact title/lg binding is 28/36 even though the Typography prose says 24/32. The rendered SegmentedControl has a subtle edge and a 3 px inset despite its older description saying no border/2 px. The Card section renders `bg/raised`, while Principles describes page-colored cards. These source discrepancies have not been edited in Figma.

This first pass establishes the full token source and the core components above. Checkbox/Radio/Switch, IconButton, Kbd, TextArea, Select/Search, Number/Date/Time inputs, Combo/MultiSelect, Slider, files/attachments, Steps/SelectableCard, display/status components, data/charts, and the remaining navigation/overlays still require v2 implementation and parity checks. Existing v1 controls do not count as v2 coverage. LVT-380 stays In Progress; no v1.0 or v2 release is implied, and Lovat dependencies remain unchanged.
