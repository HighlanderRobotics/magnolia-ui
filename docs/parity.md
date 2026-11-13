# Legacy parity and remaining gates

The legacy source inventory is pinned at `765e43e5b2efc9bfbdb84e1b7751cae73ad7c900`. Lovat Website currently uses MagnoliaUIRoot, DensityProvider, Button, Icon and TextField. Collection supplies the native Button, text, Checkbox, TextField and Icon lineage. Dashboard supplies Material color schemes and FRC roles; Learn supplies the Starlight mapping requirements. Tooling-web source was also inventoried at `8f6b0b7579ce5c67a91e1ce12cc6d51e700e771e`: it uses root/density, actions/links, icons, TextField/Select, Dialog and menu exports. Its AddPersonForm contains an implicit submit Button; that migration must set type="submit", update event callbacks and supply dialog names. Consumer integration is still unverified.

| Legacy export   | New implementation                                     | Intentional difference                                                                                    |
| --------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| MagnoliaUIRoot  | Same named export, tokens/styles                       | div landmark, scoped styles, explicit/system themes, opt-in hosted fonts; no global reset/font-loading JS |
| DensityProvider | Same export; spacious/compact accepted                 | comfortable canonical name, nested reset and minimum targets                                              |
| Button          | All five variants, button/anchor, href/type/disabled   | Svelte 5 onclick(original event), snippet children, default type button, loading state                    |
| Icon            | Name/size/fill/grade/color/transition retained         | icon is a string (no external literal-type package), optional accessible label, application-owned font    |
| Switch          | bind:value, disabled, ariaLabel retained               | Native checkbox/switch form behavior; label/name/required supported; Space activation, disabled excluded  |
| TextField       | Value/type/placeholder/required/name/id/error retained | Stable labelled errors, visible focus, native attribute passthrough                                       |
| Select          | Value/items/placeholder/required/error retained        | Disabled options wired, visible focus, stable labelled errors                                             |
| Dialog          | bind:open and canClose retained                        | Native modal, title/description API, focus wrap/restoration, nested scroll locks, guarded dismissals      |
| Menu            | bind:open and left/right anchor retained               | Named action menu, keyboard navigation, typeahead, selection/Tab/outside close                            |
| MenuWrapper     | Same positioning wrapper                               | Snippet children                                                                                          |
| MenuItem        | Same noninteractive content wrapper                    | Explicit presentation role; actions use MenuButton                                                        |
| MenuButton      | Same variants and button/anchor API                    | Original MouseEvent callback, menuitem role, context closes after uncancelled activation                  |

Native control styling and transition behavior intentionally differ from the previous custom div switch/overlay implementations. The gallery records light/dark and comfortable/compact screenshots at desktop and mobile sizes. These are implementation snapshots, not a proof of legacy pixel parity.

Checkbox, Radio, Pill and Alert extend core form/feedback coverage. Tooltip, Popover, Tabs, Toast, Combobox, MultiSelect, Table, Pagination and Accordion remain deferred until concrete consumers and accessible contracts are established (LVT-361).

Do not mark LVT-369 complete or archive anything until all consumer migrations, released clean installs, representative visual approval, device accessibility validation, rollback documentation and explicit owner sign-off are recorded. Existing Lovat tarball dependencies and patches are deliberately retained for now.

Shared component geometry and artwork are compared against the supplied Lovat 2027 Figma file in [Figma parity](figma-parity.md). This comparison is separate from consumer migration approval.
