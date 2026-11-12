# Release setup

Packages are independent semver units managed with Changesets. Run `npm run changeset` for a public change; review `npm run version-packages` output and commit versions/changelogs before publishing. Pin known-good releases in applications. Keep all generated token artifacts in version control.

The release workflow runs only via an explicit workflow dispatch on main. It builds/tests first, then publishes from the protected GitHub `npm` environment using npm OIDC. Configure that environment’s reviewer rules in GitHub before use. The workflow has `id-token: write` and no stored npm token. npm CLI must be 11.5.1+ for trusted publishing. Scope ownership, administrator 2FA and initial package creation are account configuration, not repository code.

Before first release:

1. Confirm ownership and publishing permission for npm `@highlanderrobotics`.
2. Obtain approval to make this repository public if public source/provenance is desired. It is currently private; do not assume provenance can be produced from a private repo.
3. Bootstrap the four package names with an authorized maintainer if npm requires initial publication, then configure each npm package’s trusted publisher to owner `HighlanderRobotics`, repository `magnolia-ui`, workflow `release.yml`, environment `npm`.
4. Review versions, changelogs, clean-install tests and the intended npm dist-tag. Never execute release automation just to test its configuration.
5. Dispatch the release workflow, inspect registry artifacts/provenance, and create immutable release tags. Changesets tags npm packages after successful publication. Tag Flutter separately as `flutter-vX.Y.Z` only after Flutter checks pass.

`@highlanderrobotics/magnolia-tokens` exports JavaScript/types, CSS and JSON. Svelte exports compiled-package source and declarations for bundlers. React Native exports ESM with React/React Native peers and a `react-native` condition. Starlight exports CSS only. CSS is intentionally marked as side-effectful and has no executable JavaScript entry. Do not require a CSS file through Node; use a supported bundler.

`node scripts/package-smoke.mjs npm|pnpm|yarn|bun` packs all four packages and installs them in a fresh temporary consumer. It checks token imports, CSS exports and published Svelte/RN type resolution. Unpublished internal token dependencies are redirected to the local token tarball via pnpm overrides/Yarn resolutions/Bun overrides; this emulates availability of the coordinated token release. This validates artifacts before publication, not npm permissions or platform/device workflows.

A breaking token/component contract needs a major version. Release fixes as patches and additions as minors. Rollback uses a previous immutable version and restored lockfile, never a silently retagged artifact. Lovat migration is deliberately deferred; publishing does not authorize consumer changes.

References: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), [Svelte props and bindable values](https://svelte.dev/docs/svelte/$props), [Starlight CSS variables](https://starlight.astro.build/guides/css-and-tailwind/).
