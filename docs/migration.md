# Consumer migration and rollback

No Lovat consumer dependencies are replaced in this implementation. Lovat’s local edits, installed dependency patches and lockfiles remain intact. Migrate only after a known-good release is available and consumer tests pass. Do not archive the legacy repo as part of installing the new packages.

## Website and tooling-web

Install a pinned released `@highlanderrobotics/magnolia-svelte` version and update imports. Svelte 5 `onclick` receives the original `MouseEvent`, replacing legacy `on:click` and the erroneous click-count payload. If cancellation is needed, call `event.preventDefault()` directly. Slotted children become snippets (ordinary component children still work); forwarded DOM events become callback props. Native button type now defaults to `button`.

Keep all 12 original exports; apply accessible names to Dialog and Menu triggers, link trigger `aria-controls`/expanded state, and use the native Switch form contract. `DensityProvider density="spacious"` remains a comfortable-density alias. The root renders a div, so retain one app-owned main landmark. Use explicit root theme rather than relying on undocumented global resets. Opt in to fonts.css or bundle fonts; no mount-time font JS remains to patch.

Build in an isolated consumer branch first. Verify SSR/hydration, navigation, forms, dialog keyboard behavior, mobile layout and icon loading. Remove the old font patch/tests only after the migrated release is validated. Roll back by restoring the prior package manifest, lockfile, imports and font patch together.

## Collection

Install the pinned React Native package compatible with React 19.1/React Native 0.81+. Wrap the app in `MagnoliaProvider mode="dark"`; preserve safe-area providers, navigation and bundled Heebo/Material Symbols. Migrate shared controls incrementally. Named exports replace local default imports; provider and controls accept generated semantic tokens. `Icon.renderIcon` supplies app-owned FRC icons. Add screen labels and preserve density/async actions while keeping offline data and scouting logic unchanged.

Exercise iOS/Android builds and offline scouting, native text scaling, VoiceOver/TalkBack, loading/errors, persisted reports and navigation. Jest control tests do not establish device or app-workflow parity. Roll back control imports and dependency/lockfile together; do not change persisted data during this migration.

## Dashboard

Use an approved immutable Git tag in `pubspec.yaml` after the repository/tag is available:

```yaml
magnolia_ui:
  git:
    url: https://github.com/HighlanderRobotics/magnolia-ui.git
    ref: flutter-v0.1.0
    path: packages/flutter
```

The example tag above is the intended versioning convention, not a claim that a tag has been released. Private repositories require Git access. Use `MagnoliaTheme.light()` for `theme`, `MagnoliaTheme.dark()` for `darkTheme` and keep the app’s existing `themeMode`. Fonts are bundled by the application; pass its font family if different. `Theme.of(context).extension<MagnoliaFrc>()!` exposes alliance colors. Material text/control behavior remains native; generated ColorScheme values preserve Dashboard’s existing palette.

Do not replace analysis widgets, charts, picklists, routes or authentication. Test light/dark, text scaling, charts and core picklist behavior before removing manual definitions. Roll back theme factory imports and pubspec/lockfile together.

## Learn

Install a pinned `@highlanderrobotics/magnolia-starlight` release. Add `@highlanderrobotics/magnolia-starlight/theme.css` to Starlight’s `customCss` after base styles. Remove duplicated palette overrides only after comparing light and dark docs pages. The adapter uses public Starlight CSS variables and leaves search, routing, MDX, navigation and code highlighting intact. Keep application-specific CSS where needed.

Check sidebar/search/mobile navigation, code, callouts, tables and content contrast in both themes. Roll back `customCss`, the old theme file and dependency/lockfile as a unit.
