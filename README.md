![Magnolia UI — purple lettering with a soft purple aura](docs/assets/magnolia-ui-header.png)

[![CI](https://github.com/HighlanderRobotics/magnolia-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/HighlanderRobotics/magnolia-ui/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@highlanderrobotics/magnolia-svelte?label=npm)](https://www.npmjs.com/package/@highlanderrobotics/magnolia-svelte)
[![Figma](https://img.shields.io/badge/Figma-Magnolia%20v2-B59AFF?logo=figma&logoColor=white)](https://www.figma.com/design/cXx2mM66UtpxNVbResHxq3/Magnolia-v2--Copy-?node-id=2-225)

**Magnolia UI** is Highlander Robotics’ design system for web and native apps. Shared tokens and accessible components bring consistent forms, navigation, tables, charts and overlays to each platform.

## Use it

Install the published Svelte package:

```sh
npm install --save-exact @highlanderrobotics/magnolia-svelte@2.0.0
```

```svelte
<script lang="ts">
  import {
    MagnoliaUIRoot,
    Button,
  } from '@highlanderrobotics/magnolia-svelte/v2';
</script>

<MagnoliaUIRoot theme="dark">
  <Button onclick={() => console.log('Saved')}>Save changes</Button>
</MagnoliaUIRoot>
```

Load Roboto 400/500 and Roboto Mono 400 in your app. See the [component contracts](docs/components.md) and [native example](examples/native/README.md) for platform setup.

## Explore v2

Magnolia v2 adds Dark/Light themes, Comfortable/Compact densities and components matched to the new Figma source. Use the Svelte and React Native `/v2` entry points for the new components. The original root imports remain available.

Use Node 22.23.4+ and npm 11.6.2, then run from the repository root:

```sh
npm ci
npm run build
npm run gallery
```

Open the [v2 gallery](http://localhost:4173/v2). See the [v2 APIs and coverage](docs/magnolia-v2.md) for component examples and platform adaptations.

## Packages

| Package                                                              | What it provides                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------- |
| [`@highlanderrobotics/magnolia-svelte`](packages/svelte)             | Svelte 5 components for web apps                        |
| [`@highlanderrobotics/magnolia-react-native`](packages/react-native) | Native controls and shared interaction patterns         |
| [`@highlanderrobotics/magnolia-tokens`](packages/tokens)             | Semantic colors, typography, spacing and density tokens |
| [`@highlanderrobotics/magnolia-starlight`](packages/starlight)       | Astro Starlight theme styles                            |
| [`magnolia_ui`](packages/flutter)                                    | Flutter Material 3 theme and token adapters             |

## Develop

```sh
npm run check
npm test
npm run test:native
```

For browser checks, run `npx playwright install chromium`, then `npm run test:browser`. Generated token files are committed; edit their source and run `npm run generate`.

Read the [component contracts](docs/components.md), [token guide](docs/tokens.md), [migration and rollback guide](docs/migration.md), and [release setup](docs/releases.md) for more detail.
