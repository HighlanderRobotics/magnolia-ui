# Validation evidence

Implementation validation was performed on 2026-11-12. No Lovat consumer dependency, lockfile, patch or source was changed. Existing local Collection app.json/eas.json edits remain as found. No Dart tag, application deployment or legacy archive was performed. Initial npm publication and registry verification are recorded below.

## Completed locally

| Check                             | Result                                                                                                                                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical token generation/schema | Reproducible, validated aliases, parity, required roles and stale-output check                                                                                                                                 |
| Token tests                       | 7 passing: original Figma asset hashes/geometry, generation, cycles/missing aliases, palette parity, AA text contrast, boundaries/targets/reduced motion, invalid schema                                       |
| Svelte DOM tests                  | 10 passing: multiple-value form data/errors, combobox validity, Pill toggle/cancellation, original callback event/cancellation, disabled links, native switch form data, labelled form errors/disabled options |
| React Native Jest tests           | 11 passing: native Radio/Select/Dialog/Menu, Pill state/disabled behavior, duplicate async actions, failure/retry, disabled controls, checkbox semantics, refs/labels/errors, themes/scaling                   |
| Web/SSR                           | Packages build and Svelte check with zero warnings; server-render smoke plus real browser hydration without mismatch                                                                                           |
| Chromium                          | 44 desktop/mobile tests passing for dialog/menu/forms, axe in both themes/densities, reduced motion, SSR hydration, radio binding and Starlight content/search                                                 |
| Gallery                           | Production Vite build passes                                                                                                                                                                                   |
| Starlight                         | Production Astro/Starlight build passes, native Pagefind index generated                                                                                                                                       |
| Flutter 3.50.0 / Dart 3.14.0      | Analysis passes, 3 theme/widget tests pass including 200% text scaling; standalone web build passes                                                                                                            |
| Package exports                   | All four packages pass publint; JS/JSON entries pass attw ESM profile; CSS validated as bundler assets                                                                                                         |
| Clean consumers                   | npm, pnpm 10.20.0, Yarn 4.10.3 and Bun 1.3.14 install packed and published registry artifacts and resolve token/CSS/Svelte/RN types                                                                            |
| Dependency audit                  | 0 critical/high/moderate; 9 low-severity development advisories remain in compatible Jest/RN testing and Svelte inspector dependencies                                                                         |

Unpublished coordinated token dependencies use local-tarball overrides/resolutions in package-manager fixtures. Registry-only clean installs now pass with no overrides; trusted-publisher settings were read back for all four packages. The first automated OIDC publish/provenance attestation remains to be exercised on a future release. Packages are ESM/bundler-oriented, not CommonJS libraries. Svelte declarations are checked in the clean consumer because attw cannot execute .svelte modules.

## Visual review and issues found

Desktop light/comfortable and mobile dark/compact gallery screenshots were inspected, together with desktop light and mobile dark Starlight screenshots. Controls and documentation fit their viewports; form errors, switches, buttons, typography and code/callouts remain readable. Fonts intentionally use application/system fallbacks unless the app supplies or opts into hosted fonts. The icon example illustrates the explicit bundled-font requirement.

The review/test pass found and corrected modal Tab wrapping, nested scroll locking, menu trigger re-opening, shared radio state, intermediate theme-transition contrast and light-theme Starlight table-of-contents contrast. A screenshot also caught that the first mobile Starlight test was leaving its menu open; the test now closes it and checks visible content before axe/screenshot capture.

Playwright writes captures to test-results; CI uploads them as browser-evidence. They are implementation snapshots, not a legacy pixel-parity baseline or owner visual approval. No claim of full consumer parity is made.

## Remaining gates

Consumer migrations and application workflow verification are deferred by request. This includes Website/tooling-web integration, Collection offline scouting/iOS/Android/VoiceOver/TalkBack, Dashboard picklists/charts and Learn integration. React Native controls have interaction tests, not a device accessibility sign-off. Flutter 3.35.7 and 3.50.0 both passed the remote analysis/format/test/web-build matrix; 3.50.0 was also executed locally.

GitHub CI covers Node 22/24, four package managers, Chromium and Flutter 3.35.7/3.50.0. The first remote run passed both Flutter jobs but exposed npm 10 lock resolution differences. Repository npm is now pinned to 11.6.2; a fresh checkout clean install passes with that version. Updated remote results are recorded in Linear. npm scope ownership, 2FA, initial publication, public visibility and all four OIDC trusted-publisher configurations are now verified. Legacy archival remains gated by LVT-369.

## Figma comparison pass

The supplied Lovat 2027 design was inspected through Figma MCP. The comparison preview at `/figma` self-hosts Heebo and Material Symbols and uses the production components. Desktop/mobile checks cover all four light/dark and comfortable/compact panels: 44px/33px visible button and field heights, 58×34 switches, 24px/18px selections, original SVG bindings, role-specific disabled colors and keyboard Pill toggling. Axe passes on this page. Button label widths differ by up to one pixel due to text shaping. Original bytes for all 29 Figma SVGs are checked by SHA-256.

See [Figma parity](figma-parity.md) for source nodes, measured values and retained accessibility adjustments. This pass adds Svelte and React Native Pill components; it does not establish consumer migration or native-device visual parity. The gallery fonts are bundled only in the example application.

## Initial npm registry verification

On 2026-11-12 (America/Los_Angeles), npm accepted tokens/Svelte/React Native 0.2.0 and Starlight 0.1.0. All four public registry metadata responses returned 200 with the expected latest versions after npm processing completed. Source tags point to fb6a12d.

Fresh registry-only consumers pass with npm, pnpm 10.20.0, Yarn 4.10.3 and Bun 1.3.14. These installs use exact published versions, without local tarballs or token overrides/resolutions, and verify token imports, CSS exports and Svelte/React Native type resolution. Packed-artifact mode also continues to pass.

All four npm trusted publishers were configured after explicit owner authorization and read back as repository HighlanderRobotics/magnolia-ui, workflow release.yml, environment npm. That GitHub environment is main-only and requires jackshim415 review. Bootstrap used interactive account 2FA; no bypass token was stored. Bootstrap releases do not claim CI provenance. Lovat dependency migration and platform/device acceptance remain separate gates.

## LVT-361 control expansion

The complete local suite passes with nine additional web controls and four native controls. New desktop/mobile coverage verifies Figma pill-tab geometry (35px visible height, 7px gap and 109px items at 341px), roving/RTL/disabled tab navigation, hover/focus/Escape tooltips, nonmodal popover focus and light dismissal, persistent toast dismissal/focus return, searchable option navigation, disabled items, native multiple-value form data/reset, numeric sorting, page bounds, native details groups and SSR hydration/unique IDs. All four theme/density combinations pass axe and viewport checks. The final 18 extended browser checks also pass after focus/hover improvements.

Svelte check reports zero errors/warnings; native typings/builds and package exports pass. Native tests cover checked/disabled radios, guarded modal dismissal, modal choice state and async action failure/retry. Native example includes every addition. Flutter analysis passes after the single tab-gap token is generated into Dart. Source mappings and accessibility/platform exceptions are in [extended controls](extended-controls.md). No standalone Figma variants are claimed where none exist. Device screen-reader and consumer migration gates remain open; this pass does not change Lovat dependencies or publish a new npm version.
