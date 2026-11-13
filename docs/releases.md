# Release setup

Packages are independent semver units managed with Changesets. Run `npm run changeset` for a public change; review `npm run version-packages` output and commit versions/changelogs before publishing. Pin known-good releases in applications. Keep all generated token artifacts in version control.

The release workflow runs only via an explicit workflow dispatch on main. It builds/tests first, then publishes from the protected GitHub `npm` environment using npm OIDC. The `npm` environment permits only `main` and requires review by `jackshim415`. The workflow has `id-token: write` and no stored npm token. npm CLI must be 11.5.1+ for trusted publishing. Scope ownership, administrator 2FA and initial package creation are account configuration, not repository code.

Release checklist:

1. npm `jackshim415` is a verified owner of `@highlanderrobotics`, with account 2FA enabled for authentication and writes.
2. The GitHub repository is public (verified during setup), providing a source for provenance.
3. All four initial publications have been accepted by npm. Their trusted publishers are configured and read back as owner `HighlanderRobotics`, repository `magnolia-ui`, workflow `release.yml`, environment `npm`, with direct publish permission.
4. Review versions, changelogs, clean-install tests and the intended npm dist-tag. Never execute release automation just to test its configuration.
5. Dispatch the release workflow, inspect registry artifacts/provenance, and create immutable release tags. Changesets tags npm packages after successful publication. Tag Flutter separately as `flutter-vX.Y.Z` only after Flutter checks pass.

`@highlanderrobotics/magnolia-tokens` exports JavaScript/types, CSS and JSON. Svelte exports compiled-package source and declarations for bundlers. React Native exports ESM with React/React Native peers and a `react-native` condition. Starlight exports CSS only. CSS is intentionally marked as side-effectful and has no executable JavaScript entry. Do not require a CSS file through Node; use a supported bundler.

`node scripts/package-smoke.mjs npm|pnpm|yarn|bun` packs all four packages and installs them in a fresh temporary consumer. It checks token imports, CSS exports and published Svelte/RN type resolution. Unpublished internal token dependencies are redirected to the local token tarball via pnpm overrides/Yarn resolutions/Bun overrides; this emulates availability of the coordinated token release. This validates artifacts before publication, not npm permissions or platform/device workflows.

A breaking token/component contract needs a major version. Release fixes as patches and additions as minors. Rollback uses a previous immutable version and restored lockfile, never a silently retagged artifact. Lovat migration is deliberately deferred; publishing does not authorize consumer changes.

References: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), [Svelte props and bindable values](https://svelte.dev/docs/svelte/$props), [Starlight CSS variables](https://starlight.astro.build/guides/css-and-tailwind/).

## Initial npm releases

| Package                                     | Version |
| ------------------------------------------- | ------- |
| `@highlanderrobotics/magnolia-tokens`       | 0.2.0   |
| `@highlanderrobotics/magnolia-svelte`       | 0.2.0   |
| `@highlanderrobotics/magnolia-react-native` | 0.2.0   |
| `@highlanderrobotics/magnolia-starlight`    | 0.1.0   |

npm accepted these initial publications on 2026-11-12 (America/Los_Angeles). Immutable package tags point to source commit `fb6a12d`. Public registry metadata can take time to propagate after first publication; acceptance is separate from a successful clean registry install.

The Figma Changeset is consumed into versions/changelogs. Internal token dependencies are pinned to 0.2.0. Run `npm run build && npm run release:check` to inspect the exact package inventory before publication. The preflight rejects pending Changesets, mismatched internal versions, incorrect registry/repository metadata, missing changelogs and missing original Figma assets. Published metadata retains `UNLICENSED`, since the repository has no license grant.

Initial npm account setup requires `npm login --auth-type=web` with an account that can publish under `@highlanderrobotics`. Check `npm whoami` and `npm org ls highlanderrobotics`; do not put credentials into repository files or GitHub secrets. Publish tokens before their dependent packages:

```sh
npm publish --workspace @highlanderrobotics/magnolia-tokens --access public
npm publish --workspace @highlanderrobotics/magnolia-svelte --access public
npm publish --workspace @highlanderrobotics/magnolia-react-native --access public
npm publish --workspace @highlanderrobotics/magnolia-starlight --access public
```

For each existing package, an npm maintainer with 2FA can configure the trusted publisher using npm 11.15.0 or newer:

```sh
npm trust github @highlanderrobotics/magnolia-tokens \
  --repo HighlanderRobotics/magnolia-ui --file release.yml \
  --env npm --allow-publish
```

Repeat for Svelte, React Native and Starlight. Verify with `npm trust list <package>`. Future releases use the manually dispatched GitHub workflow and its `npm` environment review; no long-lived npm token is required. The first manual bootstrap does not claim CI provenance; subsequent trusted-publisher releases generate it. See [npm trust prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/) and [trusted publishing](https://docs.npmjs.com/trusted-publishers/).

Registry-only consumer verification uses `node scripts/package-smoke.mjs npm registry` (also `pnpm`, `yarn` and `bun`). This mode pins the versions above and uses no local tarballs or dependency overrides. The default mode remains packed-artifact validation for unpublished changes in CI.
