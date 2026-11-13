<script module lang="ts">
  // Each gallery mount owns its own dialog state.
</script>

<script lang="ts">
  import {
    MagnoliaUIRoot,
    DensityProvider,
    Button,
    Icon,
    Dialog,
    Switch,
    TextField,
    Select,
    Menu,
    MenuWrapper,
    MenuButton,
    MenuItem,
    Checkbox,
    Radio,
    Alert,
  } from '@highlanderrobotics/magnolia-svelte';
  let theme = $state<'light' | 'dark'>('light');
  let density = $state<'comfortable' | 'compact'>('comfortable');
  let nested = $state(false);
  let open = $state(false);
  let canClose = $state(true);
  let menu = $state(false);
  let checked = $state(false);
  let value = $state('');
  let alliance = $state<string | null>(null);
  let selected = $state<string | null>(null);
  let action = $state('No action yet');
  const options = [
    { label: 'Qualification', value: 'qm' },
    { label: 'Unavailable', value: 'disabled', disabled: true },
    { label: 'Playoff', value: 'playoff' },
  ];
</script>

<MagnoliaUIRoot {theme} {density}>
  <main>
    <header>
      <p class="eyebrow">HIGHLANDER ROBOTICS · DESIGN SYSTEM</p>
      <h1>Magnolia UI</h1>
      <a href="/figma">Figma component reference →</a>
      <p>Shared foundations. Native controls. Built for the field.</p>
    </header>
    <section aria-labelledby="settings">
      <h2 id="settings">Theme & density</h2>
      <div class="row">
        <Button onclick={() => (theme = theme === 'light' ? 'dark' : 'light')}
          >Use {theme === 'light' ? 'dark' : 'light'} theme</Button
        ><Button
          variant="secondary"
          onclick={() =>
            (density = density === 'compact' ? 'comfortable' : 'compact')}
          >Use {density === 'compact' ? 'comfortable' : 'compact'} density</Button
        >
      </div>
    </section>
    <section aria-labelledby="buttons">
      <h2 id="buttons">Actions</h2>
      <div class="row">
        <Button>Primary action</Button><Button variant="secondary"
          >Secondary</Button
        ><Button variant="danger">Delete</Button><Button variant="text-only"
          >Text action</Button
        ><Button variant="text-only-secondary">Quiet action</Button><Button
          disabled>Disabled action</Button
        ><Button loading>Saving</Button><Button element="a" href="#forms"
          >Jump to forms</Button
        ><Button element="a" href="#forms" disabled>Disabled link</Button>
      </div>
      <DensityProvider density="compact"
        ><p>Nested density</p>
        <Button>Compact control</Button></DensityProvider
      >
    </section>
    <section id="forms" aria-labelledby="forms-heading">
      <h2 id="forms-heading">Forms</h2>
      <form
        onsubmit={(e) => {
          e.preventDefault();
          action = 'Form submitted';
        }}
      >
        <div class="grid">
          <TextField
            label="Team name"
            name="team"
            bind:value
            required
            placeholder="Highlanders"
          /><TextField
            label="Invalid field"
            errorMessage="Enter a valid team number"
          /><Select
            label="Match type"
            name="match"
            bind:value={selected}
            placeholder="Choose match type"
            items={options}
            required
          /><Select
            label="Invalid selection"
            items={options}
            errorMessage="Choose a match type"
          /><TextField
            label="Disabled field"
            disabled
            value="Unavailable"
          /><Select label="Disabled selection" disabled items={options} />
        </div>
        <div class="row">
          <Switch
            label="Offline scouting"
            name="offline"
            bind:value={checked}
          /><Switch label="Disabled switch" disabled /><Checkbox
            label="I am ready"
          /><Radio
            bind:group={alliance}
            label="Red alliance"
            name="alliance"
            value="red"
          /><Radio label="Blue alliance" name="alliance" value="blue" />
        </div>
        <Button type="submit">Submit form</Button>
      </form>
    </section>
    <section aria-labelledby="overlays">
      <h2 id="overlays">Dialogs & menus</h2>
      <div class="row">
        <Button onclick={() => (open = true)}>Open dialog</Button><MenuWrapper
          ><Button
            aria-haspopup="menu"
            aria-expanded={menu}
            aria-controls="gallery-menu"
            onclick={() => (menu = !menu)}
            onkeydown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                menu = true;
              }
            }}>Match actions</Button
          ><Menu id="gallery-menu" bind:open={menu} ariaLabel="Match actions"
            ><MenuItem>Choose an action</MenuItem><MenuButton
              onclick={() => (action = 'Match opened')}>Open match</MenuButton
            ><MenuButton disabled>Unavailable action</MenuButton><MenuButton
              onclick={() => (action = 'Match copied')}>Copy match</MenuButton
            ><MenuButton element="a" href="#forms">Edit form</MenuButton></Menu
          ></MenuWrapper
        >
      </div>
      <Switch label="Allow dialog dismissal" bind:value={canClose} />
      <p aria-live="polite">{action}</p>
    </section>
    <section aria-labelledby="feedback">
      <h2 id="feedback">Feedback & icons</h2>
      <Alert>Ready for offline scouting.</Alert><Alert variant="danger"
        >Connection lost. Your reports are saved locally.</Alert
      >
      <p>
        <Icon icon="check" label="Check icon" /> Icons use the application’s bundled
        font. Import optional fonts.css for hosted fonts.
      </p>
    </section>
    <Dialog
      bind:open
      {canClose}
      title="Confirm match"
      describedby="dialog-description"
      ><p id="dialog-description">
        Review the selected match before continuing.
      </p>
      <TextField label="Match notes" />
      <div class="row">
        <Button
          onclick={() => {
            open = false;
            action = 'Match confirmed';
          }}>Confirm</Button
        ><Button variant="secondary" onclick={() => (open = false)}
          >Close dialog</Button
        >
      </div>
      <Button onclick={() => (nested = true)}>Open nested dialog</Button><Dialog
        bind:open={nested}
        title="Nested confirmation"
        ><Button onclick={() => (nested = false)}>Close nested dialog</Button
        ></Dialog
      ></Dialog
    >
  </main>
</MagnoliaUIRoot>

<style>
  :global(body) {
    margin: 0;
  }
  main {
    max-width: 1120px;
    margin: auto;
    padding: 48px 24px 96px;
  }
  header {
    padding-bottom: 40px;
    border-bottom: 1px solid var(--mg-outline);
  }
  h1 {
    font-size: clamp(40px, 7vw, 72px);
    letter-spacing: -0.045em;
    margin: 16px 0;
  }
  h2 {
    font-size: 24px;
    font-weight: 500;
  }
  .eyebrow {
    font-size: 12px;
    letter-spacing: 0.14em;
    color: var(--mg-muted);
  }
  section {
    padding: 24px 0;
    border-bottom: 1px solid var(--mg-secondary);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin: 20px 0;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
    gap: 20px;
  }
  p {
    line-height: 1.6;
  }
  :global(.mg-alert) {
    margin: 12px 0;
  }
</style>
