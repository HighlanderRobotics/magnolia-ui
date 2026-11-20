# Native showcase

Use App.tsx as an entry component in an Expo SDK 54+ application with React 19.1 / React Native 0.81 and the packed Magnolia packages installed. Bundle Heebo/Material Symbols through the host application's existing font loader, or pass a system font via MagnoliaProvider. This example intentionally owns no navigation, persistence or offline data. Run on iOS/Android and with large text before approving a consumer rollout.

## V2 preview

Use `V2.tsx` as the entry component for the opt-in v2 exports. Build the local packages first with `npm run build`, then install their packed tarballs in a separate Expo host. Load static Roboto 400/500 and Roboto Mono 400 through the host's font loader; register the body family as `Roboto` and the monospace family as `Roboto Mono`. The fixture owns its provider and offers dark/light and Comfortable/Compact switches.

The example exercises responsive form rows, repeated validation, error-summary links to the editable name field, search clearing, numeric/date/time entry, original icons and keyboard marks, sheet actions, detail drawers, command search, and success notifications. All data is local. It makes no API requests and changes no consumer dependencies.

Check keyboard avoidance, error-link focus, dismissal and return focus, text scaling, and both themes/densities on iOS and Android. Automated native tests and TypeScript checks do not replace these runtime checks.
