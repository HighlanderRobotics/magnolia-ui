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

Combobox (77:1069) and MultiSelect (77:1109) reuse the existing Combobox's filtering and keyboard engine through optional rendering hooks. They add original chevrons/checks, matched-text emphasis, removable tokens, result counts and loading/no-results states. Status announcements and counts sit outside the option-only listbox. `Combobox` uses bindable `value: string | null`; `MultiSelect` uses bindable `value: string[]`, a native multiple-select form value and reset. Both accept `items`, `label`, `placeholder`, `disabled`, `required`, `error`, `loading` and `onQueryChange`. React Native uses controlled `value`/`onValueChange` and a searchable sheet. Native token removal and opening targets retain at least 44 points.

Slider (77:1157) uses a native range input on web and PanResponder plus adjustable accessibility actions on native. It exposes `min`, `max`, `step`, `value` and `formatValue`, always displays the current value, snaps relative to min and preserves decimal precision. Web values reset with their form. The dynamic rail/fill follows live data; every thumb state uses an original Figma export at its natural bounds. Twenty exports cover default/hover/pressed/focus/disabled in Dark/Light and Comfortable/Compact. Their logical bounds and shadow offsets are recorded in the asset manifest. All temporary export copies were deleted; the original nodes and 577 variables remain unchanged. System theme changes update the artwork through the v2 root's appearance context.

Calendar (47:1265), DayCell (47:1163), DateField (357:2430) and TimeField (92:1519) are implemented for web/native. DateField's public value is an ISO date (`2026-10-14`), while typed ISO or English month dates normalize to the source's readable date format. TimeField uses `HH:mm` values, accepts 24-hour or AM/PM input and offers all 96 quarter-hour choices. Parsers reject invalid day/month rollovers and invalid times. Calendar supports single or range selection, min/max bounds, Monday-first weeks (configurable), arrows/Home/End/PageUp/PageDown keyboard navigation, and current-date dots. Web pickers anchor to the whole field and restore focus on Escape; coarse-pointer layouts sit at the bottom of the viewport. Native pickers use Modal sheets; native calendar cells retain 44-point touch targets in compact density. Web fields serialize canonical values and reset with their form. The shared Popover primitive adds optional anchoring/initial-focus selectors; its existing default behavior is unchanged and its original browser regression passes.

FileField (77:1216) exports a bindable web `files` array plus an optional `onFiles` callback, accepted-format/size validation, drag/drop, native form values and reset. Updating the array after removing an Attachment also updates the native file input. React Native FileField exposes `onBrowse`; applications supply their camera/library/document picker and validation so the library adds no runtime picker dependency. Attachment (103:1501) renders controlled uploading/done/failed/image states, progress, dynamic thumbnails and independent retry/remove callbacks. Steps (103:1565) takes labels plus a zero-based current index, announces each stage and scrolls on narrow screens without hiding stages.

Resolved Figma variables and component renders govern implementation when prose differs. The current compact title/lg binding is 28/36 even though the Typography prose says 24/32. The rendered SegmentedControl has a subtle edge and a 3 px inset despite its older description saying no border/2 px. The Card section renders `bg/raised`, while Principles describes page-colored cards. These source discrepancies have not been edited in Figma.

Selected list rows use the primary foreground for description/meta text: Figma's secondary/tertiary text on the rendered selected surface fails AA contrast (4.48:1 and 3.19:1). Other list states retain the source tokens. AvatarGroup follows the rendered 6 px overlap/1.5 px rings rather than the older 8 px/2 px prose.

Outside-month Calendar dates use tertiary foreground instead of the source's outside-day token, which yields only 4.21:1 on the overlay surface. Today follows the rendered source's dot and Medium text rather than the older outline description.

## Navigation

NavItem (54:51), NavSection (54:54), NavRailItem (93:990) and Breadcrumb (54:187) are available in Svelte and React Native. Destinations accept a label, optional icon, selected/disabled states and a link or action. NavItem also accepts a count (including zero). Svelte uses `href`/`onclick`, native uses `href`/`onPress`; a native callback takes precedence over opening a URL. Custom icons should inherit the destination color on web and supply the corresponding theme/state color on native. The original default house and breadcrumb chevron assets retain their 20 px and 14 px bounds.

Sidebar items use 224 px width and density-specific 36/28 px minimum heights. Rail items use 72 × 56 px geometry with Medium text and selected background. Web focus rings appear for keyboard navigation; native destinations expose selected/disabled accessibility states. Touch/native sidebar targets retain at least 44 px height. Labels may grow vertically for text scaling. Breadcrumb ancestors support links/actions; the last item is always the noninteractive current page, even if a URL/action is supplied. Breadcrumbs wrap at narrow widths and retain native/touch activation targets. Navigation landmark labels belong to the consuming composition; Breadcrumb supplies its own customizable landmark label.

