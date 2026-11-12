# Component contracts

All Svelte components use typed `$props`, snippets for children and callbacks for DOM events. Bind state only where documented. Standard HTML attributes pass through on interactive controls. Give every icon-only action an accessible name.

| Export            | Public contract                                                                                                            | Keyboard and accessibility                                                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MagnoliaUIRoot`  | `theme=system`, `density=comfortable`, `class`, children                                                                   | Scoped tokens and styles; renders a div so the app owns its main landmark; no font-loading JS                                                                                           |
| `DensityProvider` | `density=comfortable` (`spacious` alias or `compact`), children                                                            | Nested CSS inheritance, minimum targets maintained                                                                                                                                      |
| `Button`          | `variant`, `element=button                                                                                                 | a`, `href`, `type=button`, `disabled`, `loading`, `onclick(MouseEvent)`, HTML attributes, children                                                                                      | Native button/anchor activation; disabled anchors remove href/tab stop and block activation; `preventDefault` works              |
| `Icon`            | `icon`, `size=24`, `filled=false`, `grade=0`, `color`, `transitionDuration=0.1`, optional `label`                          | Decorative by default; label adds image semantics; application bundles symbol font                                                                                                      |
| `Switch`          | `bind:value=false`, `label` or `ariaLabel`, `disabled`, `name`, `required`, `id`, input attributes                         | Native checkbox with switch role; Space, reset, form submission and disabled behavior are native; no custom Enter shortcut                                                              |
| `TextField`       | `bind:value`, `label`/`ariaLabel`, `type`, `errorMessage`, HTML input attributes                                           | Label association, required/invalid semantics, unique stable error ID and merged described-by references                                                                                |
| `Select`          | `bind:value` (string or null), `items` (`label`, `value`, `disabled`), `placeholder`, label/error props, select attributes | Native select keyboard behavior, disabled options, null placeholder, linked errors                                                                                                      |
| `Dialog`          | `bind:open`, `canClose=true`, `title` or `ariaLabel`/`labelledby`, `describedby`, `onclose`, children                      | Native modal top layer/inert background; first native focusable child initially; explicit Tab wrap, Escape/backdrop guarded by canClose, trigger focus restoration, nested scroll locks |
| `MenuWrapper`     | children                                                                                                                   | Positioning container only; app owns trigger and open binding                                                                                                                           |
| `Menu`            | `bind:open`, `anchor=left                                                                                                  | right`, `ariaLabel=Actions`, `id`, children                                                                                                                                             | Action menu, first enabled item focus, Up/Down/Home/End/typeahead, Escape/selection restore focus; Tab/outside interaction close |
| `MenuItem`        | children                                                                                                                   | Non-interactive menu presentation content; use MenuButton for actions                                                                                                                   |
| `MenuButton`      | Button props (`variant=secondary`)                                                                                         | Menuitem semantics; callback receives original event; selection closes unless prevented; disabled items skipped                                                                         |
| `Checkbox`        | `bind:checked`, `label`, input attributes                                                                                  | Native checkbox, label, form state and focus outline                                                                                                                                    |
| `Radio`           | `bind:group`, `label`, `name`, `value`, input attributes                                                                   | Bind all group components to the same string/null state; native arrow keys and form values remain intact                                                                                |
| `Alert`           | `variant=info                                                                                                              | danger`, children                                                                                                                                                                       | Status for informational updates; alert for urgent errors                                                                        |

Button variants are `primary`, `secondary`, `danger`, `text-only` and `text-only-secondary`. Links retain native browser behavior. Loading sets busy and disables activation. The default type is intentionally `button`; set `type="submit"` for form submission.

## Runnable examples

`examples/web/src/App.svelte` is the complete gallery. Its menu trigger exposes `aria-haspopup`, `aria-expanded`, `aria-controls` and opens on Down Arrow. A menu contains action items, not a navigation landmark; build ordinary link navigation with native nav/anchor elements instead.

```svelte
<script lang="ts">
  import {
    Button,
    Dialog,
    TextField,
    MenuWrapper,
    Menu,
    MenuButton,
  } from '@highlanderrobotics/magnolia-svelte';
  let dialog = $state(false);
  let menu = $state(false);
</script>

<Button onclick={() => (dialog = true)}>Open dialog</Button>
<Dialog bind:open={dialog} title="Match notes">
  <TextField label="Notes" />
  <Button onclick={() => (dialog = false)}>Done</Button>
</Dialog>
<MenuWrapper>
  <Button
    aria-haspopup="menu"
    aria-expanded={menu}
    aria-controls="actions"
    onclick={() => (menu = !menu)}
    onkeydown={(event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        menu = true;
      }
    }}
  >
    Actions
  </Button>
  <Menu id="actions" bind:open={menu} ariaLabel="Match actions">
    <MenuButton onclick={() => console.log('Copy')}>Copy match</MenuButton>
    <MenuButton disabled>Unavailable</MenuButton>
  </Menu>
</MenuWrapper>
```

Give Dialog a title or accessible label. `canClose=false` prevents dismissal gestures, while app actions may set `open=false`. Use native `autofocus` only when an application has a deliberate initial-focus requirement. Keep dialog children app-owned. Dialog uses the browser’s modal top layer, rather than a competing overlay/focus implementation.

## React Native

`MagnoliaProvider` defaults to dark/comfortable with Collection’s bundled Heebo and symbol font names. Set `mode`, `density`, `fontFamily` and `iconFontFamily` explicitly when needed. `useMagnolia()` exposes resolved colors, sizes and FRC colors. The provider does not own safe areas, status bars, routing or font downloads.

`Button` supports Collection’s primary/secondary/danger, filled, density, flex, borderRadius, backgroundColorSet, loadingChildren and async `onPress`. It blocks duplicate presses synchronously, announces busy/disabled state and renders caught synchronous/async errors. Use `onError` for app reporting. Changes in foreground/background state are immediate, avoiding custom motion dependencies.

`Text`, `BodyMedium`, `LabelSmall`, `TitleLarge`, `TitleMedium`, `Heading1Small`, `TextField` (forwarded ref), `Checkbox`, native `Switch`, `Icon` and `Alert` pass relevant native props and retain text scaling. Native controls use 48px targets. `Icon.renderIcon` lets the app supply FRC/domain art; decorative symbols are hidden from accessibility. Label icons that convey independent meaning. Device screen-reader validation remains a release gate.
