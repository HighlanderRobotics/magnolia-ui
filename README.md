# Magnolia UI

Highlander Robotics’ cross-platform design system. One JSON token source generates semantic CSS, typed TypeScript, Flutter Material 3 color schemes and Starlight styles.

This is the new repository for [LVT-362](https://linear.app/highlander-robotics/issue/LVT-362). **Lovat’s dependencies have not been changed.** The legacy `magnolia-ui-svelte` repository remains available. Initial npm publications have been accepted; release and consumer-validation status is recorded in [release setup](docs/releases.md).

| Package                                     | Purpose                                                      |
| ------------------------------------------- | ------------------------------------------------------------ |
| `@highlanderrobotics/magnolia-tokens`       | Validated JSON, CSS, typed tokens, density and FRC semantics |
| `@highlanderrobotics/magnolia-svelte`       | Svelte 5 controls and opt-in fonts                           |
| `@highlanderrobotics/magnolia-react-native` | Native Collection-style controls with async actions          |
| `@highlanderrobotics/magnolia-starlight`    | Generated Astro Starlight theme mapping                      |
| `magnolia_ui`                               | Native Flutter Material 3 theme and FRC extension            |

## Develop

Use Node 22.23.4 or newer and npm 11.6.2 (the pinned repository package manager). Run from the repository root:

```sh
npm install --global npm@11.6.2
npm ci
npm run build
npm run check
npm test
npm run test:ssr
npm run test:native
npx playwright install chromium
npm run test:browser
npm run gallery
```

The interactive gallery runs at `http://127.0.0.1:4173`. The [Figma comparison](http://127.0.0.1:4173/figma) shows the source-linked light/dark components in both densities with bundled fonts. It demonstrates every web export, themes, nested density, form errors, dialogs and action menus. `npm run gallery:build` produces a deployable gallery without requiring application secrets. No website is deployed by these commands.

For Flutter, use Flutter 3.35+ and Dart 3.8+:

```sh
cd packages/flutter
flutter pub get
flutter analyze
flutter test
cd example
flutter build web
```

Generated artifacts are committed. Change `packages/tokens/tokens.json`, run `npm run generate`, and include the resulting files. `npm run generate:check` rejects stale output. Do not edit generated CSS, TypeScript or Dart directly.

## Use the packages

Install a published package:

```sh
npm install --save-exact @highlanderrobotics/magnolia-svelte@0.2.0
```

```svelte
<script lang="ts">
  import {
    MagnoliaUIRoot,
    Button,
    Switch,
  } from '@highlanderrobotics/magnolia-svelte';
  let offline = $state(false);
</script>

<MagnoliaUIRoot theme="dark">
  <Switch label="Offline scouting" bind:value={offline} name="offline" />
  <Button onclick={(event) => console.log(event.currentTarget)}>Continue</Button
  >
</MagnoliaUIRoot>
```

Fonts are application-owned. Bundle Heebo and Material Symbols for offline native use. For web you may self-host them, use system fonts, or explicitly import `@highlanderrobotics/magnolia-svelte/fonts.css` to opt into Google-hosted fonts. Magnolia performs no `document.fonts.load()` calls. Importing individual web controls without `MagnoliaUIRoot` requires both `@highlanderrobotics/magnolia-tokens/css` and `@highlanderrobotics/magnolia-svelte/styles.css`.

See [component contracts](docs/components.md), [tokens](docs/tokens.md), [migration and rollback](docs/migration.md), [release setup](docs/releases.md), [parity inventory](docs/parity.md), [Figma parity](docs/figma-parity.md) and [validation evidence](docs/validation.md).

## Contribute and release

Keep app routing, scouting logic, timers, persistence, charts and domain icons in their applications. Magnolia owns reusable visual tokens and control behavior. Add tests for behavior and accessibility, document public API changes, run `npm run format`, and add a Changeset for publishable changes. Never commit private environment files or generated dependencies.

CI validates clean installs, generated artifacts, formatting, package builds, types, native interactions, browser keyboard/axe checks, Flutter widgets and consumer tarball installs. Release publishing is separately gated through the `npm` GitHub environment; npm scope ownership and trusted publishing must be configured first. Consumer migrations and legacy archival remain separate work.

Legacy source reference: `HighlanderRobotics/magnolia-ui-svelte@765e43e5b2efc9bfbdb84e1b7751cae73ad7c900`. The new implementation retains its export names and visual lineage; see the documented Svelte 5 API changes before upgrading.
