<script lang="ts">
  import {
    MagnoliaUIRoot,
    Button,
    TextField,
    Tooltip,
    Popover,
    Tabs,
    Toast,
    Accordion,
    Pagination,
    Table,
    MultiSelect,
    Combobox,
  } from '@highlanderrobotics/magnolia-svelte';
  let theme = $state<'light' | 'dark'>('dark');
  let density = $state<'comfortable' | 'compact'>('comfortable');
  let tab = $state('categories');
  let tabState = $state('ready');
  let popover = $state(false);
  let toast = $state(false);
  let team = $state<string | null>(null);
  let roles = $state<string[]>([]);
  let page = $state(1);
  let result = $state('No choices submitted');
  const teams = [
    { value: '8033', label: '8033 — Highlander Robotics' },
    { value: 'blocked', label: 'Unavailable team', disabled: true },
    { value: '1678', label: '1678 — Citrus Circuits' },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: String(9000 + i),
      label: `${9000 + i} — Example team`,
    })),
  ];
  const roleItems = [
    { value: 'scout', label: 'Scout' },
    { value: 'analyst', label: 'Analyst' },
    { value: 'driver', label: 'Driver', disabled: true },
  ];
</script>

<MagnoliaUIRoot {theme} {density}>
  <main>
    <header>
      <a href="/">← Component gallery</a>
      <p class="eyebrow">MAGNOLIA UI · CONTROL COVERAGE</p>
      <h1>Ready for the next interaction.</h1>
      <p>Shared Figma foundations, with keyboard and native form behavior.</p>
      <div class="row">
        <Button
          variant="secondary"
          onclick={() => (theme = theme === 'dark' ? 'light' : 'dark')}
          >Use {theme === 'dark' ? 'light' : 'dark'} theme</Button
        >
        <Button
          variant="secondary"
          onclick={() =>
            (density = density === 'compact' ? 'comfortable' : 'compact')}
          >Use {density === 'comfortable' ? 'compact' : 'comfortable'} density</Button
        >
        <a
          href="https://www.figma.com/design/aFsGTC9XlSZIO6HEQA1Zyz/Lovat-2027?node-id=4690-202"
          >Figma tab reference ↗</a
        >
      </div>
    </header>
    <section aria-labelledby="tabs-title">
      <h2 id="tabs-title">Pill tabs</h2>
      <div class="tab-reference" data-testid="pill-tabs">
        <Tabs
          label="Team details"
          bind:value={tab}
          items={[
            { value: 'categories', label: 'Categories' },
            { value: 'breakdowns', label: 'Breakdowns' },
            { value: 'notes', label: 'Notes' },
          ]}
        >
          {#snippet children(value)}<p>
              {value === 'categories'
                ? 'Team categories and performance summaries.'
                : value === 'breakdowns'
                  ? 'Compare scoring breakdowns.'
                  : 'Team notes and observations.'}
            </p>{/snippet}
        </Tabs>
      </div>
      <Tabs
        label="Availability"
        bind:value={tabState}
        items={[
          { value: 'ready', label: 'Ready' },
          { value: 'unavailable', label: 'Unavailable', disabled: true },
          { value: 'complete', label: 'Complete' },
        ]}
      >
        {#snippet children(value)}<p>
            {value === 'ready' ? 'Ready to begin.' : 'All reports complete.'}
          </p>{/snippet}
      </Tabs>
    </section>
    <section aria-labelledby="overlay-title">
      <h2 id="overlay-title">Help, popovers and notifications</h2>
      <div class="row">
        <Tooltip text="Choose the team you are scouting." delay={200}>
          {#snippet trigger(props)}<Button {...props} variant="secondary"
              >Why choose a team?</Button
            >{/snippet}
        </Tooltip>
        <Popover label="Display settings" bind:open={popover}>
          {#snippet trigger(props)}<Button {...props}>Edit display</Button
            >{/snippet}
          <TextField label="Display name" placeholder="Your name" />
          <p>Use a name your teammates recognize.</p>
          <Button onclick={() => (popover = false)}>Apply display</Button>
        </Popover>
        <Button variant="secondary" onclick={() => (toast = true)}
          >Show notification</Button
        >
      </div>
      <Toast bind:open={toast}>Report saved. You can keep scouting.</Toast>
    </section>
    <section aria-labelledby="choices-title">
      <h2 id="choices-title">Search and multiple choices</h2>
      <form
        onsubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          result = `Team ${data.get('team')}; roles ${data.getAll('roles').join(', ')}`;
        }}
      >
        <div class="choices">
          <Combobox
            label="Team lookup"
            bind:value={team}
            name="team"
            items={teams}
            required
          />
          <MultiSelect
            label="Scouting roles"
            bind:value={roles}
            name="roles"
            items={roleItems}
            required
          />
          <Combobox label="Disabled lookup" items={teams} disabled />
          <MultiSelect label="Disabled roles" items={roleItems} disabled />
        </div>
        <div class="row">
          <Button type="submit">Submit choices</Button><Button
            type="reset"
            variant="secondary">Reset choices</Button
          >
        </div>
      </form>
      <output>{result}</output>
    </section>
    <section aria-labelledby="table-title">
      <h2 id="table-title">Tables and pagination</h2>
      <Table
        caption="Example teams"
        columns={[
          { key: 'team', label: 'Team', sortable: true },
          { key: 'name', label: 'Name', sortable: true },
          { key: 'reports', label: 'Reports', sortable: true },
        ]}
        rows={[
          { team: 8033, name: 'Highlander Robotics', reports: 12 },
          { team: 1678, name: 'Citrus Circuits', reports: 8 },
          { team: 254, name: 'The Cheesy Poofs', reports: 10 },
        ]}
      />
      <Pagination bind:page totalPages={8} label="Report pages" />
    </section>
    <section aria-labelledby="help-title">
      <h2 id="help-title">Expandable help</h2>
      <Accordion title="Keyboard shortcuts" name="help"
        ><p>
          Use arrow keys in tabs and search results. Escape closes a popover.
          Space opens a help section.
        </p></Accordion
      >
      <Accordion title="What happens offline?" name="help"
        ><p>
          Your application owns offline storage and synchronization.
        </p></Accordion
      >
    </section>
    <footer>
      Tabs match Figma’s Pill strip. Other additions compose its fields, menus
      and semantic tokens; no separate Figma specifications exist for them.
    </footer>
  </main>
</MagnoliaUIRoot>

<style>
  main {
    max-width: 1120px;
    margin: auto;
    padding: 32px 24px 80px;
  }
  header {
    padding-bottom: 32px;
  }
  h1 {
    font-size: clamp(36px, 5vw, 64px);
    line-height: 1.12;
    max-width: 760px;
    margin-block: 20px;
  }
  .eyebrow {
    letter-spacing: 0.14em;
    font-size: 12px;
    margin-top: 44px;
  }
  section {
    padding-block: 24px;
    border-top: 1px solid var(--mg-outline);
  }
  h2 {
    font-size: 22px;
    font-weight: 500;
  }
  a {
    color: inherit;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    margin-block: 20px;
  }
  .choices {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
  .tab-reference {
    max-width: 341px;
  }
  footer {
    padding-top: 32px;
    color: var(--mg-muted);
  }
  @media (max-width: 600px) {
    main {
      padding-inline: 20px;
    }
    .choices {
      grid-template-columns: 1fr;
    }
  }
</style>