TabBarItem (54:128) and TabBar (54:150) provide mobile destinations using 80 × 52 px items, accent/Medium selected labels, original 1.75/2.25-stroke default house artwork and optional unread badges. Item selection is controlled by the consuming router (`selected`); links and callbacks work independently. The custom icon slot receives selection state (`Snippet<[boolean]>` on web, render function on native), so applications can supply the corresponding selected artwork. TabBar accepts 3–5 items as children and a `bottomInset` in pixels/points (32 by default, following the rendered source rather than older 30 px prose). Use the platform safe-area inset when integrating it in an app. Narrow web bars scroll rather than clip destinations.

TopBar (54:178) supports inline and large titles, back/action callbacks, accessible labels and a custom action slot. A controlled `collapsed` prop lets the application's scroll handler switch a large header to inline. Header actions remain 44 px even in compact density; large titles may wrap as text grows. Missing actions reserve a symmetric slot to keep inline titles centered. Native buttons now draw focus outlines without reserving eight extra points in layout, preserving the intended header action geometry.

## Tables and pagination

Svelte and React Native export TableHeaderCell (52:70), TableCell (52:80), TableRow (52:157), Table, Pagination (52:175), PaginationPages (78:784) and BulkActionBar (52:200). Source sorting, pagination and bulk-action icons are original vendored SVGs with native PNG derivatives.

Web Table composes the existing numeric sorting primitive through optional header/row render hooks; its legacy defaults are unchanged. Columns support sortable, secondary and end-aligned numeric content. `sortBy`/`sortDirection` are bindable on web; native uses controlled sorting plus `onSortChange`. Custom `cell`/`rowContent` slots support status indicators, progress and selection controls. Supply a stable `rowKey` when rows have no unique `id`; v2 defaults to id, then index. Native tables scroll horizontally and announce column labels with values; they use native reading order rather than claiming an ARIA grid. Native header/cell widths can be adjusted through their style props.

Web TableRow optionally supplies a labeled checkbox with bindable selection and `onselectionchange`; native selection controls belong in row children. TableCell accepts text/secondary/numeric variants and editable values. Web editing commits on Enter/blur, cancels on Escape and restores focus; `value` is bindable and `oncommit` optional. Native uses controlled `value`/`onCommit`, submit/blur commit and hardware Escape cancellation. Selected secondary cells use primary foreground to retain readable contrast. Web desktop rows follow 44/28 px density heights. Interactive touch/native cells preserve at least 44 px activation height; collapsed table borders can add one pixel to a touch row.

Pagination shows the bounded visible range and total, provides configurable page sizes, resets to page one after a size change and disables previous/next at bounds. Empty results show 0–0. Web uses bindable `page`/`pageSize`; native uses `onPageChange`/`onPageSizeChange`. Native page-size selection uses the existing accessible Select sheet. PaginationPages uses the existing bounded pager with selected page semantics, nearby pages, first/last and ellipses. Native/touch page buttons keep 44 px targets while desktop page visuals use 36 px.

BulkActionBar shows selected count, optional assign/export/delete callbacks (or custom children) and clear. Web defaults to a floating bottom bar; set `floating={false}` for inline compositions. Escape clears selection unless a child already handled it. Clearing while focus is inside returns focus to the control active when selection began. Native exposes clear and accessibility escape; the application positions it with `style` and supplies any destructive-action confirmation. Bulk action buttons retain 44 px targets and wrap on narrow screens.

## Chart primitives

Sparkline (53:213) uses the eight original SVGs for rising/falling/volatile/flat shapes in neutral/accent tones at their natural 96 × 24 px bounds. It is a shape indicator; applications supply an accessible `label` describing the represented data, or leave it decorative when adjacent text already gives the same meaning. It does not fabricate numerical data from a shape.

LegendItem (53:238) provides an 8 px swatch and label for categorical series 1–5 or `other`. ChartTooltip (53:253) takes a title and ordered `{label, value, series}` items, with tabular, right-aligned values. It renders the readout; the owning chart controls its position and associates it with the active point. Both platforms use the generated theme tokens. The `ChartSeries` type is exported from the v2 token package.

BarChart (53:308) renders supplied `{label, value}` data with 24 px bars, four grid/axis ticks, neutral context bars and an accent highlighted bar with a value label. The source geometry is 560 × 220 px for eight periods; longer series grow horizontally. `highlightIndex` is bindable on web and optionally controlled on native (`onHighlightChange`); web also offers `onhighlightchange`. Arrow/Home/End navigation uses one tab stop and skips missing values. Native bars are full-height touch targets. An optional `domain` fixes the axis, with visual bars clipped to that range while labels and the expandable data view retain actual values. Null/nonfinite values remain missing; empty data renders an explicit empty state. `formatValue` formats axis and data values.

Charts provide a horizontally scrollable visual plus an expandable data table/readout. Native chart geometry scales with the system font scale, keeping captions and marks aligned; chart text is scaled with its surface instead of scaling twice. This implementation still needs the physical native visual/text-scaling gate recorded in LVT-368.

The full token source and the controls above are implemented. Charts, remaining overlays, and the complete canonical icon inventory still require v2 implementation and parity checks. Existing v1 controls do not count as v2 coverage. LVT-380 stays In Progress; no v1.0 or v2 release is implied, and Lovat dependencies remain unchanged.
