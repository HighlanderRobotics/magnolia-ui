# Additional controls (LVT-361)

These APIs describe the current source and the pending minor Changeset. They are not included in the initial 0.2.0 npm releases. Open `/controls` with `npm run gallery` for the complete runnable web example; `examples/native/App.tsx` demonstrates the native additions.

## Figma source and scope

Inspected through Figma MCP in Lovat 2027:

| Source                                                                                                                                                                                                      | Use                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [Team Details pill strip, 4690:202](https://www.figma.com/design/aFsGTC9XlSZIO6HEQA1Zyz/Lovat-2027?node-id=4690-202)                                                                                        | Tabs: 35px visible pill height, 14px Heebo Medium, 7px gap, equal-width items; at 341px each item is 109px |
| [Pill active, 1971:243](https://www.figma.com/design/aFsGTC9XlSZIO6HEQA1Zyz/Lovat-2027?node-id=1971-243)                                                                                                    | Selected tab #bbaaf0 / #1f1f1f, 7px radius and 7px/10px padding                                            |
| [Light menu, 116:476](https://www.figma.com/design/aFsGTC9XlSZIO6HEQA1Zyz/Lovat-2027?node-id=116-476), [dark menu, 196:135](https://www.figma.com/design/aFsGTC9XlSZIO6HEQA1Zyz/Lovat-2027?node-id=196-135) | Combobox options, multiple-choice rows, surface/selected roles, density padding and maximum list height    |
| [Inputs, 5:29](https://www.figma.com/design/aFsGTC9XlSZIO6HEQA1Zyz/Lovat-2027?node-id=5-29)                                                                                                                 | Existing TextField, selection states and spacing foundations                                               |

No standalone Tooltip, Popover, Toast, Combobox, MultiSelect, Table, Pagination or Accordion specifications were found on the supplied Components page. These are documented compositions of its existing primitives, not claims of new exact Figma component variants. The tab strip retains larger vertical space around its 35px visible pills so 48px activation areas and focus rings fit without a scrollbar. Inactive colors follow the current theme. Existing accessible contrast adjustments remain.

No new static artwork was necessary. The 29 original selection/chevron SVGs remain unchanged. Native controls use platform modal/selection rendering and larger targets; they do not claim web SVG pixel parity. Figma files and Lovat consumers were not edited.

## Svelte contracts

Use stable, unique values for choice and tab items. Each component creates scoped IDs; callers can render multiple copies and SSR safely.

| Component     | Props                                                                                                             | Behavior                                                                                                                                                                                                                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tooltip`     | `text`, `trigger` snippet receiving HTML button attributes, `delay=400` milliseconds                              | Hover/focus reveals a description; Escape dismisses without moving focus. Hovering the tooltip keeps it visible. Noninteractive text only. Spread all trigger attributes onto the actual focusable control.                                                                                                          |
| `Popover`     | `bind:open=false`, required `label`, `trigger` snippet receiving button attributes, children                      | Nonmodal named dialog using the browser Popover API/top layer. First focusable content receives focus; Escape/light-dismiss update open state. Escape/content dismissal restore focus. Outside clicks retain the user's new focus. Focus is not trapped. Repositions on scroll/resize and keeps within the viewport. |
| `Tabs`        | `bind:value`, required `label`, `items` with value/label/optional disabled, children snippet receiving each value | Automatic activation with roving tab stop; Left/Right, Home/End, wrap, disabled skipping and RTL. Panels stay mounted and inactive panels are hidden. An invalid initial value falls back to the first enabled tab.                                                                                                  |
| `Toast`       | `bind:open=false`, `variant=info` or `danger`, children, `dismissLabel`                                           | Stable status/alert live region; notifications persist until dismissed. No timeout removes information while a user is reading. The dismiss button restores focus to the control that opened the notification. The component stays in flow; applications own placement and queues.                                   |
| `Accordion`   | `bind:open=false`, required `title`, optional `name`, children                                                    | Native details/summary, Enter/Space, expanded state. Shared name enables an exclusive group in supported browsers. Applications own heading hierarchy around accordion items.                                                                                                                                        |
| `Combobox`    | `bind:value` string or null, required label/items, placeholder, disabled, required, name, errorMessage            | Editable search of labelled options. Up/Down/Home/End move the active descendant without moving input focus; disabled items are skipped and active results scroll into view. Enter commits an option; Escape/Tab/outside closes. Arbitrary text is not a committed value.                                            |
| `MultiSelect` | `bind:value` string array, required label/items, errorMessage, native select attributes                           | Native multiple select with platform keyboard/touch selection. Disabled options, required, name/form submission, reset and linked errors remain native. No custom listbox selection model or local filtering.                                                                                                        |
| `Table`       | required caption/columns/rows; optional cell snippet `(row, key)`; bindable sortBy and sortDirection              | Native table with scoped column headers, caption and optional numeric-aware local sorting. Sort buttons expose aria-sort. Primitive cell text is escaped; snippets can render rich cells. Named overflow region supports keyboard scrolling. No grid editing or virtualization.                                      |
| `Pagination`  | `bind:page=1`, required totalPages, label, disabled                                                               | Native buttons, current-page semantics and status announcement. Values are normalized for rendering; first/last and nearby pages are bounded with gaps. Applications own fetching, table slicing, loading and navigation.                                                                                            |

Modern browsers supporting the HTML Popover API are required for Tooltip/Popover. Chromium desktop/mobile are tested; Safari/Firefox and device screen readers remain validation gates. No popover polyfill or consumer dependency was added.

Combobox `name` submits the selected option ID via a hidden input. Its visible input enforces that required or nonempty query text corresponds to an available selection. Editing clears the committed ID; closing an uncommitted query clears its display. Reset restores the mounted initial value. Error text is linked via described-by and error-message IDs. Its items API is synchronous; applications own debounced remote search and loading announcements.

MultiSelect intentionally retains native modifier/range selection on desktop and the platform chooser on touch devices. It uses the existing menu density/selection colors; it is not a chips-based combobox. Table accepts rows with string/number/null cell values. A custom cell snippet changes rendering while sorting still uses the underlying primitive value.

```svelte
<script lang="ts">
  import {
    Button,
    Popover,
    Tabs,
    Combobox,
  } from '@highlanderrobotics/magnolia-svelte';
  let open = $state(false);
  let tab = $state('overview');
  let team = $state<string | null>(null);
</script>

<Popover label="Report settings" bind:open>
  {#snippet trigger(attributes)}<Button {...attributes}>Settings</Button
    >{/snippet}
  <Button onclick={() => (open = false)}>Done</Button>
</Popover>
<Tabs
  label="Report sections"
  bind:value={tab}
  items={[
    { value: 'overview', label: 'Overview' },
    { value: 'notes', label: 'Notes' },
  ]}
>
  {#snippet children(value)}<p>
      {value === 'overview' ? 'Overview content' : 'Notes content'}
    </p>{/snippet}
</Tabs>
<Combobox
  label="Team"
  name="team"
  bind:value={team}
  items={[{ value: '8033', label: 'Highlander Robotics' }]}
  required
/>
```

## React Native contracts

| Component | Props                                                                                 | Native behavior                                                                                                                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Radio`   | label, value, checked, disabled, onSelect(value)                                      | Application owns group state; radio role and checked/disabled state, density-sized marker with 48px activation target                                                                                                                                             |
| `Dialog`  | open, title, onClose, canClose=true, onDismiss, children                              | Native Modal background isolation; heading gets accessibility focus on show. Android Back and backdrop request onClose only when allowed. Scrollable contents and a named Close button; no custom entrance animation                                              |
| `Select`  | label, value, items, onChange(value), disabled, placeholder, errorMessage             | Combobox trigger exposes selected text/expanded/disabled state; native modal choice sheet uses Radio. Disabled options stay visible. Selection closes the sheet; dismissal requests accessibility focus restoration on supported platforms. No DOM form semantics |
| `Menu`    | open, onClose, onDismiss, label, items with optional danger/disabled, onSelect(value) | Named native action sheet. Async actions reuse Button's busy/error handling and close only after success; failed actions stay open. It does not impose desktop menu keyboard semantics on native platforms                                                        |

All new native controls use MagnoliaProvider tokens, retain font scaling and 48px targets, and introduce no new runtime dependency. Unit tests verify state, disabled choices, guarded dismissal and failed/successful async actions. Actual VoiceOver/TalkBack focus restoration, native Back behavior, very large text and device screenshots remain LVT-368 gates. `onDismiss` is platform-dependent; applications can use it to restore their external menu/dialog trigger. No Lovat consumer dependency or patch was changed.
